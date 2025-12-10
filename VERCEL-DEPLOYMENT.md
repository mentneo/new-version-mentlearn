# 🚀 Vercel Deployment Guide for Mentlearn Frontend

## Your Deployment URLs
- **Frontend (Vercel)**: https://new-version-mentlearn.vercel.app
- **Backend (Render)**: https://new-version-mentlearn-3.onrender.com

---

## Quick Deploy to Vercel (3 Steps)

### Step 1: Connect to Vercel
1. Go to https://vercel.com/dashboard
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository: `yeduruabhiram/mindneox.ai`
4. Select the repository

### Step 2: Configure Project
- **Framework Preset**: Create React App
- **Root Directory**: `new-version-mentlearn` (or leave blank if deploying from root)
- **Build Command**: `npm run build`
- **Output Directory**: `build`
- **Install Command**: `npm install`

### Step 3: Set Environment Variables
Go to **Project Settings** → **Environment Variables** and add:

```bash
# Backend API
REACT_APP_API_URL=https://new-version-mentlearn-3.onrender.com
REACT_APP_API_BASE=https://new-version-mentlearn-3.onrender.com/api

# Razorpay (LIVE MODE)
REACT_APP_RAZORPAY_KEY_ID=rzp_live_RW6hQg5iL5Thm2

# Firebase
REACT_APP_FIREBASE_API_KEY=AIzaSyD5TM1O1F1T49UKMbUG0nI7k19FHk6Cvr0
REACT_APP_FIREBASE_AUTH_DOMAIN=mentor-app-238c6.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=mentor-app-238c6
REACT_APP_FIREBASE_STORAGE_BUCKET=mentor-app-238c6.firebasestorage.app
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=943754909900
REACT_APP_FIREBASE_APP_ID=1:943754909900:web:cef25346ffae73d2e20a69
REACT_APP_FIREBASE_MEASUREMENT_ID=G-8T3CMHE740

# Cloudinary
REACT_APP_CLOUDINARY_CLOUD_NAME=dp8bfdbab
REACT_APP_CLOUDINARY_UPLOAD_PRESET=mentneo_uploads

# Build Configuration
CI=false
GENERATE_SOURCEMAP=false
```

### Step 4: Deploy
Click **"Deploy"** and wait 2-3 minutes.

---

## Verify Backend Connection

After deployment, test the connection:

```bash
# Check backend health
curl https://new-version-mentlearn-3.onrender.com/api/health
# Should return: {"status":"ok"}

# Check from frontend
# Open browser console on https://new-version-mentlearn.vercel.app
# Run: fetch(process.env.REACT_APP_API_URL + '/api/health').then(r => r.json()).then(console.log)
```

---

## Payment Gateway Configuration

### ✅ Already Configured:

1. **Razorpay LIVE Mode**: 
   - Key ID: `rzp_live_RW6hQg5iL5Thm2`
   - Secret configured in backend (Render)
   
2. **Backend Integration**:
   - Create Order: `POST /api/razorpay/create-order`
   - Verify Payment: `POST /api/razorpay/verify-payment`
   - Webhook: `POST /api/razorpay/webhook`

3. **Frontend Integration**:
   - Razorpay Checkout SDK loaded
   - Key fetched from backend
   - Payment verification flow complete

### Configure Razorpay Webhooks:

1. Go to https://dashboard.razorpay.com/app/webhooks
2. Click **"Add New Webhook"**
3. Configure:
   ```
   URL: https://new-version-mentlearn-3.onrender.com/api/razorpay/webhook
   Secret: <your-webhook-secret>
   Events: ✓ payment.captured
          ✓ payment.failed
          ✓ order.paid
   ```
4. Save and copy the webhook secret
5. Add to Render backend environment variables:
   ```
   RAZORPAY_WEBHOOK_SECRET=<your-webhook-secret>
   ```

---

## Test Payment Flow

### 1. Local Testing (Optional)
```bash
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
npm start
```

### 2. Production Testing
1. Visit https://new-version-mentlearn.vercel.app
2. Navigate to **Courses** page
3. Click **"Buy Now"** on a paid course
4. Complete checkout with test card:
   ```
   Card: 4111 1111 1111 1111
   CVV: Any 3 digits
   Expiry: Any future date
   ```
5. Verify enrollment in Firebase/Firestore

---

## CORS Configuration

### Backend (Render) Environment Variables:
```bash
FRONTEND_ORIGIN=https://new-version-mentlearn.vercel.app,http://localhost:3000
```

If you encounter CORS errors:
1. Check backend logs in Render dashboard
2. Verify FRONTEND_ORIGIN includes your Vercel URL
3. Restart backend service if needed

---

## Auto-Deploy Setup

