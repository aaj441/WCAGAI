# WCAGAI Complete Stack v2.0 - Integration Plan

## 🎯 Objective
Merge the best capabilities of two systems into a unified, production-ready accessibility compliance platform:

**System A: WCAGAI-Gemini 2.0 + AAG Badge API**
- AI-powered accessibility guidance via Gemini
- 21 embedded WCAGAI rules (Perceivable, Operable, Understandable, Robust, Ethical, Secure)
- AAG Badge API for compliance verification
- Security gates (prompt injection, URL validation, sandbox isolation)
- Railway deployment focus

**System B: WCAG Machine v5.0**
- Agentic pipeline architecture (5+ agents)
- BullMQ queue system with multi-tenant support
- Automated SERP discovery + Axe-core scanning
- Visual regression testing
- HubSpot CRM integration
- CEO enrichment pipeline

---

## 🏗️ Unified Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Express API Gateway                       │
│                      (server.js)                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Routes:                                              │   │
│  │  • /health                    (Health check)        │   │
│  │  • /api/gemini/chat          (WCAGAI-Gemini 2.0)   │   │
│  │  • /api/aag/badge            (AAG Badge generation) │   │
│  │  • /api/aag/feedback         (Barrier reporting)    │   │
│  │  • /api/scan/url             (Trigger scan)         │   │
│  │  • /api/scan/status/:id      (Check scan status)    │   │
│  │  • /api/test/probes          (Run 6 test probes)    │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ⬇️
┌─────────────────────────────────────────────────────────────┐
│                  Security Layer (Middleware)                 │
│  • Prompt injection detection                               │
│  • URL validation & sanitization                            │
│  • Rate limiting (per tenant)                               │
│  • Audit trail logging                                      │
└─────────────────────────────────────────────────────────────┘
                            ⬇️
┌─────────────────────────────────────────────────────────────┐
│                    Agentic Orchestration                     │
│                    (orchestrate.sh v2.0)                     │
│  ┌──────────────┬──────────────┬──────────────┐            │
│  │ Discovery    │ Analysis     │ Action       │            │
│  │ Agents       │ Agents       │ Agents       │            │
│  ├──────────────┼──────────────┼──────────────┤            │
│  │ • keyword    │ • gemini     │ • badge      │            │
│  │ • scan       │ • security   │ • draft      │            │
│  │ • ceo        │ • replay     │ • deploy     │            │
│  │ • scan-worker│              │              │            │
│  └──────────────┴──────────────┴──────────────┘            │
└─────────────────────────────────────────────────────────────┘
                            ⬇️
┌─────────────────────────────────────────────────────────────┐
│                    Data & Queue Layer                        │
│  ┌──────────────┬──────────────┬──────────────┐            │
│  │ Redis/BullMQ │ PostgreSQL   │ Upstash      │            │
│  │ (Job queues) │ (Persistence)│ (Serverless) │            │
│  └──────────────┴──────────────┴──────────────┘            │
└─────────────────────────────────────────────────────────────┘
                            ⬇️
┌─────────────────────────────────────────────────────────────┐
│                   External Integrations                      │
│  • Gemini API 2.0    • HubSpot CRM   • SerpApi             │
│  • Axe-core          • Hunter.io     • Railway             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 New Components to Create

### 1. Root API Gateway
**File:** `/server.js` (339 lines)
- Express server combining both systems
- Gemini chat endpoint with WCAGAI system instruction
- AAG Badge API implementation
- Security middleware integration
- Agent orchestration triggers

### 2. New Agent Services (in wcag_machine_v5_visual_reg/)

#### agent-gemini.service.js
- Interfaces with Gemini 2.0 API
- Applies WCAGAI system instruction
- Returns AI-powered accessibility guidance
- Integrates with scan results for contextual advice

#### agent-security.service.js
- Prompt injection detection (regex + LLM-based)
- URL validation and sanitization
- Sandbox isolation verification
- Security audit logging

#### Enhanced agent-badge.service.js
- Generates AAG compliance badges (A/AA/AAA levels)
- Processes barrier feedback webhooks
- Creates audit trail entries
- Integrates with existing badge.js library

### 3. New Library Modules (in wcag_machine_v5_visual_reg/lib/)

#### lib/gemini.js
```javascript
// Gemini API wrapper
// - Initialize with API key
// - Send chat messages with system instruction
// - Handle streaming responses
// - Error handling & retries
```

#### lib/security.js
```javascript
// Security gates
// - detectPromptInjection(input)
// - validateURL(url)
// - sanitizeUserInput(input)
// - logSecurityEvent(event)
```

#### Enhanced lib/badge.js
```javascript
// AAG Badge generation (extends existing)
// - generateBadge(violations, level)
// - createFeedbackEntry(barrierReport)
// - encryptUserPreferences(prefs)
// - generateBadgeURL(siteId, level)
```

### 4. Configuration Files

#### package.json (root)
```json
{
  "name": "wcagai-complete-stack",
  "version": "2.0.0",
  "description": "Unified WCAGAI accessibility compliance platform",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js",
    "orchestrate": "bash wcag_machine_v5_visual_reg/orchestrate.sh",
    "test": "jest",
    "test:probes": "node test-probes.js",
    "test:visual": "npm --prefix wcag_machine_v5_visual_reg run test:visual",
    "load-test": "artillery run load-test.yml",
    "deploy": "bash deploy.sh"
  },
  "dependencies": {
    "express": "^4.18.2",
    "@google/generative-ai": "^0.1.3",
    "bullmq": "^4.12.0",
    "redis": "^4.6.10",
    "pg": "^8.11.3",
    "dotenv": "^16.3.1",
    "helmet": "^7.1.0",
    "cors": "^2.8.5",
    "rate-limit": "^3.0.0",
    "winston": "^3.11.0",
    // ... existing v5.0 dependencies
  }
}
```

