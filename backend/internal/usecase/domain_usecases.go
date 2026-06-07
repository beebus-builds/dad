package usecase

import (
	"context"
	"time"

	"github.com/google/uuid"
	"github.com/shramjagaran/cms-backend/internal/domain/entity"
	"github.com/shramjagaran/cms-backend/internal/domain/repository"
)

type NewsService struct{ repo repository.NewsRepository }

func NewNewsService(r repository.NewsRepository) *NewsService { return &NewsService{repo: r} }

type CreateNewsInput struct {
	Slug          string
	Title         string
	TitleNepali   string
	Excerpt       string
	Content       string
	Category      string
	CoverImageURL string
	Tags          []string
}

func (s *NewsService) Create(ctx context.Context, userID string, in CreateNewsInput) (*entity.News, error) {
	slug := in.Slug
	if slug == "" {
		slug = slugify(in.Title)
	}
	n := &entity.News{
		ID:            uuid.NewString(),
		Slug:          slug,
		Title:         in.Title,
		TitleNepali:   strPtr(in.TitleNepali),
		Excerpt:       in.Excerpt,
		Content:       in.Content,
		CoverImageURL: strPtr(in.CoverImageURL),
		Category:      defaultStr(in.Category, "OTHER"),
		Status:        entity.NewsStatusDraft,
		AuthorID:      userID,
		Tags:          in.Tags,
	}
	if err := s.repo.Create(ctx, n); err != nil {
		return nil, err
	}
	return n, nil
}

func (s *NewsService) Get(ctx context.Context, id string) (*entity.News, error) {
	return s.repo.GetByID(ctx, id)
}

func (s *NewsService) GetBySlug(ctx context.Context, slug string) (*entity.News, error) {
	return s.repo.GetBySlug(ctx, slug)
}

func (s *NewsService) Update(ctx context.Context, id string, in CreateNewsInput, status string) (*entity.News, error) {
	existing, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	existing.Title = in.Title
	existing.TitleNepali = strPtr(in.TitleNepali)
	existing.Slug = in.Slug
	existing.Excerpt = in.Excerpt
	existing.Content = in.Content
	existing.CoverImageURL = strPtr(in.CoverImageURL)
	existing.Category = in.Category
	existing.Tags = in.Tags
	if status != "" {
		existing.Status = status
		if status == entity.NewsStatusPublished && existing.PublishedAt == nil {
			now := time.Now()
			existing.PublishedAt = &now
		}
	}
	if err := s.repo.Update(ctx, id, existing); err != nil {
		return nil, err
	}
	return existing, nil
}

func (s *NewsService) Delete(ctx context.Context, id string) error { return s.repo.Delete(ctx, id) }
func (s *NewsService) List(ctx context.Context, opts repository.ListNewsOptions) ([]entity.News, int, error) {
	return s.repo.List(ctx, opts)
}
func (s *NewsService) View(ctx context.Context, id string) error { return s.repo.IncrementViews(ctx, id) }

type DocumentService struct{ repo repository.DocumentRepository }

func NewDocumentService(r repository.DocumentRepository) *DocumentService { return &DocumentService{repo: r} }

type CreateDocumentInput struct {
	Title       string
	Description string
	FileURL     string
	FileType    string
	FileSize    int64
	Category    string
	Visibility  string
}

func (s *DocumentService) Create(ctx context.Context, userID string, in CreateDocumentInput) (*entity.Document, error) {
	d := &entity.Document{
		ID:          uuid.NewString(),
		Title:       in.Title,
		Description: strPtr(in.Description),
		FileURL:     in.FileURL,
		FileType:    in.FileType,
		FileSize:    in.FileSize,
		Category:    in.Category,
		Visibility:  defaultStr(in.Visibility, entity.DocumentVisibilityMembers),
		UploadedBy:  userID,
	}
	if err := s.repo.Create(ctx, d); err != nil {
		return nil, err
	}
	return d, nil
}
func (s *DocumentService) List(ctx context.Context, opts repository.ListDocumentsOptions) ([]entity.Document, int, error) {
	return s.repo.List(ctx, opts)
}
func (s *DocumentService) Get(ctx context.Context, id string) (*entity.Document, error) { return s.repo.GetByID(ctx, id) }
func (s *DocumentService) Delete(ctx context.Context, id string) error { return s.repo.Delete(ctx, id) }

