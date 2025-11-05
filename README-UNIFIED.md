# WCAGAI Complete Stack v2.0

**Unified Accessibility Compliance Platform**

Combining **WCAGAI-Gemini 2.0** (AI-powered accessibility guidance) + **AAG Badge API** (compliance verification) + **WCAG Machine v5.0** (agentic automation pipeline)

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)
[![Node Version](https://img.shields.io/badge/node-%3E%3D20.0.0-brightgreen)](package.json)
[![WCAG 2.1 AA](https://img.shields.io/badge/WCAG-2.1%20AA-blue)](https://www.w3.org/WAI/WCAG21/quickref/)

---

## 🎯 What is WCAGAI Complete Stack?

A **production-ready, end-to-end accessibility compliance platform** that:

1. **Discovers** websites with accessibility issues (SERP search)
2. **Scans** them with automated tools (Axe-core + Playwright)
3. **Analyzes** violations with AI (Gemini 2.0 + 21 WCAGAI rules)
4. **Generates** compliance badges (AAG Levels A/AA/AAA)
5. **Reaches out** to site owners (HubSpot CRM + email drafts)
6. **Monitors** progress with visual regression testing

All powered by a **multi-tenant, scalable, security-hardened** architecture ready for Railway deployment.

---

## ✨ Key Features

### 🤖 AI-Powered Analysis
- **Gemini 2.0 Integration** with WCAGAI system instruction (21 rules)
- 6 dimensions: Perceivable, Operable, Understandable, Robust, Ethical, Secure
- Context-aware accessibility guidance
- Automated remediation recommendations

### 🏅 AAG Badge API
- Generate compliance badges (A, AA, AAA levels)
- Barrier feedback webhooks
- Encrypted user preferences
- 90-day badge validity with auto-renewal

### 🛡️ Security Gates
- **Prompt injection detection** (regex + pattern matching)
- **URL validation** (protocol, private IP, XSS prevention)
- **Rate limiting** (per-tenant, configurable)
- **Audit trail logging** (all security events)

### 🔄 Agentic Pipeline
- **5 core agents:** keyword, scan, CEO, draft, deploy
- **3 new agents:** gemini, security, enhanced badge
- **BullMQ job queues** with multi-tenant namespacing
- **Redis + PostgreSQL** persistence
- **Visual regression testing** (Playwright + pixelmatch)

### 🚀 Production-Ready
- **Railway deployment** config included
- **6 test probes** for instant validation
- **Load testing** with Artillery (100 concurrent users)
- **Health checks** at `/health`, `/health/gemini`
- **Comprehensive logging** (Winston)

---

## 📦 Quick Start

### 1. Clone & Install

```bash
git clone https://github.com/aaj441/WCAGAI.git
cd WCAGAI
npm install
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your API keys:
# - GEMINI_API_KEY (required)
# - REDIS or UPSTASH config (required)
# - DATABASE_URL (optional but recommended)
# - SERPAPI_KEY, HUBSPOT_API_KEY (for full pipeline)
```

### 3. Run Locally

```bash
npm start
# Server starts at http://localhost:3000
```

### 4. Test Probes

```bash
npm run test:probes
# All 6 probes should PASS ✓
```

### 5. Deploy to Railway

```bash
railway login
railway up
# Follow prompts to deploy
```

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Express API Gateway                       │
│                      (server.js)                             │
│  Routes:                                                     │
│   • /health              • /api/gemini/chat                 │
│   • /api/aag/badge       • /api/aag/feedback                │
│   • /api/scan/url        • /api/test/probes                 │
└─────────────────────────────────────────────────────────────┘
                            ⬇️
┌─────────────────────────────────────────────────────────────┐
│             Security Layer (Middleware)                      │
│  • Prompt injection detection • URL validation              │
│  • Rate limiting • Audit logging                            │
└─────────────────────────────────────────────────────────────┘
                            ⬇️
┌─────────────────────────────────────────────────────────────┐
│           Agentic Orchestration (8 Agents)                  │
│  keyword → scan → gemini → security → badge → ceo           │
│                   → draft → deploy                           │
└─────────────────────────────────────────────────────────────┘
                            ⬇️
┌─────────────────────────────────────────────────────────────┐
│          Data Layer (Redis/BullMQ + PostgreSQL)             │
└─────────────────────────────────────────────────────────────┘
```

---

## 📚 API Endpoints

### Health Checks

```bash
GET /health
# Returns: { status: 'ok', version: '2.0.0', features: {...} }

GET /health/gemini
# Returns: { status: 'ok', model: 'gemini-2.0-flash-exp' }
```

### Gemini Chat (WCAGAI-Powered)

```bash
POST /api/gemini/chat
Content-Type: application/json

{
  "message": "How do I make my dropdown menu keyboard accessible?",
  "context": { "framework": "React", "component": "Select" }
}

# Returns:
{
  "response": "To make a React dropdown keyboard accessible...",
  "model": "gemini-2.0-flash-exp",
  "system_instruction": "WCAGAI (21 rules)",
  "security_gate": "PASS"
}
```

### AAG Badge Generation

```bash
POST /api/aag/badge
Content-Type: application/json

{
  "url": "https://example.com",
  "violations": [
    { "impact": "serious", "description": "Missing alt text" },
    { "impact": "moderate", "description": "Color contrast issue" }
  ]
}

# Returns:
{
  "badge_id": "abc-123-def",
  "compliance_level": "A",
  "badge_url": "https://api.wcagai.org/badge/abc-123-def",
  "total_violations": 2,
  "generated_at": "2025-11-05T12:00:00Z",
  "expires_at": "2026-02-03T12:00:00Z"
}
```

### Barrier Feedback

```bash
POST /api/aag/feedback
Content-Type: application/json

{
  "badge_id": "abc-123-def",
  "barrier_type": "visual",
  "description": "Color contrast too low on CTA button",
  "user_context": {
    "assistive_tech": "screen_magnifier",
    "vision_type": "low_vision"
  }
}

# Returns:
{
  "feedback_id": "xyz-789",
  "status": "received",
  "message": "Thank you for reporting this accessibility barrier"
}
```

### Trigger Scan

```bash
POST /api/scan/url
Content-Type: application/json

{
  "url": "https://example.com"
}

# Returns:
{
  "scan_id": "scan-456",
  "status": "initiated",
  "message": "Check status with GET /api/scan/status/scan-456"
}
```

---

## 🧪 Testing

### Run All Test Probes

```bash
npm run test:probes
```

**Expected output:**
```
PROBE 1/6: Gemini System Instruction Active
✓ PASS: WCAGAI rules embedded correctly

PROBE 2/6: AAG Badge API - Valid Request
✓ PASS: Badge generated successfully (Level: AA)

PROBE 3/6: Security Gate - Prompt Injection Detection
✓ PASS: 4/4 injection attempts blocked

PROBE 4/6: Security Gate - URL Validation
✓ PASS: 4/4 malicious URLs blocked

PROBE 5/6: Multi-Tenant Isolation
✓ PASS: Tenant isolation working

PROBE 6/6: End-to-End Pipeline
✓ PASS: Pipeline completed in 4.23s

✅ ALL PROBES PASSED
```

### Load Testing

```bash
npm run load-test
```

Simulates 100 concurrent users across all endpoints.

### Visual Regression

```bash
cd wcag_machine_v5_visual_reg
npm run capture
npm run test:visual
```

---

## 🚀 Deployment

### Option 1: Railway (Recommended)

```bash
# 1. Install Railway CLI
npm install -g @railway/cli

# 2. Login
railway login

# 3. Initialize project
railway init

# 4. Deploy
railway up
```

Railway will automatically:
- Detect `railway.json` configuration
- Install dependencies
- Run health checks
- Assign a public URL

### Option 2: Manual Deployment

```bash
bash deploy.sh production
```

This runs a 6-stage deployment process:
1. Pre-flight checks
2. Dependency installation
3. Environment validation
4. Database migration
5. Health check
6. Smoke tests

---

## 📖 Documentation

### Core Docs
- **[INTEGRATION-PLAN.md](INTEGRATION-PLAN.md)** - Architecture & merge strategy
- **[WCAGAI-SYSTEM-INSTRUCTION.md](WCAGAI-SYSTEM-INSTRUCTION.md)** - Gemini 2.0 system instruction
- **[DEPLOYMENT-GUIDE.md](DEPLOYMENT-GUIDE.md)** - Step-by-step deployment
- **[wcag_machine_v5_visual_reg/README.md](wcag_machine_v5_visual_reg/README.md)** - Agentic pipeline docs

### API Reference
- Gemini chat endpoint
- AAG Badge API
- Security gates
- Agent orchestration

---

## 🔧 Configuration

### Required Environment Variables

```bash
# Server
PORT=3000
NODE_ENV=production

# Gemini API (REQUIRED)
GEMINI_API_KEY=your_key_here

# Redis (REQUIRED - choose one)
# Option A: Standard Redis
REDIS_HOST=localhost
REDIS_PORT=6379

# Option B: Upstash
UPSTASH_REDIS_REST_URL=https://your-redis.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token
```

### Optional (Recommended)

```bash
# Database
DATABASE_URL=postgresql://user:pass@host:5432/wcagai

# External APIs
SERPAPI_KEY=your_key
HUBSPOT_API_KEY=your_key

# Multi-tenant
TENANT_ID=your_tenant
USE_BULLMQ=true
```

See [.env.example](.env.example) for full list.

---

## 🛠️ Development

### Project Structure

```
WCAGAI/
├── server.js                      # Main API gateway
├── package.json                   # Root dependencies
├── .env.example                   # Environment template
├── railway.json                   # Railway config
├── deploy.sh                      # Deployment script
├── load-test.yml                  # Artillery config
├── test-probes.js                 # 6 instant tests
│
├── wcag_machine_v5_visual_reg/    # Agentic pipeline
│   ├── agent-keyword.service.js
│   ├── agent-scan.service.js
│   ├── agent-gemini.service.js    # NEW: Gemini analysis
│   ├── agent-badge.service.js
│   ├── agent-ceo.service.js
│   ├── agent-draft.service.js
│   ├── agent-deploy.service.js
│   ├── orchestrate.sh             # Agent orchestrator
│   │
│   └── lib/
│       ├── gemini.js              # NEW: Gemini wrapper
│       ├── security.js            # NEW: Security gates
│       ├── badge.js               # ENHANCED: AAG badges
│       ├── scan.js
│       ├── redis.js
│       ├── db.js
│       └── ...
│
└── logs/                          # Winston logs
```

### Adding a New Agent

1. Create `agent-myagent.service.js` in `wcag_machine_v5_visual_reg/`
2. Follow pattern: input → process → output (JSON)
3. Add to `orchestrate.sh`
4. Test with `node agent-myagent.service.js <input>`

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📊 Metrics

| Metric | Value |
|--------|-------|
| WCAGAI Rules | 21 |
| Deployment Phases | 6 |
| Test Probes | 6 |
| API Endpoints | 8 |
| Agents | 8 |
| Backend Lines of Code | 441 (server.js) |
| Test Coverage | 6 instant probes + load test |
| Security Gates | 3 (injection, URL, rate limit) |
| AAG Compliance Levels | 4 (AAA, AA, A, Fail) |

---

## 📝 License

MIT License - see [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- **WCAG 2.1/2.2** by W3C
- **Gemini 2.0** by Google
- **Axe-core** by Deque Systems
- **Railway** for deployment platform
- **Upstash** for serverless Redis

---

## 📞 Support

- **Issues:** https://github.com/aaj441/WCAGAI/issues
- **Discussions:** https://github.com/aaj441/WCAGAI/discussions
- **Email:** (Add your contact)

---

**Built with ❤️ for accessibility**

**Version:** 2.0.0
**Last Updated:** November 5, 2025
**Author:** Aaron J. (aaj441)