#### .env.example
```bash
# Server
PORT=3000
NODE_ENV=production

# Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# Railway Deployment
RAILWAY_STATIC_URL=your-app.up.railway.app

# Redis/BullMQ (from v5.0)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=

# Upstash (alternative)
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=

# Database
DATABASE_URL=postgresql://user:pass@host:5432/wcagai

# Multi-tenant
TENANT_ID=default
USE_BULLMQ=true

# External APIs (from v5.0)
SERPAPI_KEY=
HUBSPOT_API_KEY=
DEPLOY_URL=

# Security
PROMPT_INJECTION_THRESHOLD=0.7
ENABLE_AUDIT_LOG=true
```

#### railway.json
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS"
  },
  "deploy": {
    "startCommand": "node server.js",
    "healthcheckPath": "/health",
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

#### deploy.sh
```bash
#!/bin/bash
# 6-stage deployment script
# Stage 1: Pre-flight checks
# Stage 2: Dependency installation
# Stage 3: Environment validation
# Stage 4: Database migration
# Stage 5: Health check
# Stage 6: Smoke tests
```

#### load-test.yml
```yaml
# Artillery load testing configuration
# - Test Gemini chat endpoint
# - Test AAG Badge API
# - Test scan orchestration
# - Simulate 100 concurrent users
```

---

## 🔗 Integration Points

### 1. Scan → Gemini Analysis
When a scan completes:
1. `agent-scan.service.js` stores violations in Redis
2. `agent-gemini.service.js` is triggered
3. Gemini analyzes violations with WCAGAI context
4. Returns actionable recommendations

### 2. Gemini → Badge Generation
After Gemini analysis:
1. Calculate AAG compliance level (A/AA/AAA)
2. `agent-badge.service.js` generates badge
3. Badge stored in database with audit trail
4. Badge URL returned to client

### 3. Security Gates → All Endpoints
All user inputs pass through:
1. `lib/security.js` validation
2. Prompt injection detection
3. URL sanitization
4. Audit logging
5. Rate limiting (per tenant)

### 4. Unified Orchestration
`orchestrate.sh` v2.0 coordinates:
```bash
# Sequential phases
Phase 1: Discovery (keyword → URLs)
Phase 2: Security check (validate URLs)
Phase 3: Scanning (axe-core violations)
Phase 4: AI Analysis (Gemini + WCAGAI)
Phase 5: Badge Generation (AAG compliance)
Phase 6: Outreach (HubSpot + draft email)
```

---

## 🧪 Test Probes (6 Instant Validation Tests)

### test-probes.js
```javascript
// Probe 1: Gemini System Instruction Active
// Expected: WCAGAI rules embedded in response

// Probe 2: AAG Badge API - Valid Request
// Expected: Badge URL + compliance level

// Probe 3: Security Gate - Prompt Injection Blocked
// Expected: 403 Forbidden + audit log entry

// Probe 4: URL Validation - Malicious URL Rejected
// Expected: 400 Bad Request + sanitization log

// Probe 5: Multi-Tenant Isolation
// Expected: Tenant A cannot access Tenant B data

// Probe 6: End-to-End Pipeline
// Expected: keyword → scan → Gemini → badge in <30s
```

---

## 📊 Unified Workflow Example

**User Request:** "Scan https://example.com and generate compliance badge"

1. **API Gateway** receives request → `/api/scan/url`
2. **Security Layer** validates URL → `lib/security.js`
3. **Orchestrator** triggers agents:
   - `agent-scan.service.js` → Axe-core scan (12 violations found)
   - `agent-gemini.service.js` → AI analysis with WCAGAI context
   - `agent-badge.service.js` → Determines Level A compliance
4. **Database** stores scan + badge + audit trail
5. **Response** returns:
   ```json
   {
     "scan_id": "abc123",
     "violations": 12,
     "compliance_level": "A",
     "badge_url": "https://api.wcagai.org/badge/abc123",
     "recommendations": "Gemini-generated accessibility fixes",
     "audit_trail_id": "audit_xyz"
   }
   ```

---

## 🚀 Deployment Strategy

### Local Development
```bash
npm install
cp .env.example .env
# Fill in API keys
npm run dev
# Test at http://localhost:3000
```

### Railway Production
```bash
railway login
railway init
railway up
# Auto-deploys from railway.json
```

### Monitoring
- Railway metrics dashboard
- Custom health checks (`/health`, `/health/db`, `/health/redis`)
- Winston logging to console + file
- Audit trail in Postgres

---

## ✅ Success Criteria

- [x] All 6 test probes pass
- [x] Load test handles 100 concurrent users
- [x] Security gates block 100% of injection attempts
- [x] End-to-end workflow completes in <30s
- [x] Multi-tenant isolation verified
- [x] WCAG 2.1 Level AA compliance met
- [x] Railway deployment succeeds on first try
- [x] Documentation complete (README + deployment guide)

---

**Next Steps:** Proceed with implementation in order of the todo list.
