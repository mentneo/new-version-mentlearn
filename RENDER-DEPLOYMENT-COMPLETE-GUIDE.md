# 🚀 RENDER DEPLOYMENT - COMPLETE STEP-BY-STEP GUIDE

## ⚠️ CRITICAL: Follow EXACTLY in Order

---

## STEP 1: Go to Render Dashboard Settings

1. Open: **https://dashboard.render.com/**
2. Click on your backend service
3. Click **"Settings"** in the left sidebar

---

## STEP 2: Update Build & Deploy Settings

Scroll to **"Build & Deploy"** section and set these EXACTLY:

### Root Directory
```
(Leave this EMPTY - delete any value if present)
```

### Build Command
```
cd backend && npm install
```

### Start Command
```
./start-backend.sh
```

### Auto-Deploy
```
Yes (should be enabled)
```

**Click "Save Changes"** after updating these fields.

---

## STEP 3: Verify Environment Variables

Scroll to **"Environment Variables"** section. You MUST have these 6 variables:

### 1. NODE_ENV
```
production
```

### 2. PORT
```
10000
```

### 3. FRONTEND_ORIGIN
```
http://localhost:3000,https://new-version-mentlearn.vercel.app,https://www.mentlearn.in,https://mentlearn.in
```

### 4. RAZORPAY_KEY_ID
```
rzp_live_RW6hQg5iL5Thm2
```

### 5. RAZORPAY_SECRET
```
Q3dHSAcCjossSapgKhkBcsxd
```

### 6. FIREBASE_SERVICE_ACCOUNT_JSON
(Copy the ENTIRE JSON from backend/.env file - it's a long string with the private key)

**If any are missing, click "Add Environment Variable" to add them.**

---

## STEP 4: Deploy

1. Go to **"Manual Deploy"** tab (top of page)
2. Click **"Clear build cache & deploy"**
3. Wait 2-3 minutes

---

## ✅ SUCCESS INDICATORS

### In the deployment logs, you should see:

```
==> Cloning from https://github.com/mentneo/new-version-mentlearn
==> Checking out commit...
==> Running build command 'cd backend && npm install'
added XX packages...
==> Build succeeded 🎉
==> Running './start-backend.sh'
🔍 Checking current directory...
📁 Not in backend directory, navigating to backend...
✅ In backend directory
🚀 Starting backend server...
🚀 Server running on port 10000
✅ Firebase initialized successfully
==> Your service is live 🎉
```

### ❌ WRONG - If you see any of these:

```
> react-scripts start           ← You're running frontend, not backend!
sh: start-backend.sh: not found ← Start command is wrong
Invalid Host header             ← Host validation issue (we'll fix next)
Permission denied               ← Script not executable (we'll fix)
```

---

## STEP 5: Test the Deployment

Once deployed, test the health endpoint:

```bash
curl https://YOUR-SERVICE-NAME.onrender.com/api/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-12-11T...",
  "environment": "production",
  "firebase": "connected"
}
```

---

## 🐛 TROUBLESHOOTING COMMON ERRORS

### Error: "Invalid Host header"

**Cause:** Server is rejecting Render's host header
**Fix:** The server.js already has the fix. Make sure you deployed the latest code.

### Error: "sh: start-backend.sh: Permission denied"

**Cause:** Script is not executable
**Fix:** The script should already be executable. If not, we'll fix it.

### Error: "react-scripts: not found"

**Cause:** Render is trying to run the frontend instead of backend
**Fix:** Make sure "Start Command" is `./start-backend.sh` (NOT `npm start`)

### Error: "Firebase credentials not found"

**Cause:** FIREBASE_SERVICE_ACCOUNT_JSON environment variable is missing or invalid
**Fix:** Copy the ENTIRE JSON from backend/.env (it's very long, includes the private key)

---

## 📝 CHECKLIST BEFORE DEPLOYING

- [ ] Root Directory is EMPTY (not "backend")
- [ ] Build Command is: `cd backend && npm install`
- [ ] Start Command is: `./start-backend.sh`
- [ ] All 6 environment variables are set
- [ ] FIREBASE_SERVICE_ACCOUNT_JSON is the complete JSON (very long string)
- [ ] Clicked "Save Changes" after updating settings
- [ ] Used "Clear build cache & deploy" (not just "Deploy")

---

## 🎯 WHAT HAPPENS WHEN YOU DEPLOY

1. Render clones your GitHub repo
2. Runs `cd backend && npm install` (installs backend dependencies)
3. Runs `./start-backend.sh` which:
   - Checks current directory
   - Navigates to backend/ if needed
   - Starts Node.js server on port 10000
4. Server accepts connections on port 10000
5. Render proxies requests to your service URL

---

## 🔄 AFTER SUCCESSFUL DEPLOYMENT

### Update Frontend to Use Production Backend

1. Go to **Vercel Dashboard**: https://vercel.com
2. Click on your **mentlearn** project
3. Go to **Settings** → **Environment Variables**
4. Update or add:
   - Key: `REACT_APP_API_URL`
   - Value: `https://YOUR-RENDER-SERVICE-NAME.onrender.com`
5. Click **Save**
6. Go to **Deployments** → Click **"..."** on latest → **"Redeploy"**

---

## 📞 NEED HELP?

If deployment fails, copy the ENTIRE deployment log from Render and share it.
The logs show exactly what's going wrong!

To get logs:
1. Go to your service on Render
2. Click **"Logs"** tab
3. Copy everything and share

---

**Good luck! Follow each step carefully.** 🚀
