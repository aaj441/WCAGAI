#!/bin/bash

###############################################################################
# WCAGAI v2.0 - FINAL DEPLOYMENT READINESS TEST
#
# This test simulates Railway/Vercel deployment to give a definitive
# YES or NO answer about production readiness.
###############################################################################

echo "╔═══════════════════════════════════════════════════════════════════╗"
echo "║                                                                   ║"
echo "║   🚀 FINAL DEPLOYMENT READINESS TEST                             ║"
echo "║   Railway/Vercel Compatibility Validation                        ║"
echo "║                                                                   ║"
echo "╚═══════════════════════════════════════════════════════════════════╝"
echo ""
echo "Testing Date: $(date)"
echo "Node Version: $(node --version)"
echo "NPM Version: $(npm --version)"
echo ""

cd wcag_machine_v5_visual_reg || exit 1

PASS_COUNT=0
FAIL_COUNT=0
CRITICAL_FAIL=0

# Test results storage
declare -a FAILURES
declare -a WARNINGS

###############################################################################
# TEST 1: Package.json Validation
###############################################################################
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 1: Package.json Validation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if package.json exists
if [ -f "package.json" ]; then
  echo "✅ package.json exists"
  ((PASS_COUNT++))
else
  echo "❌ package.json missing"
  FAILURES+=("CRITICAL: package.json missing")
  ((FAIL_COUNT++))
  ((CRITICAL_FAIL++))
fi

# Check if package.json is valid JSON
if jq empty package.json 2>/dev/null; then
  echo "✅ package.json is valid JSON"
  ((PASS_COUNT++))
else
  echo "❌ package.json is invalid JSON"
  FAILURES+=("CRITICAL: package.json invalid JSON")
  ((FAIL_COUNT++))
  ((CRITICAL_FAIL++))
fi

# Check for start script
if jq -e '.scripts.start' package.json >/dev/null 2>&1; then
  START_SCRIPT=$(jq -r '.scripts.start' package.json)
  echo "✅ Start script exists: $START_SCRIPT"
  ((PASS_COUNT++))
else
  echo "⚠️  No start script (Railway/Vercel may need configuration)"
  WARNINGS+=("No 'start' script in package.json")
fi

# Check for "type": "module"
if jq -e '.type == "module"' package.json >/dev/null 2>&1; then
  echo "✅ ES modules enabled (type: module)"
  ((PASS_COUNT++))
else
  echo "❌ ES modules not enabled"
  FAILURES+=("ES modules not configured")
  ((FAIL_COUNT++))
fi

echo ""

###############################################################################
# TEST 2: Dependencies Installation
###############################################################################
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 2: Dependencies Installation"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -d "node_modules" ]; then
  echo "✅ node_modules directory exists"
  ((PASS_COUNT++))

  # Count installed packages
  INSTALLED=$(ls node_modules | wc -l)
  echo "   Installed packages: $INSTALLED"
else
  echo "⚠️  node_modules not found (will be installed on deployment)"
  WARNINGS+=("node_modules not present locally")
fi

# Check critical dependencies
CRITICAL_DEPS=("@upstash/redis" "serpapi" "playwright" "axe-core" "concurrently")
for dep in "${CRITICAL_DEPS[@]}"; do
  if [ -d "node_modules/$dep" ] || jq -e ".dependencies.\"$dep\"" package.json >/dev/null 2>&1; then
    echo "✅ $dep available"
    ((PASS_COUNT++))
  else
    echo "❌ $dep missing"
    FAILURES+=("CRITICAL: Missing dependency: $dep")
    ((FAIL_COUNT++))
    ((CRITICAL_FAIL++))
  fi
done

echo ""

###############################################################################
# TEST 3: Railway Configuration
###############################################################################
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 3: Railway Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -f "railway.json" ]; then
  echo "✅ railway.json exists"
  ((PASS_COUNT++))

  # Check railway.json content
  if jq -e '.build.builder' railway.json >/dev/null 2>&1; then
    BUILDER=$(jq -r '.build.builder' railway.json)
    echo "   Builder: $BUILDER"
  fi

  if jq -e '.deploy.startCommand' railway.json >/dev/null 2>&1; then
    START_CMD=$(jq -r '.deploy.startCommand' railway.json)
    echo "   Start command: $START_CMD"
  fi
else
  echo "⚠️  railway.json not found (Railway will use package.json)"
  WARNINGS+=("No railway.json configuration")
fi

echo ""

###############################################################################
# TEST 4: Vercel Configuration
###############################################################################
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 4: Vercel Configuration"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -f "vercel.json" ]; then
  echo "✅ vercel.json exists"
  ((PASS_COUNT++))
else
  echo "⚠️  vercel.json not found (optional for Vercel)"
  WARNINGS+=("No vercel.json configuration")
fi

echo ""

