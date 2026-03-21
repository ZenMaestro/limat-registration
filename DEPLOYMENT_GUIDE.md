# LIMAT Deployment & CI/CD Guide

## Quick Deployment Options

Choose one:
- **Azure App Service** (Recommended - Free tier available)
- **Railway.app** (Easiest - simple setup)
- **Heroku** (Classic - still works)
- **DigitalOcean** (Affordable VPS)

---

## Option 1: Azure App Service (Recommended) ✅

### Why Azure?
- Free tier available (F1)
- Integrated with Azure DevOps
- Good for student projects
- Easy deployment from Git

### Step-by-Step Setup

#### 1. Create Azure Account
```bash
# Go to https://azure.microsoft.com/free
# Sign up with your email (get $200 free credits for 30 days)
```

#### 2. Create Resource Group
```bash
az login
az group create --name limat-rg --location eastus
```

#### 3. Create App Service Plan
```bash
az appservice plan create \
  --name limat-plan \
  --resource-group limat-rg \
  --sku FREE
```

#### 4. Create Web App
```bash
az webapp create \
  --resource-group limat-rg \
  --plan limat-plan \
  --name limat-registration \
  --runtime "node|20-lts"
```

#### 5. Connect Git Repository
```bash
# In VS Code Terminal
cd "c:\Users\sai43\Documents\Codux\LIMAT sem"

# Add Azure remote
az webapp deployment source config-zip \
  --resource-group limat-rg \
  --name limat-registration \
  --src limat-app.zip

# Or deploy directly from GitHub
az webapp deployment github-actions add \
  --resource-group limat-rg \
  --name limat-registration \
  --repo sai43/limat-registration
```

#### 6. Configure Environment Variables
```bash
az webapp config appsettings set \
  --resource-group limat-rg \
  --name limat-registration \
  --settings \
  DB_HOST=mysql.database.azure.com \
  DB_USER=admin@mysql-server \
  DB_PASSWORD=YourSecurePassword \
  JWT_SECRET=YourJWTSecret \
  NODE_ENV=production
```

---

## Option 2: Railway.app (Easiest Setup)

### Step 1: Connect GitHub
1. Go to https://railway.app
2. Click "Start a New Project"
3. Select "Deploy from GitHub"
4. Authorize Railway and select your LIMAT repository

### Step 2: Configure Backend Service
```
1. Select backend folder
2. Railway automatically detects Node.js
3. Configure environment variables:
   - DB_HOST
   - DB_USER
   - DB_PASSWORD
   - JWT_SECRET
   - NODE_ENV=production
```

### Step 3: Configure Frontend Service
```
1. Add another service
2. Select frontend folder
3. Set Build Command: npm run build (or leave empty for static)
4. Set Start Command: python -m http.server 8000
```

### Step 4: Connect Database
```
1. Click "Add a plugin"
2. Select "MySQL"
3. Railway creates MySQL service
4. Copy connection string to environment variables
```

### Deploy
```
Click "Deploy" - Railway watches your GitHub repo
Any push triggers automatic deployment!
```

---

## Option 3: GitHub Actions CI/CD (Most Control)

### Setup Automatic Deployment on Every Git Push

#### Step 1: Create GitHub Actions Workflow File

Create `.github/workflows/deploy.yml` in your project root:

```yaml
name: Deploy LIMAT to Azure

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

env:
  NODE_VERSION: '20.x'
  AZURE_APP_SERVICE: 'limat-registration'
  AZURE_RESOURCE_GROUP: 'limat-rg'

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js ${{ env.NODE_VERSION }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ env.NODE_VERSION }}
    
    - name: Install Backend Dependencies
      run: |
        cd backend
        npm install
    
    - name: Run Backend Tests
      run: |
        cd backend
        npm test
      continue-on-error: true
    
    - name: Login to Azure
      uses: azure/login@v1
      with:
        creds: ${{ secrets.AZURE_CREDENTIALS }}
    
    - name: Deploy to Azure App Service
      uses: azure/webapps-deploy@v2
      with:
        app-name: ${{ env.AZURE_APP_SERVICE }}
        resource-group-name: ${{ env.AZURE_RESOURCE_GROUP }}
        package: backend
    
    - name: Notify Deployment
      if: success()
      run: echo "✅ Deployment successful! App live at https://limat-registration.azurewebsites.net"

    - name: Notify Deployment Failure
      if: failure()
      run: echo "❌ Deployment failed - check logs above"
```

