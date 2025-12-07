# 🚀 START HERE - Razorpay Integration

## ✅ What's Done

Your Mentlearn platform now has a complete course purchase system with Razorpay payment integration!

### What Users Can Do:
- ✅ Browse all courses on public `/courses` page
- ✅ Search and filter courses
- ✅ View detailed course information
- ✅ Purchase courses with Razorpay (cards, UPI, wallets)
- ✅ Get automatically enrolled after payment
- ✅ Access purchased courses from dashboard

## 🎯 Quick Start (2 Minutes)

### Step 1: Start Backend
```bash
cd backend
npm start
```

**Should see:**
```
✅ Firebase credentials loaded
MongoDB connected
Server listening on 5001
```

### Step 2: Start Frontend (New Terminal)
```bash
npm start
```

**Opens:** `http://localhost:3000`

### Step 3: Test It!
1. Click **"Courses"** in navigation
2. Click **"Buy Now"** on any course
3. **Sign up** if needed (or login)
4. Click **"Pay ₹XXX"**
5. Use test card: **4111 1111 1111 1111**
6. CVV: **123**, Expiry: **12/25**
7. See success page with confetti! 🎉

## ⚠️ IMPORTANT: Razorpay Keys

**You're currently using LIVE keys** - Real money will be charged!

### For Testing (Recommended):
1. Go to [Razorpay Dashboard](https://dashboard.razorpay.com)
2. Switch to **Test Mode** (top right)
3. Settings → API Keys → Generate Test Keys
4. Update `backend/.env`:
   ```env
   RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXX
   RAZORPAY_KEY_SECRET=your_test_secret
   ```
5. Restart backend server

## 📁 Key Files

### Configuration
- **`.env`** - Frontend config (API URL, Firebase)
- **`backend/.env`** - Backend config (Razorpay, MongoDB, Firebase)

### New Pages
- **`/courses`** - Browse all courses
- **`/courses/:id/checkout`** - Payment checkout
- **`/payment/success`** - Success confirmation

### Backend API
- **`POST /api/razorpay/create-order`** - Create payment order
- **`POST /api/razorpay/verify-payment`** - Verify and enroll

## 🔧 If Something Doesn't Work

### Backend Won't Start
```bash
# Check if dependencies are installed
cd backend
npm install

# Check .env file exists
ls -la .env

# Check Firebase file path
ls -la ../mentor-app-238c6-firebase-adminsdk-fbsvc-8db9a224f3.json
```

### "Course not found"
Add a test course in Firestore:
```javascript
Collection: courses
Document: {
  title: "Test Course",
  description: "A test course",
  price: 499,
  published: true,
  level: "beginner",
  duration: 10,
  category: "Programming"
}
```

### Payment Fails
- Check Razorpay keys in `backend/.env`
- Use test card: `4111 1111 1111 1111`
- Check backend console for errors

## 📚 Full Documentation

- **IMPLEMENTATION-COMPLETE.md** - What was built (summary)
- **RAZORPAY-QUICK-START.md** - 5-minute setup guide
- **RAZORPAY-INTEGRATION-GUIDE.md** - Complete technical guide

## 🎓 Test Cards (Test Mode Only)

| Card Number | Result |
|-------------|--------|
| 4111 1111 1111 1111 | ✅ Success |
| 4000 0000 0000 0002 | ❌ Failure |

**Test UPI:** `success@razorpay`

## 🔒 Production Checklist

Before going live:
- [ ] Switch to Razorpay LIVE keys (you already have them)
- [ ] Enable HTTPS (required by Razorpay)
- [ ] Test with real payment (small amount)
- [ ] Set up Razorpay webhooks
- [ ] Configure email notifications
- [ ] Enable error monitoring

## 💡 Pro Tips

1. **Always test with TEST keys first** - Avoid real charges during development
2. **Check browser console** - All analytics events are logged there
3. **Check backend logs** - Detailed payment flow information
4. **Use Razorpay Dashboard** - View all transactions and test payments

## 🆘 Need Help?

1. **Check logs**: Frontend (browser console) + Backend (terminal)
2. **Verify .env files**: Both frontend and backend
3. **Test with test cards**: See table above
4. **Read docs**: Check the documentation files listed above

## ✨ What's Next?

Your payment system is ready! You can now:
- Add more courses to Firestore
- Customize the courses page design
- Add email notifications
- Enable webhooks for redundancy
- Switch to production when ready

---

## 🎉 Ready to Go!

```bash
# Terminal 1
cd backend && npm start

# Terminal 2
npm start

# Browser
# Go to http://localhost:3000
# Click "Courses"
# Test the purchase flow!
```

**Happy coding! 🚀**

---

*For questions or issues, check the documentation files or review the implementation details in IMPLEMENTATION-COMPLETE.md*
