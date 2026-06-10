#!/usr/bin/env bash
# ============================================================================
# Database Restore Script (Neon PostgreSQL)
# Usage:  bash scripts/restore.sh backups/shramjagaran_20250610_120000.sql.gz
# ============================================================================
set -euo pipefail

if [ $# -lt 1 ]; then
  echo "Usage: $0 <backup-file>"
  echo "Example: $0 backups/shramjagaran_20250610_120000.sql.gz"
  exit 1
fi

BACKUP_FILE="$1"

if [ ! -f "$BACKUP_FILE" ]; then
  echo "ERROR: Backup file not found: $BACKUP_FILE"
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"

if [ -f "$PROJECT_ROOT/.env" ]; then
  set -o allexport; source "$PROJECT_ROOT/.env"; set +o allexport
fi

if [ -z "${DATABASE_URL:-}" ]; then
  echo "ERROR: DATABASE_URL is not set."
  exit 1
fi

echo "WARNING: This will REPLACE the current database with data from $BACKUP_FILE"
read -rp "Are you sure? (type 'yes' to continue): " confirmation
if [ "$confirmation" != "yes" ]; then
  echo "Aborted."
  exit 1
fi

echo "Restoring from $BACKUP_FILE …"
if [[ "$BACKUP_FILE" == *.gz ]]; then
  gunzip -c "$BACKUP_FILE" | psql "$DATABASE_URL"
else
  psql "$DATABASE_URL" < "$BACKUP_FILE"
fi

echo "Restore complete."