type DonationService struct{ repo repository.DonationRepository }

func NewDonationService(r repository.DonationRepository) *DonationService { return &DonationService{repo: r} }

type CreateDonationInput struct {
	DonorName  string
	DonorEmail string
	DonorPhone string
	Amount     float64
	Currency   string
	Method     string
	Purpose    string
}

func (s *DonationService) Create(ctx context.Context, in CreateDonationInput) (*entity.Donation, error) {
	rn := "DON-" + time.Now().Format("2006") + "-" + uuid.NewString()[:6]
	d := &entity.Donation{
		ID:           uuid.NewString(),
		ReceiptNumber: rn,
		DonorName:    in.DonorName,
		DonorEmail:   strPtr(in.DonorEmail),
		DonorPhone:   strPtr(in.DonorPhone),
		Amount:       in.Amount,
		Currency:     defaultStr(in.Currency, "NPR"),
		Method:       in.Method,
		Purpose:      strPtr(in.Purpose),
		Status:       entity.DonationStatusPending,
	}
	if err := s.repo.Create(ctx, d); err != nil {
		return nil, err
	}
	return d, nil
}
func (s *DonationService) List(ctx context.Context, opts repository.ListDonationsOptions) ([]entity.Donation, int, error) {
	return s.repo.List(ctx, opts)
}
func (s *DonationService) Total(ctx context.Context) (float64, error) { return s.repo.SumTotal(ctx) }

type LegalCaseService struct{ repo repository.LegalCaseRepository }

func NewLegalCaseService(r repository.LegalCaseRepository) *LegalCaseService { return &LegalCaseService{repo: r} }

type CreateLegalInput struct {
	CaseNumber     string
	Title          string
	Description    string
	Type           string
	MemberID       string
	AssignedAdvisor string
	BranchID       string
	NextHearingAt  *time.Time
}

func (s *LegalCaseService) Create(ctx context.Context, in CreateLegalInput) (*entity.LegalCase, error) {
	cn := in.CaseNumber
	if cn == "" {
		cn = "LEG-" + uuid.NewString()[:6]
	}
	c := &entity.LegalCase{
		ID:               uuid.NewString(),
		CaseNumber:       cn,
		Title:            in.Title,
		Description:      in.Description,
		Type:             in.Type,
		Status:           entity.LegalStatusIntake,
		MemberID:         strPtr(in.MemberID),
		AssignedAdvisor:  strPtr(in.AssignedAdvisor),
		BranchID:         strPtr(in.BranchID),
		FiledAt:          time.Now(),
		NextHearingAt:    in.NextHearingAt,
	}
	if err := s.repo.Create(ctx, c); err != nil {
		return nil, err
	}
	return c, nil
}
func (s *LegalCaseService) Get(ctx context.Context, id string) (*entity.LegalCase, error) { return s.repo.GetByID(ctx, id) }
func (s *LegalCaseService) List(ctx context.Context, opts repository.ListLegalCasesOptions) ([]entity.LegalCase, int, error) {
	return s.repo.List(ctx, opts)
}
func (s *LegalCaseService) Update(ctx context.Context, id string, status, advisor string) (*entity.LegalCase, error) {
	existing, err := s.repo.GetByID(ctx, id)
	if err != nil {
		return nil, err
	}
	if status != "" {
		existing.Status = status
		if status == entity.LegalStatusResolved {
			now := time.Now()
			existing.ResolvedAt = &now
		}
	}
	if advisor != "" {
		existing.AssignedAdvisor = &advisor
	}
	if err := s.repo.Update(ctx, id, existing); err != nil {
		return nil, err
	}
	return existing, nil
}

