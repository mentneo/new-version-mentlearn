const express = require('express');
const router = express.Router();
const admin = require('firebase-admin');

// Razorpay webhook endpoint
router.post('/razorpay-webhook', async (req, res) => {
  const event = req.body;
  try {
    if (event.event === 'payment.captured') {
      const payment = event.payload.payment.entity;
      const orderId = payment.order_id;
      const paymentId = payment.id;
      const amount = payment.amount;
      const status = payment.status;
      // Update order status in Firestore
      await admin.firestore().collection('razorpayOrders').doc(orderId).update({
        status: 'success',
        paymentId,
        amount,
        updatedAt: new Date().toISOString()
      });

      // Create payment record for admin verification
      await admin.firestore().collection('payments').add({
        paymentId,
        orderId,
        amount: amount / 100,
        status,
        userId: payment.notes?.userId || '',
        courseId: payment.notes?.courseId || '',
        timestamp: new Date().toISOString(),
        method: payment.method || '',
        email: payment.email || '',
      });
    }
    res.status(200).json({ received: true });
  } catch (err) {
    console.error('Webhook error:', err);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

module.exports = router;
