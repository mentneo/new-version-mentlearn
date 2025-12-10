# Render Backend Troubleshooting Guide

## ❌ Current Error: Bad Gateway (502)

**Error Message**: "This service is currently unavailable"

This means your backend server is failing to start or crashing immediately after startup.

---

## 🔍 Step-by-Step Debugging

### 1. Check Render Logs (MOST IMPORTANT)

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click on your service (e.g., `mentlearn-backend` or `new-version-mentlearn-3`)
3. Click on **"Logs"** tab
4. Look for error messages - common ones:

```
❌ Missing Firebase service account
❌ Cannot find module 'express'
❌ EADDRINUSE: address already in use
❌ Error: Invalid Firebase credentials
❌ Razorpay keys missing
```

### 2. Verify Environment Variables

Go to **Environment** tab and ensure ALL these are set:

**Required Variables:**
- [ ] `NODE_ENV` = `production`
- [ ] `PORT` = `10000`
- [ ] `FRONTEND_ORIGIN` = your frontend domains (comma-separated)
- [ ] `RAZORPAY_KEY_ID` = your Razorpay key
- [ ] `RAZORPAY_SECRET` = your Razorpay secret  
- [ ] `FIREBASE_SERVICE_ACCOUNT_JSON` = your Firebase JSON (ONE LINE, no line breaks!)

**How to get the values:**
```bash
# On your local machine:
cd /Users/yeduruabhiram/Desktop/mentlearn/new-version-mentlearn/backend
cat .env
```

Copy each value and paste into Render.

### 3. Common Issues & Fixes

#### Issue 1: Firebase JSON Format Error
**Symptoms**: Logs show "Missing Firebase service account" or JSON parse error
**Solution**:
1. Open `backend/.env` file locally
2. Copy the ENTIRE `FIREBASE_SERVICE_ACCOUNT_JSON` value
3. It should be ONE LONG LINE (no line breaks!)
4. Paste it exactly as is into Render

**Test it locally first:**
```bash
cd backend
node -e "const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON; console.log(JSON.parse(json).project_id)"
```
Should output: `mentor-app-238c6`

#### Issue 2: Missing Dependencies
**Symptoms**: Logs show "Cannot find module 'xxx'"
**Solution**:
- Ensure `package.json` exists in `backend/` folder
- Trigger a manual deploy to reinstall dependencies
- Check build logs for npm install errors

#### Issue 3: Port Binding Error  
**Symptoms**: Logs show "EADDRINUSE" or "Port already in use"
**Solution**:
- Ensure `PORT` environment variable is set to `10000`
- Check `server.js` binds to `process.env.PORT`
- Restart the service

#### Issue 4: Build Command Fails
**Symptoms**: Deployment shows "Build failed"
**Solution**:
1. Check `package.json` exists in correct location
2. Verify Node version: Should be `20.x`
3. Check for syntax errors in `server.js`

---

## ✅ Quick Fix Checklist

### If Backend Won't Start:

1. **Check the logs first** - this tells you the exact error
2. **Verify all environment variables are set**
3. **Re-deploy manually**:
   - Go to Render Dashboard
   - Click "Manual Deploy" → "Deploy latest commit"
4. **Check build logs** during deployment
5. **Wait 2-3 minutes** after deployment before testing

### Test if Backend is Running:

```bash
# Health check endpoint
curl https://your-service-name.onrender.com/api/health

# Should return:
# {"status":"ok","timestamp":"...","environment":"production"}
```

---

## 🚀 Manual Deployment Steps

If auto-deploy isn't working:

### 1. From Render Dashboard:
1. Go to your service
2. Click "Manual Deploy" dropdown (top right)
3. Select "Deploy latest commit"
4. Monitor the logs during deployment

### 2. From Command Line:
```bash
# Ensure latest code is on GitHub
cd /Users/yeduruabhiram/Desktop/mentlearn/new-version-mentlearn
git add backend/
git commit -m "Fix backend configuration"
git push origin main

# Then trigger deploy from Render dashboard
```

---

## 📊 Expected Successful Logs

When the backend starts correctly, you should see:

```
Building...
-----> Installing dependencies
       npm install
-----> Build succeeded
Deploying...
-----> Starting server
✅ Firebase credentials loaded
✅ Razorpay client initialized
🚀 Server listening on 0.0.0.0:10000
```

---

## 🔧 Local Testing Before Deploy

Always test locally first:

```bash
cd backend

# Set environment variables from .env
source .env  # or: export $(cat .env | xargs)

# Start server
npm start

# Test in another terminal:
curl http://localhost:5001/api/health
```

If it works locally but not on Render, it's an environment variable issue!

---

## 📞 Get Specific Error Details

**To get the exact error:**

1. Open Render Dashboard
2. Go to Logs tab
3. Scroll to the bottom
4. Copy the last 20-30 lines of logs
5. Share them with me so I can diagnose the specific issue

**Common log patterns to look for:**
- `Error:` - Shows what failed
- `at Object.<anonymous>` - Shows which file has the error
- `Missing` - Shows what's not configured
- `Cannot` - Shows what the app can't do

---

## 🎯 Next Steps

1. **Go to Render Dashboard → Logs tab RIGHT NOW**
2. **Copy the error messages**
3. **Check which environment variables are missing**
4. **Add them in the Environment tab**
5. **Click "Save Changes" and wait for auto-redeploy**

The logs will tell us exactly what's wrong!

---

**Last Updated**: December 2025
