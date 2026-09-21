package scheduler

import (
	"context"
	"fmt"

	"github.com/shramjagaran/cms-backend/internal/domain/entity"
	"github.com/shramjagaran/cms-backend/internal/domain/repository"
	"github.com/shramjagaran/cms-backend/internal/usecase"
	"github.com/shramjagaran/cms-backend/pkg/logger"
	"github.com/shramjagaran/cms-backend/pkg/mail"
	"go.uber.org/zap"
)

// NewRenewalReminderJob checks for ACTIVE members whose membership expires
// within thresholdDays, and for each: creates an in-app notification (if
// they have a linked user account) and sends an email (if a mailer is
// configured and they have an email on file). mailer may be nil — email
// sending is skipped, not an error, until Phase 6 wires a provider.
func NewRenewalReminderJob(members repository.MemberRepository, notifications *usecase.NotificationService, mailer mail.Mailer, appName string, thresholdDays int) Job {
	return func(ctx context.Context) error {
		expiring, err := members.ListExpiringWithin(ctx, thresholdDays)
		if err != nil {
			return err
		}
		for _, m := range expiring {
			body := fmt.Sprintf("Your %s membership (#%s) expires on %s. Please renew to keep your benefits active.",
				appName, m.MembershipNumber, m.ExpiresAt.Format("2006-01-02"))

			if m.UserID != nil {
				if err := notifications.Create(ctx, &entity.Notification{
					UserID: *m.UserID,
					Title:  "Membership renewal due soon",
					Body:   body,
					Type:   "WARNING",
				}); err != nil {
					logger.L.Warn("renewal reminder: failed to create notification", zap.String("memberId", m.ID), zap.Error(err))
				}
			}

			if mailer != nil && m.Email != nil && *m.Email != "" {
				if err := mailer.Send(*m.Email, appName+" — membership renewal due soon", body); err != nil {
					logger.L.Warn("renewal reminder: failed to send email", zap.String("memberId", m.ID), zap.Error(err))
				}
			}

			if err := members.MarkRenewalReminderSent(ctx, m.ID); err != nil {
				logger.L.Warn("renewal reminder: failed to mark sent", zap.String("memberId", m.ID), zap.Error(err))
			}
		}
		return nil
	}
}
