package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"

	"github.com/joho/godotenv"
)

type Config struct {
	App       AppConfig
	HTTP      HTTPConfig
	Database  DatabaseConfig
	Redis     RedisConfig
	JWT       JWTConfig
	SMTP      SMTPConfig
	Mail      MailConfig
	R2        R2Config
	Sentry    SentryConfig
	RateLimit RateLimitConfig
	CORS      CORSConfig
	Admin     AdminConfig
}

type AdminConfig struct {
	Email    string
	Password string
	Phone    string
	FullName string
}

type SMTPConfig struct {
	Host     string
	Port     int
	User     string
	Pass     string
	From     string
	FromName string
}

// MailConfig chooses the email provider. "smtp" (default) uses SMTPConfig
// via pkg/mail.Sender; "resend" uses the Resend HTTP API. Either way the
// result satisfies pkg/mail.Mailer, so call sites never branch on provider.
type MailConfig struct {
	Provider     string
	ResendAPIKey string
}

type AppConfig struct {
	Env          string
	Name         string
	Version      string
	FrontendURL  string
	CookieSecure bool
}

type HTTPConfig struct {
	Port              string
	ReadTimeout       time.Duration
	WriteTimeout      time.Duration
	IdleTimeout       time.Duration
	ReadHeaderTimeout time.Duration
	MaxHeaderBytes    int
	TrustedProxies    []string
}

type DatabaseConfig struct {
	URL             string
	MaxOpenConns    int
	MaxIdleConns    int
	ConnMaxLifetime time.Duration
}

type RedisConfig struct {
	URL      string
	Password string
	DB       int
}

type JWTConfig struct {
	Secret           string
	AccessExpiresIn  time.Duration
	RefreshExpiresIn time.Duration
	Issuer           string
}

type R2Config struct {
	AccountID       string
	AccessKeyID     string
	SecretAccessKey string
	Bucket          string
	PublicURL       string
	Enabled         bool
}

type SentryConfig struct {
	DSN    string
	Enable bool
}

type RateLimitConfig struct {
	Requests int
	Window   time.Duration
}

type CORSConfig struct {
	Origins []string
}

func Load() (*Config, error) {
	// Try .env in: current dir, then parent dir (project root), then grandparent.
	// godotenv.Load silently continues if a file is missing, so this lets you
	// run the binary from either the project root or `backend/`.
	_ = godotenv.Load(".env")
	_ = godotenv.Load("../.env")
	_ = godotenv.Load("../../.env")
	_ = godotenv.Load(".env.local")
	_ = godotenv.Load("../.env.local")

	cfg := &Config{
		App: AppConfig{
			Env:          getEnv("APP_ENV", "development"),
			Name:         getEnv("APP_NAME", "Shram Jagaran CMS"),
			Version:      getEnv("APP_VERSION", "0.1.0"),
			FrontendURL:  getEnv("FRONTEND_URL", "http://localhost:3000"),
			CookieSecure: getEnvBool("COOKIE_SECURE", false),
		},
		SMTP: SMTPConfig{
			Host:     getEnv("SMTP_HOST", ""),
			Port:     getEnvInt("SMTP_PORT", 587),
			User:     getEnv("SMTP_USER", ""),
			Pass:     strings.ReplaceAll(getEnv("SMTP_PASS", ""), " ", ""),
			From:     getEnv("SMTP_FROM", "noreply@shramjagaran.org"),
			FromName: getEnv("SMTP_FROM_NAME", "Shram Jagaran"),
		},
		Mail: MailConfig{
			Provider:     getEnv("MAIL_PROVIDER", "smtp"),
			ResendAPIKey: getEnv("RESEND_API_KEY", ""),
		},
		HTTP: HTTPConfig{
			Port:              getEnv("HTTP_PORT", "8080"),
			ReadTimeout:       getEnvDuration("HTTP_READ_TIMEOUT", 15*time.Second),
			WriteTimeout:      getEnvDuration("HTTP_WRITE_TIMEOUT", 15*time.Second),
			IdleTimeout:       getEnvDuration("HTTP_IDLE_TIMEOUT", 120*time.Second),
			ReadHeaderTimeout: getEnvDuration("HTTP_READ_HEADER_TIMEOUT", 10*time.Second),
			MaxHeaderBytes:    getEnvInt("HTTP_MAX_HEADER_BYTES", 1<<20),
			TrustedProxies:    splitCSV(getEnv("TRUSTED_PROXIES", "")),
		},
		Database: DatabaseConfig{
			URL:             getEnv("DATABASE_URL", ""),
			MaxOpenConns:    getEnvInt("DB_MAX_OPEN_CONNS", 25),
			MaxIdleConns:    getEnvInt("DB_MAX_IDLE_CONNS", 5),
			ConnMaxLifetime: getEnvDuration("DB_CONN_MAX_LIFETIME", 5*time.Minute),
		},
		Redis: RedisConfig{
			URL:      getEnv("REDIS_URL", "redis://localhost:6379"),
			Password: getEnv("REDIS_PASSWORD", ""),
			DB:       getEnvInt("REDIS_DB", 0),
		},
		JWT: JWTConfig{
			Secret:           getEnv("JWT_SECRET", ""),
			AccessExpiresIn:  getEnvDuration("JWT_ACCESS_EXPIRES_IN", 15*time.Minute),
			RefreshExpiresIn: getEnvDuration("JWT_REFRESH_EXPIRES_IN", 7*24*time.Hour),
			Issuer:           getEnv("JWT_ISSUER", "shram-jagaran-cms"),
		},
		R2: R2Config{
			AccountID:       getEnv("R2_ACCOUNT_ID", ""),
			AccessKeyID:     getEnv("R2_ACCESS_KEY_ID", ""),
			SecretAccessKey: getEnv("R2_SECRET_ACCESS_KEY", ""),
			Bucket:          getEnv("R2_BUCKET", "shram-jagaran"),
			PublicURL:       getEnv("R2_PUBLIC_URL", ""),
			Enabled:         getEnvBool("R2_ENABLED", false),
		},
		Sentry: SentryConfig{
			DSN:    getEnv("SENTRY_DSN", ""),
			Enable: getEnvBool("SENTRY_ENABLED", false),
		},
		RateLimit: RateLimitConfig{
			Requests: getEnvInt("RATE_LIMIT_REQUESTS", 100),
			Window:   getEnvDuration("RATE_LIMIT_WINDOW", 1*time.Minute),
		},
		CORS: CORSConfig{
			Origins: strings.Split(getEnv("CORS_ORIGINS", "http://localhost:3000"), ","),
		},
		Admin: AdminConfig{
			Email:    getEnv("ADMIN_EMAIL", "admin@shramjagaran.np"),
			Password: getEnv("ADMIN_PASSWORD", "Admin@123"),
			Phone:    getEnv("ADMIN_PHONE", "+977-9800000001"),
			FullName: getEnv("ADMIN_FULL_NAME", "Platform Admin"),
		},
	}

	if err := cfg.validate(); err != nil {
		return nil, err
	}
	return cfg, nil
}