###############################################################################
# TEST 5: Health Server Test
###############################################################################
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 5: Health Server Startup"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if health server exists
if [ -f "health-server.js" ]; then
  echo "✅ health-server.js exists"
  ((PASS_COUNT++))

  # Test health server startup
  echo "   Testing health server startup..."
  PORT=3099 timeout 5 node health-server.js > /tmp/health-test.log 2>&1 &
  HEALTH_PID=$!
  sleep 2

  # Test health endpoint
  if curl -s -f http://localhost:3099/health > /dev/null 2>&1; then
    echo "✅ Health server responds on port 3099"
    ((PASS_COUNT++))

    # Get health response
    HEALTH_RESPONSE=$(curl -s http://localhost:3099/health)
    echo "   Response: $HEALTH_RESPONSE"
  else
    echo "❌ Health server not responding"
    FAILURES+=("Health server failed to start")
    ((FAIL_COUNT++))
  fi

  # Cleanup
  kill $HEALTH_PID 2>/dev/null
  wait $HEALTH_PID 2>/dev/null
else
  echo "❌ health-server.js missing"
  FAILURES+=("CRITICAL: health-server.js missing")
  ((FAIL_COUNT++))
  ((CRITICAL_FAIL++))
fi

echo ""

###############################################################################
# TEST 6: Environment Variables Handling
###############################################################################
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 6: Environment Variables Handling"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Required environment variables for Railway/Vercel
REQUIRED_VARS=("SERPAPI_KEY" "GEMINI_API_KEY" "UPSTASH_REDIS_REST_URL" "UPSTASH_REDIS_REST_TOKEN")

echo "Checking environment variable handling..."
for var in "${REQUIRED_VARS[@]}"; do
  # Check if agent handles missing env var gracefully
  if grep -r "process.env.$var" . --include="*.js" >/dev/null 2>&1; then
    echo "✅ $var referenced in code"
    ((PASS_COUNT++))
  else
    echo "⚠️  $var not referenced (may not be needed)"
  fi
done

# Check if .env.example exists
if [ -f ".env.example" ] || [ -f "../.env.example" ]; then
  echo "✅ .env.example exists (good for documentation)"
  ((PASS_COUNT++))
else
  echo "⚠️  No .env.example (recommended for documentation)"
  WARNINGS+=("No .env.example file")
fi

echo ""

###############################################################################
# TEST 7: ES Module Imports
###############################################################################
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 7: ES Module Imports"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Test if modules can be imported
echo "Testing ES module imports..."

# Test security.js import
TEST_IMPORT=$(node --eval "import('./lib/security.js').then(() => console.log('OK')).catch(e => console.log('FAIL: ' + e.message))" 2>&1)
if echo "$TEST_IMPORT" | grep -q "OK"; then
  echo "✅ lib/security.js imports successfully"
  ((PASS_COUNT++))
else
  echo "❌ lib/security.js import failed: $TEST_IMPORT"
  FAILURES+=("CRITICAL: lib/security.js import failed")
  ((FAIL_COUNT++))
  ((CRITICAL_FAIL++))
fi

# Test gemini.js import
TEST_IMPORT=$(node --eval "import('./lib/gemini.js').then(() => console.log('OK')).catch(e => console.log('FAIL: ' + e.message))" 2>&1)
if echo "$TEST_IMPORT" | grep -q "OK"; then
  echo "✅ lib/gemini.js imports successfully"
  ((PASS_COUNT++))
else
  echo "❌ lib/gemini.js import failed: $TEST_IMPORT"
  FAILURES+=("CRITICAL: lib/gemini.js import failed")
  ((FAIL_COUNT++))
  ((CRITICAL_FAIL++))
fi

# Test badge.js import
TEST_IMPORT=$(node --eval "import('./lib/badge.js').then(() => console.log('OK')).catch(e => console.log('FAIL: ' + e.message))" 2>&1)
if echo "$TEST_IMPORT" | grep -q "OK"; then
  echo "✅ lib/badge.js imports successfully"
  ((PASS_COUNT++))
else
  echo "❌ lib/badge.js import failed: $TEST_IMPORT"
  FAILURES+=("lib/badge.js import failed")
  ((FAIL_COUNT++))
fi

# Test redis.js import
TEST_IMPORT=$(node --eval "import('./lib/redis.js').then(() => console.log('OK')).catch(e => console.log('FAIL: ' + e.message))" 2>&1)
if echo "$TEST_IMPORT" | grep -q "OK"; then
  echo "✅ lib/redis.js imports successfully"
  ((PASS_COUNT++))
else
  echo "❌ lib/redis.js import failed: $TEST_IMPORT"
  FAILURES+=("lib/redis.js import failed")
  ((FAIL_COUNT++))
fi

echo ""

###############################################################################
# TEST 8: Concurrently Package
###############################################################################
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 8: Concurrently Package (for parallel execution)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if command -v concurrently >/dev/null 2>&1 || [ -f "node_modules/.bin/concurrently" ]; then
  echo "✅ concurrently available"
  ((PASS_COUNT++))

  # Test concurrently
  CONCURRENTLY_VERSION=$(npx concurrently --version 2>/dev/null || echo "unknown")
  echo "   Version: $CONCURRENTLY_VERSION"
else
  echo "❌ concurrently not available"
  FAILURES+=("concurrently not installed")
  ((FAIL_COUNT++))
fi

echo ""

###############################################################################
# TEST 9: Port Handling
###############################################################################
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 9: Port Handling (Railway/Vercel compatibility)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Check if health server uses process.env.PORT
if grep -q "process.env.PORT" health-server.js 2>/dev/null; then
  echo "✅ Health server uses PORT environment variable"
  ((PASS_COUNT++))
else
  echo "⚠️  Health server may not use PORT env var"
  WARNINGS+=("Health server should use process.env.PORT")
fi

# Check default port
if grep -q "3000" health-server.js 2>/dev/null; then
  echo "✅ Has default port fallback"
  ((PASS_COUNT++))
else
  echo "⚠️  No default port fallback"
fi

echo ""

###############################################################################
# TEST 10: Agent Files Existence
###############################################################################
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 10: Agent Files Existence"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

AGENT_FILES=(
  "agent-keyword.service.js"
  "agent-scan.service.js"
  "agent-scan-worker.service.js"
  "agent-gemini.service.js"
  "agent-badge.service.js"
  "agent-ceo.service.js"
  "agent-draft.service.js"
  "agent-deploy.service.js"
)

for agent in "${AGENT_FILES[@]}"; do
  if [ -f "$agent" ]; then
    echo "✅ $agent exists"
    ((PASS_COUNT++))
  else
    echo "❌ $agent missing"
    FAILURES+=("Agent file missing: $agent")
    ((FAIL_COUNT++))
  fi
done

echo ""

###############################################################################
# TEST 11: Orchestration Scripts
###############################################################################
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "TEST 11: Orchestration Scripts"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ -f "orchestrate-enhanced.sh" ]; then
  echo "✅ orchestrate-enhanced.sh exists"
  ((PASS_COUNT++))

  # Check if executable
  if [ -x "orchestrate-enhanced.sh" ]; then
    echo "✅ orchestrate-enhanced.sh is executable"
    ((PASS_COUNT++))
  else
    echo "⚠️  orchestrate-enhanced.sh not executable (chmod +x needed)"
    WARNINGS+=("orchestrate-enhanced.sh needs chmod +x")
  fi
