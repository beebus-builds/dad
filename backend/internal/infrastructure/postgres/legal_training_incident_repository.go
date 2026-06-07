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

type legalRepo struct{ pool *pgxpool.Pool }

func NewLegalCaseRepository(p *pgxpool.Pool) repository.LegalCaseRepository { return &legalRepo{pool: p} }

const legalColumns = `id,case_number,title,description,type,status,member_id,assigned_advisor,branch_id,filed_at,next_hearing_at,resolved_at,created_at,updated_at`

func scanLegal(c *entity.LegalCase, row pgx.Row) error {
	return row.Scan(&c.ID, &c.CaseNumber, &c.Title, &c.Description, &c.Type, &c.Status, &c.MemberID, &c.AssignedAdvisor, &c.BranchID, &c.FiledAt, &c.NextHearingAt, &c.ResolvedAt, &c.CreatedAt, &c.UpdatedAt)
}

func (r *legalRepo) Create(ctx context.Context, c *entity.LegalCase) error {
	const q = `INSERT INTO legal_cases (case_number,title,description,type,status,member_id,assigned_advisor,branch_id,filed_at,next_hearing_at)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id,created_at,updated_at`
	return r.pool.QueryRow(ctx, q, c.CaseNumber, c.Title, c.Description, c.Type, c.Status, c.MemberID, c.AssignedAdvisor, c.BranchID, c.FiledAt, c.NextHearingAt).Scan(&c.ID, &c.CreatedAt, &c.UpdatedAt)
}

func (r *legalRepo) GetByID(ctx context.Context, id string) (*entity.LegalCase, error) {
	c := &entity.LegalCase{}
	err := scanLegal(c, r.pool.QueryRow(ctx, `SELECT `+legalColumns+` FROM legal_cases WHERE id=$1`, id))
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, apperror.ErrNotFound
	}
	return c, err
}

func (r *legalRepo) Update(ctx context.Context, id string, c *entity.LegalCase) error {
	const q = `UPDATE legal_cases SET title=$2,description=$3,type=$4,status=$5,assigned_advisor=$6,next_hearing_at=$7,resolved_at=$8,updated_at=NOW() WHERE id=$1`
	_, err := r.pool.Exec(ctx, q, id, c.Title, c.Description, c.Type, c.Status, c.AssignedAdvisor, c.NextHearingAt, c.ResolvedAt)
	return err
}

func (r *legalRepo) List(ctx context.Context, opts repository.ListLegalCasesOptions) ([]entity.LegalCase, int, error) {
	conds := []string{"1=1"}
	args := []any{}
	if opts.Type != "" {
		args = append(args, opts.Type)
		conds = append(conds, fmt.Sprintf("type=$%d", len(args)))
	}
	if opts.Status != "" {
		args = append(args, opts.Status)
		conds = append(conds, fmt.Sprintf("status=$%d", len(args)))
	}
	where := "WHERE " + strings.Join(conds, " AND ")
	var total int
	if err := r.pool.QueryRow(ctx, "SELECT COUNT(*) FROM legal_cases "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}
	args = append(args, opts.PageSize, (opts.Page-1)*opts.PageSize)
	q := fmt.Sprintf("SELECT %s FROM legal_cases %s ORDER BY filed_at DESC LIMIT $%d OFFSET $%d", legalColumns, where, len(args)-1, len(args))
	rows, err := r.pool.Query(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()
	out := make([]entity.LegalCase, 0, opts.PageSize)
	for rows.Next() {
		c := entity.LegalCase{}
		if err := scanLegal(&c, rows); err != nil {
			return nil, 0, err
		}
		out = append(out, c)
	}
	return out, total, nil
}

type trainingRepo struct{ pool *pgxpool.Pool }

func NewTrainingRepository(p *pgxpool.Pool) repository.TrainingRepository { return &trainingRepo{pool: p} }

const trainingColumns = `id,title,title_nepali,description,starts_at,ends_at,location,trainer,capacity,registered_count,status,branch_id,created_by,created_at,updated_at`

func scanTraining(t *entity.Training, row pgx.Row) error {
	return row.Scan(&t.ID, &t.Title, &t.TitleNepali, &t.Description, &t.StartsAt, &t.EndsAt, &t.Location, &t.Trainer, &t.Capacity, &t.RegisteredCount, &t.Status, &t.BranchID, &t.CreatedBy, &t.CreatedAt, &t.UpdatedAt)
}

func (r *trainingRepo) Create(ctx context.Context, t *entity.Training) error {
	const q = `INSERT INTO training_programs (title,title_nepali,description,starts_at,ends_at,location,trainer,capacity,status,branch_id,created_by)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING id,registered_count,created_at,updated_at`
	return r.pool.QueryRow(ctx, q, t.Title, t.TitleNepali, t.Description, t.StartsAt, t.EndsAt, t.Location, t.Trainer, t.Capacity, t.Status, t.BranchID, t.CreatedBy).Scan(&t.ID, &t.RegisteredCount, &t.CreatedAt, &t.UpdatedAt)
}

func (r *trainingRepo) GetByID(ctx context.Context, id string) (*entity.Training, error) {
	t := &entity.Training{}
	err := scanTraining(t, r.pool.QueryRow(ctx, `SELECT `+trainingColumns+` FROM training_programs WHERE id=$1`, id))
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, apperror.ErrNotFound
	}
	return t, err
}