func (c *Config) validate() error {
	if c.Database.URL == "" {
		return fmt.Errorf("DATABASE_URL is required")
	}
	if c.JWT.Secret == "" {
		return fmt.Errorf("JWT_SECRET is required")
	}
	if len(c.JWT.Secret) < 32 {
		return fmt.Errorf("JWT_SECRET must be at least 32 characters")
	}
	if c.App.Env == "production" {
		if c.Admin.Password == "Admin@123" {
			return fmt.Errorf("refusing to boot in production with default ADMIN_PASSWORD; set a strong ADMIN_PASSWORD")
		}
		if strings.HasPrefix(c.App.FrontendURL, "http://localhost") {
			return fmt.Errorf("refusing to boot in production with localhost FRONTEND_URL; set FRONTEND_URL to the public URL")
		}
		for _, o := range c.CORS.Origins {
			if strings.Contains(o, "localhost") {
				return fmt.Errorf("refusing to boot in production with localhost CORS_ORIGINS; set CORS_ORIGINS to the public frontend URL")
			}
		}
	}
	return nil
}

func splitCSV(s string) []string {
	if strings.TrimSpace(s) == "" {
		return nil
	}
	parts := strings.Split(s, ",")
	out := make([]string, 0, len(parts))
	for _, p := range parts {
		if p = strings.TrimSpace(p); p != "" {
			out = append(out, p)
		}
	}
	return out
}

func getEnv(key, def string) string {
	if v, ok := os.LookupEnv(key); ok && v != "" {
		return v
	}
	return def
}

func getEnvInt(key string, def int) int {
	if v, ok := os.LookupEnv(key); ok {
		if n, err := strconv.Atoi(v); err == nil {
			return n
		}
	}
	return def
}

func getEnvBool(key string, def bool) bool {
	if v, ok := os.LookupEnv(key); ok {
		if b, err := strconv.ParseBool(v); err == nil {
			return b
		}
	}
	return def
}

func getEnvDuration(key string, def time.Duration) time.Duration {
	if v, ok := os.LookupEnv(key); ok {
		if d, err := time.ParseDuration(v); err == nil {
			return d
		}
	}
	return def
}
