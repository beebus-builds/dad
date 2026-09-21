package migrator

import (
	"context"
	"fmt"
	"io/fs"
	"sort"
	"strings"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/shramjagaran/cms-backend/migrations"
	"golang.org/x/crypto/bcrypt"
)

// ensureVersionTable creates the schema_migrations ledger if missing.
func ensureVersionTable(ctx context.Context, pool *pgxpool.Pool) error {
	_, err := pool.Exec(ctx, `CREATE TABLE IF NOT EXISTS schema_migrations (
		version TEXT PRIMARY KEY,
		applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
	)`)
	return err
}

func appliedVersions(ctx context.Context, pool *pgxpool.Pool) (map[string]bool, error) {
	rows, err := pool.Query(ctx, `SELECT version FROM schema_migrations`)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	done := map[string]bool{}
	for rows.Next() {
		var v string
		if err := rows.Scan(&v); err != nil {
			return nil, err
		}
		done[v] = true
	}
	return done, rows.Err()
}

// MigrateAll applies every *.up.sql exactly once, in filename order,
// recording each in schema_migrations. Idempotent and safe on restart.
func MigrateAll(ctx context.Context, pool *pgxpool.Pool) error {
	if err := ensureVersionTable(ctx, pool); err != nil {
		return fmt.Errorf("version table: %w", err)
	}
	done, err := appliedVersions(ctx, pool)
	if err != nil {
		return fmt.Errorf("read applied: %w", err)
	}
	entries, err := migrations.FS.ReadDir(".")
	if err != nil {
		return fmt.Errorf("read migrations dir: %w", err)
	}
	var files []fs.DirEntry
	for _, e := range entries {
		if !e.IsDir() && strings.HasSuffix(e.Name(), ".up.sql") {
			files = append(files, e)
		}
	}
	sort.Slice(files, func(i, j int) bool { return files[i].Name() < files[j].Name() })
	for _, f := range files {
		version := strings.TrimSuffix(f.Name(), ".up.sql")
		if done[version] {
			continue
		}
		sql, err := migrations.FS.ReadFile(f.Name())
		if err != nil {
			return fmt.Errorf("read %s: %w", f.Name(), err)
		}
		tx, err := pool.Begin(ctx)
		if err != nil {
			return fmt.Errorf("begin %s: %w", f.Name(), err)
		}
		if _, err := tx.Exec(ctx, string(sql)); err != nil {
			_ = tx.Rollback(ctx)
			return fmt.Errorf("execute %s: %w", f.Name(), err)
		}
		if _, err := tx.Exec(ctx, `INSERT INTO schema_migrations (version) VALUES ($1) ON CONFLICT DO NOTHING`, version); err != nil {
			_ = tx.Rollback(ctx)
			return fmt.Errorf("record %s: %w", f.Name(), err)
		}
		if err := tx.Commit(ctx); err != nil {
			return fmt.Errorf("commit %s: %w", f.Name(), err)
		}
	}
	return nil
}

// RunSchema applies table-creating migrations (0001).
// Deprecated: use MigrateAll.
func RunSchema(ctx context.Context, pool *pgxpool.Pool) error {
	return MigrateAll(ctx, pool)
}

// RunSeed applies seed data and remaining migrations (0002+).
// Deprecated: use MigrateAll (no-op, kept for compatibility).
func RunSeed(ctx context.Context, pool *pgxpool.Pool) error {
	return nil
}

type AdminSeed struct {
	Email    string
	Password string
	Phone    string
	FullName string
}

func SeedAdmin(ctx context.Context, pool *pgxpool.Pool, s AdminSeed) error {
	hash, err := bcrypt.GenerateFromPassword([]byte(s.Password), bcrypt.DefaultCost)
	if err != nil {
		return fmt.Errorf("hash password: %w", err)
	}

	// 1. If this email already exists (e.g. admin email was changed via
	// the app), refresh it in place.
	tag, err := pool.Exec(ctx,
		`UPDATE users SET password_hash=$2, full_name=$3, phone=$4,
		   role='SUPER_ADMIN', is_active=true, deleted_at=NULL, updated_at=NOW()
		 WHERE email=$1`,
		s.Email, string(hash), s.FullName, s.Phone,
	)
	if err != nil {
		return fmt.Errorf("update admin: %w", err)
	}
	if tag.RowsAffected() > 0 {
		return nil
	}

	// 2. Otherwise insert. The well-known id may already belong to a
	// different email (admin email was changed via the app) — never steal
	// that row; use a fresh UUID instead.
	tag, err = pool.Exec(ctx,
		`INSERT INTO users (id, email, password_hash, full_name, phone, role, is_active)
		 VALUES ('00000000-0000-0000-0000-000000000001',$1,$2,$3,$4,'SUPER_ADMIN',true)
		 ON CONFLICT (id) DO NOTHING`,
		s.Email, string(hash), s.FullName, s.Phone,
	)
	if err != nil {
		return fmt.Errorf("create admin: %w", err)
	}
	if tag.RowsAffected() == 0 {
		if _, err := pool.Exec(ctx,
			`INSERT INTO users (email, password_hash, full_name, phone, role, is_active)
			 VALUES ($1,$2,$3,$4,'SUPER_ADMIN',true)
			 ON CONFLICT (email) DO NOTHING`,
			s.Email, string(hash), s.FullName, s.Phone,
		); err != nil {
			return fmt.Errorf("create admin (fallback id): %w", err)
		}
	}
	return nil
}
