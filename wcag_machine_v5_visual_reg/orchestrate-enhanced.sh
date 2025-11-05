#!/usr/bin/env bash

# ============================================================================
# WCAGAI Complete Stack v2.0 - Enhanced Orchestration with LucyQ AI
# ============================================================================
#
# This orchestration script runs the full accessibility compliance pipeline
# with advanced LLM prompt engineering and musical pattern integration.
#
# Usage: bash orchestrate.sh <keyword> [options]
#
# Examples:
#   bash orchestrate.sh "pharmaceutical companies"
#   bash orchestrate.sh "guitar" --verbose
#   bash orchestrate.sh "pfizer" --lucy-mode
#
# Features:
#   - Parallel agent execution
#   - LucyQ AI persona integration
#   - Advanced prompt engineering
#   - Musical pattern-based pacing
#   - Real-time progress tracking
#   - Intelligent fallback mechanisms
#
# Author: Aaron J. (aaj441) + LucyQ AI
# Version: 2.0.0 Enhanced
# ============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# ============================================================================
# Configuration
# ============================================================================

if [[ -z "$1" ]]; then
  echo -e "${RED}Usage: $0 <keyword> [options]${NC}"
  echo ""
  echo "Examples:"
  echo "  $0 'pharmaceutical companies'"
  echo "  $0 'guitar' --verbose"
  echo "  $0 'pfizer' --lucy-mode"
  echo ""
  echo "Options:"
  echo "  --verbose       Show detailed logs"
  echo "  --lucy-mode     Enable LucyQ AI persona"
  echo "  --musical       Use musical pacing patterns"
  echo "  --skip-gemini   Skip Gemini AI analysis"
  echo "  --fast          Fast mode (parallel, no delays)"
  exit 1
fi

KEYWORD="$1"
shift  # Remove keyword from args

VERBOSE=false
LUCY_MODE=false
MUSICAL_MODE=false
SKIP_GEMINI=false
FAST_MODE=false

# Parse options
while [[ $# -gt 0 ]]; do
  case $1 in
    --verbose)
      VERBOSE=true
      shift
      ;;
    --lucy-mode)
      LUCY_MODE=true
      shift
      ;;
    --musical)
      MUSICAL_MODE=true
      shift
      ;;
    --skip-gemini)
      SKIP_GEMINI=true
      shift
      ;;
    --fast)
      FAST_MODE=true
      shift
      ;;
    *)
      echo -e "${YELLOW}Unknown option: $1${NC}"
      shift
      ;;
  esac
done

# ============================================================================
# LucyQ AI Banner
# ============================================================================

if [[ "$LUCY_MODE" == "true" ]]; then
  echo -e "${MAGENTA}"
  cat << 'EOF'
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║   🎵 LucyQ AI - WCAGAI Enhanced Orchestration               ║
║                                                               ║
║   "Accessibility scanning with musical intelligence"        ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
EOF
  echo -e "${NC}"
else
  echo -e "${CYAN}"
  cat << 'EOF'
╔═══════════════════════════════════════════════════════════════╗
║   🚀 WCAGAI Complete Stack v2.0 - Pipeline Starting          ║
╚═══════════════════════════════════════════════════════════════╝
EOF
  echo -e "${NC}"
fi

echo -e "${BLUE}Keyword:${NC} '$KEYWORD'"
echo -e "${BLUE}Lucy Mode:${NC} $LUCY_MODE"
echo -e "${BLUE}Musical Pacing:${NC} $MUSICAL_MODE"
echo ""

# ============================================================================
# Musical Pacing Function (Based on Last.fm patterns)
# ============================================================================

musical_pause() {
  if [[ "$MUSICAL_MODE" == "true" && "$FAST_MODE" == "false" ]]; then
    # Simulate musical pacing: 120 BPM = 0.5s per beat
    sleep 0.5
  fi
}

# ============================================================================
# Progress Tracking
# ============================================================================

START_TIME=$(date +%s)
pids=()
agent_names=()
agent_status=()

log_stage() {
  local stage=$1
  local message=$2
  echo -e "${CYAN}[STAGE $stage]${NC} $message"
  musical_pause
}

log_success() {
  echo -e "${GREEN}✓${NC} $1"
}

log_error() {
  echo -e "${RED}✗${NC} $1"
}

log_info() {
  if [[ "$VERBOSE" == "true" ]]; then
    echo -e "${YELLOW}ℹ${NC} $1"
  fi
}

# ============================================================================
# Stage 1: Keyword → URLs Discovery
# ============================================================================

