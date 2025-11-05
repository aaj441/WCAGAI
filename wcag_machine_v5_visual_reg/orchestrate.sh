#!/usr/bin/env bash

# Orchestration script for running all agents in parallel.
# The script accepts a single argument – the search keyword.
# Each agent is spawned in the background and its process ID is recorded.
# The script waits for all agents to finish and reports success when every agent exits cleanly.

# Change to script's directory (critical for Railway deployment)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR" || exit 1

# Use provided keyword or default to "accessibility" for Railway/cloud deployments
KEYWORD=${1:-accessibility}
echo "🔍 Running WCAGAI pipeline with keyword: $KEYWORD"
echo "📂 Working directory: $SCRIPT_DIR"
pids=()

# Launch keyword→URLs agent
node agent-keyword.service.js "$KEYWORD" &
pids+=("$!")

# Launch scan agent or queue worker depending on USE_BULLMQ
if [[ "$USE_BULLMQ" == "true" ]]; then
  node agent-scan-worker.service.js &
  pids+=("$!")
else
  node agent-scan.service.js &
  pids+=("$!")
fi

# Launch CEO mining agent (uses SERP results to mine CEO contact)
node agent-ceo.service.js &
pids+=("$!")

# Launch draft agent (generates outreach email based on scan report)
node agent-draft.service.js &
pids+=("$!")

# Launch deploy/health agent (deploys dashboard and checks health)
node agent-deploy.service.js &
pids+=("$!")

# Wait for all agents to complete.  If any agent exits with a non‑zero code the orchestration fails.
for pid in "${pids[@]}"; do
  if ! wait "$pid"; then
    echo "❌ An agent exited with an error. See logs above."
    exit 1
  fi
done

echo "🚀 All agents passed – pipeline live"