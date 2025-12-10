# Backend Deployment Guide - Render.com

## 🚀 Quick Deploy Steps

### 1. Push Backend to GitHub
```bash
cd /Users/yeduruabhiram/Desktop/mentlearn/new-version-mentlearn
git add backend/
git commit -m "Update backend for deployment"
git push origin main
```

### 2. Deploy on Render

#### Option A: Deploy from Dashboard (Recommended)
1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `yeduruabhiram/mindneox.ai`
4. Configure the service:
   - **Name**: `mentlearn-backend` (or `new-version-mentlearn-3`)
   - **Region**: Oregon (US West)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free

#### Option B: Deploy with render.yaml (Auto-deploy)
The `render.yaml` file is already configured. Render will auto-detect it.

### 3. Set Environment Variables in Render Dashboard

Go to your service → **Environment** tab and add these variables:

```env
NODE_ENV=production
PORT=10000

# Frontend Origins (comma-separated)
FRONTEND_ORIGIN=https://mentlearn.in,https://www.mentlearn.in,https://new-version-mentlearn.vercel.app

# Razorpay LIVE Credentials (Copy from your backend/.env file)
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_SECRET=your_razorpay_secret_here

# Firebase Admin SDK (Copy the ENTIRE JSON from backend/.env as ONE LINE)
FIREBASE_SERVICE_ACCOUNT_JSON=your_firebase_service_account_json_here
```

**⚠️ IMPORTANT for Firebase JSON:**
- Copy the entire JSON content from `.env` file
- Paste it as ONE LINE (no line breaks)
- Render will parse it correctly

### 4. Verify Deployment

After deployment completes, test the endpoints:

```bash
# Health check
curl https://your-service.onrender.com/api/health

# Should return: {"status":"ok","timestamp":"...","environment":"production"}
```

## 🔧 Common Deployment Issues & Fixes

### Issue 1: "Missing Firebase service account"
**Solution**: Make sure `FIREBASE_SERVICE_ACCOUNT_JSON` is set in Render environment variables

### Issue 2: Build fails with npm errors
**Solution**: 
- Check that `package.json` exists in `backend/` directory
- Verify Node version is set to `20.x` in `package.json`

### Issue 3: Service crashes on startup
**Solutions**:
- Check Render logs: Dashboard → Your Service → Logs
- Verify all environment variables are set
- Ensure PORT is set to `10000` (Render's default)

### Issue 4: CORS errors from frontend
**Solution**: Update `FRONTEND_ORIGIN` to include all your domains:
```
https://mentlearn.in,https://www.mentlearn.in,https://new-version-mentlearn.vercel.app
```

### Issue 5: Payment webhook not working
**Solution**: 
- Update Razorpay webhook URL to: `https://your-service.onrender.com/api/razorpay/webhook`
- Go to Razorpay Dashboard → Webhooks → Edit webhook URL

## 📝 Post-Deployment Checklist

- [ ] Service is running (green status in Render dashboard)
- [ ] Health check endpoint returns 200 OK
- [ ] Environment variables are all set correctly
- [ ] CORS is configured for your frontend domains
- [ ] Razorpay webhook URL is updated
- [ ] Frontend can connect to backend API
- [ ] Test a payment flow end-to-end

## 🌐 Your Deployment URLs

- **Backend API**: `https://new-version-mentlearn-3.onrender.com`
- **Frontend**: `https://mentlearn.in`
- **Health Check**: `https://new-version-mentlearn-3.onrender.com/api/health`

## 📞 Support

If deployment fails:
1. Check Render logs (Dashboard → Logs tab)
2. Review environment variables
3. Ensure GitHub repo has latest backend code
4. Contact Render support if persistent issues

---

**Last Updated**: December 2025