#### Step 2: Add Azure Credentials to GitHub Secrets

```bash
# Generate Azure credentials
az ad sp create-for-rbac \
  --name "limat-github-actions" \
  --role contributor \
  --scopes /subscriptions/{subscription-id}/resourceGroups/limat-rg \
  --output json

# Copy the output JSON string
# Go to GitHub repo → Settings → Secrets and variables → Actions
# Create AZURE_CREDENTIALS secret with the JSON
```

#### Step 3: Enable Auto-Deploy
```bash
# Every time you push to main:
git add .
git commit -m "Update student dashboard"
git push origin main

# GitHub Actions automatically:
# 1. Checks code
# 2. Installs dependencies
# 3. Runs tests
# 4. Deploys to Azure
# 5. Updates live site
```

---

## Option 4: Simple Local-to-Cloud with Vercel + Backend API

### Frontend on Vercel (Easy)
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy frontend
cd frontend
vercel

# Automatic deployment on every git push
```

### Backend Stays on Azure/Railway
- Deploy Node backend separately
- Update frontend API_BASE in auth.js

---

## Project Structure for Deployment

```
limat-registration/
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env (⚠️ DO NOT COMMIT)
│   ├── routes/
│   ├── controllers/
│   └── config/
├── frontend/
│   ├── index.html
│   ├── student/
│   └── admin/
├── .github/
│   └── workflows/
│       └── deploy.yml
├── .env.example (Template for .env)
├── .gitignore
└── README.md
```

---

## .gitignore File

Create `.gitignore` to avoid committing sensitive files:

```
# Environment variables
.env
.env.local
.env.*.local

# Dependencies
node_modules/
npm-debug.log
package-lock.json

# IDE
.vscode/
.idea/
*.swp

# System
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Testing
coverage/
.nyc_output/

# Build
dist/
build/
```

---

## Environment Variables Setup

### .env.example (Commit this)
```
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=limat_registration
DB_USER=root
DB_PASSWORD=change_me
JWT_SECRET=change_me_to_secure_key
NODE_ENV=development
```

### Production .env (Never commit)
```
PORT=5000
DB_HOST=mysql.database.azure.com
DB_PORT=3306
DB_NAME=limat_prod
DB_USER=admin
DB_PASSWORD=SecurePassword123!
JWT_SECRET=your-secure-jwt-secret-key
NODE_ENV=production
```

---

## Database Migration to Cloud

### Option A: Azure SQL Database

```bash
# Create Azure MySQL Database
az mysql server create \
  --resource-group limat-rg \
  --name limat-mysql-server \
  --location eastus \
  --admin-user dbadmin \
  --admin-password StrongPassword123!

# Import schema
mysql -h limat-mysql-server.mysql.database.azure.com \
  -u dbadmin \
  -p < backend/config/schema.sql
```

### Option B: Remote Database Service

Use **Clever Cloud** or **PlanetScale** for managed MySQL:
```bash
# PlanetScale example
# Go to https://planetscale.com
# Create database cluster
# Copy connection string
# Paste into .env file
```

---

## Deployment Checklist

### Before First Deployment
- [ ] Create `.env.example` with all required variables
- [ ] Add `.env` to `.gitignore`
- [ ] Test locally: `npm start`
- [ ] Check all API endpoints work
- [ ] Verify database connection
- [ ] Update API_BASE URL in frontend/assets/js/auth.js for production

### Git Setup
- [ ] Initialize repository: `git init`
- [ ] Add remote: `git remote add origin https://github.com/yourusername/limat`
- [ ] Commit all files: `git add . && git commit -m "Initial commit"`
- [ ] Create `.github/workflows/deploy.yml`

