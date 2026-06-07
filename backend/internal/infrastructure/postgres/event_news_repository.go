package postgres

import (
	"context"
	"errors"
	"fmt"
	"strings"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/shramjagaran/cms-backend/internal/domain/entity"
	"github.com/shramjagaran/cms-backend/internal/domain/repository"
	"github.com/shramjagaran/cms-backend/pkg/apperror"
)

type eventRepo struct{ pool *pgxpool.Pool }

func NewEventRepository(p *pgxpool.Pool) repository.EventRepository { return &eventRepo{pool: p} }

const eventColumns = `id,title,title_nepali,slug,description,category,status,starts_at,ends_at,location,capacity,registered_count,cover_image_url,branch_id,created_by,created_at,updated_at`

func scanEvent(e *entity.Event, row pgx.Row) error {
	return row.Scan(&e.ID, &e.Title, &e.TitleNepali, &e.Slug, &e.Description, &e.Category, &e.Status, &e.StartsAt, &e.EndsAt, &e.Location, &e.Capacity, &e.RegisteredCount, &e.CoverImageURL, &e.BranchID, &e.CreatedBy, &e.CreatedAt, &e.UpdatedAt)
}

func (r *eventRepo) Create(ctx context.Context, e *entity.Event) error {
	const q = `INSERT INTO events (title,title_nepali,slug,description,category,status,starts_at,ends_at,location,capacity,cover_image_url,branch_id,created_by)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13) RETURNING id,registered_count,created_at,updated_at`
	return r.pool.QueryRow(ctx, q, e.Title, e.TitleNepali, e.Slug, e.Description, e.Category, e.Status, e.StartsAt, e.EndsAt, e.Location, e.Capacity, e.CoverImageURL, e.BranchID, e.CreatedBy).Scan(&e.ID, &e.RegisteredCount, &e.CreatedAt, &e.UpdatedAt)
}

func (r *eventRepo) GetByID(ctx context.Context, id string) (*entity.Event, error) {
	e := &entity.Event{}
	err := scanEvent(e, r.pool.QueryRow(ctx, `SELECT `+eventColumns+` FROM events WHERE id=$1`, id))
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, apperror.ErrNotFound
	}
	return e, err
}

func (r *eventRepo) GetBySlug(ctx context.Context, slug string) (*entity.Event, error) {
	e := &entity.Event{}
	err := scanEvent(e, r.pool.QueryRow(ctx, `SELECT `+eventColumns+` FROM events WHERE slug=$1`, slug))
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, apperror.ErrNotFound
	}
	return e, err
}

func (r *eventRepo) Update(ctx context.Context, id string, e *entity.Event) error {
	const q = `UPDATE events SET title=$2,title_nepali=$3,slug=$4,description=$5,category=$6,status=$7,starts_at=$8,ends_at=$9,location=$10,capacity=$11,cover_image_url=$12,branch_id=$13,updated_at=NOW() WHERE id=$1`
	_, err := r.pool.Exec(ctx, q, id, e.Title, e.TitleNepali, e.Slug, e.Description, e.Category, e.Status, e.StartsAt, e.EndsAt, e.Location, e.Capacity, e.CoverImageURL, e.BranchID)
	return err
}

