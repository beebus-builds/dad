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

type pageRepo struct{ pool *pgxpool.Pool }

func NewPageRepository(p *pgxpool.Pool) repository.PageRepository { return &pageRepo{pool: p} }

func scanPage(p *entity.Page, scanner pgx.Row) error {
	return scanner.Scan(&p.ID, &p.Title, &p.Slug, &p.Content, &p.IsPublished, &p.CreatedAt, &p.UpdatedAt)
}

func (r *pageRepo) Create(ctx context.Context, p *entity.Page) error {
	const q = `INSERT INTO pages (title,slug,content,is_published)
		VALUES ($1,$2,$3,$4) RETURNING id,created_at,updated_at`
	return r.pool.QueryRow(ctx, q, p.Title, p.Slug, p.Content, p.IsPublished).Scan(&p.ID, &p.CreatedAt, &p.UpdatedAt)
}

func (r *pageRepo) GetByID(ctx context.Context, id string) (*entity.Page, error) {
	p := &entity.Page{}
	err := scanPage(p, r.pool.QueryRow(ctx, `SELECT id,title,slug,content,is_published,created_at,updated_at FROM pages WHERE id=$1`, id))
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, fmt.Errorf("page not found")
	}
	return p, err
}

func (r *pageRepo) GetBySlug(ctx context.Context, slug string) (*entity.Page, error) {
	p := &entity.Page{}
	err := scanPage(p, r.pool.QueryRow(ctx, `SELECT id,title,slug,content,is_published,created_at,updated_at FROM pages WHERE slug=$1 AND is_published=TRUE`, slug))
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, fmt.Errorf("page not found")
	}
	return p, err
}

func (r *pageRepo) Update(ctx context.Context, id string, p *entity.Page) error {
	const q = `UPDATE pages SET title=$2,slug=$3,content=$4,is_published=$5,updated_at=NOW() WHERE id=$1`
	_, err := r.pool.Exec(ctx, q, id, p.Title, p.Slug, p.Content, p.IsPublished)
	return err
}

func (r *pageRepo) Delete(ctx context.Context, id string) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM pages WHERE id=$1`, id)
	return err
}

func (r *pageRepo) List(ctx context.Context) ([]entity.Page, error) {
	rows, err := r.pool.Query(ctx, `SELECT id,title,slug,content,is_published,created_at,updated_at FROM pages ORDER BY created_at DESC`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := make([]entity.Page, 0)
	for rows.Next() {
		p := entity.Page{}
		if err := scanPage(&p, rows); err != nil {
			return nil, err
		}
		out = append(out, p)
	}
	return out, nil
}
