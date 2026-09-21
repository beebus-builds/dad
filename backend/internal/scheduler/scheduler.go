package scheduler

import (
	"context"
	"time"

	"github.com/shramjagaran/cms-backend/pkg/logger"
	"go.uber.org/zap"
)

// Job is one unit of periodic background work (renewal reminders, campaign
// sends, complaint escalation, ...). A Job's error is logged, never fatal —
// one failing job must not stop the others or crash the process.
type Job func(ctx context.Context) error

// Scheduler runs a fixed set of Jobs on a shared ticker. There's no
// distributed coordination — this is a single in-process ticker, adequate
// for the single free-tier instance this API currently runs on. See
// docs/architecture.md discussion in the CRM plan for the upgrade path
// (a cron-triggered internal endpoint) if/when multi-instance matters.
type Scheduler struct {
	interval time.Duration
	jobs     []Job
}

func New(interval time.Duration, jobs ...Job) *Scheduler {
	return &Scheduler{interval: interval, jobs: jobs}
}

// Start blocks, running every job once immediately and then again on every
// tick, until ctx is cancelled. Call it in a goroutine.
func (s *Scheduler) Start(ctx context.Context) {
	s.runAll(ctx)
	ticker := time.NewTicker(s.interval)
	defer ticker.Stop()
	for {
		select {
		case <-ctx.Done():
			return
		case <-ticker.C:
			s.runAll(ctx)
		}
	}
}

func (s *Scheduler) runAll(ctx context.Context) {
	for _, job := range s.jobs {
		if err := job(ctx); err != nil {
			logger.L.Error("scheduled job failed", zap.Error(err))
		}
	}
}
