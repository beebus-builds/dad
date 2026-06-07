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
	DB            *pgxpool.Pool
	Cache         *cache.Cache
}
