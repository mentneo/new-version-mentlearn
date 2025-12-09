const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const crypto = require('crypto');
const admin = require('firebase-admin');

// Initialize Razorpay with environment variables
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Middleware to verify Firebase token
const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }

    const token = authHeader.split('Bearer ')[1];
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }
};

// POST /api/razorpay/create-order
// Create Razorpay order for course purchase
router.post('/create-order', verifyFirebaseToken, async (req, res) => {
  console.log('📦 Creating Razorpay order...');
  
  try {
    const { courseId, couponCode } = req.body;
    const userId = req.user.uid;
    const userEmail = req.user.email;

    if (!courseId) {
      return res.status(400).json({ error: 'Course ID is required' });
    }

    // Fetch course details from Firestore
    const courseRef = admin.firestore().collection('courses').doc(courseId);
    const courseDoc = await courseRef.get();

    if (!courseDoc.exists) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const courseData = courseDoc.data();
    
    // Check if course is published
    if (courseData.published === false) {
      return res.status(400).json({ error: 'This course is not available for purchase' });
    }

    let finalPrice = courseData.price;
    let discount = 0;

    // Apply coupon if provided
    if (couponCode) {
      const couponRef = admin.firestore().collection('coupons').doc(couponCode);
      const couponDoc = await couponRef.get();

      if (couponDoc.exists) {
        const coupon = couponDoc.data();
        if (coupon.active && new Date(coupon.expiryDate) > new Date()) {
          if (coupon.type === 'percentage') {
            discount = (finalPrice * coupon.value) / 100;
          } else if (coupon.type === 'fixed') {
            discount = coupon.value;
          }
          finalPrice = Math.max(0, finalPrice - discount);
        }
      }
    }

    // Convert to paise (Razorpay expects amount in smallest currency unit)
    const amountInPaise = Math.round(finalPrice * 100);

    if (amountInPaise < 100) {
      return res.status(400).json({ error: 'Amount must be at least ₹1' });
    }

    // Create Razorpay order
    // Receipt must be max 40 characters
    const shortReceipt = `rcpt_${Date.now()}_${courseId.substring(0, 10)}`.substring(0, 40);
    
    const orderOptions = {
      amount: amountInPaise,
      currency: 'INR',
      receipt: shortReceipt,
      notes: {
        courseId: courseId,
        courseName: courseData.title,
        userId: userId,
        userEmail: userEmail,
        couponCode: couponCode || 'none',
        discount: discount
      }
    };

    const order = await razorpay.orders.create(orderOptions);
    console.log('✅ Razorpay order created:', order.id);

    // Store order details in Firestore
    await admin.firestore().collection('razorpayOrders').doc(order.id).set({
      orderId: order.id,
      courseId: courseId,
      courseName: courseData.title,
      userId: userId,
      userEmail: userEmail,
      amount: order.amount,
      currency: order.currency,
      originalPrice: courseData.price,
      discount: discount,
      couponCode: couponCode || null,
      status: 'created',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      paymentStatus: 'pending'
    });

    // Return order details to frontend
    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      courseDetails: {
        id: courseId,
        title: courseData.title,
        thumbnail: courseData.thumbnailUrl || courseData.thumbnail,
        originalPrice: courseData.price,
        finalPrice: finalPrice,
        discount: discount
      }
    });
    
    // Log analytics event
    console.log('📊 Analytics: order_created', {
      userId,
      courseId,
      amount: finalPrice
    });

  } catch (error) {
    console.error('❌ Error creating Razorpay order:', error);
    res.status(500).json({ 
      error: 'Failed to create order',
      details: error.message 
    });
  }
});

