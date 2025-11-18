#!/bin/bash
# ============================================================================
# Feature Flag Disable Script - Kill Switch for New Features
# ============================================================================
#
# Purpose: Quickly disable problematic features without full rollback
# Usage: ./scripts/rollback/feature-flag-disable.sh <feature-name> [environment]
#
# Examples:
#   ./scripts/rollback/feature-flag-disable.sh WCAG_AI_ENHANCED production-green
#   ./scripts/rollback/feature-flag-disable.sh AUTO_ROLLBACK production-green
#
# ============================================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# ============================================================================
# Parse Arguments
# ============================================================================

FEATURE_NAME="${1}"
ENVIRONMENT="${2:-production-green}"

if [ -z "$FEATURE_NAME" ]; then
  echo -e "${RED}Error: Feature name required${NC}"
  echo ""
  echo "Usage: $0 <feature-name> [environment]"
  echo ""
  echo "Available features:"
  echo "  - WCAG_AI_ENHANCED     : Enhanced AI scanning with Gemini 2.0"
  echo "  - AUTO_ROLLBACK        : Automatic rollback on errors"
  echo "  - EMAIL_NOTIFICATIONS  : Email notifications for scans"
  echo "  - BADGE_GENERATION     : AAG badge generation"
  echo ""
  exit 1
fi

# ============================================================================
# Feature Flag Mapping
# ============================================================================

case $FEATURE_NAME in
  WCAG_AI_ENHANCED)
    FLAG_VAR="FEATURE_WCAG_AI_ENHANCED"
    DESCRIPTION="Enhanced AI Scanning with Gemini 2.0"
    ;;
  AUTO_ROLLBACK)
    FLAG_VAR="FEATURE_AUTO_ROLLBACK"
    DESCRIPTION="Automatic Rollback System"
    ;;
  EMAIL_NOTIFICATIONS)
    FLAG_VAR="FEATURE_EMAIL_NOTIFICATIONS"
    DESCRIPTION="Email Notifications"
    ;;
  BADGE_GENERATION)
    FLAG_VAR="FEATURE_BADGE_GENERATION"
    DESCRIPTION="AAG Badge Generation"
    ;;
  *)
    echo -e "${RED}Unknown feature: $FEATURE_NAME${NC}"
    exit 1
    ;;
esac

# ============================================================================
# Confirmation
# ============================================================================

echo -e "${YELLOW}════════════════════════════════════════════════════════${NC}"
echo -e "${YELLOW}  🚫 FEATURE FLAG DISABLE${NC}"
echo -e "${YELLOW}════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}Feature:${NC}     $DESCRIPTION"
echo -e "${BLUE}Flag:${NC}        $FLAG_VAR"
echo -e "${BLUE}Environment:${NC} $ENVIRONMENT"
echo ""

read -p "Disable this feature? (yes/no): " -r
echo
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
  echo -e "${YELLOW}Cancelled by user${NC}"
  exit 0
fi

# ============================================================================
# Disable Feature Flag
# ============================================================================

echo -e "${BLUE}[1/3]${NC} Disabling feature flag..."

if railway variables set $FLAG_VAR=false --environment $ENVIRONMENT; then
  echo -e "${GREEN}✓${NC} Feature flag disabled"
else
  echo -e "${RED}✗${NC} Failed to disable feature flag"
  exit 1
fi

# ============================================================================
# Restart Service
# ============================================================================

echo -e "${BLUE}[2/3]${NC} Restarting service to apply changes..."

if railway restart --environment $ENVIRONMENT; then
  echo -e "${GREEN}✓${NC} Service restarted"
else
  echo -e "${RED}✗${NC} Failed to restart service"
  exit 1
fi

# Wait for service to be ready
echo -e "${BLUE}[3/3]${NC} Waiting for service to be ready..."
sleep 15

# ============================================================================
# Verify
# ============================================================================

# Get environment URL
ENV_URL=$(railway status --environment $ENVIRONMENT 2>/dev/null | grep "URL:" | awk '{print $2}' || echo "")

if [ -n "$ENV_URL" ]; then
  if curl -f -s --max-time 10 "$ENV_URL/health/ready" > /dev/null; then
    echo -e "${GREEN}✓${NC} Service is ready"
  else
    echo -e "${YELLOW}⚠${NC} Service may not be ready yet (check manually)"
  fi
fi

# ============================================================================
# Complete
# ============================================================================

echo ""
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  ✅ FEATURE DISABLED${NC}"
echo -e "${GREEN}════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${BLUE}Feature:${NC}     $DESCRIPTION"
echo -e "${BLUE}Status:${NC}      DISABLED"
echo -e "${BLUE}Environment:${NC} $ENVIRONMENT"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo -e "  1. Verify feature is disabled: curl $ENV_URL/health"
echo -e "  2. Monitor error rates"
echo -e "  3. Fix underlying issue"
echo -e "  4. Re-enable when ready: railway variables set $FLAG_VAR=true"
echo ""

# Log
echo "$(date) - Feature disabled: $FEATURE_NAME ($FLAG_VAR=false) - Environment: $ENVIRONMENT" >> logs/feature-flag-history.log

exit 0
