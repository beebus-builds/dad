#!/usr/bin/env bash
# ============================================================================
# Post-deploy smoke test — backend + frontend
# Usage: bash scripts/smoke.sh [FRONTEND_URL] [API_URL]
#   FRONTEND_URL defaults to http://localhost:3000
#   API_URL defaults to http://localhost:8080
# Fails (exit 1) on the first failing check.
# ============================================================================
set -euo pipefail

FRONT="${1:-http://localhost:3000}"
API="${2:-http://localhost:8080}"

pass=0
fail=0

check() {
  local name="$1" url="$2" expect="${3:-200}"
  local code
  code="$(curl -s -o /dev/null -w '%{http_code}' --max-time 15 "$url" || echo 000)"
  if [ "$code" = "$expect" ]; then
    echo "PASS [$code] $name ($url)"
    pass=$((pass + 1))
  else
    echo "FAIL [got $code, want $expect] $name ($url)"
    fail=$((fail + 1))
  fi
}

echo "== backend =="
check "liveness"        "$API/health"
check "readiness (DB)"  "$API/ready"
check "public news"     "$API/api/v1/public/news"

echo "== frontend =="
check "home"            "$FRONT/ne"
check "english home"    "$FRONT/en"
check "frontend health" "$FRONT/api/health"

echo
echo "pass=$pass fail=$fail"
[ "$fail" -eq 0 ]