### Automatic Deployments:
- **Push to GitHub** → Vercel automatically deploys
- **Frontend**: Updates instantly on push to `main`
- **Backend**: Already configured with Render auto-deploy

### Manual Redeploy:
```bash
# Vercel Dashboard → Deployments → Redeploy
# OR via CLI:
vercel --prod
```

---

## Troubleshooting

### Issue: "Network Error" or CORS
**Solution**: 
- Verify FRONTEND_ORIGIN in Render includes Vercel URL
- Check backend is responding: `curl https://new-version-mentlearn-3.onrender.com/api/health`
- Clear browser cache and hard reload (Cmd+Shift+R)

### Issue: "Payment Failed"
**Solution**:
- Check Razorpay dashboard for error details
- Verify RAZORPAY_KEY_ID matches in frontend and backend
- Check backend logs in Render dashboard
- Ensure Razorpay account is activated for LIVE mode

### Issue: "Course not showing after purchase"
**Solution**:
- Check Firebase console → Firestore → enrollments collection
- Verify user document exists in users collection
- Check browser console for errors
- Enrollment query handles both userId and studentId fields

### Issue: Build fails on Vercel
**Solution**:
- Check build logs for specific errors
- Verify all dependencies in package.json
- Ensure Node.js version matches (20.x)
- Check for TypeScript errors: `npm run build` locally

### Issue: Environment variables not working
**Solution**:
- All React env vars must start with `REACT_APP_`
- Redeploy after adding/changing env vars
- Check Vercel logs for undefined variables
- Don't commit .env files with secrets

---

## Monitoring & Analytics

### Vercel Analytics:
- Enable in Project Settings → Analytics
- Track page views, performance, user flows

### Backend Monitoring:
- Render Dashboard → Metrics
- Monitor CPU, Memory, Bandwidth
- Check response times and error rates

### Razorpay Dashboard:
- Track payments, refunds, disputes
- View settlement status
- Download reports

### Firebase Analytics:
- Already configured with Google Analytics
- Track user behavior, conversions
- Monitor engagement metrics

---

## Security Best Practices

### ✅ Implemented:
- Razorpay keys not exposed (fetched from backend)
- Firebase Admin SDK on backend only
- CORS restricted to specific origins
- HTTPS enforced on both frontend and backend
- Environment variables for all secrets

### Recommendations:
1. Enable Razorpay 2FA for dashboard access
2. Rotate API keys periodically (every 6 months)
3. Monitor Razorpay webhook signatures
4. Set up Firebase security rules
5. Enable rate limiting on backend (future)
6. Add Vercel firewall rules (paid plan)

---

## Cost Breakdown

### Current Setup (Free Tier):
- **Vercel**: Free (with usage limits)
- **Render**: Free (spins down after 15 min inactivity)
- **Firebase**: Free (Spark plan)
- **Razorpay**: Transaction fees only (2% + GST)

### Recommended Upgrades:
- **Render Starter**: $7/month (always-on, faster)
- **Vercel Pro**: $20/month (better analytics, support)
- **Firebase Blaze**: Pay-as-you-go (more generous limits)

---

## Performance Optimization

### Already Implemented:
- React code splitting
- Lazy loading components
- Image optimization
- Firebase query optimization
- Razorpay SDK lazy loaded

### Future Improvements:
- Enable Vercel Edge Functions
- Add service worker for offline support
- Implement Redis caching on backend
- Use CDN for static assets
- Add database indexing for Firestore

---

## Rollback Plan

### If deployment fails:
1. **Vercel**: Dashboard → Deployments → Previous deployment → "Promote to Production"
2. **Backend**: Render Dashboard → Events → Previous deployment → "Redeploy"
3. **Git**: `git revert <commit-hash> && git push`

---

## Support & Documentation

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **Razorpay Docs**: https://razorpay.com/docs
- **Firebase Docs**: https://firebase.google.com/docs
- **React Docs**: https://react.dev

---

## Post-Deployment Checklist

- [ ] Frontend deployed on Vercel
- [ ] Backend deployed on Render
- [ ] All environment variables set
- [ ] Health check passing: `/api/health`
- [ ] CORS configured correctly
- [ ] Payment flow tested end-to-end
- [ ] Razorpay webhook configured
- [ ] Firebase security rules reviewed
- [ ] Course purchase tested
- [ ] User enrollment verified
- [ ] Dashboard displays courses correctly
- [ ] Analytics configured
- [ ] Monitoring enabled
- [ ] Domain configured (if custom domain)
- [ ] SSL/HTTPS working

---

**Your Mentlearn platform is now live! 🎉**

**URLs:**
- 🌐 Frontend: https://new-version-mentlearn.vercel.app
- 🔧 Backend: https://new-version-mentlearn-3.onrender.com
- 💳 Payments: Razorpay LIVE mode active
