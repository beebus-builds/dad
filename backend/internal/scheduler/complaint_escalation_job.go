package scheduler

import (
	"context"

	"github.com/shramjagaran/cms-backend/internal/domain/entity"
	"github.com/shramjagaran/cms-backend/internal/domain/repository"
	"github.com/shramjagaran/cms-backend/internal/usecase"
	"github.com/shramjagaran/cms-backend/pkg/logger"
	"go.uber.org/zap"
)

// NewComplaintEscalationJob auto-transitions OPEN/IN_REVIEW complaints past
// their due date to ESCALATED. Complaint.IsOverdue is already computed at
// read time for on-demand display; this job is what actually acts on it
// proactively instead of waiting for someone to look.
func NewComplaintEscalationJob(complaints *usecase.ComplaintService) Job {
	return func(ctx context.Context) error {
		for _, status := range []string{entity.ComplaintStatusOpen, entity.ComplaintStatusInReview} {
			list, _, err := complaints.List(ctx, repository.ListComplaintsOptions{Page: 1, PageSize: 500, Status: status})
			if err != nil {
				return err
			}
			for _, c := range list {
				if !c.IsOverdue {
					continue
				}
				if _, err := complaints.Update(ctx, c.ID, entity.ComplaintStatusEscalated, "", ""); err != nil {
					logger.L.Warn("complaint escalation: failed to update", zap.String("complaintId", c.ID), zap.Error(err))
				}
			}
		}
		return nil
	}
}
