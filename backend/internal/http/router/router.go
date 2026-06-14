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

func New(cfg *config.Config, h *handler.Handlers, jm *jwt.Manager, auditRepo repository.AuditLogRepository) *gin.Engine {
	if cfg.App.Env == "production" {
		gin.SetMode(gin.ReleaseMode)
	}
	r := gin.New()
	r.Use(gin.Logger())
	r.Use(middleware.Recovery())
	r.Use(middleware.CORS(cfg.CORS.Origins))
	r.Use(middleware.NewRateLimiter(cfg.RateLimit.Requests).Middleware())

	r.GET("/health", h.Health)

	api := r.Group("/api/v1")
	{
		auth := api.Group("/auth")
		{
			auth.POST("/login", h.Login)
			auth.POST("/register", h.Register)
			auth.POST("/refresh", h.Refresh)
			auth.POST("/forgot-password", h.ForgotPassword)
			auth.POST("/reset-password", h.ResetPassword)
		}

		authed := api.Group("")
		authed.Use(middleware.Auth(jm), middleware.Audit(auditRepo))
		{
			authed.GET("/auth/me", h.Me)
			authed.POST("/auth/logout", h.Logout)
			authed.GET("/notifications", h.ListNotifications)
			authed.PATCH("/notifications/:id/read", h.MarkRead)
			authed.POST("/notifications/read-all", h.MarkAllRead)
			authed.GET("/reports/dashboard", h.ReportsDashboard)
		authed.PATCH("/auth/profile", h.UpdateProfile)
		}

		api.Group("/users").Use(middleware.Auth(jm), middleware.RequirePerm(rbac.PermUsersManage)).
			GET("", h.ListUsers).GET("/:id", h.GetUser)
		api.Group("/users").Use(middleware.Auth(jm), middleware.RequirePerm(rbac.PermUsersManage)).
			POST("", h.CreateUser).PATCH("/:id", h.UpdateUser).DELETE("/:id", h.DeactivateUser)

		api.Group("/branches").Use(middleware.Auth(jm), middleware.RequirePerm(rbac.PermBranchesManage)).
			GET("", h.BranchesList).GET("/:id", h.GetBranch)
		api.Group("/branches").Use(middleware.Auth(jm), middleware.RequirePerm(rbac.PermBranchesManage)).
			POST("", h.CreateBranch).PATCH("/:id", h.UpdateBranch).DELETE("/:id", h.DeleteBranch)

		authed.GET("/audit-logs", h.ListAuditLogs)
		authed.GET("/settings", h.GetOrganisationSettings)
		authed.PUT("/settings", h.UpdateOrganisationSettings)

		api.Group("/members").Use(middleware.Auth(jm), middleware.RequirePerm(rbac.PermMembersRead)).
			GET("", h.ListMembers).GET("/:id", h.GetMember)
		api.Group("/members").Use(middleware.Auth(jm), middleware.RequirePerm(rbac.PermMembersWrite)).
			POST("", h.CreateMember).POST("/import", h.ImportMembers).PATCH("/:id", h.UpdateMember).DELETE("/:id", h.DeleteMember)

		api.Group("/complaints").Use(middleware.Auth(jm), middleware.RequirePerm(rbac.PermComplaintsRead)).
			GET("", h.ListComplaints).GET("/:id", h.GetComplaint).GET("/stats", h.ComplaintStats)
		api.Group("/complaints").Use(middleware.Auth(jm), middleware.RequirePerm(rbac.PermComplaintsWrite)).
			POST("", h.CreateComplaint).PATCH("/:id", h.UpdateComplaint)

		api.Group("/events").Use(middleware.Auth(jm), middleware.RequirePerm(rbac.PermEventsRead)).
			GET("", h.ListEvents).GET("/:id", h.GetEvent)
		api.Group("/events").Use(middleware.Auth(jm), middleware.RequirePerm(rbac.PermEventsWrite)).
			POST("", h.CreateEvent).PATCH("/:id", h.UpdateEvent).DELETE("/:id", h.DeleteEvent)

		api.Group("/news").Use(middleware.Auth(jm), middleware.RequirePerm(rbac.PermNewsRead)).
			GET("", h.ListNews).GET("/:id", h.GetNews)
		api.Group("/news").Use(middleware.Auth(jm), middleware.RequirePerm(rbac.PermNewsWrite)).
			POST("", h.CreateNews).PATCH("/:id", h.UpdateNews).DELETE("/:id", h.DeleteNews)

		api.Group("/documents").Use(middleware.Auth(jm), middleware.RequirePerm(rbac.PermDocumentsRead)).
			GET("", h.ListDocuments).GET("/:id", h.GetDocument)
		api.Group("/documents").Use(middleware.Auth(jm), middleware.RequirePerm(rbac.PermDocumentsWrite)).
			POST("", h.CreateDocument).DELETE("/:id", h.DeleteDocument)

		api.Group("/payments").Use(middleware.Auth(jm), middleware.RequirePerm(rbac.PermDonationsRead)).
			GET("", h.ListDonations).GET("/total", h.DonationsTotal).GET("/:id", h.GetDonation)
		api.Group("/payments").Use(middleware.Auth(jm), middleware.RequirePerm(rbac.PermDonationsWrite)).
			POST("", h.CreateDonation)

		api.Group("/legal-cases").Use(middleware.Auth(jm), middleware.RequirePerm(rbac.PermLegalRead)).
			GET("", h.ListLegal).GET("/:id", h.GetLegal)
		api.Group("/legal-cases").Use(middleware.Auth(jm), middleware.RequirePerm(rbac.PermLegalWrite)).
			POST("", h.CreateLegal).PATCH("/:id", h.UpdateLegal)

		api.Group("/training").Use(middleware.Auth(jm), middleware.RequirePerm(rbac.PermTrainingRead)).
			GET("", h.ListTrainings).GET("/:id", h.GetTraining)
		api.Group("/training").Use(middleware.Auth(jm), middleware.RequirePerm(rbac.PermTrainingWrite)).
			POST("", h.CreateTraining).DELETE("/:id", h.DeleteTraining)

		api.Group("/incidents").Use(middleware.Auth(jm), middleware.RequirePerm(rbac.PermIncidentsRead)).
			GET("", h.ListIncidents).GET("/:id", h.GetIncident)
		api.Group("/incidents").Use(middleware.Auth(jm), middleware.RequirePerm(rbac.PermIncidentsWrite)).
			POST("", h.CreateIncident)

		public := api.Group("/public")
		{
			public.GET("/branches", h.BranchesList)
			public.GET("/search", h.PublicSearch)
			public.GET("/news/:slug", h.PublicGetNewsBySlug)
			public.POST("/events/:id/register", h.PublicRegisterForEvent)
			public.POST("/members/apply", h.PublicMemberApply)
			public.GET("/members/:id", h.PublicGetMemberProfile)
			public.POST("/donations", h.PublicCreateDonation)
			public.POST("/contact", h.PublicContactSubmit)
		}
	}

	return r
}