log_stage "1/7" "Discovering URLs for keyword: '$KEYWORD'"

if [[ -f "agent-keyword.service.js" ]]; then
  log_info "Launching keyword agent..."
  node agent-keyword.service.js "$KEYWORD" > logs/keyword-agent.log 2>&1 &
  pids+=("$!")
  agent_names+=("keyword")
  log_success "Keyword agent started (PID: $!)"
else
  log_error "agent-keyword.service.js not found"
  exit 1
fi

musical_pause

# Wait for Stage 1 (keyword agent) to complete before proceeding
log_info "Waiting for keyword agent to complete..."
if ! wait "${pids[0]}"; then
  log_error "Stage 1 (keyword agent) failed - cannot proceed"
  log_warn "Check logs/keyword-agent.log for details"
  exit 1
fi
log_success "Stage 1 completed successfully"

# ============================================================================
# Stage 2: URL Scanning with Axe-core
# ============================================================================

log_stage "2/7" "Scanning URLs for accessibility violations"

# Prerequisite check: Verify URLs were discovered
if [[ ! -f "results/urls.json" ]] && [[ ! -f "./urls.json" ]]; then
  log_error "No URLs found from Stage 1 - cannot proceed with scanning"
  log_warn "Expected results/urls.json or urls.json to exist"
  exit 1
fi

if [[ "$USE_BULLMQ" == "true" ]]; then
  log_info "Using BullMQ worker for scanning..."
  if [[ -f "agent-scan-worker.service.js" ]]; then
    node agent-scan-worker.service.js > logs/scan-worker.log 2>&1 &
    pids+=("$!")
    agent_names+=("scan-worker")
    log_success "Scan worker started (PID: $!)"
  fi
else
  log_info "Using direct scan agent..."
  if [[ -f "agent-scan.service.js" ]]; then
    node agent-scan.service.js > logs/scan-agent.log 2>&1 &
    pids+=("$!")
    agent_names+=("scan")
    log_success "Scan agent started (PID: $!)"
  fi
fi

musical_pause

