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

func runFiles(ctx context.Context, pool *pgxpool.Pool, files []fs.DirEntry) error {
	sort.Slice(files, func(i, j int) bool { return files[i].Name() < files[j].Name() })
	for _, f := range files {
		sql, err := migrations.FS.ReadFile(f.Name())
		if err != nil {
			return fmt.Errorf("read %s: %w", f.Name(), err)
		}
		if _, err := pool.Exec(ctx, string(sql)); err != nil {
			return fmt.Errorf("execute %s: %w", f.Name(), err)
		}
	}
	return nil
}

func listAll() ([]fs.DirEntry, error) {
	entries, err := migrations.FS.ReadDir(".")
	if err != nil {
		return nil, fmt.Errorf("read migrations dir: %w", err)
	}
	var files []fs.DirEntry
	for _, e := range entries {
		if !e.IsDir() && strings.HasSuffix(e.Name(), ".up.sql") {
			files = append(files, e)
		}
	}
	return files, nil
}

// RunSchema applies table-creating migrations (0001).
func RunSchema(ctx context.Context, pool *pgxpool.Pool) error {
	all, err := listAll()
	if err != nil {
		return err
	}
	var schema []fs.DirEntry
	for _, f := range all {
		if strings.HasPrefix(f.Name(), "0001") {
			schema = append(schema, f)
		}
	}
	return runFiles(ctx, pool, schema)
}

// RunSeed applies seed data and remaining migrations (0002+).
func RunSeed(ctx context.Context, pool *pgxpool.Pool) error {
	all, err := listAll()
	if err != nil {
		return err
	}
	var seed []fs.DirEntry
	for _, f := range all {
		if strings.HasPrefix(f.Name(), "0002") || strings.HasPrefix(f.Name(), "0003") || strings.HasPrefix(f.Name(), "0004") || strings.HasPrefix(f.Name(), "0005") {
			seed = append(seed, f)
		}
	}
	return runFiles(ctx, pool, seed)
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

	_, err = pool.Exec(ctx,
		`INSERT INTO users (id, email, password_hash, full_name, phone, role, is_active)
		 VALUES ($1,$2,$3,$4,$5,'SUPER_ADMIN',true)
		 ON CONFLICT (email) DO UPDATE SET
		   password_hash=EXCLUDED.password_hash,
		   full_name=EXCLUDED.full_name,
		   phone=EXCLUDED.phone,
		   role=EXCLUDED.role,
		   is_active=true,
		   deleted_at=NULL,
		   updated_at=NOW()`,
		"00000000-0000-0000-0000-000000000001", s.Email, string(hash), s.FullName, s.Phone,
	)
	if err != nil {
		return fmt.Errorf("create admin: %w", err)
	}
	return nil
}
