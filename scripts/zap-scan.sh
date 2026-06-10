#!/usr/bin/env bash
# ============================================================================
# OWASP ZAP Baseline Security Scan
# Requires Docker. Run from project root.
# Usage:  bash scripts/zap-scan.sh
# ============================================================================
set -euo pipefail

TARGET_URL="${1:-https://your-frontend.vercel.app}"
REPORT_DIR="security-reports"

mkdir -p "$REPORT_DIR"

docker pull softwaresecurityproject/zap-stable:latest

docker run --rm \
  -v "$(pwd)/$REPORT_DIR:/zap/wrk/:rw" \
  softwaresecurityproject/zap-stable:latest \
  zap-baseline.py \
    -t "$TARGET_URL" \
    -r zap-report.html \
    -w zap-report.md \
    -x zap-report.xml \
    -d \
    --hook=/zap/auth_hook.py \
    || echo "ZAP scan completed (exit code ignored — see report for details)"

echo "Report saved to $REPORT_DIR/"
