const functions = require('firebase-functions');
const admin = require('firebase-admin');
const Razorpay = require('razorpay');
const crypto = require('crypto');

admin.initializeApp();

// Initialize Razorpay with keys from environment variables
const razorpay = new Razorpay({
  key_id: functions.config().razorpay.key_id || 'rzp_test_spPZOICqYMH8a8',
  key_secret: functions.config().razorpay.key_secret || 'qQgu6K7C8pEJwNBPMmKUgmmO'
});

// Create Razorpay order
exports.createRazorpayOrder = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }

  const { amount, currency = 'INR', userId } = data;

  try {
    // Create order
    const order = await razorpay.orders.create({
      amount: amount,
      currency: currency,
      receipt: `receipt_${Date.now()}_${userId}`,
      notes: {
        userId: userId
      }
    });

    return order;
  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Error creating order',
      error
    );
  }
});

// Verify Razorpay payment
exports.verifyRazorpayPayment = functions.https.onCall(async (data, context) => {
  // Verify user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }

  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = data;

  try {
    // Fetch order details from database
    const orderRef = admin.firestore().collection('razorpayOrders').doc(razorpay_order_id);
    const orderDoc = await orderRef.get();
    
    if (!orderDoc.exists) {
      throw new Error('Order not found');
    }
    
    // Verify signature
    const payload = `${razorpay_order_id}|${razorpay_payment_id}`;
    const secret = functions.config().razorpay.key_secret || 'qQgu6K7C8pEJwNBPMmKUgmmO';
    
    const generated_signature = crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
    
    const isSignatureValid = generated_signature === razorpay_signature;
    
    // Update order status in database
    await orderRef.update({
      status: isSignatureValid ? 'verified' : 'failed',
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
      signatureVerified: isSignatureValid
    });
    
    // If verified, grant access to user
    if (isSignatureValid) {
      const orderData = orderDoc.data();
      const userId = orderData.userId;
      
      // Update user document
      await admin.firestore().collection('users').doc(userId).update({
        hasPaid: true,
        accessGranted: true,
        accessLevel: 'full',
        updatedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    
    return { verified: isSignatureValid };
  } catch (error) {
    console.error('Error verifying payment:', error);
    throw new functions.https.HttpsError(
      'internal',
      'Error verifying payment',
      error
    );
  }
});

// Webhook to catch Razorpay events
exports.razorpayWebhook = functions.https.onRequest(async (req, res) => {
  try {
    const payload = req.body;
    const event = req.headers['x-razorpay-event-id'];
    const signature = req.headers['x-razorpay-signature'];
    
    // Verify webhook signature
    const webhookSecret = functions.config().razorpay.webhook_secret;
    const expected_signature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(payload))
      .digest('hex');
    
    if (signature !== expected_signature) {
      console.error('Invalid webhook signature');
      return res.status(400).send('Invalid signature');
    }
    
    // Process the event
    const eventType = payload.event;
    if (eventType === 'payment.authorized' || eventType === 'payment.captured') {
      const paymentId = payload.payload.payment.entity.id;
      const orderId = payload.payload.payment.entity.order_id;
      const notes = payload.payload.payment.entity.notes || {};
      const userId = notes.userId;
      
      if (userId) {
        // Update user access
        await admin.firestore().collection('users').doc(userId).update({
          hasPaid: true,
          accessGranted: true,
          accessLevel: 'full',
          updatedAt: admin.firestore.FieldValue.serverTimestamp()
        });
        
        // Update order status
        await admin.firestore().collection('razorpayOrders').doc(orderId).update({
          status: 'paid',
          updatedAt: admin.firestore.FieldValue.serverTimestamp(),
          webhook: {
            eventId: event,
            eventType: eventType,
            receivedAt: admin.firestore.FieldValue.serverTimestamp()
          }
        });
        
        // Create payment record
        await admin.firestore().collection('payments').add({
          orderId: orderId,
          paymentId: paymentId,
          userId: userId,
          status: 'completed',
          amount: payload.payload.payment.entity.amount / 100, // Convert from paisa to INR
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
          provider: 'razorpay',
          webhook: {
            eventId: event,
            eventType: eventType
          }
        });
      }
    }
    
    // Acknowledge the webhook
    res.status(200).send('Webhook received successfully');
  } catch (error) {
    console.error('Error processing webhook:', error);
    res.status(500).send('Error processing webhook');
  }
});
