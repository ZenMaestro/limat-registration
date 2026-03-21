# 🚀 LIMAT Deployment Checklist

## Pre-Deployment Checklist

### Code Preparation
- [ ] All code committed to Git
- [ ] No sensitive data in code (check for hardcoded passwords)
- [ ] .env.example created with all variables
- [ ] .gitignore properly configured
- [ ] No node_modules/ or .env in Git history

### Testing
- [ ] Backend server runs locally: `npm start`
- [ ] Frontend loads correctly
- [ ] Database connection works locally
- [ ] Admin login works
- [ ] Student login works
- [ ] API endpoints respond correctly

### Documentation
- [ ] README.md updated with setup instructions
- [ ] DEPLOYMENT_GUIDE.md reviewed
- [ ] DEPLOYMENT_QUICK_START.md reviewed
- [ ] Environment variables documented

### GitHub Setup
- [ ] Repository created on GitHub
- [ ] Code pushed to main branch
- [ ] .github/workflows/deploy.yml present
- [ ] GitHub Actions visible in Actions tab

---

## Railway Deployment (Recommended)

### Account & Project Setup
- [ ] Railway account created
- [ ] GitHub connected to Railway
- [ ] New project created
- [ ] Repository selected
- [ ] Main branch selected for deployment

### Backend Service Configuration
- [ ] Backend service created
- [ ] Node.js detected automatically
- [ ] Environment variables added:
  - [ ] PORT = 5000
  - [ ] NODE_ENV = production
  - [ ] DB_HOST
  - [ ] DB_USER
  - [ ] DB_PASSWORD
  - [ ] DB_NAME
  - [ ] JWT_SECRET

### Database Setup
- [ ] MySQL add-on provisioned
- [ ] Database credentials copied to environment
- [ ] Initial schema imported (if needed)
- [ ] Admin user created in database

### Deployment
- [ ] Click "Deploy" button
- [ ] Build completes successfully
- [ ] No errors in logs
- [ ] App shows "Running" status
- [ ] Health endpoint responds: https://app.railway.app/api/health

### Post-Deployment Verification
- [ ] Frontend API_BASE updated to production URL
- [ ] Browser can access https://app.railway.app
- [ ] Login page loads
- [ ] Admin can log in
- [ ] Student can log in
- [ ] Dashboard displays correctly

---

## Azure Deployment (Enterprise Option)

### Azure Account Setup
- [ ] Azure account created
- [ ] Subscription confirmed (free credits available)
- [ ] Resource group created: limat-rg
- [ ] Region selected: eastus or closer to users

### App Service Setup
- [ ] App Service Plan created (FREE tier for testing)
- [ ] Web App created: limat-registration
- [ ] Runtime: Node.js 20 LTS
- [ ] Region: Same as resource group

### Database Setup
- [ ] Azure Database for MySQL created
- [ ] Admin credentials set
- [ ] Firewall rules configured
- [ ] Connection string obtained
- [ ] Schema imported
- [ ] Test data created

### Environment Variables
- [ ] All variables set in App Service Configuration:
  - [ ] WEBSITES_ENABLE_APP_SERVICE_STORAGE = false
  - [ ] SCM_DO_BUILD_DURING_DEPLOYMENT = true
  - [ ] All DB and JWT variables

### GitHub Deployment Integration
- [ ] GitHub repository connected to App Service
- [ ] Deployment Center configured
- [ ] Azure Credentials saved as GitHub Secret
- [ ] GitHub Actions workflow created

### Initial Deployment
- [ ] Push code to GitHub
- [ ] GitHub Actions workflow triggers
- [ ] Build completes in GitHub Actions
- [ ] Deploy to App Service completes
- [ ] App shows "Running" in Azure Portal

### Post-Deployment Verification
- [ ] Visit https://limat-registration.azurewebsites.net
- [ ] Health endpoint works
- [ ] All logins work
- [ ] Database queries return data
- [ ] Check Azure Portal → App Service → Log stream for any errors

---

## Auto-Deploy Configuration

### GitHub Actions Trigger
- [ ] Workflow file present: .github/workflows/deploy.yml
- [ ] Triggers on push to main branch
- [ ] Triggers on pull requests (testing)
- [ ] Manual trigger available (workflow_dispatch)

### Testing Auto-Deploy
- [ ] Make small code change
- [ ] Commit: `git commit -m "Test auto-deploy"`
- [ ] Push: `git push origin main`
- [ ] Watch GitHub Actions run
- [ ] Verify changes appear on live site (1-5 min)

