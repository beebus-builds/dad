package postgres

import (
	"context"
	"fmt"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/shramjagaran/cms-backend/internal/domain/entity"
	"github.com/shramjagaran/cms-backend/internal/domain/repository"
)

type publicEventRegRepo struct{ pool *pgxpool.Pool }

func NewPublicEventRegistrationRepository(p *pgxpool.Pool) repository.PublicEventRegistrationRepository {
	return &publicEventRegRepo{pool: p}
}

func (r *publicEventRegRepo) Create(ctx context.Context, reg *entity.PublicEventRegistration) error {
	const q = `INSERT INTO public_event_registrations (event_id,full_name,email,phone,status)
		VALUES ($1,$2,$3,$4,$5) RETURNING id,registered_at`
	return r.pool.QueryRow(ctx, q, reg.EventID, reg.FullName, reg.Email, reg.Phone, reg.Status).
		Scan(&reg.ID, &reg.RegisteredAt)
}

func (r *publicEventRegRepo) ListByEvent(ctx context.Context, eventID string) ([]entity.PublicEventRegistration, error) {
	rows, err := r.pool.Query(ctx, `SELECT id,event_id,full_name,email,phone,status,registered_at FROM public_event_registrations WHERE event_id=$1 ORDER BY registered_at`, eventID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := make([]entity.PublicEventRegistration, 0)
	for rows.Next() {
		e := entity.PublicEventRegistration{}
		if err := rows.Scan(&e.ID, &e.EventID, &e.FullName, &e.Email, &e.Phone, &e.Status, &e.RegisteredAt); err != nil {
			return nil, err
		}
		out = append(out, e)
	}
	return out, nil
}

type memberAppRepo struct{ pool *pgxpool.Pool }

func NewMemberApplicationRepository(p *pgxpool.Pool) repository.MemberApplicationRepository {
	return &memberAppRepo{pool: p}
}

func (r *memberAppRepo) Create(ctx context.Context, a *entity.MemberApplication) error {
	const q = `INSERT INTO member_applications (full_name,email,phone,address,branch_id,occupation,employer,notes,status)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id,created_at,updated_at`
	return r.pool.QueryRow(ctx, q, a.FullName, a.Email, a.Phone, a.Address, a.BranchID, a.Occupation, a.Employer, a.Notes, a.Status).
		Scan(&a.ID, &a.CreatedAt, &a.UpdatedAt)
}

func (r *memberAppRepo) List(ctx context.Context, opts repository.ListMemberApplicationsOptions) ([]entity.MemberApplication, int, error) {
	conds := []string{"1=1"}
	args := []any{}
	if opts.Status != "" {
		args = append(args, opts.Status)
		conds = append(conds, fmt.Sprintf("status=$%d", len(args)))
	}
	where := "WHERE " + strings.Join(conds, " AND ")
	var total int
	if err := r.pool.QueryRow(ctx, "SELECT COUNT(*) FROM member_applications "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}
	args = append(args, opts.PageSize, (opts.Page-1)*opts.PageSize)
	q := fmt.Sprintf("SELECT id,full_name,email,phone,address,branch_id,occupation,employer,notes,status,created_at,updated_at FROM member_applications %s ORDER BY created_at DESC LIMIT $%d OFFSET $%d", where, len(args)-1, len(args))
	rows, err := r.pool.Query(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()
	out := make([]entity.MemberApplication, 0, opts.PageSize)
	for rows.Next() {
		a := entity.MemberApplication{}
		if err := rows.Scan(&a.ID, &a.FullName, &a.Email, &a.Phone, &a.Address, &a.BranchID, &a.Occupation, &a.Employer, &a.Notes, &a.Status, &a.CreatedAt, &a.UpdatedAt); err != nil {
			return nil, 0, err
		}
		out = append(out, a)
	}
	return out, total, nil
}

type contactRepo struct{ pool *pgxpool.Pool }

func NewContactRepository(p *pgxpool.Pool) repository.ContactRepository {
	return &contactRepo{pool: p}
}

func (r *contactRepo) Create(ctx context.Context, m *entity.ContactMessage) error {
	const q = `INSERT INTO contact_messages (name,email,phone,subject,message) VALUES ($1,$2,$3,$4,$5) RETURNING id,created_at`
	return r.pool.QueryRow(ctx, q, m.Name, m.Email, m.Phone, m.Subject, m.Message).Scan(&m.ID, &m.CreatedAt)
}

func (r *contactRepo) List(ctx context.Context, opts repository.ListContactOptions) ([]entity.ContactMessage, int, error) {
	args := []any{}
	conds := []string{"1=1"}
	if opts.IsRead != nil {
		args = append(args, *opts.IsRead)
		conds = append(conds, fmt.Sprintf("is_read=$%d", len(args)))
	}
	where := "WHERE " + strings.Join(conds, " AND ")
	var total int
	if err := r.pool.QueryRow(ctx, "SELECT COUNT(*) FROM contact_messages "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}
	args = append(args, opts.PageSize, (opts.Page-1)*opts.PageSize)
	q := fmt.Sprintf("SELECT id,name,email,phone,subject,message,is_read,created_at FROM contact_messages %s ORDER BY created_at DESC LIMIT $%d OFFSET $%d", where, len(args)-1, len(args))
	rows, err := r.pool.Query(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()
	out := make([]entity.ContactMessage, 0, opts.PageSize)
	for rows.Next() {
		m := entity.ContactMessage{}
		if err := rows.Scan(&m.ID, &m.Name, &m.Email, &m.Phone, &m.Subject, &m.Message, &m.IsRead, &m.CreatedAt); err != nil {
			return nil, 0, err
		}
		out = append(out, m)
	}
	return out, total, nil
}