// POST /api/razorpay/verify-payment
// Verify Razorpay payment signature and enroll user
router.post('/verify-payment', verifyFirebaseToken, async (req, res) => {
  console.log('🔐 Verifying payment...');
  
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    const userId = req.user.uid;
    const userEmail = req.user.email;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: 'Missing payment details' });
    }

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');

    if (expectedSignature !== razorpay_signature) {
      console.error('❌ Payment signature verification failed');
      
      // Update order status
      await admin.firestore().collection('razorpayOrders').doc(razorpay_order_id).update({
        status: 'failed',
        paymentStatus: 'signature_verification_failed',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });

      // Log analytics event
      console.log('📊 Analytics: payment_failed', { userId, reason: 'signature_mismatch' });
      
      return res.status(400).json({ 
        ok: false, 
        error: 'Payment verification failed' 
      });
    }

    console.log('✅ Payment signature verified');

    // Fetch order details
    const orderDoc = await admin.firestore().collection('razorpayOrders').doc(razorpay_order_id).get();
    
    if (!orderDoc.exists) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const orderData = orderDoc.data();

    // Fetch payment details from Razorpay
    let paymentDetails = null;
    try {
      paymentDetails = await razorpay.payments.fetch(razorpay_payment_id);
    } catch (error) {
      console.warn('⚠️ Could not fetch payment details from Razorpay:', error.message);
    }

    // Update order with payment details
    await admin.firestore().collection('razorpayOrders').doc(razorpay_order_id).update({
      status: 'completed',
      paymentStatus: 'success',
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      paymentMethod: paymentDetails?.method || 'unknown',
      paidAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Check if user is already enrolled
    const enrollmentQuery = await admin.firestore()
      .collection('enrollments')
      .where('userId', '==', userId)
      .where('courseId', '==', orderData.courseId)
      .limit(1)
      .get();

    let enrollmentId;

    if (enrollmentQuery.empty) {
      // Create enrollment with both userId and studentId for compatibility
      const enrollmentRef = await admin.firestore().collection('enrollments').add({
        userId: userId,
        studentId: userId, // Add studentId for frontend compatibility
        userEmail: userEmail,
        courseId: orderData.courseId,
        courseName: orderData.courseName,
        enrolledAt: admin.firestore.FieldValue.serverTimestamp(),
        status: 'active',
        progress: 0,
        paymentId: razorpay_payment_id,
        orderId: razorpay_order_id,
        amountPaid: orderData.amount / 100, // Convert back to rupees
        paymentMethod: paymentDetails?.method || 'razorpay',
        source: 'public_purchase'
      });

      enrollmentId = enrollmentRef.id;
      console.log('✅ User enrolled in course:', enrollmentId);
    } else {
      enrollmentId = enrollmentQuery.docs[0].id;
      console.log('ℹ️ User already enrolled in course:', enrollmentId);
    }

    // Update user's enrolled courses list (create user if doesn't exist)
    const userRef = admin.firestore().collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (userDoc.exists) {
      const userData = userDoc.data();
      const enrolledCourses = userData.enrolledCourses || [];
      
      if (!enrolledCourses.includes(orderData.courseId)) {
        await userRef.update({
          enrolledCourses: admin.firestore.FieldValue.arrayUnion(orderData.courseId),
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
      }
    } else {
      // Create user document if it doesn't exist
      await userRef.set({
        email: userEmail,
        fullName: userEmail.split('@')[0], // Use email prefix as name
        role: 'student',
        enrolledCourses: [orderData.courseId],
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
        createdVia: 'razorpay_purchase'
      });
      console.log('✅ Created user document for:', userId);
    }

    // Create payment record for admin tracking
    await admin.firestore().collection('payments').add({
      userId: userId,
      userEmail: userEmail,
      courseId: orderData.courseId,
      courseName: orderData.courseName,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      amount: orderData.amount / 100,
      currency: orderData.currency,
      status: 'success',
      method: paymentDetails?.method || 'razorpay',
      discount: orderData.discount || 0,
      couponCode: orderData.couponCode || null,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      verifiedAt: admin.firestore.FieldValue.serverTimestamp()
    });

    // Log analytics event
    console.log('📊 Analytics: payment_success', {
      userId,
      courseId: orderData.courseId,
      amount: orderData.amount / 100,
      method: paymentDetails?.method
    });

    // Send success response
    res.json({
      ok: true,
      message: 'Payment verified and enrollment successful',
      enrollmentId: enrollmentId,
      courseId: orderData.courseId,
      courseName: orderData.courseName
    });

    // TODO: Send enrollment confirmation email
    console.log('📧 TODO: Send enrollment confirmation email to', userEmail);

  } catch (error) {
    console.error('❌ Error verifying payment:', error);
    
    // Log analytics event
    console.log('📊 Analytics: payment_failed', { 
      userId: req.user?.uid, 
      reason: 'server_error',
      error: error.message 
    });
    
    res.status(500).json({ 
      ok: false,
      error: 'Payment verification failed',
      details: error.message 
    });
  }
});

// POST /api/razorpay/webhook
// Razorpay webhook for payment.captured events (for redundancy)
router.post('/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  console.log('🔔 Webhook received from Razorpay');
  
  try {
    const webhookSignature = req.headers['x-razorpay-signature'];
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.warn('⚠️ Webhook secret not configured');
      return res.status(500).json({ error: 'Webhook not configured' });
    }

    // Verify webhook signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(req.body)
      .digest('hex');

    if (webhookSignature !== expectedSignature) {
      console.error('❌ Webhook signature verification failed');
      return res.status(400).json({ error: 'Invalid signature' });
    }

    const event = JSON.parse(req.body.toString());
    console.log('📦 Webhook event:', event.event);

    // Handle payment.captured event
    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity;
      const orderId = payment.order_id;

      console.log('💰 Payment captured for order:', orderId);

      // Update order status in Firestore
      const orderRef = admin.firestore().collection('razorpayOrders').doc(orderId);
      const orderDoc = await orderRef.get();

      if (orderDoc.exists) {
        await orderRef.update({
          webhookReceived: true,
          webhookReceivedAt: admin.firestore.FieldValue.serverTimestamp(),
          paymentStatus: 'captured',
          paymentId: payment.id
        });
        console.log('✅ Order updated from webhook');
      }
    }

    res.json({ status: 'ok' });

  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// GET /api/razorpay/order-status/:orderId
// Check order status
router.get('/order-status/:orderId', verifyFirebaseToken, async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.uid;

    const orderDoc = await admin.firestore().collection('razorpayOrders').doc(orderId).get();

    if (!orderDoc.exists) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const orderData = orderDoc.data();

    // Verify this order belongs to the requesting user
    if (orderData.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    res.json({
      orderId: orderId,
      status: orderData.status,
      paymentStatus: orderData.paymentStatus,
      courseId: orderData.courseId,
      courseName: orderData.courseName,
      amount: orderData.amount / 100,
      currency: orderData.currency
    });

  } catch (error) {
    console.error('❌ Error fetching order status:', error);
    res.status(500).json({ error: 'Failed to fetch order status' });
  }
});

module.exports = router;