### Monitoring Deployments
- [ ] Check GitHub Actions tab after every push
- [ ] Review logs if deployment fails
- [ ] Monitor Railway/Azure dashboard logs
- [ ] Set up email alerts (if available)

---

## Security Checklist

### Secrets Management
- [ ] No passwords in code
- [ ] .env file in .gitignore
- [ ] secrets never logged
- [ ] JWT_SECRET is strong (32+ chars)
- [ ] Database passwords are complex

### Database Security
- [ ] Database user has minimal required permissions
- [ ] Firewall restricts access to needed IPs only
- [ ] SSL enabled for database connections
- [ ] Regular backups configured

### API Security
- [ ] All endpoints require authentication (except login)
- [ ] Role-based access control enforced
- [ ] CORS configured properly
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (using parameterized queries)

### Deployment Security
- [ ] HTTPS enforced (no HTTP)
- [ ] Environment variables never in Git
- [ ] GitHub repository set to private (if required)
- [ ] Deployment secrets protected
- [ ] Regular security updates for dependencies

---

## Monitoring & Maintenance

### Daily
- [ ] Check app status (should be "Running")
- [ ] Monitor error logs if issues reported
- [ ] Verify no unauthorized access attempts

### Weekly
- [ ] Review GitHub Actions runs
- [ ] Check deployment history
- [ ] Monitor resource usage (CPU, memory)
- [ ] Test critical user flows

### Monthly
- [ ] Review and update dependencies
- [ ] Check for security vulnerabilities: `npm audit`
- [ ] Review database backups
- [ ] Update documentation if needed
- [ ] Plan for scaling if needed

---

## Rollback Plan

If deployment fails:

1. **Check logs** in GitHub Actions or Railway
2. **Identify issue** (database connection, syntax error, etc.)
3. **Fix locally** and test
4. **Commit fix**: `git commit -m "Fix deployment issue"`
5. **Push fix**: `git push origin main`
6. **Redeploy** automatically via GitHub Actions

If rollback to previous version needed:

```bash
# Revert to previous commit
git revert HEAD~1
git push origin main

# Previous working version redeploys automatically
```

---

## Performance Monitoring

### Key Metrics to Monitor
- [ ] Response time < 500ms
- [ ] Database queries < 100ms
- [ ] CPU usage < 70%
- [ ] Memory usage < 70%
- [ ] Error rate < 1%

### Tools to Use
- [ ] Railway/Azure dashboard metrics
- [ ] Application Performance Monitoring (if added)
- [ ] Browser DevTools (frontend performance)
- [ ] MySQL slow query log (database performance)

---

## Scaling Considerations

### When to Scale Up
- [ ] App approaching CPU/memory limits
- [ ] Response times increasing
- [ ] More than 1000 concurrent users
- [ ] Database queries becoming slow

### Options
- [ ] Increase App Service tier (Azure)
- [ ] Increase Railway memory allocation
- [ ] Upgrade database plan
- [ ] Add caching layer (Redis)

---

## Troubleshooting During Deployment

### Build Fails
```
1. Check syntax errors in code
2. Verify all imports are correct
3. Check package.json exists in root
4. Verify dependencies installed locally
```

### Deploy Fails After Build
```
1. Check environment variables are set
2. Verify database is reachable
3. Check JWT_SECRET is configured
4. Review error in deployment logs
```

### Site Won't Load
```
1. Check app status in dashboard
2. Verify port 5000 is correct
3. Check CORS configuration
4. Review "Log stream" for errors
```

### Database Connection Error
```
1. Check DB connection string
2. Verify credentials
3. Test from local machine
4. Check firewall rules
5. Verify schema is imported
```

---

## Success Criteria ✅

Your deployment is successful when:

- [ ] Site loads without errors
- [ ] Health endpoint returns 200: `/api/health`
- [ ] Admin can login and access dashboard
- [ ] Student can login and register for courses
- [ ] Database queries work correctly
- [ ] Changes auto-deploy on git push
- [ ] Live site URL is shareable and working
- [ ] No sensitive data exposed
- [ ] Performance is acceptable
- [ ] Monitoring/logs are accessible

---

## Celebration! 🎉

When everything is deployed and working:

1. Share live URL with your team/professor
2. Test all features on production
3. Set up monitoring alerts
4. Begin using for real data
5. Start collecting feedback

---

## Notes

**Deployed at**: ___________________
**Platform used**: ___________________
**Live URL**: ___________________
**Database**: ___________________
**Status**: ✅ Live and Ready!

---

**Document created**: March 21, 2026
**Last updated**: ___________________
**Next review date**: ___________________
