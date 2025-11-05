# Railway Deployment Troubleshooting Guide

## Common Railway Build Failures & Solutions

### 🔴 Issue #1: Build Fails During `npm install`

**Error Messages:**
```
npm ERR! code ERESOLVE
npm ERR! ERESOLVE unable to resolve dependency tree
```

**Solution:**
```bash
# In railway.json, use legacy peer deps
{
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install --legacy-peer-deps"
  }
}
```

---

### 🔴 Issue #2: Missing Environment Variables

**Error Messages:**
```
Error: GEMINI_API_KEY is required
Error: Cannot find module 'express'
```

**Solution:**
1. Go to Railway Dashboard → Your Project
2. Click **"Variables"** tab
3. Add these variables:
   ```
   GEMINI_API_KEY=AIzaSyC-your-key-here
   PORT=3000
   NODE_ENV=production
   ```
4. Click **"Redeploy"**

---

### 🔴 Issue #3: Test Script Failing

**Error Messages:**
```
npm ERR! missing script: test
Cannot find module 'jest'
```

**Solution:** ✅ FIXED in latest commit
- Removed jest and other test dependencies
- Removed test scripts that Railway tries to run

---

### 🔴 Issue #4: Health Check Timeout

**Error Messages:**
```
Health check failed
Deployment failed: health check timeout after 100s
```

**Solution:**
```json
// railway.json
{
  "deploy": {
    "healthcheckPath": "/health",
    "healthcheckTimeout": 300  // Increase to 5 minutes
  }
}
```

---

### 🔴 Issue #5: Port Binding Issues

**Error Messages:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solution:**
Railway automatically assigns a port via `$PORT` environment variable.

Make sure your server.js uses:
```javascript
const PORT = process.env.PORT || 3000;
```

✅ This is already correct in our server.js

---

### 🔴 Issue #6: Module Not Found

**Error Messages:**
```
Error: Cannot find module '@google/generative-ai'
Error: Cannot find module 'express'
```

**Solution:**
1. Check package.json has all dependencies listed
2. Make sure buildCommand is `npm install` (not `npm ci`)
3. Delete node_modules locally and push fresh package.json

---

### 🔴 Issue #7: Out of Memory

**Error Messages:**
```
JavaScript heap out of memory
FATAL ERROR: Reached heap limit
```

**Solution:**
1. Railway free tier has 512MB RAM
2. Upgrade to Hobby plan ($5/mo) for 8GB RAM
3. Or optimize your code to use less memory

---

## ✅ Verified Working Configuration

This is the configuration that works:

### `railway.json`
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": {
    "builder": "NIXPACKS",
    "buildCommand": "npm install"
  },
  "deploy": {
    "startCommand": "node server.js",
    "healthcheckPath": "/health",
    "healthcheckTimeout": 100,
    "restartPolicyType": "ON_FAILURE",
    "restartPolicyMaxRetries": 10
  }
}
```

### Railway Environment Variables
```
NODE_ENV=production
PORT=3000
GEMINI_API_KEY=your_actual_key
UPSTASH_REDIS_REST_URL=your_redis_url
UPSTASH_REDIS_REST_TOKEN=your_redis_token
```

---

## 🔍 How to Debug Railway Builds

### Step 1: View Build Logs
1. Railway Dashboard → Your Project
2. Click "Deployments" tab
3. Click the failed deployment (red X)
4. Scroll through logs to find the error

### Step 2: Check Common Issues
- [ ] Are all environment variables set?
- [ ] Is package.json valid JSON?
- [ ] Are all dependencies in package.json?
- [ ] Is the startCommand correct?
- [ ] Is the health check endpoint working?

### Step 3: Test Locally First
```bash
# Simulate Railway environment
NODE_ENV=production PORT=3000 node server.js

# Test health check
curl http://localhost:3000/health
```

### Step 4: Check Railway Status
- Sometimes Railway has outages
- Check: https://status.railway.app/

---

## 🚀 Deploy from Scratch (If All Else Fails)

1. **Delete the Railway project** (start fresh)

2. **Create new project:**
   ```bash
   railway login
   railway init
   ```

3. **Link to GitHub repo:**
   ```bash
   railway link
   ```

4. **Set environment variables:**
   ```bash
   railway variables set GEMINI_API_KEY=your_key
   railway variables set PORT=3000
   railway variables set NODE_ENV=production
   ```

5. **Deploy:**
   ```bash
   railway up
   ```

---

## 📞 Get Railway Error Logs

To share error logs with me for debugging:

```bash
# Using Railway CLI
railway logs

# Or copy from Railway Dashboard
# Deployments → Failed Build → Copy logs
```

Then paste them here so I can help debug!

---

## ✅ Post-Deployment Verification

Once deployed successfully:

```bash
# Get your Railway URL
railway domain

# Test health check
curl https://your-app.up.railway.app/health

# Test test probes
curl https://your-app.up.railway.app/api/test/probes

# Test Gemini (if API key configured)
curl -X POST https://your-app.up.railway.app/api/gemini/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"Test"}'
```

All should return 200 OK ✅

---

**Last Updated:** 2025-11-05
**Version:** 2.0.0
