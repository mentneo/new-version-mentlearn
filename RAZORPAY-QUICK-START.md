# 🚀 Quick Start Guide - Razorpay Course Payments

Get the Razorpay course purchase system running in 5 minutes!

## Prerequisites

- ✅ Node.js 18+ installed
- ✅ npm 9+ installed
- ✅ MongoDB running (local or cloud)
- ✅ Firebase project setup
- ✅ Razorpay account (free test account)

## Step 1: Get Your Razorpay Test Keys (2 min)

1. Go to [https://razorpay.com](https://razorpay.com) and sign up
2. After signup, go to **Dashboard → Settings → API Keys**
3. Switch to **Test Mode** (top right toggle)
4. Click **Generate Test Keys**
5. Copy your:
   - **Key ID** (starts with `rzp_test_`)
   - **Key Secret** (keep this secret!)

## Step 2: Configure Backend (1 min)

Create `backend/.env` file:

```env
# Server
PORT=5001

# MongoDB (use your connection string)
MONGO_URI=mongodb://127.0.0.1:27017/mentneo

# Frontend URL
FRONTEND_ORIGIN=http://localhost:3000

# Firebase Admin (paste your service account JSON)
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"your-project",...}

# Razorpay TEST Keys (paste from Step 1)
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=your_secret_key_here
RAZORPAY_SECRET=your_secret_key_here
```

**To get Firebase service account JSON:**
1. Go to Firebase Console → Project Settings → Service Accounts
2. Click "Generate New Private Key"
3. Copy the entire JSON content

## Step 3: Configure Frontend (30 sec)

Create or update `.env` in project root:

```env
# Backend API URL
REACT_APP_API_URL=http://localhost:5001
```

## Step 4: Start the Application (1 min)

### Terminal 1 - Start Backend
```bash
cd backend
npm start
```

You should see:
```
MongoDB connected
Server listening on 5001
```

### Terminal 2 - Start Frontend
```bash
npm start
```

Frontend opens at `http://localhost:3000`

## Step 5: Test the Flow (1 min)

1. **Open** `http://localhost:3000`
2. **Click** "Courses" in the navigation
3. **Browse** available courses
4. **Click** "Buy Now" on any course
5. **Sign up** if not logged in
6. **Review** course details on checkout page
7. **Click** "Pay ₹XXX" button
8. **Use test card** in Razorpay popup:
   - Card: `4111 1111 1111 1111`
   - CVV: `123`
   - Expiry: Any future date
   - Name: Your name
9. **See** success page with confetti! 🎉
10. **Verify** you're enrolled in the dashboard

## 🎯 Test Cards

Use these in Razorpay test mode:

### Success Payment
- **Card**: `4111 1111 1111 1111`
- **CVV**: Any 3 digits
- **Expiry**: Any future date

### Failed Payment
- **Card**: `4000 0000 0000 0002`

### Test UPI
- **Success**: `success@razorpay`
- **Failure**: `failure@razorpay`

## 📋 Quick Checklist

Before testing, make sure:

- [ ] MongoDB is running
- [ ] Backend `.env` has all required variables
- [ ] Backend started successfully (check terminal)
- [ ] Frontend `.env` has API URL
- [ ] Frontend started successfully
- [ ] You have at least one course in Firestore `courses` collection
- [ ] Course has `published: true` and `price` field

## 🔥 Common Issues

### "Failed to create order"
**Fix**: Check Razorpay keys in `backend/.env` are correct

### "CORS error"
**Fix**: Verify `FRONTEND_ORIGIN=http://localhost:3000` in `backend/.env`

### "Course not found"
**Fix**: Create a test course in Firestore:
```javascript
// In Firestore, add to 'courses' collection:
{
  title: "Test Course",
  description: "A test course for payments",
  price: 499,
  published: true,
  level: "beginner",
  duration: 10
}
```

### Backend won't start
**Fix**: Run `cd backend && npm install` to install dependencies

### Razorpay not opening
**Fix**: Check browser console for errors. Clear cache and reload.

## 🎓 What's Next?

✅ Test with different courses and prices
✅ Try the coupon code field (backend is ready)
✅ Test payment failure scenarios
✅ Check enrollments in Firestore
✅ Review analytics logs in console

## 📚 Full Documentation

For complete setup, API reference, and production deployment:
- See `RAZORPAY-INTEGRATION-GUIDE.md`

## 🆘 Need Help?

1. Check the console logs (both frontend and backend)
2. Verify all environment variables are set
3. Try the test cards listed above
4. Check Razorpay Dashboard for payment logs

---

**Ready to go live?**
Switch to Razorpay **Live Mode** keys and enable HTTPS before production deployment.
See full guide for production checklist.
