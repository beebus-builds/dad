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
	"github.com/shramjagaran/cms-backend/internal/infrastructure/migrator"
	"github.com/shramjagaran/cms-backend/internal/infrastructure/postgres"
	"github.com/shramjagaran/cms-backend/internal/infrastructure/storage"
	"github.com/shramjagaran/cms-backend/internal/scheduler"
	"github.com/shramjagaran/cms-backend/internal/usecase"
	jwtpkg "github.com/shramjagaran/cms-backend/pkg/jwt"
	"github.com/shramjagaran/cms-backend/pkg/logger"
	"github.com/shramjagaran/cms-backend/pkg/mail"
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

	if err := migrator.MigrateAll(ctx, pool); err != nil {
		logger.L.Fatal("migration failed", zap.Error(err))
	}
	logger.L.Info("migrations applied")

	if err := migrator.SeedAdmin(ctx, pool, migrator.AdminSeed{
		Email:    cfg.Admin.Email,
		Password: cfg.Admin.Password,
		Phone:    cfg.Admin.Phone,
		FullName: cfg.Admin.FullName,
	}); err != nil {
		logger.L.Fatal("seed admin failed", zap.Error(err))
	}
	logger.L.Info("admin seed ok", zap.String("email", cfg.Admin.Email))

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
	pageRepo := postgres.NewPageRepository(pool)
	menuRepo := postgres.NewMenuRepository(pool)
	eventRepo := postgres.NewEventRepository(pool)
	newsRepo := postgres.NewNewsRepository(pool)
	resetTokenRepo := postgres.NewPasswordResetTokenRepository(pool)
	verificationCodeRepo := postgres.NewVerificationCodeRepository(pool)
	complaintRepo := postgres.NewComplaintRepository(pool)
	complaintNoteRepo := postgres.NewComplaintNoteRepository(pool)
	documentRepo := postgres.NewDocumentRepository(pool)
	notificationRepo := postgres.NewNotificationRepository(pool)
	donationRepo := postgres.NewDonationRepository(pool)
	legalCaseRepo := postgres.NewLegalCaseRepository(pool)
	trainingRepo := postgres.NewTrainingRepository(pool)
	incidentRepo := postgres.NewIncidentRepository(pool)
	auditRepo := postgres.NewAuditLogRepository(pool)
	branchRepo := postgres.NewBranchRepository(pool)
	publicEventRegRepo := postgres.NewPublicEventRegistrationRepository(pool)
	memberAppRepo := postgres.NewMemberApplicationRepository(pool)
	contactRepo := postgres.NewContactRepository(pool)
	commLogRepo := postgres.NewCommunicationLogRepository(pool)
	campaignRepo := postgres.NewCampaignRepository(pool)
	campaignRecipientRepo := postgres.NewCampaignRecipientRepository(pool)

	authSvc := usecase.NewAuthService(userRepo, nil, resetTokenRepo, verificationCodeRepo, nil)
	memberSvc := usecase.NewMemberService(memberRepo)
	eventSvc := usecase.NewEventService(eventRepo)
	newsSvc := usecase.NewNewsService(newsRepo)
	pageSvc := usecase.NewPageUsecase(pageRepo)
	menuSvc := usecase.NewMenuUsecase(menuRepo)
	settingsSvc := usecase.NewSettingsService(pool)
	complaintSvc := usecase.NewComplaintService(complaintRepo)
	complaintNoteSvc := usecase.NewComplaintNoteService(complaintNoteRepo, complaintRepo)
	documentSvc := usecase.NewDocumentService(documentRepo)
	notificationSvc := usecase.NewNotificationService(notificationRepo)
	donationSvc := usecase.NewDonationService(donationRepo)
	legalSvc := usecase.NewLegalCaseService(legalCaseRepo)
	trainingSvc := usecase.NewTrainingService(trainingRepo)
	incidentSvc := usecase.NewIncidentService(incidentRepo)
	auditSvc := usecase.NewAuditLogService(auditRepo)
	branchSvc := usecase.NewBranchService(branchRepo)
	publicEventSvc := usecase.NewPublicEventService(eventRepo, publicEventRegRepo)
	memberAppSvc := usecase.NewMemberApplicationService(memberAppRepo)
	contactSvc := usecase.NewContactService(contactRepo)
	commLogSvc := usecase.NewCommunicationLogService(commLogRepo)

	handlers := &handler.Handlers{
		Auth:              authSvc,
		Members:           memberSvc,
		Events:            eventSvc,
		News:              newsSvc,
		Pages:             pageSvc,
		Menus:             menuSvc,
		Users:             authSvc,
		Settings:          settingsSvc,
		Complaints:        complaintSvc,
		ComplaintNotes:    complaintNoteSvc,
		Documents:         documentSvc,
		Notifications:     notificationSvc,
		Donations:         donationSvc,
		LegalCases:        legalSvc,
		Training:          trainingSvc,
		Incidents:         incidentSvc,
		AuditLog:          auditSvc,
		Branches:          branchSvc,
		PublicEvents:      publicEventSvc,
		MemberApps:        memberAppSvc,
		Contact:           contactSvc,
		CommunicationLogs: commLogSvc,
		DB:                pool,
		Cache:             c,
	}

	jm := jwtpkg.NewManager(cfg.JWT.Secret, cfg.JWT.AccessExpiresIn, cfg.JWT.RefreshExpiresIn, cfg.JWT.Issuer)
	authSvc.SetJWTManager(jm)

	var mailer mail.Mailer
	if cfg.Mail.Provider == "resend" && cfg.Mail.ResendAPIKey != "" {
		mailer = mail.NewResendSender(cfg.Mail.ResendAPIKey, cfg.SMTP.From)
		logger.L.Info("mailer configured", zap.String("provider", "resend"))
	} else if cfg.SMTP.Host != "" {
		mailer = mail.NewSender(cfg.SMTP)
		logger.L.Info("mailer configured", zap.String("provider", "smtp"), zap.String("host", cfg.SMTP.Host))
	} else {
		logger.L.Warn("no mail provider configured — password reset, renewal reminder, and campaign emails disabled")
	}
	if smtpSender, ok := mailer.(*mail.Sender); ok {
		authSvc.SetMailer(smtpSender, cfg.App.FrontendURL, cfg.App.Name)
	}

	campaignSvc := usecase.NewCampaignService(campaignRepo, campaignRecipientRepo, memberRepo, mailer)
	handlers.Campaigns = campaignSvc

	schedCtx, schedCancel := context.WithCancel(context.Background())
	sched := scheduler.New(1*time.Hour,
		scheduler.NewRenewalReminderJob(memberRepo, notificationSvc, mailer, cfg.App.Name, 14),
		scheduler.NewComplaintEscalationJob(complaintSvc),
		campaignSvc.ProcessDueCampaigns,
	)
	go sched.Start(schedCtx)

	r := router.New(cfg, handlers, jm, auditRepo, branchRepo)

	srv := &http.Server{
		Addr:              ":" + cfg.HTTP.Port,
		Handler:           r,
		ReadTimeout:       cfg.HTTP.ReadTimeout,
		WriteTimeout:      cfg.HTTP.WriteTimeout,
		IdleTimeout:       cfg.HTTP.IdleTimeout,
		ReadHeaderTimeout: cfg.HTTP.ReadHeaderTimeout,
		MaxHeaderBytes:    cfg.HTTP.MaxHeaderBytes,
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
	schedCancel()

	shutCtx, c2 := context.WithTimeout(context.Background(), 10*time.Second)
	defer c2()
	_ = srv.Shutdown(shutCtx)
	return nil
}
