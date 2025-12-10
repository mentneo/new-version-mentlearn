# Complete Deployment Guide - Mentlearn Platform

## 🎯 Deployment Overview

**Frontend (React)** → Deploy to **Vercel**  
**Backend (Node.js/Express)** → Deploy to **Render**

---

## 🌐 Frontend Deployment (Vercel)

### Prerequisites
- Vercel account connected to your GitHub
- Repository: `yeduruabhiram/mindneox.ai`

### Steps:

#### 1. Push Latest Code to GitHub
```bash
cd /Users/yeduruabhiram/Desktop/mentlearn/new-version-mentlearn
git add .
git commit -m "Update frontend for production"
git push origin main
```

#### 2. Deploy on Vercel Dashboard

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New"** → **"Project"**
3. Import your repository: `mindneox.ai`
4. Configure the project:
   - **Framework Preset**: Create React App
   - **Root Directory**: `./` (leave as root)
   - **Build Command**: `npm run build`
   - **Output Directory**: `build`
   - **Install Command**: `npm install`

#### 3. Set Environment Variables in Vercel

Go to **Project Settings** → **Environment Variables** and add:

```env
# Firebase Configuration (from your Firebase project)
REACT_APP_FIREBASE_API_KEY=your-api-key
REACT_APP_FIREBASE_AUTH_DOMAIN=mentor-app-238c6.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=mentor-app-238c6
REACT_APP_FIREBASE_STORAGE_BUCKET=mentor-app-238c6.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
REACT_APP_FIREBASE_APP_ID=your-app-id

# Backend API URL (from Render deployment)
REACT_APP_API_URL=https://new-version-mentlearn-3.onrender.com

# Razorpay (Frontend needs only the KEY_ID, not the secret)
REACT_APP_RAZORPAY_KEY_ID=rzp_live_RW6hQg5iL5Thm2
```

#### 4. Configure Custom Domain

1. Go to **Project Settings** → **Domains**
2. Add your domains:
   - `mentlearn.in`
   - `www.mentlearn.in`
3. Update DNS records as instructed by Vercel

#### 5. Deploy

Click **"Deploy"** - Vercel will automatically:
- Install dependencies
- Build the React app
- Deploy to CDN
- Assign production URL

**✅ Frontend will be live at**: `https://mentlearn.in`

---

## 🖥️ Backend Deployment (Render)

### Prerequisites
- Render account connected to your GitHub
- Repository: `yeduruabhiram/mindneox.ai`

### Steps:

#### 1. Push Backend Code to GitHub
```bash
cd /Users/yeduruabhiram/Desktop/mentlearn/new-version-mentlearn
git add backend/
git commit -m "Update backend for Render deployment"
git push origin main
```

#### 2. Create New Web Service on Render

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `yeduruabhiram/mindneox.ai`
4. Configure the service:
   - **Name**: `mentlearn-backend` or `new-version-mentlearn-3`
   - **Region**: Oregon (US West)
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Plan**: Free (or Starter for better performance)

#### 3. Set Environment Variables in Render

Go to **Environment** tab and add:

```env
NODE_ENV=production
PORT=10000

# Frontend Origins (CRITICAL for CORS)
FRONTEND_ORIGIN=https://mentlearn.in,https://www.mentlearn.in,https://new-version-mentlearn.vercel.app,http://localhost:3000

# Razorpay LIVE Credentials (Copy from your backend/.env file)
RAZORPAY_KEY_ID=your_razorpay_key_id_here
RAZORPAY_SECRET=your_razorpay_secret_here

# Firebase Admin SDK (Copy the ENTIRE JSON from backend/.env as ONE LINE)
FIREBASE_SERVICE_ACCOUNT_JSON=your_firebase_service_account_json_here
```

**⚠️ CRITICAL**: Copy the entire Firebase JSON as ONE SINGLE LINE (no line breaks)

#### 4. Deploy on Render

Click **"Create Web Service"** - Render will:
- Clone the repository
- Navigate to `backend/` directory
- Run `npm install`
- Start the server with `npm start`
- Expose it on port 10000

**✅ Backend will be live at**: `https://new-version-mentlearn-3.onrender.com`

---

## ✅ Post-Deployment Checklist

### Backend Verification
- [ ] Service status is "Live" (green) in Render dashboard
- [ ] Health check works: `https://new-version-mentlearn-3.onrender.com/api/health`
- [ ] Environment variables are all set
- [ ] Logs show no errors

### Frontend Verification
- [ ] Site loads at `https://mentlearn.in`
- [ ] Login/signup works
- [ ] Can browse courses
- [ ] Payment flow works
- [ ] No console errors

### Integration Tests
- [ ] Frontend can connect to backend API
- [ ] CORS is working (no CORS errors in browser console)
- [ ] Payment gateway integration works
- [ ] Firebase authentication works
- [ ] Razorpay webhook receives events

---

## 🔧 Common Issues & Solutions

### Issue: React app shows "react-scripts start" error on Render
**Why**: Render is trying to run development server instead of serving built files
**Solution**: Don't deploy React app to Render - use Vercel instead!

### Issue: CORS errors between frontend and backend
**Solution**: Add all frontend domains to `FRONTEND_ORIGIN` in Render:
```
https://mentlearn.in,https://www.mentlearn.in,https://new-version-mentlearn.vercel.app
```

### Issue: "Missing Firebase service account" on Render
**Solution**: Ensure `FIREBASE_SERVICE_ACCOUNT_JSON` is pasted as ONE LINE

### Issue: Payments fail in production
**Solutions**:
1. Check Razorpay credentials are LIVE keys (not test)
2. Update webhook URL in Razorpay dashboard
3. Verify backend URL in frontend `.env`

---

## 🌐 Final Production URLs

| Service | Platform | URL |
|---------|----------|-----|
| Frontend | Vercel | https://mentlearn.in |
| Backend API | Render | https://new-version-mentlearn-3.onrender.com |
| Health Check | Render | https://new-version-mentlearn-3.onrender.com/api/health |

---

**Last Updated**: December 2025
