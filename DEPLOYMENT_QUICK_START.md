# LIMAT Registration System - Deployment Quick Start

## 🎯 Deployment in 3 Steps

### Step 1: Prepare Your Code for Git

```bash
cd "c:\Users\sai43\Documents\Codux\LIMAT sem"

# Configure Git (if first time)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"

# Add all files to staging
git add .

# Commit
git commit -m "Initial LIMAT project setup with deployment configuration"

# Push to GitHub (after creating repo)
git remote add origin https://github.com/yourusername/limat-registration.git
git branch -M main
git push -u origin main
```

### Step 2: Choose Deployment Platform

| Platform | Setup Time | Cost | Auto-Deploy | Recommendation |
|----------|-----------|------|-----------|-----------------|
| **Railway** | 5 min | Free-$20/mo | ✅ | 🌟 Best for beginners |
| **Azure** | 10 min | Free-$25/mo | ✅ | Great for enterprises |
| **Heroku** | 10 min | Paid only | ✅ | Legacy option |
| **DigitalOcean** | 15 min | $4+/mo | ⚠️ Manual | For VPS users |

### Step 3: Deploy & Enable Auto-Updates

**Recommendation: Railway.app** (Easiest)

```bash
# 1. Go to https://railway.app
# 2. Sign up with GitHub
# 3. Create new project → Deploy from GitHub
# 4. Select your limat-registration repository
# 5. Railway automatically deploys on every push!
```

---

## 📋 Environment Setup for Deployment

### 1. Update API URLs for Production

**File**: `frontend/assets/js/auth.js`

```javascript
// Change this for production:
const API_BASE = 'http://localhost:5000/api';

// To this (example for Railway):
const API_BASE = 'https://your-app-name.railway.app/api';
```

### 2. Set Environment Variables on Platform

Create these in your deployment platform's settings:

```
PORT = 5000
NODE_ENV = production
DB_HOST = mysql.database.azure.com  (or Railway MySQL)
DB_USER = admin
DB_PASSWORD = YourSecurePassword123!
DB_NAME = limat_registration
JWT_SECRET = YourSecureJWTSecret123!456!
```

### 3. Database Setup on Cloud

**Option A: Railway MySQL (Easiest)**
- Railway automatically sets up MySQL
- Connection string provided in environment

**Option B: Azure MySQL**
```bash
# Create MySQL in Azure
az mysql server create --name limat-mysql \
  --resource-group limat-rg \
  --admin-user admin \
  --admin-password SecurePass123!
```

---

## 🚀 Deploy to Railway (Step-by-Step)

### 1. Create Railway Account
```
Visit: https://railway.app
Sign up with GitHub → Authorize Railway
```

### 2. Create New Project
```
Click: New Project → Deploy from GitHub
Select: yourusername/limat-registration
Choose: main branch
```

### 3. Configure Backend Service
```
Railway auto-detects Node.js backend
Goes to backend/ folder
Environment tab:
  - Click "New Variable"
  - Add all variables from .env
  - Railway keeps secrets safe
```

### 4. Configure MySQL Database
```
In Railway Dashboard:
  - Click "Add"
  - Select "MySQL"
  - Railway creates database
  - Copy connection string to env variables
```

### 5. Deploy
```
Click "Deploy" button
Railway builds and deploys
Within 2-5 minutes: Your app is live!
Example URL: https://limat-prod-123.railway.app
```

### 6. Enable Auto-Deploy
```
Go to Settings → Deployments
Check: "Auto-deploy on push"
Now every git push triggers deployment automatically!
```

---

## ✅ Automatic Updates After Deployment

### How It Works:

```
You edit code
  ↓
git push origin main
  ↓
Railway receives push
  ↓
Automatic build & deploy
  ↓
Live site updates (1-5 min)
```

### Example Workflow:

```bash
# Make a change
echo "// New comment" >> backend/server.js

# Save and commit
git add backend/server.js
git commit -m "Update server comments"

# Push
git push origin main

# Wait 1-5 minutes...
# Your changes are LIVE! 🎉
```

---

## 🔍 Verify Deployment

### Test Your Live Site:

```bash
# Test health endpoint
curl https://your-app.railway.app/api/health

# Should return:
# {"status":"Server is running"}
```

### Test Login:

```bash
# From browser console
fetch('https://your-app.railway.app/api/auth/admin-login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ 
    email: 'admin@limat.edu',
    password: 'admin123'
  })
})
.then(r => r.json())
.then(d => console.log(d))
```

---

## 🐛 Troubleshooting

### Site won't load
```
1. Check railway.app dashboard for deployment logs
2. Verify environment variables are set
3. Check database connection string
4. See deployment errors in "Build Logs"
```

### Database connection fails
```
1. Verify DB credentials in environment
2. Check database exists
3. Run schema import:
   mysql -h host -u user -p < schema.sql
4. Test connection locally first
```

### Auto-deploy not working
```
1. Check GitHub connected correctly
2. Go to Settings → Integrations → GitHub
3. Re-authorize if needed
4. Check "Auto-deploy" is enabled
```

### Changes not showing
```
1. Check git push succeeded: git push origin main
2. Check GitHub shows latest commit
3. Check Railway deployment completed
4. Check browser cache: Ctrl+Shift+Delete
5. Hard refresh: Ctrl+Shift+R (Windows)
```

---

## 📊 Monitoring Your Deployment

### Railway Dashboard
```
1. Log in to railway.app
2. Select your project
3. View real-time logs
4. Monitor resource usage
5. Check deployment history
```

### Check Live Logs
```
Click "View Logs" in Railway dashboard
See real-time server output
Helpful for debugging errors
```

---

## 💰 Estimated Costs (Monthly)

| Service | Free Tier | Paid Tier |
|---------|-----------|-----------|
| Railway App Service | Yes ($5 trial) | $10-50 |
| Railway MySQL | Yes (shared) | $10-30 |
| Total | ~$0 | ~$20-80 |

---

## 📱 Share Your Live Site

Once deployed, your site is live at:
```
https://your-app-name.railway.app
```

Share this link with:
- Your professor
- Classmates
- Teammates
- Stakeholders

---

## 🎓 Learning Resources

- **Railway Docs**: https://docs.railway.app
- **GitHub Actions**: https://docs.github.com/actions
- **Node.js Deployment**: https://nodejs.org/en/docs/guides/nodejs-web-app/
- **MySQL in Cloud**: https://dev.mysql.com/doc/

---

## ✨ What's Next?

1. **Deploy now** using Railway (5 minutes)
2. **Test everything** on live site
3. **Share with team** (show live demo)
4. **Make Updates** → Auto-deploy on every push
5. **Monitor** performance and logs
6. **Scale up** if needed (more resources)

---

## Support

**Need Help?**
- Railway Support: https://railway.app/support
- GitHub Support: https://support.github.com
- Ask in Railway Discord: https://discord.gg/railway

---

**Good luck deploying! 🚀**