func (r *trainingRepo) Update(ctx context.Context, id string, t *entity.Training) error {
	const q = `UPDATE training_programs SET title=$2,title_nepali=$3,description=$4,starts_at=$5,ends_at=$6,location=$7,trainer=$8,capacity=$9,status=$10,updated_at=NOW() WHERE id=$1`
	_, err := r.pool.Exec(ctx, q, id, t.Title, t.TitleNepali, t.Description, t.StartsAt, t.EndsAt, t.Location, t.Trainer, t.Capacity, t.Status)
	return err
}

func (r *trainingRepo) Delete(ctx context.Context, id string) error {
	_, err := r.pool.Exec(ctx, `DELETE FROM training_programs WHERE id=$1`, id)
	return err
}

func (r *trainingRepo) List(ctx context.Context, opts repository.ListTrainingsOptions) ([]entity.Training, int, error) {
	conds := []string{"1=1"}
	args := []any{}
	if opts.Status != "" {
		args = append(args, opts.Status)
		conds = append(conds, fmt.Sprintf("status=$%d", len(args)))
	}
	where := "WHERE " + strings.Join(conds, " AND ")
	var total int
	if err := r.pool.QueryRow(ctx, "SELECT COUNT(*) FROM training_programs "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}
	args = append(args, opts.PageSize, (opts.Page-1)*opts.PageSize)
	q := fmt.Sprintf("SELECT %s FROM training_programs %s ORDER BY starts_at ASC LIMIT $%d OFFSET $%d", trainingColumns, where, len(args)-1, len(args))
	rows, err := r.pool.Query(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()
	out := make([]entity.Training, 0, opts.PageSize)
	for rows.Next() {
		t := entity.Training{}
		if err := scanTraining(&t, rows); err != nil {
			return nil, 0, err
		}
		out = append(out, t)
	}
	return out, total, nil
}

type incidentRepo struct{ pool *pgxpool.Pool }

func NewIncidentRepository(p *pgxpool.Pool) repository.IncidentRepository { return &incidentRepo{pool: p} }

const incidentColumns = `id,incident_number,title,description,severity,occurred_at,location,workplace_name,reported_by,branch_id,status,created_at,updated_at`

func scanIncident(i *entity.Incident, row pgx.Row) error {
	return row.Scan(&i.ID, &i.IncidentNumber, &i.Title, &i.Description, &i.Severity, &i.OccurredAt, &i.Location, &i.WorkplaceName, &i.ReportedBy, &i.BranchID, &i.Status, &i.CreatedAt, &i.UpdatedAt)
}

func (r *incidentRepo) Create(ctx context.Context, i *entity.Incident) error {
	const q = `INSERT INTO worker_incidents (incident_number,title,description,severity,occurred_at,location,workplace_name,reported_by,branch_id,status)
		VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING id,created_at,updated_at`
	return r.pool.QueryRow(ctx, q, i.IncidentNumber, i.Title, i.Description, i.Severity, i.OccurredAt, i.Location, i.WorkplaceName, i.ReportedBy, i.BranchID, i.Status).Scan(&i.ID, &i.CreatedAt, &i.UpdatedAt)
}

func (r *incidentRepo) GetByID(ctx context.Context, id string) (*entity.Incident, error) {
	i := &entity.Incident{}
	err := scanIncident(i, r.pool.QueryRow(ctx, `SELECT `+incidentColumns+` FROM worker_incidents WHERE id=$1`, id))
	if errors.Is(err, pgx.ErrNoRows) {
		return nil, apperror.ErrNotFound
	}
	return i, err
}

func (r *incidentRepo) Update(ctx context.Context, id string, i *entity.Incident) error {
	const q = `UPDATE worker_incidents SET title=$2,description=$3,severity=$4,status=$5,updated_at=NOW() WHERE id=$1`
	_, err := r.pool.Exec(ctx, q, id, i.Title, i.Description, i.Severity, i.Status)
	return err
}

func (r *incidentRepo) List(ctx context.Context, opts repository.ListIncidentsOptions) ([]entity.Incident, int, error) {
	conds := []string{"1=1"}
	args := []any{}
	if opts.Severity != "" {
		args = append(args, opts.Severity)
		conds = append(conds, fmt.Sprintf("severity=$%d", len(args)))
	}
	if opts.Status != "" {
		args = append(args, opts.Status)
		conds = append(conds, fmt.Sprintf("status=$%d", len(args)))
	}
	where := "WHERE " + strings.Join(conds, " AND ")
	var total int
	if err := r.pool.QueryRow(ctx, "SELECT COUNT(*) FROM worker_incidents "+where, args...).Scan(&total); err != nil {
		return nil, 0, err
	}
	args = append(args, opts.PageSize, (opts.Page-1)*opts.PageSize)
	q := fmt.Sprintf("SELECT %s FROM worker_incidents %s ORDER BY occurred_at DESC LIMIT $%d OFFSET $%d", incidentColumns, where, len(args)-1, len(args))
	rows, err := r.pool.Query(ctx, q, args...)
	if err != nil {
		return nil, 0, err
	}
	defer rows.Close()
	out := make([]entity.Incident, 0, opts.PageSize)
	for rows.Next() {
		i := entity.Incident{}
		if err := scanIncident(&i, rows); err != nil {
			return nil, 0, err
		}
		out = append(out, i)
	}
	return out, total, nil
}
