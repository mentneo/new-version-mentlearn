# Mentlearn - Razorpay Course Purchase Integration

Complete implementation of public course listing and Razorpay payment integration for Mentlearn platform.

## 🎯 Features Implemented

### 1. Public Courses Page (`/courses`)
- ✅ Responsive course grid (3-col desktop, 2-col tablet, 1-col mobile)
- ✅ Hero section with headline and Browse Courses CTA
- ✅ Advanced filters: Category, Level, Price, Duration, Sort
- ✅ Search functionality
- ✅ Course cards with thumbnails, tags, pricing, ratings
- ✅ Course detail modal with full information
- ✅ Empty state and loading states
- ✅ Hover animations and microinteractions

### 2. Razorpay Checkout Integration
- ✅ Server-side order creation (secure)
- ✅ Razorpay Checkout SDK integration
- ✅ Payment signature verification
- ✅ Automatic user enrollment on success
- ✅ Coupon code support (backend ready)
- ✅ Error handling and retry logic

### 3. Payment Flow
- ✅ User clicks "Buy Now" → Redirects to checkout page
- ✅ Checkout page shows course details and price
- ✅ Creates Razorpay order via backend API
- ✅ Opens Razorpay Checkout modal
- ✅ Verifies payment signature on backend
- ✅ Enrolls user in course automatically
- ✅ Redirects to success page with confetti animation

### 4. Success/Error Flows
- ✅ Payment success page with confetti
- ✅ Email confirmation (logged, ready for integration)
- ✅ Auto-redirect to student dashboard
- ✅ Error handling with user-friendly messages
- ✅ Payment failed analytics tracking

### 5. Analytics Integration
- ✅ `view_course_list` - When courses page loads
- ✅ `click_course_card` - When user clicks a course
- ✅ `start_payment` - When user initiates payment
- ✅ `payment_success` - When payment succeeds
- ✅ `payment_failed` - When payment fails
- ✅ `payment_cancelled` - When user closes checkout

## 📁 Files Created/Modified

### Frontend Files Created:
1. **`src/pages/PublicCoursesPage.js`** - Main courses listing page
2. **`src/pages/RazorpayCheckout.js`** - Checkout page with payment integration
3. **`src/pages/PaymentSuccess.js`** - Success page with confetti

### Backend Files Created:
1. **`backend/routes/razorpayRoutes.js`** - All Razorpay endpoints

### Files Modified:
1. **`src/App.js`** - Added new routes
2. **`src/pages/LandingPage.js`** - Added Courses link to navigation
3. **`backend/server.js`** - Integrated Razorpay routes
4. **`backend/.env.example`** - Added Razorpay configuration

## 🚀 Setup Instructions

### Prerequisites
- Node.js 18+ and npm 9+
- MongoDB instance (local or cloud)
- Firebase project with Firestore
- Razorpay account (Test mode for development)

### 1. Install Dependencies

#### Frontend
```bash
cd /Users/yeduruabhiram/Desktop/mentlearn/new-version-mentlearn
npm install canvas-confetti
```

#### Backend
```bash
cd backend
npm install razorpay
```

### 2. Configure Environment Variables

Create `backend/.env` file:

```env
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/mentneo

# Frontend URL
FRONTEND_ORIGIN=http://localhost:3000

# Firebase Admin SDK
FIREBASE_SERVICE_ACCOUNT_JSON={"type":"service_account",...}

# Razorpay TEST Credentials (get from Razorpay Dashboard)
RAZORPAY_KEY_ID=rzp_test_XXXXXXXXXXXXXXXX
RAZORPAY_KEY_SECRET=your_test_key_secret_here
RAZORPAY_SECRET=your_test_key_secret_here

# Razorpay Webhook Secret (optional)
RAZORPAY_WEBHOOK_SECRET=your_webhook_secret
```

Create or update `.env` in frontend root:

```env
REACT_APP_API_URL=http://localhost:5001
```

### 3. Get Razorpay API Keys

