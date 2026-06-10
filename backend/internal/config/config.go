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
	App        AppConfig
	HTTP       HTTPConfig
	Database   DatabaseConfig
	Redis      RedisConfig
	JWT        JWTConfig
	SMTP       SMTPConfig
	R2         R2Config
	Sentry     SentryConfig
	RateLimit  RateLimitConfig
	CORS       CORSConfig
}

type SMTPConfig struct {
	Host     string
	Port     int
	User     string
	Pass     string
	From     string
	FromName string
}

type AppConfig struct {
	Env         string
	Name        string
	Version     string
	FrontendURL string
}

type HTTPConfig struct {
	Port         string
	ReadTimeout  time.Duration
	WriteTimeout time.Duration
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
			Env:         getEnv("APP_ENV", "development"),
			Name:        getEnv("APP_NAME", "Shram Jagaran CMS"),
			Version:     getEnv("APP_VERSION", "0.1.0"),
			FrontendURL: getEnv("FRONTEND_URL", "http://localhost:3000"),
		},
		SMTP: SMTPConfig{
			Host:     getEnv("SMTP_HOST", ""),
			Port:     getEnvInt("SMTP_PORT", 587),
			User:     getEnv("SMTP_USER", ""),
			Pass:     getEnv("SMTP_PASS", ""),
			From:     getEnv("SMTP_FROM", "noreply@shramjagaran.org"),
			FromName: getEnv("SMTP_FROM_NAME", "Shram Jagaran"),
		},
		HTTP: HTTPConfig{
			Port:         getEnv("HTTP_PORT", "8080"),
			ReadTimeout:  getEnvDuration("HTTP_READ_TIMEOUT", 15*time.Second),
			WriteTimeout: getEnvDuration("HTTP_WRITE_TIMEOUT", 15*time.Second),
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
	return nil
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
