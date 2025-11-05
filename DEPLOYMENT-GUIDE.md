# 🚀 WCAGAI v2.0 Deployment Guide

This guide will help you deploy WCAGAI to Railway or Vercel in under 10 minutes.

---

## 📋 Prerequisites

Before deploying, you need API keys for:

1. **SerpAPI** (Google Search)
   - Get it here: https://serpapi.com/manage-api-key
   - Sign up for free tier (100 searches/month)

2. **Google Gemini API** (AI Analysis)
   - Get it here: https://aistudio.google.com/app/apikey
   - Free tier available

3. **Upstash Redis** (Queue/Storage)
   - Get it here: https://console.upstash.com/
   - Create a Redis database
   - Copy the REST URL and token

---

## 🚂 Option 1: Deploy to Railway (RECOMMENDED)

Railway is the easiest option for this project.

### Step 1: Push Your Code to GitHub

If you haven't already, make sure your latest changes are pushed.

### Step 2: Deploy to Railway

1. **Go to Railway:** https://railway.app/

2. **Sign in with GitHub**

3. **Click "New Project"**

4. **Select "Deploy from GitHub repo"**

5. **Choose your WCAGAI repository**

6. **Select the branch:** claude/wcagai-complete-stack-v2-011CUpgLwfZNtDX8L2GaosGU

7. **Configure root directory:**
   - Click on your service
   - Go to "Settings" → "Service Settings"
   - Set **Root Directory:** wcag_machine_v5_visual_reg
   - Click "Update"

### Step 3: Add Environment Variables

In Railway dashboard, go to **Variables** tab and add:

```
SERPAPI_KEY=your_actual_serpapi_key_here
GEMINI_API_KEY=your_actual_gemini_key_here
UPSTASH_REDIS_REST_URL=your_redis_url_here
UPSTASH_REDIS_REST_TOKEN=your_redis_token_here
NODE_ENV=production
```

### Step 4: Deploy!

Railway will automatically:
1. Detect Node.js
2. Run npm install
3. Run npm start (starts health-server.js)
4. Expose your app on a public URL

Deployment takes ~2-3 minutes

### Step 5: Verify Deployment

Test the health endpoint:
```bash
curl https://your-app-url.railway.app/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "WCAGAI v2.0",
  "timestamp": "2025-11-05T18:00:00.000Z",
  "uptime": 123.45,
  "version": "2.0.0"
}
```

✅ If you see this, deployment succeeded!

---

## 🎉 You're Done!

Your WCAGAI v2.0 is now live on Railway!

**What to do next:**
1. Save your Railway URL
2. Test the /health endpoint
3. Monitor logs in Railway dashboard
4. Run a test workflow (optional)

