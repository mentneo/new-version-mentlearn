import { db } from '../firebase/firebase';
import { doc, setDoc, updateDoc, collection, addDoc, serverTimestamp, getDoc } from 'firebase/firestore';

// Razorpay API key
const RAZORPAY_KEY = 'rzp_test_tSkVPhb1dwSOoX';
  
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

  async createOrder(userId, amount, userDetails, planId = 'complete', isCustomAmount = false, isDemoMode = false) {
    try {
      // If in demo mode, return mock order data
      if (isDemoMode) {
        console.log("Demo Mode: Creating mock order data");
        return {
          id: 'order_demo_' + Math.random().toString(36).substr(2, 9),
          amount: amount * 100, // Convert to paisa
          currency: 'INR',
          receipt: 'receipt_demo_' + Date.now(),
          status: 'created'
        };
      }
      
      // Check if the user exists and has permissions
      try {
        const userRef = doc(db, "users", userId);
        const userSnapshot = await getDoc(userRef);
        
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          if (userData.role === 'banned' || userData.role === 'suspended') {
            throw new Error("Your account doesn't have permission to create orders");
          }
        }
      } catch (permError) {
        console.error("Permission check error:", permError);
        // If it's not a permission error, continue with order creation
        if (permError.message.includes('permission')) {
          throw permError;
        }
      }
      
      // Simulate order creation for development
      console.log("Creating order for user:", userId, "amount:", amount, "plan:", planId, "custom amount:", isCustomAmount);
      
      // Mock order data
      const orderData = {
        id: 'order_' + Math.random().toString(36).substr(2, 9),
        amount: amount * 100, // Convert to paisa
        currency: 'INR',
        receipt: 'receipt_' + Date.now(),
        status: 'created'
      };
      
      // Store order in Firestore
      try {
        await setDoc(doc(collection(db, 'razorpayOrders'), orderData.id), {
          orderId: orderData.id,
          amount: amount,
          currency: 'INR',
          userId: userId,
          planId: planId,
          isCustomAmount: isCustomAmount,
          status: 'created',
          createdAt: serverTimestamp(),
          userDetails: {
            name: userDetails.name || '',
            email: userDetails.email || '',
            phone: userDetails.phone || ''
          }
        });
      } catch (dbError) {
        console.error("Database error creating order:", dbError);
        if (dbError.code === "permission-denied") {
          throw new Error("Permission denied: Unable to create order. Please contact support.");
        }
        throw new Error("Failed to create order in database: " + dbError.message);
      }
      
      return orderData;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async processPayment(orderData, userData, successCallback, failureCallback, isCustomAmount = false, isDemoMode = false) {
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
      let planName;
      if (isCustomAmount) {
        planName = 'Custom Payment';
      } else if (userData.plan && userData.plan.startsWith('course_')) {
        planName = 'Course Enrollment';
      } else {
        planName = userData.plan === 'basic' ? 'Basic Plan' : 'Complete Bundle';
      }

      const options = {
        key: RAZORPAY_KEY, // Use the updated key
        amount: orderData.amount,
        currency: orderData.currency || 'INR',
        name: 'Mentlearn',
        description: `${planName} - Course Access`,
        order_id: orderData.id,
        image: 'https://mentlearn.in/logo.png',
        handler: async (response) => {
          try {
            console.log('Payment success response:', response);
            
            try {
              if (isDemoMode) {
                console.log("DEMO MODE: Skipping database operations");
                if (successCallback) {
                  successCallback(response, { verified: true, demo: true });
                }
                return;
              }
              
              // Update payment status in Firestore
              await this.updatePaymentStatus(
                orderData.id, 
                'success', 
                response.razorpay_payment_id || 'mock_payment_id',
                userData.id,
                userData.plan || 'complete',
                null,
                isCustomAmount,
                orderData.amount / 100 // Convert back from paisa to rupees
              );
              
              // Grant access to courses
              await this.enrollUserInCourses(userData.id, userData.plan || 'complete', isCustomAmount);
              
              if (successCallback) {
                successCallback(response, { verified: true });
              }
            } catch (dbError) {
              console.error('Database error after payment:', dbError);
              
              // Check if it's a permission error
              if (dbError.code === "permission-denied" || dbError.message.includes("permission")) {
                if (failureCallback) {
                  failureCallback({
                    message: "Payment was successful, but we couldn't update your enrollment status due to a permission issue. This is expected in the demo version.",
                    code: "PERMISSION_DENIED",
                    source: "database",
                    paymentId: response.razorpay_payment_id
                  });
                }
              } else {
                // Handle other errors
                if (failureCallback) {
                  failureCallback({
                    message: "Payment was successful, but there was an issue updating your enrollment. Please contact support with your payment ID: " + response.razorpay_payment_id,
                    code: "DATABASE_ERROR",
                    source: "database",
                    paymentId: response.razorpay_payment_id
                  });
                }
              }
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
          response.error?.description || "Payment failed",
          isCustomAmount
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

  async updatePaymentStatus(orderId, status, paymentId, userId, planId = 'complete', errorMessage = null, isCustomAmount = false, customAmount = null) {
    try {
      // Get plan price based on planId or use custom amount
      let amount;
      if (isCustomAmount && customAmount) {
        amount = customAmount;
      } else {
        const planPrices = {
          complete: 4999,
          basic: 2999
        };
        amount = planPrices[planId] || 4999;
      }
      
      // Update order status
      const orderRef = doc(db, 'razorpayOrders', orderId);
      await updateDoc(orderRef, {
        status: status,
        updatedAt: serverTimestamp(),
        paymentId: paymentId || null,
        planId: planId,
        isCustomAmount: isCustomAmount,
        customAmount: isCustomAmount ? customAmount : null,
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
        isCustomAmount: isCustomAmount,
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

  async enrollUserInCourses(userId, planId = 'complete', isCustomAmount = false) {
    try {
      // Check user permissions before enrolling
      try {
        const userRef = doc(db, "users", userId);
        const userSnapshot = await getDoc(userRef);
        
        if (userSnapshot.exists()) {
          const userData = userSnapshot.data();
          if (userData.role === 'banned' || userData.role === 'suspended') {
            throw new Error("Your account doesn't have permission to enroll in courses");
          }
        }
      } catch (permError) {
        console.error("Permission check error during enrollment:", permError);
        // If it's not a permission error, continue with enrollment
        if (permError.message.includes('permission')) {
          throw permError;
        }
      }
      
      // Create enrollment document with pending status
      try {
        await addDoc(collection(db, 'enrollments'), {
          userId: userId,
          status: 'pending_verification', // Change from 'active' to 'pending_verification'
          planId: planId,
          enrollmentType: isCustomAmount ? 'custom_amount' : 'paid',
          enrolledAt: serverTimestamp(),
          accessUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 year access
        });
      } catch (enrollError) {
        console.error("Error creating enrollment:", enrollError);
        if (enrollError.code === "permission-denied") {
          throw new Error("Permission denied: Unable to create enrollment. Please contact support.");
        }
        throw new Error("Failed to create enrollment: " + enrollError.message);
      }
      
      // Update user document to mark as paid but pending verification
      try {
        const userRef = doc(db, 'users', userId);
        await updateDoc(userRef, {
          hasPaid: true,
          verificationStatus: 'pending', // Add verification status
          accessGranted: false, // Don't grant access until verified by admin
          accessLevel: null, // Will be set when verified
          planId: planId,
          customAmountPayment: isCustomAmount,
          paymentCompleted: true, // New flag indicating payment is complete
          updatedAt: serverTimestamp()
        });
      } catch (userUpdateError) {
        console.error("Error updating user:", userUpdateError);
        if (userUpdateError.code === "permission-denied") {
          throw new Error("Permission denied: Unable to update user status. Please contact support.");
        }
        throw new Error("Failed to update user status: " + userUpdateError.message);
      }
      
      // Create notification for admin
      try {
        await addDoc(collection(db, 'adminNotifications'), {
          type: 'new_payment',
          userId: userId,
          planId: planId,
          isCustomAmount: isCustomAmount,
          status: 'unread',
          createdAt: serverTimestamp(),
          message: `New ${isCustomAmount ? 'custom amount' : ''} payment received. Student access pending verification.`
        });
      } catch (notifyError) {
        // Just log the notification error but don't fail the enrollment
        console.error("Error creating admin notification:", notifyError);
      }
      
      return true;
    } catch (error) {
      console.error('Error enrolling user:', error);
      throw error;
    }
  }
}

const razorpayServiceInstance = new RazorpayService();
export default razorpayServiceInstance;