1. Sign up at [https://razorpay.com](https://razorpay.com)
2. Go to Dashboard → Settings → API Keys
3. Generate **Test Mode** keys
4. Copy `Key ID` and `Key Secret` to backend `.env`

⚠️ **Important**: Use TEST keys during development. Switch to LIVE keys only before production.

### 4. Start the Application

#### Terminal 1 - Backend
```bash
cd backend
node server.js
```

Backend should start on `http://localhost:5001`

#### Terminal 2 - Frontend
```bash
npm start
```

Frontend should start on `http://localhost:3000`

## 🔗 API Endpoints

### Backend Routes

All routes require Firebase authentication (Bearer token).

#### 1. Create Order
```http
POST /api/razorpay/create-order
Content-Type: application/json
Authorization: Bearer <firebase_id_token>

{
  "courseId": "course_doc_id",
  "couponCode": "OPTIONAL_COUPON" // optional
}
```

**Response:**
```json
{
  "orderId": "order_xxx",
  "amount": 49900,
  "currency": "INR",
  "keyId": "rzp_test_xxx",
  "courseDetails": {
    "id": "course_id",
    "title": "Course Name",
    "finalPrice": 499,
    "discount": 0
  }
}
```

#### 2. Verify Payment
```http
POST /api/razorpay/verify-payment
Content-Type: application/json
Authorization: Bearer <firebase_id_token>

{
  "razorpay_order_id": "order_xxx",
  "razorpay_payment_id": "pay_xxx",
  "razorpay_signature": "signature_hash"
}
```

**Response:**
```json
{
  "ok": true,
  "message": "Payment verified and enrollment successful",
  "enrollmentId": "enrollment_doc_id",
  "courseId": "course_id",
  "courseName": "Course Name"
}
```

#### 3. Check Order Status
```http
GET /api/razorpay/order-status/:orderId
Authorization: Bearer <firebase_id_token>
```

#### 4. Webhook (Optional)
```http
POST /api/razorpay/webhook
X-Razorpay-Signature: <signature>
```

## 🎨 User Flow

### For Non-Logged Users:
1. Visit `/courses` → See all available courses
2. Click "Buy Now" → Redirect to `/signup` with return URL
3. Sign up → Redirect back to checkout
4. Complete payment → Enrolled + Redirect to dashboard

### For Logged-In Users:
1. Visit `/courses` → See all available courses
2. Click "Buy Now" → Go to checkout page
3. Review course details and price
4. Click "Pay ₹XXX" → Razorpay Checkout opens
5. Complete payment → Auto-enrolled
6. Success page → Confetti 🎉
7. Redirect to dashboard or explore more courses

## 🔒 Security Features

- ✅ Order creation on server-side only
- ✅ Payment signature verification
- ✅ Firebase authentication required
- ✅ HTTPS recommended for production
- ✅ API key secrets never exposed to frontend
- ✅ User authorization checks (order belongs to user)
- ✅ Input validation and sanitization

## 📊 Database Structure

### Firestore Collections

#### `razorpayOrders`
```javascript
{
  orderId: "order_xxx",
  courseId: "course_id",
  courseName: "Course Name",
  userId: "user_uid",
  userEmail: "user@example.com",
  amount: 49900, // in paise
  currency: "INR",
  originalPrice: 599,
  discount: 100,
  couponCode: "SAVE100",
  status: "created|completed|failed",
  paymentStatus: "pending|success|failed",
  paymentId: "pay_xxx",
  signature: "signature_hash",
  paymentMethod: "card|upi|netbanking",
  createdAt: Timestamp,
  paidAt: Timestamp
}
```

#### `enrollments`
```javascript
{
  userId: "user_uid",
  userEmail: "user@example.com",
  courseId: "course_id",
  courseName: "Course Name",
  enrolledAt: Timestamp,
  status: "active",
  progress: 0,
  paymentId: "pay_xxx",
  orderId: "order_xxx",
  amountPaid: 499,
  paymentMethod: "razorpay",
  source: "public_purchase"
}
```

#### `payments` (for admin tracking)
```javascript
{
  userId: "user_uid",
  userEmail: "user@example.com",
  courseId: "course_id",
  courseName: "Course Name",
  orderId: "order_xxx",
  paymentId: "pay_xxx",
  amount: 499,
  currency: "INR",
  status: "success",
  method: "card",
  discount: 100,
  couponCode: "SAVE100",
  createdAt: Timestamp,
  verifiedAt: Timestamp
}
```

## 🧪 Testing

### Test with Razorpay Test Cards

**Test Card Numbers:**
- Success: `4111 1111 1111 1111`
- Failure: `4000 0000 0000 0002`

**Test UPI:**
- Success: `success@razorpay`
- Failure: `failure@razorpay`

**CVV:** Any 3 digits
**Expiry:** Any future date
**OTP:** `123456` (for 3D Secure)

### Manual Testing Checklist

- [ ] View courses page without login
- [ ] Search and filter courses
- [ ] Click course card → modal opens
- [ ] Click "Buy Now" without login → redirects to signup
- [ ] Sign up and return to checkout
- [ ] Review course details on checkout page
- [ ] Click Pay button → Razorpay opens
- [ ] Complete payment with test card
- [ ] Verify payment success page appears
- [ ] Check user is enrolled in course
- [ ] Verify enrollment shows in dashboard
- [ ] Test payment failure scenario
- [ ] Test cancel payment scenario

## 🐛 Troubleshooting

### Common Issues

#### 1. "Failed to create order"
- Check Razorpay API keys in `.env`
- Verify Firebase auth token is valid
- Check course exists in Firestore
- Check backend logs for detailed error

#### 2. "Payment verification failed"
- Signature mismatch: Check `RAZORPAY_KEY_SECRET`
- Order not found: Check order creation succeeded
- Network timeout: Retry the request

#### 3. Razorpay Checkout doesn't open
- Check Razorpay script loaded: Look for `window.Razorpay`
- Check browser console for errors
- Verify `keyId` is correct in response

#### 4. CORS errors
- Check `FRONTEND_ORIGIN` in backend `.env`
- Verify frontend making requests to correct API URL
- Check browser console for specific CORS error

## 📈 Analytics Events

All events are logged to console. Integrate with Google Analytics, Mixpanel, or your analytics provider.

```javascript
// Example integration
console.log('📊 Analytics: event_name', { data });

// Replace with:
gtag('event', 'event_name', { ...data });
// or
mixpanel.track('event_name', data);
```

## 🚢 Production Deployment

### Before Going Live:

1. **Switch to Razorpay Live Keys**
   ```env
   RAZORPAY_KEY_ID=rzp_live_XXXXXXXXXXXXXXXX
   RAZORPAY_KEY_SECRET=your_live_key_secret
   ```

2. **Enable HTTPS**
   - Required for Razorpay in production
   - Use Let's Encrypt or your hosting provider

3. **Set Production URLs**
   ```env
   FRONTEND_ORIGIN=https://yourdomain.com
   REACT_APP_API_URL=https://api.yourdomain.com
   ```

4. **Configure Razorpay Webhooks**
   - Dashboard → Webhooks → Add Webhook URL
   - URL: `https://api.yourdomain.com/api/razorpay/webhook`
   - Events: `payment.captured`, `payment.failed`

5. **Test End-to-End with Live Keys**
   - Use real card with small amount
   - Verify payment, enrollment, and email

6. **Enable Monitoring**
   - Set up error tracking (Sentry, etc.)
   - Monitor payment success rate
   - Track failed payments

## 🎓 Razorpay Resources

- [Dashboard](https://dashboard.razorpay.com/)
- [API Documentation](https://razorpay.com/docs/api/)
- [Standard Checkout](https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/)
- [Payment Links](https://razorpay.com/docs/payments/payment-links/)
- [Webhooks](https://razorpay.com/docs/webhooks/)
- [Test Cards](https://razorpay.com/docs/payments/payments/test-card-details/)

## 📧 Email Integration (TODO)

Add email notifications in `backend/routes/razorpayRoutes.js`:

```javascript
// After successful payment verification
await sendEnrollmentEmail({
  to: userEmail,
  subject: `Welcome to ${courseName}!`,
  courseName,
  courseLink: `https://yourdomain.com/student/courses/${courseId}`
});
```

Use SendGrid, AWS SES, or NodeMailer for email delivery.

## 🎉 Done!

Your Razorpay integration is complete. Users can now:
- Browse all available courses
- Filter and search courses
- Purchase courses securely with Razorpay
- Get automatically enrolled after payment
- Access courses from their dashboard

For support, contact your development team or refer to Razorpay documentation.
