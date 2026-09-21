package usecase

import (
	"context"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/shramjagaran/cms-backend/internal/domain/entity"
	"github.com/shramjagaran/cms-backend/internal/domain/repository"
	"github.com/shramjagaran/cms-backend/pkg/apperror"
	"github.com/shramjagaran/cms-backend/pkg/mail"
)

const campaignSendBatchSize = 50

type CampaignService struct {
	campaigns  repository.CampaignRepository
	recipients repository.CampaignRecipientRepository
	members    repository.MemberRepository
	mailer     mail.Mailer
}

func NewCampaignService(campaigns repository.CampaignRepository, recipients repository.CampaignRecipientRepository, members repository.MemberRepository, mailer mail.Mailer) *CampaignService {
	return &CampaignService{campaigns: campaigns, recipients: recipients, members: members, mailer: mailer}
}

type CreateCampaignInput struct {
	Name    string
	Subject string
	Body    string
	Segment entity.CampaignSegment
}

func (s *CampaignService) Create(ctx context.Context, userID string, in CreateCampaignInput) (*entity.Campaign, error) {
	if strings.TrimSpace(in.Name) == "" {
		return nil, apperror.New(422, "VALIDATION", "name is required")
	}
	if strings.TrimSpace(in.Subject) == "" {
		return nil, apperror.New(422, "VALIDATION", "subject is required")
	}
	if strings.TrimSpace(in.Body) == "" {
		return nil, apperror.New(422, "VALIDATION", "body is required")
	}
	c := &entity.Campaign{
		ID:            uuid.NewString(),
		Name:          in.Name,
		Subject:       in.Subject,
		Body:          in.Body,
		SegmentFilter: in.Segment,
		Status:        entity.CampaignStatusDraft,
		CreatedBy:     userID,
	}
	if err := s.campaigns.Create(ctx, c); err != nil {
		return nil, err
	}
	return c, nil
}

func (s *CampaignService) Get(ctx context.Context, id string) (*entity.Campaign, error) {
	return s.campaigns.GetByID(ctx, id)
}

func (s *CampaignService) List(ctx context.Context, opts repository.ListCampaignsOptions) ([]entity.Campaign, int, error) {
	if opts.Page < 1 {
		opts.Page = 1
	}
	if opts.PageSize < 1 {
		opts.PageSize = 20
	}
	return s.campaigns.List(ctx, opts)
}

type UpdateCampaignInput struct {
	Name    string
	Subject string
	Body    string
	Segment entity.CampaignSegment
}

// Update edits a campaign's content. Only DRAFT campaigns can be edited —
// once scheduled/sending, the audience and content are locked in.
func (s *CampaignService) Update(ctx context.Context, id string, in UpdateCampaignInput) (*entity.Campaign, error) {
	c, err := s.campaigns.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if c.Status != entity.CampaignStatusDraft {
		return nil, apperror.New(409, "CONFLICT", "only draft campaigns can be edited")
	}
	c.Name = in.Name
	c.Subject = in.Subject
	c.Body = in.Body
	c.SegmentFilter = in.Segment
	if err := s.campaigns.Update(ctx, id, c); err != nil {
		return nil, err
	}
	return c, nil
}

// PreviewAudience counts members matching a segment, without writing
// anything — used by the segment builder UI for a live recipient count.
func (s *CampaignService) PreviewAudience(ctx context.Context, segment entity.CampaignSegment) (int, error) {
	_, total, err := s.members.List(ctx, listOptsForSegment(segment, 1, 1))
	return total, err
}

func listOptsForSegment(segment entity.CampaignSegment, page, pageSize int) repository.ListMembersOptions {
	return repository.ListMembersOptions{
		Page:     page,
		PageSize: pageSize,
		BranchID: segment.BranchID,
		Tier:     segment.Tier,
		Status:   segment.Status,
		Tag:      segment.Tag,
	}
}

func (s *CampaignService) resolveAndMaterialize(ctx context.Context, c *entity.Campaign) error {
	members, _, err := s.members.List(ctx, listOptsForSegment(c.SegmentFilter, 1, 10000))
	if err != nil {
		return err
	}
	recipients := make([]entity.CampaignRecipient, 0, len(members))
	for _, m := range members {
		if m.Email == nil || *m.Email == "" {
			continue
		}
		recipients = append(recipients, entity.CampaignRecipient{
			CampaignID: c.ID,
			MemberID:   m.ID,
			Email:      *m.Email,
		})
	}
	return s.recipients.BulkCreate(ctx, recipients)
}

