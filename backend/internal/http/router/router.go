package router

import (
	"github.com/gin-gonic/gin"
	"github.com/shramjagaran/cms-backend/internal/config"
	"github.com/shramjagaran/cms-backend/internal/domain/rbac"
	"github.com/shramjagaran/cms-backend/internal/domain/repository"
	"github.com/shramjagaran/cms-backend/internal/http/handler"
	"github.com/shramjagaran/cms-backend/internal/http/middleware"
	"github.com/shramjagaran/cms-backend/pkg/jwt"
)

func New(cfg *config.Config, h *handler.Handlers, jm *jwt.Manager, auditRepo repository.AuditLogRepository, branchRepo repository.BranchRepository) *gin.Engine {
	scopeResolver := middleware.NewBranchScopeResolver(branchRepo)
	if cfg.App.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}
	r := gin.New()
	r.Use(middleware.RequestID())
	r.Use(gin.Logger())
	r.Use(middleware.Recovery())
	r.Use(middleware.SecurityHeaders())
	r.Use(middleware.CORS(cfg.CORS.Origins))
	r.Use(middleware.NewRateLimiter(cfg.RateLimit.Requests).Middleware())
	if len(cfg.HTTP.TrustedProxies) > 0 {
		_ = r.SetTrustedProxies(cfg.HTTP.TrustedProxies)
	}

	authLimiter := middleware.NewRateLimiter(20).Middleware()

	r.GET("/health", h.Health)
	r.GET("/ready", h.Ready)

	api := r.Group("/api/v1")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/login", authLimiter, h.Login)
			auth.POST("/register", authLimiter, h.Register)
			auth.POST("/refresh", authLimiter, h.Refresh)
			auth.POST("/forgot-password", authLimiter, h.ForgotPassword)
			auth.POST("/reset-password", authLimiter, h.ResetPassword)
			auth.POST("/verify-email", authLimiter, h.VerifyEmail)
			auth.POST("/resend-otp", authLimiter, h.ResendOTP)
		}

		authed := api.Group("")
		authed.Use(middleware.Auth(jm), middleware.Audit(auditRepo))
		{
			authed.GET("/auth/me", h.Me)
			authed.POST("/auth/logout", h.Logout)
			authed.GET("/notifications", h.ListNotifications)
			authed.PATCH("/notifications/:id/read", h.MarkRead)
			authed.POST("/notifications/read-all", h.MarkAllRead)
		authed.PATCH("/auth/profile", h.UpdateProfile)
		}

		api.GET("/reports/dashboard", middleware.Auth(jm), middleware.RequirePerm(rbac.PermReportsView), h.ReportsDashboard)
		api.GET("/reports/branches", middleware.Auth(jm), middleware.RequirePerm(rbac.PermReportsView), h.ReportsBranches)

		api.Group("/users").Use(middleware.Auth(jm), middleware.RequirePerm(rbac.PermUsersManage)).
			GET("", h.ListUsers).GET("/:id", h.GetUser)
		api.Group("/users").Use(middleware.Auth(jm), middleware.RequirePerm(rbac.PermUsersManage)).
			POST("", h.CreateUser).PATCH("/:id", h.UpdateUser).DELETE("/:id", h.DeactivateUser)
		api.Group("/users").Use(middleware.Auth(jm), middleware.RequirePerm(rbac.PermUsersManage)).
			DELETE("/:id/hard", h.DeleteUser)

		api.GET("/audit-logs", middleware.Auth(jm), middleware.RequirePerm(rbac.PermAuditView), h.ListAuditLogs)

		api.GET("/settings", middleware.Auth(jm), h.GetOrganisationSettings)
		api.PUT("/settings", middleware.Auth(jm), middleware.RequirePerm(rbac.PermSettingsManage), middleware.Audit(auditRepo), h.UpdateOrganisationSettings)

		api.Group("/members").Use(middleware.Auth(jm), middleware.BranchScope(scopeResolver), middleware.RequirePerm(rbac.PermMembersRead)).
			GET("", h.ListMembers).GET("/:id", h.GetMember).GET("/:id/timeline", h.GetMemberTimeline).GET("/:id/communication-logs", h.ListCommunicationLogs)
		api.Group("/members").Use(middleware.Auth(jm), middleware.BranchScope(scopeResolver), middleware.RequirePerm(rbac.PermMembersWrite)).
			POST("", h.CreateMember).POST("/import", h.ImportMembers).PATCH("/:id", h.UpdateMember).DELETE("/:id", h.DeleteMember).
			POST("/:id/communication-logs", h.CreateCommunicationLog)

		api.Group("/complaints").Use(middleware.Auth(jm), middleware.BranchScope(scopeResolver), middleware.RequirePerm(rbac.PermComplaintsRead)).
			GET("", h.ListComplaints).GET("/:id", h.GetComplaint).GET("/stats", h.ComplaintStats).GET("/:id/notes", h.ListComplaintNotes)
		api.Group("/complaints").Use(middleware.Auth(jm), middleware.BranchScope(scopeResolver), middleware.RequirePerm(rbac.PermComplaintsWrite)).
			POST("", h.CreateComplaint).PATCH("/:id", h.UpdateComplaint).POST("/:id/notes", h.AddComplaintNote)

		// Frontend's donations-service.ts calls "/payments", not "/donations" — match it here.
		api.Group("/payments").Use(middleware.Auth(jm), middleware.RequirePerm(rbac.PermDonationsRead)).
			GET("", h.ListDonations).GET("/:id", h.GetDonation).GET("/total", h.DonationsTotal)
		api.Group("/payments").Use(middleware.Auth(jm), middleware.RequirePerm(rbac.PermDonationsWrite)).
			POST("", h.CreateDonation)

		api.Group("/legal-cases").Use(middleware.Auth(jm), middleware.RequirePerm(rbac.PermLegalRead)).
			GET("", h.ListLegal).GET("/:id", h.GetLegal)
		api.Group("/legal-cases").Use(middleware.Auth(jm), middleware.RequirePerm(rbac.PermLegalWrite)).
			POST("", h.CreateLegal).PATCH("/:id", h.UpdateLegal)

		// Frontend's training-service.ts calls "/training" (singular), not "/trainings".
		api.Group("/training").Use(middleware.Auth(jm), middleware.RequirePerm(rbac.PermTrainingRead)).
			GET("", h.ListTrainings).GET("/:id", h.GetTraining)
		api.Group("/training").Use(middleware.Auth(jm), middleware.RequirePerm(rbac.PermTrainingWrite)).
			POST("", h.CreateTraining).DELETE("/:id", h.DeleteTraining)

		api.Group("/incidents").Use(middleware.Auth(jm), middleware.RequirePerm(rbac.PermIncidentsRead)).
			GET("", h.ListIncidents).GET("/:id", h.GetIncident)
		api.Group("/incidents").Use(middleware.Auth(jm), middleware.RequirePerm(rbac.PermIncidentsWrite)).
			POST("", h.CreateIncident)

		api.Group("/documents").Use(middleware.Auth(jm), middleware.RequirePerm(rbac.PermDocumentsRead)).
			GET("", h.ListDocuments).GET("/:id", h.GetDocument)
		api.Group("/documents").Use(middleware.Auth(jm), middleware.RequirePerm(rbac.PermDocumentsWrite)).
			POST("", h.CreateDocument).DELETE("/:id", h.DeleteDocument)

		api.Group("/campaigns").Use(middleware.Auth(jm), middleware.RequirePerm(rbac.PermCampaignsRead)).
			GET("", h.ListCampaigns).GET("/:id", h.GetCampaign).GET("/:id/stats", h.CampaignStats).GET("/:id/recipients", h.ListCampaignRecipients)
		api.Group("/campaigns").Use(middleware.Auth(jm), middleware.RequirePerm(rbac.PermCampaignsWrite)).
			POST("", h.CreateCampaign).PATCH("/:id", h.UpdateCampaign).POST("/preview-audience", h.PreviewCampaignAudience).
			POST("/:id/schedule", h.ScheduleCampaign).POST("/:id/send", h.SendCampaign).POST("/:id/cancel", h.CancelCampaign)

		api.Group("/branches").Use(middleware.Auth(jm), middleware.RequirePerm(rbac.PermBranchesManage)).
			GET("", h.BranchesList).GET("/:id", h.GetBranch).
			POST("", h.CreateBranch).PATCH("/:id", h.UpdateBranch).DELETE("/:id", h.DeleteBranch)

		api.Group("/events").Use(middleware.Auth(jm), middleware.RequirePerm(rbac.PermEventsRead)).
			GET("", h.ListEvents).GET("/:id", h.GetEvent)
		api.Group("/events").Use(middleware.Auth(jm), middleware.RequirePerm(rbac.PermEventsWrite)).
			POST("", h.CreateEvent).PATCH("/:id", h.UpdateEvent).DELETE("/:id", h.DeleteEvent)
		
		api.Group("/news").Use(middleware.Auth(jm), middleware.RequirePerm(rbac.PermNewsRead)).
			GET("", h.ListNews).GET("/:id", h.GetNews)
		api.Group("/news").Use(middleware.Auth(jm), middleware.RequirePerm(rbac.PermNewsWrite)).
			POST("", h.CreateNews).PATCH("/:id", h.UpdateNews).DELETE("/:id", h.DeleteNews)
		api.Group("/pages").Use(middleware.Auth(jm), middleware.RequirePerm(rbac.PermUsersManage)).
			GET("", h.ListPages).POST("", h.CreatePage).PATCH("/:id", h.UpdatePage).DELETE("/:id", h.DeletePage)
		api.Group("/menus").Use(middleware.Auth(jm), middleware.RequirePerm(rbac.PermUsersManage)).
			GET("", h.ListMenus).POST("", h.CreateMenu).PATCH("/:id", h.UpdateMenu).DELETE("/:id", h.DeleteMenu)
		
		public := api.Group("/public")
		{
			public.GET("/menu", h.PublicGetMenu)
			public.GET("/search", h.PublicSearch)
			public.GET("/news", h.PublicListNews)
			public.GET("/news/:slug", h.PublicGetNewsBySlug)
			public.GET("/pages/:slug", h.GetPageBySlug)
			public.POST("/events/:id/register", h.PublicRegisterForEvent)
			public.POST("/members/apply", h.PublicMemberApply)
			public.GET("/members/:id", h.PublicGetMemberProfile)
			public.POST("/donations", h.PublicCreateDonation)
			public.POST("/contact", h.PublicContactSubmit)
		}
	}

	return r
}
