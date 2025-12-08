# 🚀 Production Deployment - Payment Gateway Fix

## ✅ What Was Fixed

### Issue
Payment failing on production: https://www.mentlearn.in

### Root Cause
Backend CORS not allowing requests from `mentlearn.in` domain

### Solution Applied
Updated backend `FRONTEND_ORIGIN` to include all production domains:
```bash
FRONTEND_ORIGIN=https://www.mentlearn.in,https://mentlearn.in,https://new-version-mentlearn.vercel.app
```

---

## 🔧 Required Actions

### 1. Update Render Backend (CRITICAL)

Go to: https://dashboard.render.com → Select `mentlearn-backend` → Environment

**Update this variable:**
```bash
FRONTEND_ORIGIN=https://www.mentlearn.in,https://mentlearn.in,https://new-version-mentlearn.vercel.app,http://localhost:3000
```

**Then:**
1. Click "Save Changes"
2. Click "Manual Deploy" → "Deploy latest commit"  
3. Wait 2-3 minutes for deployment

### 2. Verify Backend CORS

Test CORS is working:
```bash
curl -H "Origin: https://www.mentlearn.in" \
  -H "Access-Control-Request-Method: POST" \
  -X OPTIONS \
  https://new-version-mentlearn-3.onrender.com/api/razorpay/create-order
```

Should return **200 OK** with CORS headers.

### 3. Test Payment Flow

1. Visit: https://www.mentlearn.in/courses
2. Click "Buy Now" on any paid course
3. Click "Pay ₹{amount}" button
4. Razorpay modal should open
5. Complete payment
6. Should redirect to success page

---

## 📋 Environment Variables Checklist

### Vercel (Frontend)
```bash
✅ REACT_APP_API_URL=https://new-version-mentlearn-3.onrender.com
✅ REACT_APP_RAZORPAY_KEY_ID=rzp_live_RW6hQg5iL5Thm2
✅ REACT_APP_FIREBASE_API_KEY=AIzaSyD5TM1O1F1T49UKMbUG0nI7k19FHk6Cvr0
✅ REACT_APP_FIREBASE_PROJECT_ID=mentor-app-238c6
✅ CI=false
✅ GENERATE_SOURCEMAP=false
```

### Render (Backend)
```bash
✅ NODE_ENV=production
✅ PORT=10000
⚠️  FRONTEND_ORIGIN=https://www.mentlearn.in,https://mentlearn.in,https://new-version-mentlearn.vercel.app
✅ RAZORPAY_KEY_ID=rzp_live_RW6hQg5iL5Thm2
✅ RAZORPAY_SECRET=Q3dHSAcCjossSapgKhkBcsxd
✅ FIREBASE_SERVICE_ACCOUNT_JSON={...}
```

⚠️ = **Must update this variable in Render dashboard**

---

## 🧪 Testing Commands

```bash
# 1. Test backend health
curl https://new-version-mentlearn-3.onrender.com/api/health
# Expected: {"status":"ok"}

# 2. Test CORS from mentlearn.in
curl -H "Origin: https://www.mentlearn.in" \
  -H "Access-Control-Request-Method: POST" \
  -X OPTIONS \
  https://new-version-mentlearn-3.onrender.com/api/razorpay/create-order
# Expected: 200 OK

# 3. Check frontend is live
curl -I https://www.mentlearn.in
# Expected: 200 OK
```

---

## 🐛 Troubleshooting

### Payment Still Fails?

1. **Check Render Logs**
   - Go to: https://dashboard.render.com
   - Select: mentlearn-backend
   - Click: Logs tab
   - Look for: CORS errors or "origin not allowed"

2. **Verify FRONTEND_ORIGIN**
   - Must include: `https://www.mentlearn.in`
   - Must include: `https://mentlearn.in` (without www)
   - Comma-separated, no spaces

3. **Hard Refresh Browser**
   - Mac: Cmd+Shift+R
   - Windows: Ctrl+Shift+R
   - Or use Incognito/Private mode

4. **Check Browser Console**
   - Open DevTools (F12)
   - Look for CORS errors
   - Look for API call failures

---

## ✅ Success Checklist

- [ ] Updated `FRONTEND_ORIGIN` in Render
- [ ] Redeployed backend in Render
- [ ] Waited 3 minutes for deployment
- [ ] Tested backend health endpoint (returns 200)
- [ ] Tested CORS (returns 200 with headers)
- [ ] Cleared browser cache
- [ ] Tested payment on https://www.mentlearn.in
- [ ] Payment modal opens successfully
- [ ] Payment completes successfully
- [ ] Redirects to success page
- [ ] Enrollment created in Firebase
- [ ] Course appears in dashboard

---

## 📞 Quick Support

**If payment still doesn't work after following all steps:**

1. Check Render deployment status
2. Review Render logs for errors
3. Test with browser DevTools open
4. Share error message from console

**Common Issues:**
- "CORS policy blocked" → Update FRONTEND_ORIGIN
- "Failed to fetch" → Backend not responding
- "Invalid key" → Check Razorpay key in Vercel

---

**After updating Render, payment should work! 🎉**
