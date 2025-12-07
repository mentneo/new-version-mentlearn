# 🚀 Render Deployment Quick Reference

## Deploy in 3 Steps

### Step 1: Push to GitHub
```bash
cd /Users/yeduruabhiram/Desktop/mentlearn/new-version-mentlearn/backend
git add .
git commit -m "fix: prepare backend for Render deployment"
git push origin main
```

### Step 2: Create Render Service
1. Go to https://render.com/dashboard
2. Click **"New +"** → **"Web Service"**
3. Connect repo: `yeduruabhiram/mindneox.ai`
4. Configure:
   - **Root Directory**: `new-version-mentlearn/backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or Starter for always-on)

### Step 3: Set Environment Variables
Click **"Environment"** tab and add:

```bash
NODE_ENV=production
PORT=10000
FRONTEND_ORIGIN=https://new-version-mentlearn.vercel.app
RAZORPAY_KEY_ID=rzp_live_RW6hQg5iL5Thm2
RAZORPAY_SECRET=Q3dHSAcCjossSapgKhkBcsxd
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"mentor-app-238c6",...entire JSON here...}
```

**That's it! Click "Create Web Service"** ✅

---

## Your Backend URL
After deployment, Render gives you:
```
https://mentlearn-backend.onrender.com
```

## Update Frontend
Update your frontend environment:
```bash
# .env.production (Vercel)
REACT_APP_API_URL=https://mentlearn-backend.onrender.com
```

Your frontend: https://new-version-mentlearn.vercel.app

## Test Deployment
```bash
# Health check
curl https://mentlearn-backend.onrender.com/api/health
# Should return: {"status":"ok"}

# Extended health
curl https://mentlearn-backend.onrender.com/_health
# Should return: {"ok":true,"uptime":123.45}
```

## Environment Variables Checklist
- [ ] `NODE_ENV=production`
- [ ] `PORT=10000`
- [ ] `FRONTEND_ORIGIN` (your frontend URL)
- [ ] `RAZORPAY_KEY_ID` (from Razorpay dashboard)
- [ ] `RAZORPAY_SECRET` (from Razorpay dashboard)
- [ ] `FIREBASE_SERVICE_ACCOUNT_JSON` (entire Firebase JSON)

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Build fails | Check Node version, run `npm install` locally |
| Server crashes | Verify all env vars set, check Render logs |
| CORS errors | Add frontend domain to `FRONTEND_ORIGIN` |
| Firebase error | Ensure `FIREBASE_SERVICE_ACCOUNT_JSON` is complete JSON |

## Monitoring
Set up UptimeRobot to ping every 5 minutes:
```
https://mentlearn-backend.onrender.com/api/health
```
This keeps Free tier warm and monitors uptime.

## Important Notes
- **Free Tier**: Spins down after 15 min inactivity (30-60s cold start)
- **Starter Plan**: Always-on, faster, no cold starts ($7/month)
- **Auto-Deploy**: Pushes to `main` automatically trigger redeployment
- **Logs**: View real-time logs in Render Dashboard → Logs tab
- **Rollback**: Dashboard → Events → Redeploy previous version

## Files Created
✅ `render.yaml` - Render configuration
✅ `RENDER-DEPLOYMENT.md` - Complete guide (6,600 words)
✅ `DEPLOYMENT-FIXES.md` - Changes summary
✅ `check-deployment.sh` - Pre-deployment validator
✅ `.gitignore` - Protects sensitive files
✅ `.env.example` - Environment template
✅ `QUICK-DEPLOY.md` - This file

## Need Help?
- 📖 **Full Guide**: See `RENDER-DEPLOYMENT.md`
- 🔍 **Validate**: Run `./check-deployment.sh`
- 📊 **Monitor**: Render Dashboard → Metrics
- 📝 **Logs**: Render Dashboard → Logs

---

**Ready to deploy! Follow steps 1-3 above. 🚀**
