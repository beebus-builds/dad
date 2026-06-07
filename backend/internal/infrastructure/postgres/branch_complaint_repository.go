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

type branchRepo struct{ pool *pgxpool.Pool }

func NewBranchRepository(p *pgxpool.Pool) repository.BranchRepository { return &branchRepo{pool: p} }

const branchColumns = `id,name,name_nepali,province_code,district_code,address,contact_email,contact_phone,is_active,created_at,updated_at`

func scanBranch(b *entity.Branch, row pgx.Row) error {
	return row.Scan(&b.ID, &b.Name, &b.NameNepali, &b.ProvinceCode, &b.DistrictCode, &b.Address, &b.ContactEmail, &b.ContactPhone, &b.IsActive, &b.CreatedAt, &b.UpdatedAt)
}

func (r *branchRepo) Create(ctx context.Context, b *entity.Branch) error {
	const q = `INSERT INTO branches (name,name_nepali,province_code,district_code,address,contact_email,contact_phone,is_active)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id,created_at,updated_at`
	return r.pool.QueryRow(ctx, q, b.Name, b.NameNepali, b.ProvinceCode, b.DistrictCode, b.Address, b.ContactEmail, b.ContactPhone, b.IsActive).Scan(&b.ID, &b.CreatedAt, &b.UpdatedAt)
}

func (r *branchRepo) GetByID(ctx context.Context, id string) (*entity.Branch, error) {
	b := &entity.Branch{}
	err := scanBranch(b, r.pool.QueryRow(ctx, `SELECT `+branchColumns+` FROM branches WHERE id=$1 AND deleted_at IS NULL`, id))
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, apperror.ErrNotFound
	}
	return b, err
}

func (r *branchRepo) List(ctx context.Context) ([]entity.Branch, error) {
	rows, err := r.pool.Query(ctx, `SELECT `+branchColumns+` FROM branches WHERE deleted_at IS NULL AND is_active=TRUE ORDER BY name`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := []entity.Branch{}
	for rows.Next() {
		b := entity.Branch{}
		if err := scanBranch(&b, rows); err != nil {
			return nil, err
		}
		out = append(out, b)
	}
	return out, nil
}

func (r *branchRepo) Update(ctx context.Context, id string, b *entity.Branch) error {
	const q = `UPDATE branches SET name=$2,name_nepali=$3,province_code=$4,district_code=$5,address=$6,contact_email=$7,contact_phone=$8,is_active=$9,updated_at=NOW() WHERE id=$1`
	_, err := r.pool.Exec(ctx, q, id, b.Name, b.NameNepali, b.ProvinceCode, b.DistrictCode, b.Address, b.ContactEmail, b.ContactPhone, b.IsActive)
	return err
}

func (r *branchRepo) Delete(ctx context.Context, id string) error {
	_, err := r.pool.Exec(ctx, `UPDATE branches SET deleted_at=NOW() WHERE id=$1`, id)
	return err
}

type complaintRepo struct{ pool *pgxpool.Pool }

func NewComplaintRepository(p *pgxpool.Pool) repository.ComplaintRepository { return &complaintRepo{pool: p} }

const complaintColumns = `id,ticket_number,title,description,category,priority,status,submitted_by,assigned_to,branch_id,created_at,updated_at,resolved_at`

func scanComplaint(c *entity.Complaint, row pgx.Row) error {
	return row.Scan(&c.ID, &c.TicketNumber, &c.Title, &c.Description, &c.Category, &c.Priority, &c.Status, &c.SubmittedBy, &c.AssignedTo, &c.BranchID, &c.CreatedAt, &c.UpdatedAt, &c.ResolvedAt)
}

func (r *complaintRepo) Create(ctx context.Context, c *entity.Complaint) error {
	const q = `INSERT INTO complaints (ticket_number,title,description,category,priority,status,submitted_by,assigned_to,branch_id)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id,created_at,updated_at`
	return r.pool.QueryRow(ctx, q, c.TicketNumber, c.Title, c.Description, c.Category, c.Priority, c.Status, c.SubmittedBy, c.AssignedTo, c.BranchID).Scan(&c.ID, &c.CreatedAt, &c.UpdatedAt)
}

func (r *complaintRepo) GetByID(ctx context.Context, id string) (*entity.Complaint, error) {
	c := &entity.Complaint{}
	err := scanComplaint(c, r.pool.QueryRow(ctx, `SELECT `+complaintColumns+` FROM complaints WHERE id=$1 AND deleted_at IS NULL`, id))
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, apperror.ErrNotFound
	}
	return c, err
}

func (r *complaintRepo) Update(ctx context.Context, id string, c *entity.Complaint) error {
	const q = `UPDATE complaints SET title=$2,description=$3,category=$4,priority=$5,status=$6,assigned_to=$7,resolved_at=$8,updated_at=NOW() WHERE id=$1`
	_, err := r.pool.Exec(ctx, q, id, c.Title, c.Description, c.Category, c.Priority, c.Status, c.AssignedTo, c.ResolvedAt)
	return err
}

func (r *complaintRepo) Delete(ctx context.Context, id string) error {
	_, err := r.pool.Exec(ctx, `UPDATE complaints SET deleted_at=NOW() WHERE id=$1`, id)
	return err
}

func (r *complaintRepo) List(ctx context.Context, opts repository.ListComplaintsOptions) ([]entity.Complaint, int, error) {
	conds := []string{"deleted_at IS NULL"}
	args := []any{}
	if opts.Search != "" {
		args = append(args, "%"+opts.Search+"%")
		conds = append(conds, fmt.Sprintf("(title ILIKE $%d OR ticket_number ILIKE $%d)", len(args), len(args)))
	}
	if opts.Status != "" {
		args = append(args, opts.Status)
		conds = append(conds, fmt.Sprintf("status=$%d", len(args)))
	}
	if opts.Priority != "" {
		args = append(args, opts.Priority)
		conds = append(conds, fmt.Sprintf("priority=$%d", len(args)))
	}
	if opts.BranchID != "" {
		args = append(args, opts.BranchID)
		conds = append(conds, fmt.Sprintf("branch_id=$%d", len(args)))
	}
	if opts.UserID != "" {
		args = append(args, opts.UserID)
		conds = append(conds, fmt.Sprintf("submitted_by=$%d", len(args)))
	}
	where := "WHERE " + strings.Join(conds, " AND ")
	var total int
	if err := r.pool.QueryRow(ctx, "SELECT COUNT(*) FROM complaints "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}
	args = append(args, opts.PageSize, (opts.Page-1)*opts.PageSize)
	q := fmt.Sprintf("SELECT %s FROM complaints %s ORDER BY created_at DESC LIMIT $%d OFFSET $%d", complaintColumns, where, len(args)-1, len(args))
	rows, err := r.pool.Query(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()
	out := make([]entity.Complaint, 0, opts.PageSize)
	for rows.Next() {
		c := entity.Complaint{}
		if err := scanComplaint(&c, rows); err != nil {
			return nil, 0, err
		}
		out = append(out, c)
	}
	return out, total, nil
}

func (r *complaintRepo) GetStats(ctx context.Context) (map[string]int, error) {
	rows, err := r.pool.Query(ctx, `SELECT status, COUNT(*) FROM complaints WHERE deleted_at IS NULL GROUP BY status`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := map[string]int{}
	for rows.Next() {
		var s string
		var c int
		if err := rows.Scan(&s, &c); err != nil {
			return nil, err
		}
		out[s] = c
	}
	return out, nil
}
