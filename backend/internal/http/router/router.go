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
			auth.POST("/verify-email", h.VerifyEmail)
			auth.POST("/resend-otp", h.ResendOTP)
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
		api.Group("/users").Use(middleware.Auth(jm), middleware.RequirePerm(rbac.PermUsersManage)).
			DELETE("/:id/hard", h.DeleteUser)
		
		authed.GET("/settings", h.GetOrganisationSettings)
		authed.PUT("/settings", h.UpdateOrganisationSettings)
		
		api.Group("/members").Use(middleware.Auth(jm), middleware.RequirePerm(rbac.PermMembersRead)).
			GET("", h.ListMembers).GET("/:id", h.GetMember)
		api.Group("/members").Use(middleware.Auth(jm), middleware.RequirePerm(rbac.PermMembersWrite)).
			POST("", h.CreateMember).POST("/import", h.ImportMembers).PATCH("/:id", h.UpdateMember).DELETE("/:id", h.DeleteMember)
		
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