func (r *eventRepo) Delete(ctx context.Context, id string) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM events WHERE id=$1`, id)
	return err
}

func (r *eventRepo) IncrementRegistered(ctx context.Context, id string) error {
	_, err := r.pool.Exec(ctx, `UPDATE events SET registered_count=registered_count+1 WHERE id=$1`, id)
	return err
}

func (r *eventRepo) List(ctx context.Context, opts repository.ListEventsOptions) ([]entity.Event, int, error) {
	conds := []string{"1=1"}
	args := []any{}
	if opts.Search != "" {
		args = append(args, "%"+opts.Search+"%")
		conds = append(conds, fmt.Sprintf("title ILIKE $%d", len(args)))
	}
	if opts.Status != "" {
		args = append(args, opts.Status)
		conds = append(conds, fmt.Sprintf("status=$%d", len(args)))
	}
	if opts.Category != "" {
		args = append(args, opts.Category)
		conds = append(conds, fmt.Sprintf("category=$%d", len(args)))
	}
	if opts.Upcoming {
		conds = append(conds, "starts_at >= NOW()")
	}
	where := "WHERE " + strings.Join(conds, " AND ")
	var total int
	if err := r.pool.QueryRow(ctx, "SELECT COUNT(*) FROM events "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}
	args = append(args, opts.PageSize, (opts.Page-1)*opts.PageSize)
	q := fmt.Sprintf("SELECT %s FROM events %s ORDER BY starts_at DESC LIMIT $%d OFFSET $%d", eventColumns, where, len(args)-1, len(args))
	rows, err := r.pool.Query(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()
	out := make([]entity.Event, 0, opts.PageSize)
	for rows.Next() {
		e := entity.Event{}
		if err := scanEvent(&e, rows); err != nil {
			return nil, 0, err
		}
		out = append(out, e)
	}
	return out, total, nil
}

type newsRepo struct{ pool *pgxpool.Pool }

func NewNewsRepository(p *pgxpool.Pool) repository.NewsRepository { return &newsRepo{pool: p} }

const newsColumns = `id,slug,title,title_nepali,excerpt,content,cover_image_url,category,status,author_id,tags,views,published_at,created_at,updated_at`

func scanNews(n *entity.News, row pgx.Row) error {
	return row.Scan(&n.ID, &n.Slug, &n.Title, &n.TitleNepali, &n.Excerpt, &n.Content, &n.CoverImageURL, &n.Category, &n.Status, &n.AuthorID, &n.Tags, &n.Views, &n.PublishedAt, &n.CreatedAt, &n.UpdatedAt)
}

func (r *newsRepo) Create(ctx context.Context, n *entity.News) error {
	const q = `INSERT INTO news (slug,title,title_nepali,excerpt,content,cover_image_url,category,status,author_id,tags,published_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id,views,created_at,updated_at`
	return r.pool.QueryRow(ctx, q, n.Slug, n.Title, n.TitleNepali, n.Excerpt, n.Content, n.CoverImageURL, n.Category, n.Status, n.AuthorID, n.Tags, n.PublishedAt).Scan(&n.ID, &n.Views, &n.CreatedAt, &n.UpdatedAt)
}

func (r *newsRepo) GetByID(ctx context.Context, id string) (*entity.News, error) {
	n := &entity.News{}
	err := scanNews(n, r.pool.QueryRow(ctx, `SELECT `+newsColumns+` FROM news WHERE id=$1`, id))
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, apperror.ErrNotFound
	}
	return n, err
}

func (r *newsRepo) GetBySlug(ctx context.Context, slug string) (*entity.News, error) {
	n := &entity.News{}
	err := scanNews(n, r.pool.QueryRow(ctx, `SELECT `+newsColumns+` FROM news WHERE slug=$1`, slug))
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, apperror.ErrNotFound
	}
	return n, err
}

func (r *newsRepo) Update(ctx context.Context, id string, n *entity.News) error {
	const q = `UPDATE news SET title=$2,title_nepali=$3,slug=$4,excerpt=$5,content=$6,cover_image_url=$7,category=$8,status=$9,tags=$10,published_at=$11,updated_at=NOW() WHERE id=$1`
	_, err := r.pool.Exec(ctx, q, id, n.Title, n.TitleNepali, n.Slug, n.Excerpt, n.Content, n.CoverImageURL, n.Category, n.Status, n.Tags, n.PublishedAt)
	return err
}

func (r *newsRepo) Delete(ctx context.Context, id string) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM news WHERE id=$1`, id)
	return err
}

func (r *newsRepo) IncrementViews(ctx context.Context, id string) error {
	_, err := r.pool.Exec(ctx, `UPDATE news SET views=views+1 WHERE id=$1`, id)
	return err
}

func (r *newsRepo) List(ctx context.Context, opts repository.ListNewsOptions) ([]entity.News, int, error) {
	conds := []string{"1=1"}
	args := []any{}
	if opts.Search != "" {
		args = append(args, "%"+opts.Search+"%")
		conds = append(conds, fmt.Sprintf("(title ILIKE $%d OR excerpt ILIKE $%d)", len(args), len(args)))
	}
	if opts.Category != "" {
		args = append(args, opts.Category)
		conds = append(conds, fmt.Sprintf("category=$%d", len(args)))
	}
	if opts.Status != "" {
		args = append(args, opts.Status)
		conds = append(conds, fmt.Sprintf("status=$%d", len(args)))
	}
	where := "WHERE " + strings.Join(conds, " AND ")
	var total int
	if err := r.pool.QueryRow(ctx, "SELECT COUNT(*) FROM news "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}
	args = append(args, opts.PageSize, (opts.Page-1)*opts.PageSize)
	q := fmt.Sprintf("SELECT %s FROM news %s ORDER BY published_at DESC NULLS LAST LIMIT $%d OFFSET $%d", newsColumns, where, len(args)-1, len(args))
	rows, err := r.pool.Query(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()
	out := make([]entity.News, 0, opts.PageSize)
	for rows.Next() {
		n := entity.News{}
		if err := scanNews(&n, rows); err != nil {
			return nil, 0, err
		}
		out = append(out, n)
	}
	return out, total, nil
}
