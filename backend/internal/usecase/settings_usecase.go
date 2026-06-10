package usecase

import (
	"context"
	"encoding/json"
	"strings"
	"time"

	"github.com/google/uuid"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/shramjagaran/cms-backend/pkg/apperror"
)

type SettingsService struct {
	pool *pgxpool.Pool
}

func NewSettingsService(p *pgxpool.Pool) *SettingsService {
	return &SettingsService{pool: p}
}

func (s *SettingsService) GetOrganisation(ctx context.Context) (map[string]any, error) {
	def := map[string]any{
		"name":       "Shram Jagaran",
		"nameNepali": "श्रम जागरण",
		"tagline":    "Workers' Awakening",
		"email":      "contact@shramjagaran.np",
		"phone":      "+977 1 4XXX XXX",
	}
	rows, err := s.pool.Query(ctx, `SELECT key, value FROM organisation_settings`)
	if err != nil {
		return def, nil
	}
	defer rows.Close()
	for rows.Next() {
		var k, v string
		if rows.Scan(&k, &v) == nil {
			def[k] = v
		}
	}
	return def, nil
}

func (s *SettingsService) UpdateOrganisation(ctx context.Context, settings map[string]any) error {
	for k, v := range settings {
		key := strings.TrimSpace(k)
		if key == "" {
			continue
		}
		val, _ := json.Marshal(v)
		_, err := s.pool.Exec(ctx, `
			INSERT INTO organisation_settings (key, value, updated_at)
			VALUES ($1, $2, NOW())
			ON CONFLICT (key) DO UPDATE SET value = $2, updated_at = NOW()`, key, string(val))
		if err != nil {
			return apperror.New(500, "INTERNAL", "failed to save setting: "+key)
		}
	}
	return nil
}

type OrganisationSettings struct {
	ID        string    `json:"id"`
	Key       string    `json:"key"`
	Value     string    `json:"value"`
	UpdatedAt time.Time `json:"updatedAt"`
}

var _ = uuid.NewString
