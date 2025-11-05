# 🚂 WCAGAI Railway Deployment Guide

**Version:** 2.0.0
**Date:** 2025-11-05
**Status:** Production Ready with Resource Optimization

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Resource Optimization](#resource-optimization)
3. [Quick Start](#quick-start)
4. [Environment Variables](#environment-variables)
5. [Deployment Methods](#deployment-methods)
6. [Configuration Files](#configuration-files)
7. [Monitoring & Debugging](#monitoring--debugging)
8. [Troubleshooting](#troubleshooting)
9. [Performance Tuning](#performance-tuning)

---

## 🎯 Overview

This deployment setup is **optimized for Railway's infrastructure** with:

- **Memory Management:** 400MB Node.js heap limit (fits Railway's 512MB-1GB memory)
- **Concurrency Control:** MAX_CONCURRENT=2 agents (prevents resource exhaustion)
- **Health Checks:** 600s timeout (allows complex agent startup)
- **Graceful Shutdown:** SIGTERM/SIGINT handlers for clean restarts
- **Memory Monitoring:** Real-time memory usage tracking
- **Automated Deployment:** Pre-deployment validation and safety checks

---

## 🚀 Resource Optimization

### Railway Free Tier Limits
- **Memory:** 512MB (Starter Plan: 1GB-8GB)
- **CPU:** Shared vCPU
- **Build Time:** 10 minutes max
- **Deploy Time:** Health check timeout 600s

### Our Optimizations

#### 1. Node.js Memory Limit
```bash
NODE_OPTIONS="--max-old-space-size=400"
```
- Leaves 112MB for OS, Playwright, and other processes
- Prevents OOM (Out Of Memory) kills

#### 2. Agent Concurrency
```bash
MAX_CONCURRENT=2
```
- Limits parallel agents to 2 (vs. 8 default)
- Reduces memory footprint by ~60%
- Slower execution but stable

#### 3. Playwright Optimization
```bash
PLAYWRIGHT_BROWSERS_PATH=/tmp/playwright
```
- Uses Railway's ephemeral storage
- Automatic cleanup on restart

---

## 🏁 Quick Start

### Prerequisites
1. Railway account (free tier works)
2. Railway CLI installed:
   ```bash
   npm install -g @railway/cli
   # or
   curl -fsSL https://railway.app/install.sh | sh
   ```

### One-Command Deployment
```bash
# 1. Login to Railway
railway login

# 2. Create or link project
railway init  # new project
# or
railway link  # existing project

# 3. Set environment variables
railway variables set GEMINI_API_KEY="your_gemini_api_key"
railway variables set SERPAPI_KEY="your_serpapi_key"
railway variables set NODE_ENV="production"

# 4. Deploy
npm run deploy:railway
```

---

## 🔐 Environment Variables

### Required Variables

| Variable | Description | Example |
|----------|-------------|---------|
| `GEMINI_API_KEY` | Google Gemini API key | `AIzaSyC...` |
| `SERPAPI_KEY` | SerpAPI key for Google searches | `abc123...` |
| `NODE_ENV` | Environment (set to `production`) | `production` |

### Optional Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | HTTP port (Railway sets automatically) | `3000` |
| `MAX_CONCURRENT` | Max concurrent agents | `2` |
| `TENANT_ID` | Multi-tenant identifier | `default` |
| `LUCY_MODE` | Enable Lucy persona | `false` |
| `USE_BULLMQ` | Enable BullMQ queues | `false` |
| `LOG_LEVEL` | Logging level | `info` |

### Setting Variables in Railway

**Via CLI:**
```bash
railway variables set GEMINI_API_KEY="your_key_here"
railway variables set SERPAPI_KEY="your_key_here"
railway variables set NODE_ENV="production"
railway variables set MAX_CONCURRENT="2"
```

**Via Dashboard:**
1. Go to your Railway project
2. Click on your service
3. Navigate to "Variables" tab
4. Add variables manually

---

## 🚀 Deployment Methods

### Method 1: Automated Script (Recommended)
```bash
npm run deploy:railway
```

**Features:**
- ✅ Pre-deployment validation
- ✅ Environment variable checks
- ✅ Dependency installation
- ✅ Build validation
- ✅ Confirmation prompt
- ✅ Health check after deployment
- ✅ Deployment URL display

### Method 2: Railway CLI
```bash
railway up
```

**Simple deployment without validation checks.**

### Method 3: GitHub Integration
1. Connect Railway to your GitHub repository
2. Enable automatic deployments
3. Push to main branch → auto-deploys

**Railway Dashboard → Connect Repo → Auto-Deploy**

---

## ⚙️ Configuration Files

### 1. railway.json
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm ci"
  },
  "deploy": {
    "startCommand": "npm start",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 600,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10,
    "sleepApplication": false,
    "numReplicas": 1
  },
  "regions": ["us-west1"]
}
```

**Key Settings:**
- `healthcheckTimeout: 600` - 10 minutes for agent startup
- `restartPolicyMaxRetries: 10` - Retry on transient failures
- `sleepApplication: false` - Keep container running
- `numReplicas: 1` - Single instance (free tier)

### 2. nixpacks.toml
```toml
[phases.setup]
nixPkgs = ["nodejs_20"]

[phases.install]
cmds = ["npm ci --production=false"]

[phases.build]
cmds = ["echo 'Build phase - no build step needed'"]

[start]
cmd = "npm start"
```

**Railway uses Nixpacks for builds - this ensures correct Node.js version.**

### 3. orchestrate-railway.sh
- Resource-limited orchestration wrapper
- Memory monitoring
- Environment validation
- Graceful shutdown handlers

### 4. railway-deploy.sh
- Automated deployment script
- Pre-deployment checks
- Post-deployment health validation

---

## 📊 Monitoring & Debugging

### Health Endpoints

**Basic Health Check:**
```bash
curl https://your-app.railway.app/health
```

**Response:**
```json
{
  "status": "healthy",
  "service": "wcagai-complete-stack",
  "version": "2.0.0",
  "uptime_seconds": 3600,
  "uptime_human": "1h 0m 0s",
  "environment": "production",
  "tenant": "default",
  "features": {
    "orchestrator": true,
    "agents": ["keyword", "scan", "gemini", "security", "badge", "ceo", "draft", "deploy"],
    "lucy_mode": false,
    "bullmq": false
  }
}
```

**Pipeline Status:**
```bash
curl https://your-app.railway.app/status
```

**Test Probes:**
```bash
curl https://your-app.railway.app/api/test/probes
```

### Railway CLI Monitoring

**View Logs:**
```bash
railway logs
railway logs --tail 100
```

**Check Status:**
```bash
railway status
```

**Open Dashboard:**
```bash
railway open
```

**View Variables:**
```bash
railway variables
```

### Memory Monitoring

The orchestrate-railway.sh script includes automatic memory monitoring:
```bash
📊 Memory usage: 45.23%
```

Logs are written to `logs/orchestrate-railway.log`

---

## 🐛 Troubleshooting

### Issue 1: Health Check Timeout
**Symptom:** Deployment fails with "Health check timeout"

**Solutions:**
1. Increase timeout in railway.json:
   ```json
   "healthcheckTimeout": 900
   ```
2. Check if orchestrator is hanging:
   ```bash
   railway logs | grep "orchestrator"
   ```
3. Reduce MAX_CONCURRENT to 1:
   ```bash
   railway variables set MAX_CONCURRENT="1"
   ```

### Issue 2: Out of Memory (OOM)
**Symptom:** Container restarts, logs show "JavaScript heap out of memory"

**Solutions:**
1. Reduce Node.js memory limit:
   ```bash
   railway variables set NODE_OPTIONS="--max-old-space-size=300"
   ```
2. Reduce MAX_CONCURRENT:
   ```bash
   railway variables set MAX_CONCURRENT="1"
   ```
3. Upgrade to Starter plan (1GB+ memory)

### Issue 3: Missing Environment Variables
**Symptom:** 500 errors, logs show "GEMINI_API_KEY not set"

**Solution:**
```bash
railway variables set GEMINI_API_KEY="your_key"
railway variables set SERPAPI_KEY="your_key"
```

### Issue 4: Playwright Browser Download Fails
**Symptom:** "Executable doesn't exist at /tmp/playwright"

**Solution:**
Railway's ephemeral storage may clear browsers. Add to railway.json:
```json
"build": {
  "buildCommand": "npm ci && npx playwright install chromium"
}
```

### Issue 5: Port Binding Error
**Symptom:** "EADDRINUSE: address already in use"

**Solution:**
Railway automatically sets PORT. Ensure your code uses:
```javascript
const PORT = process.env.PORT || 3000;
```

---

## ⚡ Performance Tuning

### For Railway Free Tier (512MB)
```bash
railway variables set MAX_CONCURRENT="1"
railway variables set NODE_OPTIONS="--max-old-space-size=350"
```

### For Railway Starter Plan (1GB)
```bash
railway variables set MAX_CONCURRENT="3"
railway variables set NODE_OPTIONS="--max-old-space-size=800"
```

### For Railway Pro Plan (2GB+)
```bash
railway variables set MAX_CONCURRENT="5"
railway variables set NODE_OPTIONS="--max-old-space-size=1536"
```

### Optimizing Orchestration

**Sequential Execution (Low Memory):**
- Agents run one at a time
- Slowest but most stable
- Use MAX_CONCURRENT=1

**Parallel Execution (High Memory):**
- Multiple agents run simultaneously
- Faster but memory-intensive
- Use MAX_CONCURRENT=3-5 (Pro plan)

---

## 📈 Cost Optimization

### Free Tier ($0/month)
- ✅ Suitable for testing and demos
- ✅ MAX_CONCURRENT=1-2
- ⚠️ May timeout on large scans
- ⚠️ 500 hours/month limit

### Starter Plan ($5/month)
- ✅ Production-ready
- ✅ 1GB memory (MAX_CONCURRENT=3)
- ✅ No execution hour limits
- ✅ Priority support

### Pro Plan ($20+/month)
- ✅ Full performance (MAX_CONCURRENT=5-8)
- ✅ 2GB-8GB memory
- ✅ Horizontal scaling
- ✅ Custom domains

---

## 🚀 Next Steps

1. **Deploy to Railway:**
   ```bash
   npm run deploy:railway
   ```

2. **Test Deployment:**
   ```bash
   curl https://your-app.railway.app/health
   curl https://your-app.railway.app/api/test/probes
   ```

3. **Monitor Performance:**
   ```bash
   railway logs --tail 50
   ```

4. **Scale Up (if needed):**
   - Upgrade Railway plan
   - Increase MAX_CONCURRENT
   - Increase NODE_OPTIONS memory limit

---

## 📚 Additional Resources

- **Railway Docs:** https://docs.railway.app
- **WCAGAI Architecture:** See `ARCHITECTURE.md`
- **API Documentation:** See `server.js` endpoints
- **Agent Details:** See `wcag_machine_v5_visual_reg/` directory

---

## 🆘 Support

**Issues or Questions?**
1. Check Railway logs: `railway logs`
2. Review this documentation
3. Check ARCHITECTURE.md for system details
4. Open GitHub issue with logs

**Common Questions:**
- **Q:** How do I increase memory?
- **A:** Upgrade Railway plan or reduce MAX_CONCURRENT

- **Q:** Why is my deployment slow?
- **A:** Health check takes up to 10 minutes for all 8 agents to start

- **Q:** Can I use Railway's database?
- **A:** Yes! Railway provides PostgreSQL, Redis, MySQL. See Railway docs.

---

**Happy Deploying! 🚂✨**
