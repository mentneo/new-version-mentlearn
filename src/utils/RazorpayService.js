import { db } from '../firebase/firebase';
import { doc, setDoc, updateDoc, collection, addDoc, serverTimestamp } from 'firebase/firestore';

// Updated Razorpay API key from the CSV
const RAZORPAY_KEY_ID = 'rzp_test_tSkVPhb1dwSOoX';
const RAZORPAY_KEY_SECRET = 'A9NQmnoadlYuOT5aIs6EOLdO'; // Note: This shouldn't be exposed in client-side code in production

class RazorpayService {
  constructor() {
    this.loadScript();
  }

  loadScript() {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) {
        console.log('Razorpay already loaded');
        resolve();
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      
      script.onload = () => {
        console.log('Razorpay script loaded successfully');
        resolve();
      };
      
      script.onerror = (error) => {
        console.error('Failed to load Razorpay script:', error);
        reject(new Error('Failed to load Razorpay payment gateway. Please refresh the page or try again later.'));
      };
      
      document.body.appendChild(script);
    });
  }

  async createOrder(userId, amount, userDetails, planId = 'complete') {
    try {
      // Simulate order creation for development
      console.log("Creating order for user:", userId, "amount:", amount, "plan:", planId);
      
      // Mock order data
      const orderData = {
        id: 'order_' + Math.random().toString(36).substr(2, 9),
        amount: amount * 100, // Convert to paisa
        currency: 'INR',
        receipt: 'receipt_' + Date.now(),
        status: 'created'
      };
      
      // Store order in Firestore
      await setDoc(doc(collection(db, 'razorpayOrders'), orderData.id), {
        orderId: orderData.id,
        amount: amount,
        currency: 'INR',
        userId: userId,
        planId: planId,
        status: 'created',
        createdAt: serverTimestamp(),
        userDetails: {
          name: userDetails.name || '',
          email: userDetails.email || '',
          phone: userDetails.phone || ''
        }
      });
      
      return orderData;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async processPayment(orderData, userData, successCallback, failureCallback) {
    try {
      await this.loadScript();
      
      if (!window.Razorpay) {
        console.error('Razorpay not available after loading script');
        throw new Error('Payment gateway not available. Please refresh and try again.');
      }

      console.log('Configuring Razorpay payment options');
      
      // Verify orderData has required fields
      if (!orderData || !orderData.id || !orderData.amount) {
        console.error('Invalid order data:', orderData);
        throw new Error('Invalid payment information. Please try again.');
      }
      
      // Get plan name for description
      const planName = userData.plan === 'basic' ? 'Basic Plan' : 'Complete Bundle';

      const options = {
        key: 'rzp_test_tSkVPhb1dwSOoX', // Use the updated key
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Mentlearn',
        description: `${planName} - Course Access`,
        order_id: orderData.id,
        image: 'https://mentlearn.in/logo.png',
        handler: async (response) => {
          try {
            console.log('Payment success response:', response);
            
            // Update payment status in Firestore
            await this.updatePaymentStatus(
              orderData.id, 
              'success', 
              response.razorpay_payment_id || 'mock_payment_id',
              userData.id,
              userData.plan || 'complete'
            );
            
            // Grant access to courses
            await this.enrollUserInCourses(userData.id, userData.plan || 'complete');
            
            if (successCallback) {
              successCallback(response, { verified: true });
            }
          } catch (error) {
            console.error('Error handling successful payment:', error);
            
            if (failureCallback) {
              failureCallback(error);
            }
          }
        },
        prefill: {
          name: userData.name || '',
          email: userData.email || '',
          contact: userData.phone || ''
        },
        notes: {
          userId: userData.id,
          planId: userData.plan || 'complete'
        },
        theme: {
          color: '#4568dc'
        }
      };

      console.log('Creating Razorpay instance with options:', { ...options, key: '[HIDDEN]' });
      const razorpay = new window.Razorpay(options);
      
      // Add more event listeners for better error handling
      razorpay.on('payment.failed', async (response) => {
        console.error('Payment failed:', response);
        
        await this.updatePaymentStatus(
          orderData.id, 
          'failed', 
          response.error?.metadata?.payment_id || null,
          userData.id,
          userData.plan || 'complete',
          response.error?.description || "Payment failed"
        );
        
        if (failureCallback) {
          failureCallback({
            message: response.error?.description || "Payment failed",
            code: response.error?.code || "UNKNOWN_ERROR",
            source: "razorpay",
            metadata: response.error?.metadata || {}
          });
        }
      });
      
      // Add more events for debugging
      razorpay.on('payment.cancel', () => {
        console.log('Payment cancelled by user');
        
        if (failureCallback) {
          failureCallback({
            message: "Payment was cancelled",
            code: "PAYMENT_CANCELLED",
            source: "user"
          });
        }
      });
      
      console.log('Opening Razorpay payment dialog');
      razorpay.open();
      return true;
    } catch (error) {
      console.error('Error processing payment:', error);
      
      // More specific error handling
      let errorToReport = error;
      if (error.message === 'Network Error') {
        errorToReport = new Error('Network connection issue. Please check your internet and try again.');
      }
      
      if (failureCallback) {
        failureCallback(errorToReport);
      } else {
        throw errorToReport;
      }
    }
  }

  async updatePaymentStatus(orderId, status, paymentId, userId, planId = 'complete', errorMessage = null) {
    try {
      // Get plan price based on planId
      const planPrices = {
        complete: 4999,
        basic: 2999
      };
      
      const amount = planPrices[planId] || 4999;
      
      // Update order status
      const orderRef = doc(db, 'razorpayOrders', orderId);
      await updateDoc(orderRef, {
        status: status,
        updatedAt: serverTimestamp(),
        paymentId: paymentId || null,
        planId: planId,
        errorMessage: errorMessage
      });
      
      // Create payment record
      await addDoc(collection(db, 'payments'), {
        orderId: orderId,
        paymentId: paymentId,
        userId: userId,
        status: status,
        planId: planId,
        amount: amount,
        timestamp: serverTimestamp(),
        provider: 'razorpay',
        errorMessage: errorMessage
      });
      
      return true;
    } catch (error) {
      console.error('Error updating payment status:', error);
      throw error;
    }
  }

  async enrollUserInCourses(userId, planId = 'complete') {
    try {
      // Create enrollment document with pending status
      await addDoc(collection(db, 'enrollments'), {
        userId: userId,
        status: 'pending_verification', // Change from 'active' to 'pending_verification'
        planId: planId,
        enrollmentType: 'paid',
        enrolledAt: serverTimestamp(),
        accessUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year access
      });
      
      // Update user document to mark as paid but pending verification
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        hasPaid: true,
        verificationStatus: 'pending', // Add verification status
        accessGranted: false, // Don't grant access until verified by admin
        accessLevel: null, // Will be set when verified
        planId: planId,
        paymentCompleted: true, // New flag indicating payment is complete
        updatedAt: serverTimestamp()
      });
      
      // Create notification for admin
      await addDoc(collection(db, 'adminNotifications'), {
        type: 'new_payment',
        userId: userId,
        planId: planId,
        status: 'unread',
        createdAt: serverTimestamp(),
        message: `New payment received. Student access pending verification.`
      });
      
      return true;
    } catch (error) {
      console.error('Error enrolling user:', error);
      throw error;
    }
  }
}

export default new RazorpayService();
