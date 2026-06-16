package postgres

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/shramjagaran/cms-backend/internal/domain/entity"
	"github.com/shramjagaran/cms-backend/internal/domain/repository"
)

type menuRepo struct{ pool *pgxpool.Pool }

func NewMenuRepository(p *pgxpool.Pool) repository.MenuRepository { return &menuRepo{pool: p} }

func scanMenu(m *entity.MenuItem, scanner pgx.Row) error {
	return scanner.Scan(&m.ID, &m.Label, &m.Href, &m.SortOrder, &m.IsActive, &m.CreatedAt, &m.UpdatedAt)
}

func (r *menuRepo) Create(ctx context.Context, m *entity.MenuItem) error {
	const q = `INSERT INTO menus (label,href,sort_order,is_active)
		VALUES ($1,$2,$3,$4) RETURNING id,created_at,updated_at`
	return r.pool.QueryRow(ctx, q, m.Label, m.Href, m.SortOrder, m.IsActive).Scan(&m.ID, &m.CreatedAt, &m.UpdatedAt)
}

func (r *menuRepo) GetByID(ctx context.Context, id string) (*entity.MenuItem, error) {
	m := &entity.MenuItem{}
	err := scanMenu(m, r.pool.QueryRow(ctx, `SELECT id,label,href,sort_order,is_active,created_at,updated_at FROM menus WHERE id=$1`, id))
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, fmt.Errorf("menu item not found")
	}
	return m, err
}

func (r *menuRepo) Update(ctx context.Context, id string, m *entity.MenuItem) error {
	const q = `UPDATE menus SET label=$2,href=$3,sort_order=$4,is_active=$5,updated_at=NOW() WHERE id=$1`
	_, err := r.pool.Exec(ctx, q, id, m.Label, m.Href, m.SortOrder, m.IsActive)
	return err
}

func (r *menuRepo) Delete(ctx context.Context, id string) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM menus WHERE id=$1`, id)
	return err
}

func (r *menuRepo) List(ctx context.Context) ([]entity.MenuItem, error) {
	rows, err := r.pool.Query(ctx, `SELECT id,label,href,sort_order,is_active,created_at,updated_at FROM menus WHERE is_active=TRUE ORDER BY sort_order ASC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := make([]entity.MenuItem, 0)
	for rows.Next() {
		m := entity.MenuItem{}
		if err := scanMenu(&m, rows); err != nil {
			return nil, err
		}
		out = append(out, m)
	}
	return out, nil
}