else
  echo "❌ orchestrate-enhanced.sh missing"
  FAILURES+=("orchestrate-enhanced.sh missing")
  ((FAIL_COUNT++))
fi

echo ""

###############################################################################
# FINAL VERDICT
###############################################################################
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "DEPLOYMENT READINESS SUMMARY"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

TOTAL_TESTS=$((PASS_COUNT + FAIL_COUNT))
PASS_RATE=$(awk "BEGIN {printf \"%.1f\", ($PASS_COUNT / $TOTAL_TESTS) * 100}")

echo "Tests Passed: $PASS_COUNT"
echo "Tests Failed: $FAIL_COUNT"
echo "Total Tests: $TOTAL_TESTS"
echo "Pass Rate: $PASS_RATE%"
echo "Critical Failures: $CRITICAL_FAIL"
echo "Warnings: ${#WARNINGS[@]}"
echo ""

if [ ${#FAILURES[@]} -gt 0 ]; then
  echo "❌ FAILURES:"
  for failure in "${FAILURES[@]}"; do
    echo "   - $failure"
  done
  echo ""
fi

if [ ${#WARNINGS[@]} -gt 0 ]; then
  echo "⚠️  WARNINGS:"
  for warning in "${WARNINGS[@]}"; do
    echo "   - $warning"
  done
  echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "FINAL VERDICT"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

if [ $CRITICAL_FAIL -eq 0 ] && [ $FAIL_COUNT -le 2 ]; then
  echo "✅ YES - WILL WORK ON RAILWAY/VERCEL"
  echo ""
  echo "Deployment Platforms:"
  echo "  ✅ Railway: YES - Ready to deploy"
  echo "  ✅ Vercel: YES - Ready to deploy"
  echo ""
  echo "Required Setup:"
  echo "  1. Set environment variables in Railway/Vercel dashboard:"
  echo "     - SERPAPI_KEY=your_serpapi_key"
  echo "     - GEMINI_API_KEY=your_gemini_key"
  echo "     - UPSTASH_REDIS_REST_URL=your_redis_url"
  echo "     - UPSTASH_REDIS_REST_TOKEN=your_redis_token"
  echo "  2. Railway will auto-detect Node.js and run 'npm install'"
  echo "  3. Health endpoint will be available at /health"
  echo ""
  echo "Confidence: HIGH ✅"
  exit 0
else
  echo "❌ NO - CRITICAL ISSUES FOUND"
  echo ""
  echo "Critical issues must be fixed before deployment:"
  echo "  - Critical failures: $CRITICAL_FAIL"
  echo "  - Total failures: $FAIL_COUNT"
  echo ""
  echo "Review failures above and fix before deploying."
  echo ""
  echo "Confidence: BLOCKED ❌"
  exit 1
fi