// Schedule locks in the audience (materializing campaign_recipients) and
// marks the campaign SCHEDULED; the scheduler's campaign-send job picks it
// up once scheduledAt has passed.
func (s *CampaignService) Schedule(ctx context.Context, id string, at time.Time) (*entity.Campaign, error) {
	c, err := s.campaigns.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if c.Status != entity.CampaignStatusDraft {
		return nil, apperror.New(409, "CONFLICT", "only draft campaigns can be scheduled")
	}
	if err := s.resolveAndMaterialize(ctx, c); err != nil {
		return nil, err
	}
	c.ScheduledAt = &at
	c.Status = entity.CampaignStatusScheduled
	if err := s.campaigns.Update(ctx, id, c); err != nil {
		return nil, err
	}
	return c, nil
}

// Send locks in the audience (if not already done), marks the campaign
// SENDING, and sends the first batch immediately so "send now" feels
// responsive; any remainder drains via the scheduler's campaign-send job on
// subsequent ticks, same as a scheduled campaign that's come due.
func (s *CampaignService) Send(ctx context.Context, id string) (*entity.Campaign, error) {
	c, err := s.campaigns.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if c.Status != entity.CampaignStatusDraft && c.Status != entity.CampaignStatusScheduled {
		return nil, apperror.New(409, "CONFLICT", "campaign has already been sent or cancelled")
	}
	if c.Status == entity.CampaignStatusDraft {
		if err := s.resolveAndMaterialize(ctx, c); err != nil {
			return nil, err
		}
	}
	now := time.Now()
	c.Status = entity.CampaignStatusSending
	c.ScheduledAt = &now
	if err := s.campaigns.Update(ctx, id, c); err != nil {
		return nil, err
	}
	if err := s.ProcessOne(ctx, c); err != nil {
		return nil, err
	}
	return s.campaigns.GetByID(ctx, id)
}

func (s *CampaignService) Cancel(ctx context.Context, id string) (*entity.Campaign, error) {
	c, err := s.campaigns.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if c.Status != entity.CampaignStatusDraft && c.Status != entity.CampaignStatusScheduled {
		return nil, apperror.New(409, "CONFLICT", "only draft or scheduled campaigns can be cancelled")
	}
	c.Status = entity.CampaignStatusCancelled
	if err := s.campaigns.Update(ctx, id, c); err != nil {
		return nil, err
	}
	return c, nil
}

func (s *CampaignService) Stats(ctx context.Context, id string) (entity.CampaignStats, error) {
	return s.recipients.Stats(ctx, id)
}

func (s *CampaignService) Recipients(ctx context.Context, id string, page, pageSize int) ([]entity.CampaignRecipient, int, error) {
	return s.recipients.List(ctx, id, page, pageSize)
}

// ProcessOne sends one batch of PENDING recipients for a SENDING campaign
// and marks it SENT once no pending recipients remain. Called directly by
// Send() for immediacy, and by the scheduler's campaign-send job to drain
// the rest (or to progress campaigns ProcessDueCampaigns has just flipped
// from SCHEDULED to SENDING).
func (s *CampaignService) ProcessOne(ctx context.Context, c *entity.Campaign) error {
	if s.mailer == nil {
		return apperror.New(422, "NO_MAILER", "no email provider is configured — cannot send campaigns")
	}
	pending, err := s.recipients.ListPending(ctx, c.ID, campaignSendBatchSize)
	if err != nil {
		return err
	}
	for _, rec := range pending {
		sendErr := s.mailer.SendHTML(rec.Email, c.Subject, c.Body)
		now := time.Now()
		if sendErr != nil {
			_ = s.recipients.UpdateStatus(ctx, rec.ID, entity.RecipientStatusFailed, &now, sendErr.Error())
			continue
		}
		_ = s.recipients.UpdateStatus(ctx, rec.ID, entity.RecipientStatusSent, &now, "")
	}
	stillPending, err := s.recipients.ListPending(ctx, c.ID, 1)
	if err != nil {
		return err
	}
	if len(stillPending) == 0 {
		now := time.Now()
		c.Status = entity.CampaignStatusSent
		c.SentAt = &now
		return s.campaigns.Update(ctx, c.ID, c)
	}
	return nil
}

// ProcessDueCampaigns is the scheduler job body: advance every SCHEDULED
// campaign whose time has come, and drain any campaign still SENDING from a
// previous tick.
func (s *CampaignService) ProcessDueCampaigns(ctx context.Context) error {
	due, err := s.campaigns.ListDueForSend(ctx)
	if err != nil {
		return err
	}
	for i := range due {
		c := &due[i]
		c.Status = entity.CampaignStatusSending
		if err := s.campaigns.Update(ctx, c.ID, c); err != nil {
			continue
		}
		_ = s.ProcessOne(ctx, c)
	}

	sending, _, err := s.campaigns.List(ctx, repository.ListCampaignsOptions{Page: 1, PageSize: 100, Status: entity.CampaignStatusSending})
	if err != nil {
		return err
	}
	for i := range sending {
		_ = s.ProcessOne(ctx, &sending[i])
	}
	return nil
}
