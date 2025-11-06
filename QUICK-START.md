# 🚀 WCAGAI Quick Start - Working UI + API

## ✅ What's Working Now

- **Frontend UI**: React + Tailwind at `http://localhost:3000/`
- **API Endpoints**: Express backend with Gemini AI integration
- **Two Modes**:
  - **URL Scan**: Scan a specific website for accessibility
  - **Keyword Search**: Find companies by keyword using AI

---

## 🏃 Run Locally (2 Steps)

### 1. Set Environment Variables
```bash
cp .env.example .env
```

Edit `.env` and add your API keys:
```bash
GEMINI_API_KEY=your_actual_gemini_key
SERPAPI_KEY=your_actual_serpapi_key
```

### 2. Start Server
```bash
npm install
node server.js
```

### 3. Open Browser
```
http://localhost:3000
```

You'll see the WCAGAI UI with two tabs:
- **Scan URL**: Enter website URL → Get accessibility analysis
- **Search Companies**: Enter keywords → AI finds companies

---

## 🚂 Deploy to Railway (3 Steps)

### 1. Set Environment Variables in Railway Dashboard
```bash
# In Railway Dashboard → Variables tab, add:
GEMINI_API_KEY = your_gemini_api_key
SERPAPI_KEY = your_serpapi_key
NODE_ENV = production
```

### 2. Deploy
**Option A: Link GitHub Repo (Recommended)**
```
1. Go to Railway Dashboard
2. New Project → Deploy from GitHub
3. Select your WCAGAI repo
4. Railway auto-deploys on every push
```

**Option B: Railway CLI**
```bash
railway login
railway link
railway up
```

### 3. Test Deployment
```bash
# Get your Railway URL
railway status

# Test in browser
https://your-app.railway.app/

# Test health endpoint
curl https://your-app.railway.app/health
```

---

## 📡 API Endpoints

### Frontend
- `GET /` - React UI (URL scan + keyword search)

### API Endpoints
- `GET /health` - Health check
- `POST /api/scan/url` - Scan a URL for accessibility
  ```json
  { "url": "https://example.com" }
  ```
- `POST /api/gemini/chat` - AI chat for keyword search
  ```json
  { "message": "Find pharmaceutical companies" }
  ```
- `POST /api/aag/badge` - Generate AAG compliance badge
- `GET /api/test/probes` - Run all system tests

---

## 🐛 Troubleshooting

### "Module not found" errors
```bash
npm install
```

### "GEMINI_API_KEY not configured"
1. Get key from: https://makersuite.google.com/app/apikey
2. Add to `.env` file or Railway dashboard variables

### Railway deployment fails
1. Check Railway logs: `railway logs`
2. Verify environment variables are set in Railway dashboard
3. Make sure you pushed latest code: `git push`

### Frontend doesn't load
1. Make sure server.js is running
2. Check browser console for errors
3. Visit http://localhost:3000/ (not /index.html)

---

## 📂 File Structure

```
WCAGAI/
├── public/
│   └── index.html          # React + Tailwind UI
├── server.js               # Express API server
├── health.js               # Health check server (legacy)
├── wcag_machine_v5_visual_reg/
│   ├── orchestrate.sh      # Agent orchestration
│   └── agent-*.service.js  # AI agents
├── .env.example            # Environment variable template
├── Procfile                # Railway start command
├── railway.json            # Railway configuration
└── package.json            # Dependencies

```

---

## 🎯 What This Does

1. **User visits website** → Sees clean Tailwind UI
2. **Enters URL or keyword** → Clicks "Scan" or "Search"
3. **Frontend calls API** → `/api/scan/url` or `/api/gemini/chat`
4. **Backend processes** → Gemini AI analyzes accessibility
5. **Results displayed** → Clean formatted response in UI

---

## 🔥 Next Steps

1. **Test locally**: `node server.js` → Visit http://localhost:3000
2. **Add your API keys**: Edit `.env` file
3. **Deploy to Railway**: Link GitHub repo or use `railway up`
4. **Share your live URL**: `https://your-app.railway.app`

**That's it! Your accessibility scanner is live.** 🎉
