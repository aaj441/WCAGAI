# WCAGAI Quick Start Guide - Get Running in 15 Minutes

**Goal:** Scan pharmaceutical companies for accessibility issues

**Time Required:** ~15-20 minutes

---

## Step 1: Get Gemini API Key (5 minutes)

### Why You Need This
Gemini 2.0 powers the AI analysis using WCAGAI's 21 rules to provide intelligent accessibility recommendations.

### How to Get It

1. **Go to Google AI Studio:**
   ```
   https://makersuite.google.com/app/apikey
   ```

2. **Sign in with your Google account**
   - Use any Google account (Gmail, Workspace, etc.)

3. **Click "Create API Key"**
   - You'll see a button that says "Create API key in new project" or "Create API key"
   - Click it

4. **Copy the API key**
   - It looks like: `AIzaSyC-xxxxxxxxxxxxxxxxxxxxxxxxxxx`
   - **IMPORTANT:** Copy this immediately - you won't see it again!
   - Store it somewhere safe temporarily

5. **Pricing:** FREE!
   - 60 requests per minute
   - 1,500 requests per day
   - More than enough for testing

### Expected Result
✅ You should have a string starting with `AIzaSy...`

---

## Step 2: Get SerpAPI Key (5 minutes)

### Why You Need This
SerpAPI fetches Google search results so you can automatically discover pharmaceutical company websites to scan.

### How to Get It

1. **Go to SerpAPI:**
   ```
   https://serpapi.com/
   ```

2. **Click "Register" (top right)**
   - Sign up with email or Google account

3. **Verify your email**
   - Check your inbox and click the verification link

4. **Go to Dashboard:**
   ```
   https://serpapi.com/manage-api-key
   ```

5. **Copy your API key**
   - You'll see "Your Secret API Key"
   - It looks like: `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`
   - Click the copy button

6. **Pricing:** FREE TIER
   - 100 searches per month free
   - Perfect for testing
   - Can upgrade later if needed

### Expected Result
✅ You should have a 32-character API key

---

## Step 3: Get Upstash Redis (5 minutes)

### Why You Need This
Redis stores the queue of URLs to scan and manages job processing across agents.

### How to Get It

1. **Go to Upstash:**
   ```
   https://console.upstash.com/
   ```

2. **Sign up**
   - Use GitHub, Google, or Email
   - No credit card required!

3. **Create a Redis Database**
   - Click "Create Database"
   - Name: `wcagai-production`
   - Type: `Regional`
   - Region: Choose closest to you (e.g., `us-east-1`)
   - Click "Create"

4. **Get Connection Details**
   - Click on your new database
   - Scroll to "REST API" section
   - You'll see two things you need:

   **UPSTASH_REDIS_REST_URL:**
   ```
   https://your-redis-12345.upstash.io
   ```

   **UPSTASH_REDIS_REST_TOKEN:**
   ```
   AXXXAbQyMTctxxxxxxxxxxxxxxxxxxxxxxx
   ```

5. **Copy both values**
   - Keep them handy for the next step

6. **Pricing:** FREE FOREVER
   - 10,000 commands per day
   - More than enough for your use case

### Expected Result
✅ You should have a URL and a TOKEN (both starting with `A`)

---

## Step 4: Configure Your Environment (2 minutes)

Now let's add all these keys to your project.

### Option A: Manual Configuration (Recommended)

1. **Open the .env file:**
   ```bash
   cd /home/user/WCAGAI
   nano .env
   ```

2. **Replace with your actual keys:**

   ```bash
   # ============================================================================
   # WCAGAI Complete Stack v2.0 - Production Configuration
   # ============================================================================

   # Server
   PORT=3000
   NODE_ENV=production

   # ===== PASTE YOUR KEYS BELOW =====

   # Gemini API (REQUIRED)
   GEMINI_API_KEY=AIzaSyC-PASTE-YOUR-ACTUAL-KEY-HERE

   # SerpAPI (REQUIRED for keyword search)
   SERPAPI_KEY=PASTE-YOUR-32-CHAR-KEY-HERE

   # Upstash Redis (REQUIRED)
   UPSTASH_REDIS_REST_URL=https://your-actual-redis.upstash.io
   UPSTASH_REDIS_REST_TOKEN=AXXXAbQyMTc-PASTE-YOUR-ACTUAL-TOKEN-HERE

   # ===== OPTIONAL SETTINGS =====

   # Multi-tenant
   TENANT_ID=pharma-scan
   USE_BULLMQ=true

   # Security
   PROMPT_INJECTION_THRESHOLD=0.7
   ENABLE_AUDIT_LOG=true

   # Logging
   LOG_LEVEL=info
   ```

3. **Save and exit:**
   - Press `Ctrl+X`
   - Press `Y` to confirm
   - Press `Enter`

### Option B: I'll Do It For You

Just give me your three API keys and I'll configure it automatically.

---

## Step 5: Test It Works (2 minutes)

Let's verify everything is configured correctly.

### Start the Server

```bash
cd /home/user/WCAGAI
npm start
```

**Expected output:**
```
╔═══════════════════════════════════════════════════════════════╗
║   🚀 WCAGAI Complete Stack v2.0                              ║
║   Server:    http://localhost:3000                           ║
║   ✓ Gemini 2.0 (WCAGAI 21 rules)                           ║
╚═══════════════════════════════════════════════════════════════╝
```

### Test Gemini Integration

Open a new terminal and run:

```bash
curl -X POST http://localhost:3000/api/gemini/chat \
  -H "Content-Type: application/json" \
  -d '{"message":"What are the 6 dimensions of WCAGAI?"}'
```

