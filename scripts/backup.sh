#!/usr/bin/env bash
# ============================================================================
# Database Backup Script (Neon PostgreSQL)
# Usage:  bash scripts/backup.sh
# Restore: bash scripts/restore.sh <backup-file>
# ============================================================================
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
BACKUP_DIR="$PROJECT_ROOT/backups"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
BACKUP_FILE="$BACKUP_DIR/shramjagaran_$TIMESTAMP.sql"

# Load DATABASE_URL from .env if available
if [ -f "$PROJECT_ROOT/.env" ]; then
  # shellcheck source=/dev/null
  set -o allexport; source "$PROJECT_ROOT/.env"; set +o allexport
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL is not set. Provide it in .env or export it."
  exit 1
fi

mkdir -p "$BACKUP_DIR"

echo "Backing up database to $BACKUP_FILE …"
pg_dump --no-owner --no-acl --clean --if-exists "$DATABASE_URL" > "$BACKUP_FILE"

echo "Compressing …"
gzip -f "$BACKUP_FILE"

echo "Backup complete: ${BACKUP_FILE}.gz"
ls -lh "${BACKUP_FILE}.gz"
