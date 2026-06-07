package storage

import (
	"context"
	"fmt"
	"io"

	"github.com/minio/minio-go/v7"
	"github.com/minio/minio-go/v7/pkg/credentials"
	"github.com/shramjagaran/cms-backend/internal/config"
)

type R2 struct {
	client   *minio.Client
	bucket   string
	publicURL string
}

func NewR2(ctx context.Context, cfg config.R2Config) (*R2, error) {
	if !cfg.Enabled {
		return &R2{bucket: cfg.Bucket, publicURL: cfg.PublicURL}, nil
	}
	cli, err := minio.New(fmt.Sprintf("%s.r2.cloudflarestorage.com", cfg.AccountID), &minio.Options{
		Creds:  credentials.NewStaticV4(cfg.AccessKeyID, cfg.SecretAccessKey, ""),
		Secure: true,
	})
	if err != nil {
		return nil, err
	}
	exists, err := cli.BucketExists(ctx, cfg.Bucket)
	if err != nil {
		return nil, err
	}
	if !exists {
		if err := cli.MakeBucket(ctx, cfg.Bucket, minio.MakeBucketOptions{}); err != nil {
			return nil, err
		}
	}
	return &R2{client: cli, bucket: cfg.Bucket, publicURL: cfg.PublicURL}, nil
}

func (r *R2) Upload(ctx context.Context, key string, reader io.Reader, size int64, contentType string) (string, error) {
	if r.client == nil {
		return "", fmt.Errorf("R2 is not enabled")
	}
	_, err := r.client.PutObject(ctx, r.bucket, key, reader, size, minio.PutObjectOptions{ContentType: contentType})
	if err != nil {
		return "", err
	}
	if r.publicURL != "" {
		return fmt.Sprintf("%s/%s", r.publicURL, key), nil
	}
	return fmt.Sprintf("https://%s.r2.cloudflarestorage.com/%s/%s", r.bucket, r.bucket, key), nil
}

func (r *R2) Delete(ctx context.Context, key string) error {
	if r.client == nil {
		return nil
	}
	return r.client.RemoveObject(ctx, r.bucket, key, minio.RemoveObjectOptions{})
}