**If it works, you'll see:**
```json
{
  "response": "The 6 dimensions of WCAGAI are: 1. Perceivable...",
  "model": "gemini-2.0-flash-exp",
  "system_instruction": "WCAGAI (21 rules)",
  "security_gate": "PASS"
}
```

**If you see an error about API key**, your Gemini key is wrong. Double-check it.

---

## Step 6: Scan Pharmaceutical Companies! (5 minutes)

### Test with a Single Pharma Company

First, let's test the badge API with a real pharmaceutical company:

```bash
curl -X POST http://localhost:3000/api/aag/badge \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://www.pfizer.com",
    "violations": [
      {"impact": "critical", "description": "Missing ARIA labels on navigation"},
      {"impact": "serious", "description": "Forms missing required field indicators"}
    ]
  }'
```

### Run Full Pipeline on Pharma Keyword

Now let's scan the TOP 100 pharmaceutical companies:

```bash
# Stop the server if running (Ctrl+C)

# Run the full pipeline
bash wcag_machine_v5_visual_reg/orchestrate.sh "pharmaceutical companies"
```

**This will:**
1. ✅ Fetch top 100 Google results for "pharmaceutical companies"
2. ✅ Scan each website with Axe-core
3. ✅ Analyze violations with Gemini + WCAGAI
4. ✅ Generate AAG compliance badges
5. ✅ Find CEO/contact info
6. ✅ Draft personalized outreach emails
7. ✅ Deploy results dashboard

**Time:** ~10-15 minutes for 100 sites

---

## Step 7: View Results

### Check the Output

Results are stored in Redis and logged to:
```bash
tail -f logs/combined.log
```

### Example Output

You'll see JSON output for each scanned site:
```json
{
  "company": "Pfizer Inc.",
  "url": "https://www.pfizer.com",
  "violations": 47,
  "critical": 8,
  "serious": 15,
  "moderate": 24,
  "compliance_level": "Fail",
  "badge_url": "https://api.wcagai.org/badge/abc123",
  "ceo": "Albert Bourla",
  "ceo_email": "contact@pfizer.com",
  "draft_email": "Subject: Critical Accessibility Issues on Pfizer.com..."
}
```

---

## 🚀 Alternative Keywords to Try

If you want to test first with a smaller set:

```bash
# Top 10 results only (faster)
bash wcag_machine_v5_visual_reg/orchestrate.sh "pfizer"

# Specific pharma segment
bash wcag_machine_v5_visual_reg/orchestrate.sh "biotech companies"

# Patient-facing pharma
bash wcag_machine_v5_visual_reg/orchestrate.sh "pharmacy near me"
```

---

## 🔧 Troubleshooting

### Error: "GEMINI_API_KEY not configured"
- Double-check your .env file
- Make sure there are no spaces around the `=` sign
- Restart the server after editing .env

### Error: "SerpAPI rate limit exceeded"
- You've used your 100 free searches this month
- Either wait until next month or upgrade SerpAPI plan
- Or test with a single URL instead of keyword search

### Error: "Redis connection failed"
- Check your UPSTASH_REDIS_REST_URL is correct
- Check your UPSTASH_REDIS_REST_TOKEN is correct
- Make sure your Upstash database is active (check console)

### Server won't start
```bash
# Check what's running on port 3000
lsof -i :3000

# Kill it
kill -9 <PID>

# Try again
npm start
```

---

## 📊 Expected Results for Pharma Companies

Based on typical pharmaceutical websites, you'll likely find:

### Common Critical Issues
- ❌ Missing alt text on drug images
- ❌ PDF drug information not accessible to screen readers
- ❌ Complex forms without proper labels
- ❌ Patient portals with keyboard navigation issues

### Compliance Levels (predicted)
- **Fail (60%):** Most pharma sites have critical accessibility issues
- **Level A (30%):** Some basic compliance
- **Level AA (10%):** Rare - usually only large companies
- **Level AAA (0%):** Almost never in pharma industry

### Top 10 Pharma Companies to Scan
1. Pfizer - pfizer.com
2. Johnson & Johnson - jnj.com
3. Roche - roche.com
4. Novartis - novartis.com
5. Merck - merck.com
6. AbbVie - abbvie.com
7. Bristol Myers Squibb - bms.com
8. AstraZeneca - astrazeneca.com
9. GlaxoSmithKline - gsk.com
10. Sanofi - sanofi.com

---

## 🎯 Quick Start Checklist

Use this to track your progress:

- [ ] Step 1: Got Gemini API key from Google AI Studio
- [ ] Step 2: Got SerpAPI key from serpapi.com
- [ ] Step 3: Created Upstash Redis database
- [ ] Step 4: Configured .env file with all three keys
- [ ] Step 5: Started server successfully (no errors)
- [ ] Step 6: Tested Gemini endpoint (got response)
- [ ] Step 7: Ran test scan on single pharma company
- [ ] Step 8: Ran full pipeline on "pharmaceutical companies"
- [ ] Step 9: Reviewed results in logs
- [ ] Step 10: Ready to analyze and take action!

---

## 📞 Need Help?

If you get stuck:

1. **Check logs:**
   ```bash
   tail -f logs/combined.log
   tail -f logs/error.log
   ```

2. **Run test probes:**
   ```bash
   curl http://localhost:3000/api/test/probes
   ```

3. **Verify environment:**
   ```bash
   cat .env | grep -v "^#" | grep "="
   ```

---

## 🚀 You're Ready!

Once you have all three API keys configured, you can scan pharmaceutical companies at scale!

**Next Steps:**
1. Get those API keys (15 min)
2. Configure .env (2 min)
3. Run the pipeline (5 min)
4. Analyze results and create outreach strategy

**Total time to actionable insights: ~22 minutes** ⚡

Let's go! 🎯
