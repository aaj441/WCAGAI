#!/bin/bash
# orchestrate-railway.sh
# Railway-optimized orchestration with resource limits
# Designed for Railway's memory constraints (512MB-1GB free tier)

set -e

# ============================================================================
# RAILWAY RESOURCE LIMITS
# ============================================================================

# Limit concurrent agents to prevent memory exhaustion
export MAX_CONCURRENT=${MAX_CONCURRENT:-2}

# Node.js memory limit (400MB leaves room for OS + other processes)
export NODE_OPTIONS="--max-old-space-size=400 ${NODE_OPTIONS:-}"

# Reduce Playwright memory usage
export PLAYWRIGHT_BROWSERS_PATH=/tmp/playwright
export PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=0

# ============================================================================
# LOGGING
# ============================================================================

LOG_DIR="${LOG_DIR:-./logs}"
mkdir -p "$LOG_DIR"

log_info() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] [INFO] $*" | tee -a "$LOG_DIR/orchestrate-railway.log"
}

log_error() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] [ERROR] $*" | tee -a "$LOG_DIR/orchestrate-railway.log" >&2
}

log_warn() {
  echo "[$(date +'%Y-%m-%d %H:%M:%S')] [WARN] $*" | tee -a "$LOG_DIR/orchestrate-railway.log"
}

# ============================================================================
# RAILWAY ENVIRONMENT DETECTION
# ============================================================================

if [[ -n "${RAILWAY_ENVIRONMENT:-}" ]]; then
  log_info "🚂 Running on Railway (Environment: $RAILWAY_ENVIRONMENT)"
  log_info "📊 Resource limits: MAX_CONCURRENT=$MAX_CONCURRENT, Memory=${NODE_OPTIONS}"
else
  log_warn "Not running on Railway - using Railway resource limits anyway"
fi

# ============================================================================
# ENVIRONMENT VALIDATION
# ============================================================================

KEYWORD="${1:-accessibility}"
log_info "🔍 Keyword: $KEYWORD"

# Check required environment variables
REQUIRED_VARS=("GEMINI_API_KEY" "SERPAPI_KEY")
for var in "${REQUIRED_VARS[@]}"; do
  if [[ -z "${!var}" ]]; then
    log_error "❌ Missing required environment variable: $var"
    log_error "Set it in Railway dashboard: railway variables set $var=your_value"
    exit 1
  fi
done

log_info "✅ Environment variables validated"

# ============================================================================
# ORCHESTRATION SCRIPT SELECTION
# ============================================================================

# Use enhanced orchestrator if available, otherwise fall back to standard
ORCHESTRATE_SCRIPT=""
if [[ -f "wcag_machine_v5_visual_reg/orchestrate-enhanced.sh" ]]; then
  ORCHESTRATE_SCRIPT="wcag_machine_v5_visual_reg/orchestrate-enhanced.sh"
  log_info "Using enhanced orchestrator"
elif [[ -f "wcag_machine_v5_visual_reg/orchestrate.sh" ]]; then
  ORCHESTRATE_SCRIPT="wcag_machine_v5_visual_reg/orchestrate.sh"
  log_info "Using standard orchestrator"
else
  log_error "❌ No orchestration script found"
  exit 1
fi

# ============================================================================
# MEMORY MONITORING
# ============================================================================

monitor_memory() {
  while true; do
    if command -v free &> /dev/null; then
      MEMORY_USAGE=$(free -m | awk 'NR==2{printf "%.2f%%", $3*100/$2 }')
      log_info "📊 Memory usage: $MEMORY_USAGE"
    fi
    sleep 60
  done
}

# Start memory monitor in background
monitor_memory &
MONITOR_PID=$!

# ============================================================================
# CLEANUP HANDLER
# ============================================================================

cleanup() {
  log_info "🧹 Cleaning up..."
  kill $MONITOR_PID 2>/dev/null || true

  # Kill any remaining Node processes spawned by orchestrator
  pkill -P $$ node 2>/dev/null || true

  log_info "✅ Cleanup complete"
}

trap cleanup EXIT INT TERM

# ============================================================================
# RUN ORCHESTRATOR
# ============================================================================

log_info "🚀 Starting orchestrator with resource limits..."
log_info "   MAX_CONCURRENT: $MAX_CONCURRENT"
log_info "   NODE_OPTIONS: $NODE_OPTIONS"

# Run orchestrator with keyword
bash "$ORCHESTRATE_SCRIPT" "$KEYWORD"

ORCHESTRATE_EXIT_CODE=$?

if [[ $ORCHESTRATE_EXIT_CODE -eq 0 ]]; then
  log_info "✅ Orchestration completed successfully"
else
  log_error "❌ Orchestration failed with exit code $ORCHESTRATE_EXIT_CODE"
  exit $ORCHESTRATE_EXIT_CODE
fi
