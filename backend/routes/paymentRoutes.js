const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const admin = require('firebase-admin');

// Initialize Razorpay
const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || 'rzp_live_RW6hQg5iL5Thm2',
  key_secret: process.env.RAZORPAY_KEY_SECRET || 'Q3dHSAcCjossSapgKhkBcsxd'
});

// Create order endpoint
router.post('/create-order', async (req, res) => {
  const { courseId } = req.body;
  try {
    // Fetch course price from Firestore
    const courseDoc = await admin.firestore().collection('courses').doc(courseId).get();
    if (!courseDoc.exists) {
      return res.status(404).json({ error: 'Course not found' });
    }
    const price = courseDoc.data().price;
    const amount = price * 100; // Razorpay expects paise

    const options = {
      amount,
      currency: 'INR',
      receipt: `receipt_${courseId}_${Date.now()}`
    };
    const order = await razorpay.orders.create(options);

    // Store order in Firestore
    await admin.firestore().collection('razorpayOrders').doc(order.id).set({
      courseId,
      amount,
      currency: 'INR',
      status: 'created',
      createdAt: new Date().toISOString()
    });

    res.json({ order });
  } catch (err) {
    console.error('Error creating Razorpay order:', err);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

module.exports = router;
