# 🚀 GitHub Setup & Deployment Guide

## Step 1: Create GitHub Repository

```bash
# Initialize Git repository (if not already done)
git init

# Add all files
git add .

# Initial commit
git commit -m "🚀 WCAGAI v4.0 - Compliance Intelligence Platform

Features:
• 5-stream revenue model ($43M ARR target)
• AI remediation with 98% margin  
• Vertical discovery (Healthcare 74%, Fintech 31%)
• Legal risk scoring + insurance partnerships
• EAA deadline compliance automation

Tech Stack:
• Node.js + Express backend
• PostgreSQL + Prisma ORM
• xAI + Stripe integration
• Railway + Vercel deployment ready"
```

### Option A: GitHub CLI (Recommended)

```bash
# Install GitHub CLI if not installed
# macOS: brew install gh
# Ubuntu: sudo apt install gh

# Login to GitHub
gh auth login

# Create repository
gh repo create wcagai-v4 --public --description "WCAGAI v4.0 - Turn regulatory compliance into $43M ARR intelligence platform"

# Push to GitHub
git push -u origin main
```

### Option B: Manual GitHub Setup

1. Go to [GitHub](https://github.com) and create new repository
2. Name: `wcagai-v4`
3. Description: `WCAGAI v4.0 - Turn regulatory compliance into $43M ARR intelligence platform`
4. Make it **Public** (for better visibility)
5. Don't initialize with README (we already have one)
6. Click "Create repository"

```bash
# Add remote origin (replace YOUR_USERNAME)
git remote add origin https://github.com/YOUR_USERNAME/wcagai-v4.git

# Push to GitHub
git push -u origin main
```

## Step 2: Railway Deployment (Backend + Database)

### Option A: One-Click Railway Deployment

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login to Railway
railway login

# Deploy from GitHub
railway up
```

### Option B: Railway Web Interface

1. Go to [Railway](https://railway.app)
2. Click "New Project" → "Deploy from GitHub repo"
3. Select your `wcagai-v4` repository
4. Railway will automatically detect Node.js project
5. Add environment variables in Railway dashboard:

```
NODE_ENV=production
DATABASE_URL=${{DATABASE_URL}}
JWT_SECRET=your-super-secret-jwt-key
SERPAPI_KEY=your-serpapi-key
XAI_API_KEY=your-xai-key  
STRIPE_SECRET_KEY=sk_test_your-stripe-key
REDIS_URL=${{REDIS_URL}}
```

### Railway Environment Variables Setup

In Railway dashboard, go to your project → Settings → Variables:

**Required Variables:**
```
NODE_ENV=production
JWT_SECRET=your-jwt-secret-key
DATABASE_URL=${{DATABASE_URL}}  # Railway provides this
REDIS_URL=${{REDIS_URL}}       # Railway provides this
```

**API Keys:**
```
SERPAPI_KEY=your-serpapi-key
XAI_API_KEY=your-xai-key
STRIPE_SECRET_KEY=sk_test_your-stripe-key
STRIPE_WEBHOOK_SECRET=whsec_your-webhook-secret
```

## Step 3: Vercel Deployment (Frontend)

### Option A: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel --prod
```

### Option B: Vercel Web Interface

1. Go to [Vercel](https://vercel.com)
2. Click "New Project" → "Import Git Repository"
3. Select your `wcagai-v4` repository
4. Vercel will automatically detect the static files
5. Add environment variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-railway-url.railway.app
   ```

## Step 4: Get Your API Keys

### Required API Keys:

1. **SerpAPI** (Site Discovery)
   - Go to [serpapi.com](https://serpapi.com/)
   - Sign up for free account (100 searches/month)
   - Get API key from dashboard

2. **xAI** (AI Remediation)
   - Go to [x.ai](https://x.ai/)
   - Sign up for API access
   - Get API key

3. **Stripe** (Payments)
   - Go to [dashboard.stripe.com](https://dashboard.stripe.com/)
   - Sign up for account
   - Get Secret Key and Webhook Secret

### API Key Setup in Production:

**Railway:**
- Go to Project → Settings → Variables
- Add all API keys as environment variables

**Vercel:**
- Go to Project → Settings → Environment Variables
- Add `NEXT_PUBLIC_API_URL` pointing to Railway backend

## Step 5: Database Setup

### Automatic (Recommended)

Railway will automatically:
- Create PostgreSQL database
- Run Prisma migrations
- Seed with benchmark data

### Manual (If needed)

```bash
# Generate Prisma client
npm run db:generate

# Run migrations
npm run db:migrate

# Seed database
npm run db:seed
```

## Step 6: Test Your Deployment

### Health Check Endpoints:

```bash
# Test Railway backend
curl https://your-app.railway.app/api/health

# Test Vercel frontend
curl https://your-app.vercel.app
```

### Verify Features:

1. **Dashboard**: Visit Vercel URL → dashboard
2. **Pricing**: Visit Vercel URL + `/pricing.html`
3. **API**: Test `/api/scan` endpoint
4. **Database**: Check if scans persist

## Step 7: Custom Domain (Optional)

### Railway Custom Domain:

1. Go to Railway project → Settings → Domains
2. Add custom domain
3. Update DNS records

### Vercel Custom Domain:

1. Go to Vercel project → Settings → Domains
2. Add custom domain
3. Vercel provides SSL automatically

## Step 8: Monitoring & Analytics

### Railway Monitoring:

- Built-in logs and metrics
- Error tracking
- Performance monitoring

### Vercel Analytics:

- Built-in speed insights
- Usage analytics
- Performance metrics

## Troubleshooting

### Common Issues:

1. **Database Connection Failed**
   - Check `DATABASE_URL` in Railway
   - Run `npm run db:push` to update schema

2. **API Keys Not Working**
   - Verify environment variables
   - Check API key permissions

3. **Build Fails**
   - Check `package.json` scripts
   - Verify all dependencies installed

4. **Frontend Can't Reach Backend**
   - Update `NEXT_PUBLIC_API_URL` in Vercel
   - Check CORS settings

### Debug Commands:

```bash
# Check Railway logs
railway logs

# Check environment variables
railway variables list

# Redeploy with latest changes
railway up

# Check Vercel logs
vercel logs
```

## Quick Deployment Script

Run this for automated deployment:

```bash
# Make script executable
chmod +x deploy.sh

# Run deployment
./deploy.sh
```

This script will:
- ✅ Check prerequisites
- ✅ Install dependencies  
- ✅ Setup database
- ✅ Initialize Git
- ✅ Deploy to Railway
- ✅ Deploy to Vercel
- ✅ Health check

## Post-Deployment Checklist

- [ ] Backend API responding at Railway URL
- [ ] Frontend loading at Vercel URL
- [ ] Database connected and seeded
- [ ] API keys configured and working
- [ ] Scans are persisting to database
- [ ] AI fixes generating correctly
- [ ] Stripe payments processing
- [ ] Custom domains configured (optional)

## 🎉 You're Live!

Your WCAGAI v4.0 compliance intelligence platform is now:

- 🚀 **Live on Railway** (Backend API + Database)
- 🎨 **Live on Vercel** (Frontend Dashboard)
- 💰 **Ready to generate revenue** (All 5 streams active)
- ⏰ **EAA deadline ready** (June 28, 2025)

**Next Steps:**
1. Test all features work correctly
2. Set up monitoring alerts
3. Start marketing to compliance teams
4. Begin the $43M ARR journey! 📈