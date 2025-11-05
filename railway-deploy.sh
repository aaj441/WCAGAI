#!/bin/bash
# railway-deploy.sh
# Automated Railway deployment script with validation and safety checks

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# ============================================================================
# HELPER FUNCTIONS
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
# PRE-DEPLOYMENT CHECKS
# ============================================================================

log_info "🔍 Running pre-deployment checks..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
  log_error "Railway CLI not found. Install it with:"
  log_error "npm install -g @railway/cli"
  log_error "or: curl -fsSL https://railway.app/install.sh | sh"
  exit 1
fi

log_success "Railway CLI installed"

# Check if logged in
if ! railway whoami &> /dev/null; then
  log_error "Not logged in to Railway. Run: railway login"
  exit 1
fi

log_success "Authenticated with Railway"

# Check if project is linked
if ! railway status &> /dev/null; then
  log_warn "No Railway project linked"
  log_info "Run 'railway link' to link an existing project"
  log_info "or 'railway init' to create a new project"
  exit 1
fi

log_success "Railway project linked"

# ============================================================================
# ENVIRONMENT VARIABLE CHECK
# ============================================================================

log_info "🔐 Checking required environment variables..."

REQUIRED_VARS=("GEMINI_API_KEY" "SERPAPI_KEY")
MISSING_VARS=()

for var in "${REQUIRED_VARS[@]}"; do
  if ! railway variables | grep -q "^$var="; then
    MISSING_VARS+=("$var")
  fi
done

if [[ ${#MISSING_VARS[@]} -gt 0 ]]; then
  log_error "Missing required environment variables on Railway:"
  for var in "${MISSING_VARS[@]}"; do
    log_error "  - $var"
  done
  log_info ""
  log_info "Set them with: railway variables set $var=value"
  exit 1
fi

log_success "All required environment variables set"

# ============================================================================
# BUILD VALIDATION
# ============================================================================

log_info "📦 Validating local build..."

# Ensure package.json exists
if [[ ! -f "package.json" ]]; then
  log_error "package.json not found"
  exit 1
fi

# Run npm install to validate dependencies
log_info "Installing dependencies..."
if ! npm ci --production=false; then
  log_error "npm install failed - fix dependencies before deploying"
  exit 1
fi

log_success "Dependencies installed successfully"

# Run optional build step if script exists
if npm run | grep -q "build"; then
  log_info "Running build script..."
  npm run build || log_warn "Build script failed (continuing anyway)"
fi

# ============================================================================
# CONFIGURATION VALIDATION
# ============================================================================

log_info "⚙️  Validating Railway configuration..."

# Check railway.json exists
if [[ ! -f "railway.json" ]]; then
  log_warn "railway.json not found (optional but recommended)"
fi

# Check nixpacks.toml exists (Railway uses Nixpacks)
if [[ ! -f "nixpacks.toml" ]]; then
  log_warn "nixpacks.toml not found (using Railway defaults)"
fi

# ============================================================================
# DEPLOYMENT CONFIRMATION
# ============================================================================

log_info ""
log_info "╔══════════════════════════════════════════════════════════════╗"
log_info "║                                                              ║"
log_info "║              🚂 WCAGAI Railway Deployment                   ║"
log_info "║                                                              ║"
log_info "╚══════════════════════════════════════════════════════════════╝"
log_info ""

RAILWAY_PROJECT=$(railway status | grep "Project:" | awk '{print $2}' || echo "Unknown")
RAILWAY_ENV=$(railway status | grep "Environment:" | awk '{print $2}' || echo "production")

log_info "Project:     $RAILWAY_PROJECT"
log_info "Environment: $RAILWAY_ENV"
log_info "Version:     $(cat package.json | grep '"version"' | awk -F'"' '{print $4}')"
log_info ""

read -p "Deploy to Railway? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
  log_warn "Deployment cancelled"
  exit 0
fi

# ============================================================================
# DEPLOYMENT
# ============================================================================

log_info ""
log_info "🚀 Deploying to Railway..."
log_info ""

# Set production environment variables
log_info "Setting production environment variables..."
railway variables set NODE_ENV=production || log_warn "Failed to set NODE_ENV"

# Deploy using Railway CLI
log_info "Pushing to Railway..."
if railway up; then
  log_success ""
  log_success "╔══════════════════════════════════════════════════════════════╗"
  log_success "║                                                              ║"
  log_success "║              ✅ DEPLOYMENT SUCCESSFUL                        ║"
  log_success "║                                                              ║"
  log_success "╚══════════════════════════════════════════════════════════════╝"
  log_success ""

  # Get deployment URL
  DEPLOYMENT_URL=$(railway status | grep "URL:" | awk '{print $2}' || echo "Check Railway dashboard")

  log_info "Deployment URL: $DEPLOYMENT_URL"
  log_info ""
  log_info "📊 View logs:        railway logs"
  log_info "🔍 Check status:     railway status"
  log_info "🌐 Open in browser:  railway open"
  log_info ""

  # Wait for deployment to be ready
  log_info "⏳ Waiting for deployment to become healthy..."
  sleep 10

  # Test health endpoint
  if [[ "$DEPLOYMENT_URL" != "Check Railway dashboard" ]]; then
    log_info "Testing health endpoint..."
    if curl -sf "$DEPLOYMENT_URL/health" > /dev/null; then
      log_success "Health check passed! ✅"
      log_info ""
      log_info "Test endpoints:"
      log_info "  curl $DEPLOYMENT_URL/health"
      log_info "  curl $DEPLOYMENT_URL/api/test/probes"
    else
      log_warn "Health check not responding yet (may take a minute)"
      log_info "Check logs with: railway logs"
    fi
  fi

else
  log_error ""
  log_error "╔══════════════════════════════════════════════════════════════╗"
  log_error "║                                                              ║"
  log_error "║              ❌ DEPLOYMENT FAILED                            ║"
  log_error "║                                                              ║"
  log_error "╚══════════════════════════════════════════════════════════════╝"
  log_error ""
  log_error "Check logs with: railway logs"
  log_error "View dashboard: railway open"
  exit 1
fi