### Deployment Platform
- [ ] Create account (Azure/Railway/Heroku)
- [ ] Configure environment variables
- [ ] Connect Git repository
- [ ] Test deployment manually first
- [ ] Enable automatic deployments

### Post-Deployment
- [ ] Test all features on live site
- [ ] Check API responses with correct URLs
- [ ] Verify database operations work
- [ ] Monitor error logs
- [ ] Set up monitoring/alerts

---

## Testing Your Deployment

### After deployment, test:

```bash
# Test health endpoint
curl https://your-app.azurewebsites.net/api/health

# Test login (from browser console)
fetch('https://your-app.azurewebsites.net/api/auth/student-login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    college_id: 'CS001',
    password: 'password123'
  })
})
.then(r => r.json())
.then(d => console.log(d))
```

---

## Automatic Deployment Workflow

### How It Works After Setup:

```
You edit code locally
    ↓
git push origin main
    ↓
GitHub receives push
    ↓
GitHub Actions triggered
    ↓
Workflow runs:
  1. Checks out code
  2. Installs dependencies
  3. Runs tests (if any)
  4. Builds application
  5. Deploys to production
    ↓
Live site updates automatically
    ↓
You see changes on https://your-app.azurewebsites.net
```

### Example Workflow:

```bash
# Make a change to student dashboard
echo "// New feature" >> frontend/student/dashboard.html

# Commit and push
git add frontend/student/dashboard.html
git commit -m "Add new dashboard feature"
git push origin main

# Within 2-3 minutes:
# ✅ GitHub Actions deploys your changes
# ✅ Changes live on production server
# ✅ No manual deployment needed
```

---

## Monitoring & Logs

### Azure Portal
```
1. Go to Azure Portal
2. Select your App Service
3. Click "Log stream" → See real-time logs
4. Click "Diagnose and solve problems" → Troubleshoot
```

### GitHub Actions
```
1. Go to GitHub repo
2. Click "Actions" tab
3. View workflow runs
4. Click on a run to see logs
```

### Database Monitoring
```bash
# SSH into Azure VM
az webapp create-remote-connection --resource-group limat-rg --name limat-registration

# Check MySQL logs
mysql -h host -u user -p
SHOW PROCESSLIST;
SHOW SLOW LOGS;
```

---

## Cost Estimates

| Platform | Tier | Monthly Cost |
|----------|------|-------------|
| Azure App Service | Free | $0 |
| Azure MySQL | Basic | $25-100 |
| Railway | Hobby | $5-20 |
| Heroku | Free tier (removed) | - |
| DigitalOcean | Starter VM | $4+ |
| Vercel | Free (frontend) | $0 |

**Recommendation**: Azure Free tier for both App Service and free MySQL test, then upgrade to Basic ($25/month) for production.

---

## Next Steps

1. **Immediate**: Push code to GitHub, set up repository properly
2. **Week 1**: Choose deployment platform (Azure recommended)
3. **Week 1**: Set up GitHub Actions workflow
4. **Week 1**: Deploy and test on production
5. **Ongoing**: Push updates → Automatic deployment

---

## Troubleshooting

### Deployment Failed
```bash
Check GitHub Actions logs → View error
Check Azure App Service logs → "Log stream"
Verify environment variables are set
```

### Database Connection Error
```bash
Verify DB_HOST, DB_USER, DB_PASSWORD in .env
Check Azure MySQL firewall allows your IP
Test connection locally
```

### App Not Updating After Push
```bash
Check GitHub Actions workflow ran
Check deployment logs in Azure Portal
Verify correct branch is being deployed (main/develop)
```

---

For questions with Azure: Use [Azure CLI](https://learn.microsoft.com/cli/azure/)
For questions with GitHub Actions: Use [GitHub Docs](https://docs.github.com/actions)
For questions with CI/CD: See `.github/workflows/deploy.yml` in your repo
