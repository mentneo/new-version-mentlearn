const express = require('express');
const router = express.Router();
const Razorpay = require('razorpay');
const admin = require('firebase-admin');

// Debug: Log Razorpay credentials (do NOT share logs publicly)
console.log('Razorpay key_id:', process.env.RAZORPAY_KEY_ID);
console.log('Razorpay key_secret:', process.env.RAZORPAY_KEY_SECRET);
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
      console.error('Course not found:', courseId);
      return res.status(404).json({ error: 'Course not found' });
    }
    const price = courseDoc.data().price;
    if (typeof price !== 'number' || isNaN(price)) {
      console.error('Invalid price for course:', courseId, 'Data:', courseDoc.data());
      return res.status(400).json({ error: 'Invalid course price' });
    }
    const amount = price * 100; // Razorpay expects paise

    // Razorpay receipt must be <= 40 chars
    let safeReceipt = `rcpt_${courseId}`;
    if (safeReceipt.length > 40) {
      // Truncate courseId to fit within 40 chars
      const maxCourseIdLen = 40 - 'rcpt_'.length;
      safeReceipt = `rcpt_${courseId.substring(0, maxCourseIdLen)}`;
    }
    const options = {
      amount,
      currency: 'INR',
      receipt: safeReceipt
    };
    let order;
    try {
      order = await razorpay.orders.create(options);
    } catch (razorErr) {
      console.error('Razorpay order creation failed:', razorErr);
      return res.status(500).json({ error: 'Razorpay order creation failed', details: razorErr.message });
    }

    // Store order in Firestore
    try {
      await admin.firestore().collection('razorpayOrders').doc(order.id).set({
        courseId,
        amount,
        currency: 'INR',
        status: 'created',
        createdAt: new Date().toISOString()
      });
    } catch (firestoreErr) {
      console.error('Failed to store order in Firestore:', firestoreErr);
      return res.status(500).json({ error: 'Failed to store order in Firestore', details: firestoreErr.message });
    }

    res.json({ order });
  } catch (err) {
    console.error('Error creating Razorpay order:', err);
    res.status(500).json({ error: 'Failed to create order', details: err.message });
  }
});

module.exports = router;
