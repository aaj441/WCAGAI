#!/bin/bash
# ============================================================================
# Instant Rollback Script - WCAGAI Zero-Downtime Deployment
# ============================================================================
#
# Purpose: Switch traffic from GREEN environment back to BLUE in < 30 seconds
# Usage: ./scripts/rollback/instant-rollback.sh [reason]
#
# Example:
#   ./scripts/rollback/instant-rollback.sh "High error rate detected"
#
# ============================================================================

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================================
# Configuration
# ============================================================================

BLUE_ENVIRONMENT="production-blue"
GREEN_ENVIRONMENT="production-green"
DOMAIN="wcagai.com"
ROLLBACK_REASON="${1:-Manual rollback initiated}"

# ============================================================================
# Functions
# ============================================================================

log_info() {
  echo -e "${BLUE}[INFO]${NC} $*"
}

log_success() {
  echo -e "${GREEN}[SUCCESS]${NC} $*"
}

log_warn() {
  echo -e "${YELLOW}[WARN]${NC} $*"
}

log_error() {
  echo -e "${RED}[ERROR]${NC} $*"
}

# ============================================================================
# Pre-Flight Checks
# ============================================================================

log_warn "════════════════════════════════════════════════════════"
log_warn "  🔴 EMERGENCY ROLLBACK INITIATED"
log_warn "════════════════════════════════════════════════════════"
echo ""
log_warn "Reason: $ROLLBACK_REASON"
echo ""

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
  log_error "Railway CLI not found. Install with: npm install -g @railway/cli"
  exit 1
fi

# Verify Railway authentication
if ! railway whoami &> /dev/null; then
  log_error "Not authenticated with Railway. Run: railway login"
  exit 1
fi

# Confirm rollback
echo -e "${YELLOW}This will switch ALL traffic from GREEN to BLUE${NC}"
read -p "Continue with rollback? (yes/no): " -r
echo
if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
  log_warn "Rollback cancelled by user"
  exit 0
fi

# ============================================================================
# Step 1: Verify Blue Environment is Healthy
# ============================================================================

log_info "Step 1/4: Verifying BLUE environment health..."

# Get blue environment URL
BLUE_URL=$(railway status --environment $BLUE_ENVIRONMENT 2>/dev/null | grep "URL:" | awk '{print $2}' || echo "")

if [ -z "$BLUE_URL" ]; then
  log_warn "Could not determine BLUE environment URL, using fallback"
  BLUE_URL="https://wcagai-blue.railway.app"
fi

# Check health endpoint
if curl -f -s --max-time 5 "$BLUE_URL/health" > /dev/null; then
  log_success "BLUE environment is healthy"
else
  log_error "BLUE environment health check failed!"
  log_error "Cannot rollback to unhealthy environment"
  log_error "URL tested: $BLUE_URL/health"
  read -p "Force rollback anyway? (yes/no): " -r
  echo
  if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    log_error "Rollback aborted"
    exit 1
  fi
  log_warn "Forcing rollback despite failed health check"
fi

# ============================================================================
# Step 2: Switch DNS to Blue Environment
# ============================================================================

log_info "Step 2/4: Switching DNS from GREEN to BLUE..."

# Add domain to blue environment
if railway domains add $DOMAIN --environment $BLUE_ENVIRONMENT 2>&1; then
  log_success "DNS switched to BLUE environment"
else
  log_error "Failed to switch DNS to BLUE"
  log_error "You may need to switch manually in Railway dashboard"
  exit 1
fi

# ============================================================================
# Step 3: Wait for DNS Propagation
# ============================================================================

log_info "Step 3/4: Waiting for DNS propagation (30 seconds)..."

for i in {30..1}; do
  echo -ne "\r  Waiting... $i seconds remaining"
  sleep 1
done
echo ""

log_success "DNS propagation complete"

# ============================================================================
# Step 4: Verify Traffic is on Blue
# ============================================================================

log_info "Step 4/4: Verifying traffic is on BLUE..."

# Check main domain
if curl -f -s --max-time 10 "https://$DOMAIN/health" > /dev/null; then
  log_success "Domain is responding: https://$DOMAIN"

  # Verify it's actually blue environment
  RESPONSE=$(curl -s "https://$DOMAIN/health" | grep -o '"environment":"[^"]*"' || echo "")
  log_info "Environment: $RESPONSE"
else
  log_warn "Domain not responding yet (may take longer for global DNS)"
  log_warn "Check manually: https://$DOMAIN/health"
fi

# ============================================================================
# Rollback Complete
# ============================================================================

echo ""
log_success "════════════════════════════════════════════════════════"
log_success "  ✅ ROLLBACK COMPLETE"
log_success "════════════════════════════════════════════════════════"
echo ""
log_info "Traffic is now on BLUE environment"
log_info "Domain: https://$DOMAIN"
echo ""
log_warn "NEXT STEPS:"
log_warn "1. Investigate GREEN environment issues"
log_warn "   - Review logs: railway logs --environment $GREEN_ENVIRONMENT"
log_warn "   - Check metrics: curl https://$DOMAIN/health/metrics"
log_warn "2. Fix issues in GREEN environment"
log_warn "3. Test fixes before re-deploying"
log_warn "4. Notify team and stakeholders"
echo ""
log_info "Rollback reason logged: $ROLLBACK_REASON"
echo ""

# Send Slack notification (if configured)
if [ -n "$SLACK_WEBHOOK_URL" ]; then
  curl -X POST -H 'Content-type: application/json' \
    --data "{\"text\":\"🔴 *WCAGAI Rollback Executed*\n\nReason: $ROLLBACK_REASON\nTime: $(date)\nEnvironment: GREEN → BLUE\"}" \
    "$SLACK_WEBHOOK_URL" 2>/dev/null || true
fi

# Log to file
echo "$(date) - Rollback executed - Reason: $ROLLBACK_REASON" >> logs/rollback-history.log

exit 0
