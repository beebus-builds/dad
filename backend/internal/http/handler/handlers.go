package handler

import (
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/shramjagaran/cms-backend/internal/infrastructure/cache"
	"github.com/shramjagaran/cms-backend/internal/usecase"
)

type Handlers struct {
	Auth          *usecase.AuthService
	Members       *usecase.MemberService
	Complaints    *usecase.ComplaintService
	Events        *usecase.EventService
	News          *usecase.NewsService
	Documents     *usecase.DocumentService
	Donations     *usecase.DonationService
	LegalCases    *usecase.LegalCaseService
	Training      *usecase.TrainingService
	Incidents     *usecase.IncidentService
	Notifications *usecase.NotificationService
	PublicEvents  *usecase.PublicEventService
	MemberApps    *usecase.MemberApplicationService
	Contact       *usecase.ContactService
	Branches      *usecase.BranchService
	AuditLog      *usecase.AuditLogService
	Settings      *usecase.SettingsService
	DB            *pgxpool.Pool
	Cache         *cache.Cache
}