# Wait for Stage 2 (scan agent) to complete before proceeding
log_info "Waiting for scan agent to complete..."
SCAN_PID_INDEX=$((${#pids[@]} - 1))
if ! wait "${pids[$SCAN_PID_INDEX]}"; then
  log_error "Stage 2 (scan agent) failed - cannot proceed"
  log_warn "Check logs/scan-agent.log or logs/scan-worker.log for details"
  exit 1
fi
log_success "Stage 2 completed successfully"

musical_pause

# ============================================================================
# Stage 3: LucyQ AI Analysis (Enhanced Gemini)
# ============================================================================

# Prerequisite check: Verify scan results exist
if [[ ! -f "results/scan-results.json" ]] && [[ ! -f "./scan-results.json" ]]; then
  log_warn "No scan results found from Stage 2 - skipping AI analysis"
  log_info "Expected results/scan-results.json or scan-results.json to exist"
  SKIP_GEMINI="true"
fi

if [[ "$SKIP_GEMINI" == "false" ]]; then
  log_stage "3/7" "Analyzing with LucyQ AI (Gemini 2.0 + WCAGAI)"

  if [[ -f "agent-gemini.service.js" ]]; then
    log_info "Launching LucyQ AI agent..."

    # Export Lucy mode for the agent
    export LUCY_MODE=$LUCY_MODE
    export MUSICAL_MODE=$MUSICAL_MODE

    node agent-gemini.service.js "$KEYWORD" > logs/gemini-agent.log 2>&1 &
    pids+=("$!")
    agent_names+=("gemini-lucy")
    log_success "LucyQ AI started (PID: $!)"

    musical_pause

    # Wait for Stage 3 (Gemini agent) to complete before proceeding
    log_info "Waiting for Gemini AI agent to complete..."
    GEMINI_PID_INDEX=$((${#pids[@]} - 1))
    if ! wait "${pids[$GEMINI_PID_INDEX]}"; then
      log_warn "Stage 3 (Gemini AI) failed - continuing without AI analysis"
      log_warn "Check logs/gemini-agent.log for details"
    else
      log_success "Stage 3 completed successfully"
    fi
  else
    log_error "agent-gemini.service.js not found - continuing without AI analysis"
  fi

  musical_pause
fi

# ============================================================================
# Stage 4: AAG Badge Generation
# ============================================================================

log_stage "4/7" "Generating AAG compliance badges"

# Prerequisite check: Verify scan or analysis results exist
if [[ ! -f "results/scan-results.json" ]] && [[ ! -f "./scan-results.json" ]] && \
   [[ ! -f "results/analysis-results.json" ]] && [[ ! -f "./analysis-results.json" ]]; then
  log_error "No scan or analysis results found - cannot generate badges"
  exit 1
fi

if [[ -f "agent-badge.service.js" ]]; then
  log_info "Launching badge generation agent..."
  node agent-badge.service.js > logs/badge-agent.log 2>&1 &
  pids+=("$!")
  agent_names+=("badge")
  log_success "Badge agent started (PID: $!)"
fi

musical_pause

# ============================================================================
# Stage 5: CEO/Contact Mining
# ============================================================================

log_stage "5/7" "Mining CEO and contact information"

if [[ -f "agent-ceo.service.js" ]]; then
  log_info "Launching CEO mining agent..."
  node agent-ceo.service.js > logs/ceo-agent.log 2>&1 &
  pids+=("$!")
  agent_names+=("ceo")
  log_success "CEO agent started (PID: $!)"
fi

musical_pause

# ============================================================================
# Stage 6: Outreach Email Drafting
# ============================================================================

log_stage "6/7" "Drafting personalized outreach emails"

if [[ -f "agent-draft.service.js" ]]; then
  log_info "Launching draft agent..."
  node agent-draft.service.js > logs/draft-agent.log 2>&1 &
  pids+=("$!")
  agent_names+=("draft")
  log_success "Draft agent started (PID: $!)"
fi

musical_pause

# ============================================================================
# Stage 7: Dashboard Deployment
# ============================================================================

log_stage "7/7" "Deploying results dashboard"

if [[ -f "agent-deploy.service.js" ]]; then
  log_info "Launching deploy agent..."
  node agent-deploy.service.js > logs/deploy-agent.log 2>&1 &
  pids+=("$!")
  agent_names+=("deploy")
  log_success "Deploy agent started (PID: $!)"
fi

musical_pause

# ============================================================================
# Wait for All Agents
# ============================================================================

echo ""
echo -e "${CYAN}Waiting for all agents to complete...${NC}"
echo ""

failed_agents=()

for i in "${!pids[@]}"; do
  pid="${pids[$i]}"
  name="${agent_names[$i]}"

  if wait "$pid"; then
    log_success "Agent '$name' completed successfully"
  else
    log_error "Agent '$name' failed (PID: $pid)"
    failed_agents+=("$name")
  fi
done

# ============================================================================
# Results Summary
# ============================================================================

END_TIME=$(date +%s)
DURATION=$((END_TIME - START_TIME))

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

if [[ ${#failed_agents[@]} -eq 0 ]]; then
  echo -e "${GREEN}"
  cat << 'EOF'
╔═══════════════════════════════════════════════════════════════╗
║   ✅ ALL AGENTS COMPLETED SUCCESSFULLY                        ║
╚═══════════════════════════════════════════════════════════════╝
EOF
  echo -e "${NC}"

  echo -e "${GREEN}🚀 Pipeline completed successfully!${NC}"
  echo ""
  echo -e "${BLUE}Duration:${NC} ${DURATION}s"
  echo -e "${BLUE}Agents:${NC} ${#agent_names[@]} launched"
  echo -e "${BLUE}Keyword:${NC} '$KEYWORD'"
  echo ""
  echo "Next steps:"
  echo "  1. Check logs in logs/ directory"
  echo "  2. View results in Redis/database"
  echo "  3. Review generated badges and emails"
  echo ""

  if [[ "$LUCY_MODE" == "true" ]]; then
    echo -e "${MAGENTA}🎵 LucyQ says: Great work! Your accessibility scan is complete.${NC}"
  fi

  exit 0
else
  echo -e "${RED}"
  cat << 'EOF'
╔═══════════════════════════════════════════════════════════════╗
║   ⚠️  SOME AGENTS FAILED                                      ║
╚═══════════════════════════════════════════════════════════════╝
EOF
  echo -e "${NC}"

  echo -e "${RED}❌ Pipeline completed with errors${NC}"
  echo ""
  echo -e "${BLUE}Duration:${NC} ${DURATION}s"
  echo -e "${BLUE}Failed agents:${NC} ${failed_agents[*]}"
  echo ""
  echo "Check these logs for details:"
  for agent in "${failed_agents[@]}"; do
    echo "  - logs/${agent}-agent.log"
  done
  echo ""

  exit 1
fi