type TrainingService struct{ repo repository.TrainingRepository }

func NewTrainingService(r repository.TrainingRepository) *TrainingService { return &TrainingService{repo: r} }

type CreateTrainingInput struct {
	Title       string
	TitleNepali string
	Description string
	StartsAt    time.Time
	EndsAt      time.Time
	Location    string
	Trainer     string
	Capacity    int
	BranchID    string
}

func (s *TrainingService) Create(ctx context.Context, userID string, in CreateTrainingInput) (*entity.Training, error) {
	t := &entity.Training{
		ID:           uuid.NewString(),
		Title:        in.Title,
		TitleNepali:  strPtr(in.TitleNepali),
		Description:  in.Description,
		StartsAt:     in.StartsAt,
		EndsAt:       in.EndsAt,
		Location:     in.Location,
		Trainer:      strPtr(in.Trainer),
		Capacity:     intPtr(in.Capacity),
		Status:       entity.TrainingStatusUpcoming,
		BranchID:     strPtr(in.BranchID),
		CreatedBy:    userID,
	}
	if err := s.repo.Create(ctx, t); err != nil {
		return nil, err
	}
	return t, nil
}
func (s *TrainingService) List(ctx context.Context, opts repository.ListTrainingsOptions) ([]entity.Training, int, error) {
	return s.repo.List(ctx, opts)
}
func (s *TrainingService) Get(ctx context.Context, id string) (*entity.Training, error) { return s.repo.GetByID(ctx, id) }
func (s *TrainingService) Delete(ctx context.Context, id string) error { return s.repo.Delete(ctx, id) }

type IncidentService struct{ repo repository.IncidentRepository }

func NewIncidentService(r repository.IncidentRepository) *IncidentService { return &IncidentService{repo: r} }

type CreateIncidentInput struct {
	Title         string
	Description   string
	Severity      string
	OccurredAt    time.Time
	Location      string
	WorkplaceName string
	BranchID      string
}

func (s *IncidentService) Create(ctx context.Context, userID string, in CreateIncidentInput) (*entity.Incident, error) {
	i := &entity.Incident{
		ID:             uuid.NewString(),
		IncidentNumber: "OSH-" + time.Now().Format("2006") + "-" + uuid.NewString()[:6],
		Title:          in.Title,
		Description:    in.Description,
		Severity:       defaultStr(in.Severity, entity.IncidentSeverityModerate),
		OccurredAt:     in.OccurredAt,
		Location:       in.Location,
		WorkplaceName:  strPtr(in.WorkplaceName),
		ReportedBy:     userID,
		BranchID:       strPtr(in.BranchID),
		Status:         entity.IncidentStatusReported,
	}
	if err := s.repo.Create(ctx, i); err != nil {
		return nil, err
	}
	return i, nil
}
func (s *IncidentService) List(ctx context.Context, opts repository.ListIncidentsOptions) ([]entity.Incident, int, error) {
	return s.repo.List(ctx, opts)
}
func (s *IncidentService) Get(ctx context.Context, id string) (*entity.Incident, error) { return s.repo.GetByID(ctx, id) }

type NotificationService struct{ repo repository.NotificationRepository }

func NewNotificationService(r repository.NotificationRepository) *NotificationService {
	return &NotificationService{repo: r}
}

func (s *NotificationService) List(ctx context.Context, userID string) ([]entity.Notification, error) {
	return s.repo.List(ctx, userID, 50)
}
func (s *NotificationService) MarkRead(ctx context.Context, id, userID string) error {
	return s.repo.MarkRead(ctx, id, userID)
}
func (s *NotificationService) MarkAllRead(ctx context.Context, userID string) error {
	return s.repo.MarkAllRead(ctx, userID)
}
func (s *NotificationService) UnreadCount(ctx context.Context, userID string) (int, error) {
	return s.repo.UnreadCount(ctx, userID)
}
