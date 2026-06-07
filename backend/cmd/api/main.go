package main

import (
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/shramjagaran/cms-backend/internal/config"
	"github.com/shramjagaran/cms-backend/internal/http/handler"
	"github.com/shramjagaran/cms-backend/internal/http/router"
	"github.com/shramjagaran/cms-backend/internal/infrastructure/cache"
	"github.com/shramjagaran/cms-backend/internal/infrastructure/db"
	"github.com/shramjagaran/cms-backend/internal/infrastructure/postgres"
	"github.com/shramjagaran/cms-backend/internal/infrastructure/storage"
	"github.com/shramjagaran/cms-backend/internal/usecase"
	jwtpkg "github.com/shramjagaran/cms-backend/pkg/jwt"
	"github.com/shramjagaran/cms-backend/pkg/logger"
	"go.uber.org/zap"
)

func main() {
	if err := run(); err != nil {
		log.Fatalf("fatal: %v", err)
	}
}

func run() error {
	cfg, err := config.Load()
	if err != nil {
		return fmt.Errorf("load config: %w", err)
	}
	if err := logger.Init(cfg.App.Env); err != nil {
		return fmt.Errorf("init logger: %w", err)
	}
	defer logger.Sync()

	logger.L.Info("starting shram-jagaran-cms",
		zap.String("env", cfg.App.Env),
		zap.String("version", cfg.App.Version),
	)

	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	pool, err := db.NewPool(ctx, cfg.Database)
	if err != nil {
		return fmt.Errorf("init db: %w", err)
	}
	defer pool.Close()
	logger.L.Info("db pool ready")

	c, err := cache.New(cfg.Redis)
	if err != nil {
		logger.L.Warn("redis disabled", zap.Error(err))
		c = nil
	} else {
		defer c.Close()
		logger.L.Info("redis connected")
	}

	_, err = storage.NewR2(ctx, cfg.R2)
	if err != nil {
		logger.L.Warn("r2 disabled", zap.Error(err))
	} else {
		logger.L.Info("r2 ready")
	}

	userRepo := postgres.NewUserRepository(pool)
	memberRepo := postgres.NewMemberRepository(pool)
	branchRepo := postgres.NewBranchRepository(pool)
	complaintRepo := postgres.NewComplaintRepository(pool)
	eventRepo := postgres.NewEventRepository(pool)
	newsRepo := postgres.NewNewsRepository(pool)
	documentRepo := postgres.NewDocumentRepository(pool)
	donationRepo := postgres.NewDonationRepository(pool)
	legalRepo := postgres.NewLegalCaseRepository(pool)
	trainingRepo := postgres.NewTrainingRepository(pool)
	incidentRepo := postgres.NewIncidentRepository(pool)
	notifRepo := postgres.NewNotificationRepository(pool)
	auditRepo := postgres.NewAuditLogRepository(pool)

	authSvc := usecase.NewAuthService(userRepo, auditRepo, nil)
	memberSvc := usecase.NewMemberService(memberRepo)
	complaintSvc := usecase.NewComplaintService(complaintRepo)
	eventSvc := usecase.NewEventService(eventRepo)
	newsSvc := usecase.NewNewsService(newsRepo)
	documentSvc := usecase.NewDocumentService(documentRepo)
	donationSvc := usecase.NewDonationService(donationRepo)
	legalSvc := usecase.NewLegalCaseService(legalRepo)
	trainingSvc := usecase.NewTrainingService(trainingRepo)
	incidentSvc := usecase.NewIncidentService(incidentRepo)
	notifSvc := usecase.NewNotificationService(notifRepo)

	_ = branchRepo

	handlers := &handler.Handlers{
		Auth:          authSvc,
		Members:       memberSvc,
		Complaints:    complaintSvc,
		Events:        eventSvc,
		News:          newsSvc,
		Documents:     documentSvc,
		Donations:     donationSvc,
		LegalCases:    legalSvc,
		Training:      trainingSvc,
		Incidents:     incidentSvc,
		Notifications: notifSvc,
		DB:            pool,
		Cache:         c,
	}

	jm := jwtpkg.NewManager(cfg.JWT.Secret, cfg.JWT.AccessExpiresIn, cfg.JWT.RefreshExpiresIn, cfg.JWT.Issuer)
	authSvc.SetJWTManager(jm)

	r := router.New(cfg, handlers, jm)

	srv := &http.Server{
		Addr:         ":" + cfg.HTTP.Port,
		Handler:      r,
		ReadTimeout:  cfg.HTTP.ReadTimeout,
		WriteTimeout: cfg.HTTP.WriteTimeout,
	}

	go func() {
		logger.L.Info("http listening", zap.String("addr", srv.Addr))
		if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			logger.L.Fatal("server error", zap.Error(err))
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	logger.L.Info("shutting down")

	shutCtx, c2 := context.WithTimeout(context.Background(), 10*time.Second)
	defer c2()
	_ = srv.Shutdown(shutCtx)
	return nil
}
