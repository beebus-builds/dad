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

type documentRepo struct{ pool *pgxpool.Pool }

func NewDocumentRepository(p *pgxpool.Pool) repository.DocumentRepository { return &documentRepo{pool: p} }

const documentColumns = `id,title,description,file_url,file_type,file_size,category,visibility,uploaded_by,created_at,updated_at`

func scanDocument(d *entity.Document, row pgx.Row) error {
	return row.Scan(&d.ID, &d.Title, &d.Description, &d.FileURL, &d.FileType, &d.FileSize, &d.Category, &d.Visibility, &d.UploadedBy, &d.CreatedAt, &d.UpdatedAt)
}

func (r *documentRepo) Create(ctx context.Context, d *entity.Document) error {
	const q = `INSERT INTO documents (title,description,file_url,file_type,file_size,category,visibility,uploaded_by)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING id,created_at,updated_at`
	return r.pool.QueryRow(ctx, q, d.Title, d.Description, d.FileURL, d.FileType, d.FileSize, d.Category, d.Visibility, d.UploadedBy).Scan(&d.ID, &d.CreatedAt, &d.UpdatedAt)
}

func (r *documentRepo) GetByID(ctx context.Context, id string) (*entity.Document, error) {
	d := &entity.Document{}
	err := scanDocument(d, r.pool.QueryRow(ctx, `SELECT `+documentColumns+` FROM documents WHERE id=$1`, id))
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, apperror.ErrNotFound
	}
	return d, err
}

func (r *documentRepo) Delete(ctx context.Context, id string) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM documents WHERE id=$1`, id)
	return err
}

func (r *documentRepo) List(ctx context.Context, opts repository.ListDocumentsOptions) ([]entity.Document, int, error) {
	conds := []string{"1=1"}
	args := []any{}
	if opts.Search != "" {
		args = append(args, "%"+opts.Search+"%")
		conds = append(conds, fmt.Sprintf("title ILIKE $%d", len(args)))
	}
	if opts.Category != "" {
		args = append(args, opts.Category)
		conds = append(conds, fmt.Sprintf("category=$%d", len(args)))
	}
	if opts.Visibility != "" {
		args = append(args, opts.Visibility)
		conds = append(conds, fmt.Sprintf("visibility=$%d", len(args)))
	}
	where := "WHERE " + strings.Join(conds, " AND ")
	var total int
	if err := r.pool.QueryRow(ctx, "SELECT COUNT(*) FROM documents "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}
	args = append(args, opts.PageSize, (opts.Page-1)*opts.PageSize)
	q := fmt.Sprintf("SELECT %s FROM documents %s ORDER BY created_at DESC LIMIT $%d OFFSET $%d", documentColumns, where, len(args)-1, len(args))
	rows, err := r.pool.Query(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()
	out := make([]entity.Document, 0, opts.PageSize)
	for rows.Next() {
		d := entity.Document{}
		if err := scanDocument(&d, rows); err != nil {
			return nil, 0, err
		}
		out = append(out, d)
	}
	return out, total, nil
}

type donationRepo struct{ pool *pgxpool.Pool }

func NewDonationRepository(p *pgxpool.Pool) repository.DonationRepository { return &donationRepo{pool: p} }

const donationColumns = `id,receipt_number,donor_name,donor_email,donor_phone,amount,currency,method,purpose,status,created_at,updated_at`

func scanDonation(d *entity.Donation, row pgx.Row) error {
	return row.Scan(&d.ID, &d.ReceiptNumber, &d.DonorName, &d.DonorEmail, &d.DonorPhone, &d.Amount, &d.Currency, &d.Method, &d.Purpose, &d.Status, &d.CreatedAt, &d.UpdatedAt)
}

func (r *donationRepo) Create(ctx context.Context, d *entity.Donation) error {
	const q = `INSERT INTO donations (receipt_number,donor_name,donor_email,donor_phone,amount,currency,method,purpose,status)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING id,created_at,updated_at`
	return r.pool.QueryRow(ctx, q, d.ReceiptNumber, d.DonorName, d.DonorEmail, d.DonorPhone, d.Amount, d.Currency, d.Method, d.Purpose, d.Status).Scan(&d.ID, &d.CreatedAt, &d.UpdatedAt)
}

func (r *donationRepo) GetByID(ctx context.Context, id string) (*entity.Donation, error) {
	d := &entity.Donation{}
	err := scanDonation(d, r.pool.QueryRow(ctx, `SELECT `+donationColumns+` FROM donations WHERE id=$1`, id))
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, apperror.ErrNotFound
	}
	return d, err
}

func (r *donationRepo) Update(ctx context.Context, id string, d *entity.Donation) error {
	const q = `UPDATE donations SET status=$2,updated_at=NOW() WHERE id=$1`
	_, err := r.pool.Exec(ctx, q, id, d.Status)
	return err
}

func (r *donationRepo) List(ctx context.Context, opts repository.ListDonationsOptions) ([]entity.Donation, int, error) {
	conds := []string{"1=1"}
	args := []any{}
	if opts.Status != "" {
		args = append(args, opts.Status)
		conds = append(conds, fmt.Sprintf("status=$%d", len(args)))
	}
	if opts.Method != "" {
		args = append(args, opts.Method)
		conds = append(conds, fmt.Sprintf("method=$%d", len(args)))
	}
	where := "WHERE " + strings.Join(conds, " AND ")
	var total int
	if err := r.pool.QueryRow(ctx, "SELECT COUNT(*) FROM donations "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}
	args = append(args, opts.PageSize, (opts.Page-1)*opts.PageSize)
	q := fmt.Sprintf("SELECT %s FROM donations %s ORDER BY created_at DESC LIMIT $%d OFFSET $%d", donationColumns, where, len(args)-1, len(args))
	rows, err := r.pool.Query(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()
	out := make([]entity.Donation, 0, opts.PageSize)
	for rows.Next() {
		d := entity.Donation{}
		if err := scanDonation(&d, rows); err != nil {
			return nil, 0, err
		}
		out = append(out, d)
	}
	return out, total, nil
}

func (r *donationRepo) SumTotal(ctx context.Context) (float64, error) {
	var total float64
	err := r.pool.QueryRow(ctx, `SELECT COALESCE(SUM(amount),0) FROM donations WHERE status='COMPLETED'`).Scan(&total)
	return total, err
}
