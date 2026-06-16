package handler

import (
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/shramjagaran/cms-backend/internal/infrastructure/cache"
	"github.com/shramjagaran/cms-backend/internal/usecase"
)

type Handlers struct {
	Auth          *usecase.AuthService
	Members       *usecase.MemberService
	News          *usecase.NewsService
	Events        *usecase.EventService
	Pages         *usecase.PageUsecase
	Menus         *usecase.MenuUsecase
	Users         *usecase.AuthService // Reuse auth service for user mgmt
	Settings      *usecase.SettingsService
	Complaints    *usecase.ComplaintService
	Documents     *usecase.DocumentService
	Notifications *usecase.NotificationService
	Donations     *usecase.DonationService
	LegalCases    *usecase.LegalCaseService
	Training      *usecase.TrainingService
	Incidents     *usecase.IncidentService
	AuditLog      *usecase.AuditLogService
	Branches      *usecase.BranchService
	PublicEvents  *usecase.PublicEventService
	MemberApps    *usecase.MemberApplicationService
	Contact       *usecase.ContactService
	DB            *pgxpool.Pool
	Cache         *cache.Cache
}
