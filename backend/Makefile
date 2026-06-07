SHELL := /bin/bash
APP  := shram-jagaran-api

.PHONY: help deps run build test lint migrate seed fmt clean

help:
	@echo "Targets:"
	@echo "  deps      Download go modules"
	@echo "  run       Run the API server (go run cmd/api/main.go)"
	@echo "  build     Build the binary to bin/$(APP)"
	@echo "  test      Run unit tests"
	@echo "  lint      Run golangci-lint"
	@echo "  fmt       Run gofmt"
	@echo "  migrate   Apply SQL migrations (requires psql + DATABASE_URL)"
	@echo "  seed      Apply seed data (requires psql + DATABASE_URL)"
	@echo "  clean     Remove build artifacts"

deps:
	go mod download
	go mod tidy

run:
	@if [ ! -f .env ]; then cp .env.example .env; fi
	go run ./cmd/api

build:
	@mkdir -p bin
	go build -o bin/$(APP) ./cmd/api

test:
	go test ./...

lint:
	@command -v golangci-lint >/dev/null 2>&1 || go install github.com/golangci/golangci-lint/cmd/golangci-lint@latest
	golangci-lint run ./...

fmt:
	gofmt -s -w .

migrate:
	@if [ -z "$$DATABASE_URL" ]; then echo "Set DATABASE_URL"; exit 1; fi
	@for f in migrations/*.up.sql; do \
		echo "Applying $$f..."; \
		psql "$$DATABASE_URL" -f $$f || exit 1; \
	done

seed:
	psql "$$DATABASE_URL" -f migrations/0002_seed_data.up.sql

clean:
	rm -rf bin tmp
