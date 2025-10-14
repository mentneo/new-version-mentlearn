import { db } from "../firebase/firebase";
import { doc, collection, addDoc, serverTimestamp, getDoc } from "firebase/firestore";

// Razorpay Production API key
const RAZORPAY_KEY = "rzp_live_RFqLLkkteSLfOY";

class RazorpayService {
  constructor() {
    this.loadScript();
  }

  loadScript() {
    return new Promise((resolve, reject) => {
      if (window.Razorpay) {
        console.log("Razorpay already loaded");
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.async = true;
      
      script.onload = () => {
        console.log("Razorpay script loaded successfully");
        resolve();
      };
      
      script.onerror = (error) => {
        console.error("Failed to load Razorpay script:", error);
        reject(new Error("Failed to load Razorpay payment gateway. Please refresh the page or try again later."));
      };
      
      document.body.appendChild(script);
    });
  }

  async createOrder(courseId, userData) {
    try {
      // Get course details first
      const courseRef = doc(db, "courses", courseId);
      const courseSnap = await getDoc(courseRef);
      
      if (!courseSnap.exists()) {
        throw new Error("Course not found");
      }

      const courseData = courseSnap.data();
      if (!courseData.price) {
        throw new Error("Course price not set");
      }

      // Create an order in Firestore
      const orderRef = await addDoc(collection(db, "razorpayOrders"), {
        amount: courseData.price * 100, // Convert to paisa
        currency: "INR",
        userId: userData.id,
        status: "created",
        createdAt: serverTimestamp(),
        courseId: courseId,
        courseName: courseData.name,
        courseType: courseData.type,
        creatorId: courseData.creatorId
      });

      return {
        id: orderRef.id,
        amount: courseData.price * 100,
        currency: "INR",
        courseId: courseId,
        courseName: courseData.name,
        creatorId: courseData.creatorId
      };
    } catch (error) {
      console.error("Error creating order:", error);
      throw new Error("Failed to create order: " + error.message);
    }
  }

  async processPayment(orderData, userData, successCallback, failureCallback) {
    try {
      // Handle the payment completion from Razorpay payment button
      const response = {
        razorpay_payment_id: orderData.paymentId,
        razorpay_order_id: orderData.orderId,
        razorpay_signature: orderData.signature
      };

      // Verify payment signature
      if (!this.verifyPaymentSignature(response)) {
        throw new Error('Invalid payment signature');
      }

      const options = {
        key: RAZORPAY_KEY,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "Mentneo",
        description: `Payment for ${orderData.courseName}`,
        order_id: orderData.id,
        handler: async (response) => {
          try {
            if (!this.verifyPaymentSignature(response)) {
              throw new Error("Invalid payment signature");
            }

            // Update order status
            await updateDoc(doc(db, "razorpayOrders", orderData.id), {
              status: "success",
              paymentId: response.razorpay_payment_id,
              updatedAt: serverTimestamp()
            });

            // Create enrollment record
            await addDoc(collection(db, "enrollments"), {
              userId: userData.id,
              courseId: orderData.courseId,
              orderId: orderData.id,
              paymentId: response.razorpay_payment_id,
              amount: orderData.amount,
              enrolledAt: serverTimestamp(),
              status: "active"
            });

            // Send notifications
            await Promise.all([
              // Admin notification
              addDoc(collection(db, "adminNotifications"), {
                type: "payment_success",
                courseId: orderData.courseId,
                courseName: orderData.courseName,
                userId: userData.id,
                userName: userData.name,
                amount: orderData.amount / 100,
                paymentId: response.razorpay_payment_id,
                createdAt: serverTimestamp(),
                status: "unread",
                title: "New Course Payment",
                message: `${userData.name} has enrolled in ${orderData.courseName}`
              }),
              // Creator notification
              addDoc(collection(db, "creatorNotifications"), {
                type: "course_purchase",
                courseId: orderData.courseId,
                courseName: orderData.courseName,
                userId: userData.id,
                userName: userData.name,
                amount: orderData.amount / 100,
                paymentId: response.razorpay_payment_id,
                createdAt: serverTimestamp(),
                status: "unread",
                title: "New Course Purchase",
                message: `${userData.name} has purchased your course ${orderData.courseName}`,
                creatorId: orderData.creatorId
              })
            ]);

            if (successCallback) {
              successCallback(response, { verified: true });
            }
          } catch (error) {
            console.error("Error processing payment:", error);
            if (failureCallback) {
              failureCallback({
                message: error.message || "Payment processing failed",
                code: "PAYMENT_FAILED",
                source: "server",
                details: error
              });
            }
          }
        },
        prefill: {
          name: userData.name || "",
          email: userData.email || "",
          contact: userData.phone || ""
        },
        notes: {
          userId: userData.id,
          courseId: orderData.courseId,
          creatorId: orderData.creatorId
        },
        theme: {
          color: "#4F46E5"
        },
        modal: {
          confirm_close: true,
          ondismiss: () => {
            if (failureCallback) {
              failureCallback({
                message: "Payment cancelled by user",
                code: "PAYMENT_CANCELLED",
                source: "user"
              });
            }
          }
        }
      };

      const razorpay = new window.Razorpay(options);
      
      razorpay.on("payment.failed", async (response) => {
        console.error("Payment failed:", response);
        
        await updateDoc(doc(db, "razorpayOrders", orderData.id), {
          status: "failed",
          paymentId: response.error?.metadata?.payment_id,
          errorMessage: response.error?.description,
          updatedAt: serverTimestamp()
        });
        
        if (failureCallback) {
          failureCallback({
            message: response.error?.description || "Payment failed",
            code: response.error?.code || "UNKNOWN_ERROR",
            source: "razorpay",
            metadata: response.error?.metadata || {}
          });
        }
      });

      razorpay.open();
      return true;
    } catch (error) {
      console.error("Error initiating payment:", error);
      if (failureCallback) {
        failureCallback({
          message: error.message || "Failed to initiate payment",
          code: "INITIALIZATION_ERROR",
          source: "system"
        });
      }
      throw error;
    }
  }

  async enrollUserInCourse(userId, courseId, paymentDetails = null) {
    try {
      // Get user and course data
      const [userSnap, courseSnap] = await Promise.all([
        getDoc(doc(db, "users", userId)),
        getDoc(doc(db, "courses", courseId))
      ]);
      
      if (!userSnap.exists()) {
        throw new Error("User not found");
      }
      if (!courseSnap.exists()) {
        throw new Error("Course not found");
      }

      const userData = userSnap.data();
      const courseData = courseSnap.data();
      if (userData.role === "banned" || userData.role === "suspended") {
        throw new Error("Account is not permitted to enroll in courses");
      }

      await Promise.all([
        // Create enrollment
        addDoc(collection(db, "enrollments"), {
          userId: userId,
          courseId: courseId,
          status: "active",
          enrolledAt: serverTimestamp(),
          accessUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year access
          paymentDetails: paymentDetails
        }),
        // Create notifications
        addDoc(collection(db, "adminNotifications"), {
          type: "enrollment",
          courseId: courseId,
          courseName: courseData.name,
          userId: userId,
          userName: userData.name,
          createdAt: serverTimestamp(),
          status: "unread",
          title: "New Course Enrollment",
          message: `${userData.name} has enrolled in ${courseData.name}`
        }),
        // Notify course creator if exists
        courseData.creatorId && addDoc(collection(db, "creatorNotifications"), {
          type: "new_enrollment",
          courseId: courseId,
          courseName: courseData.name,
          userId: userId,
          userName: userData.name,
          createdAt: serverTimestamp(),
          status: "unread",
          title: "New Student Enrollment",
          message: `${userData.name} has enrolled in your course ${courseData.name}`,
          creatorId: courseData.creatorId
        }),
        // Update user document
        updateDoc(doc(db, "users", userId), {
          [`enrolledCourses.${courseId}`]: {
            status: "active",
            enrolledAt: serverTimestamp(),
            accessUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          },
          updatedAt: serverTimestamp()
        })
      ]);

      return true;
    } catch (error) {
      console.error("Error enrolling user:", error);
      throw error;
    }
  }

  verifyPaymentSignature(response) {
    if (!response.razorpay_payment_id || !response.razorpay_order_id || !response.razorpay_signature) {
      console.error("Missing required payment verification fields");
      return false;
    }

    try {
      const { razorpay_signature } = response;
      
      // Validate signature format
      if (!razorpay_signature.match(/^[a-f0-9]{40}$/i)) {
        console.error("Invalid signature format");
        return false;
      }

      // TODO: Add server-side signature verification
      // const verified = await fetch("/api/verify-razorpay-signature", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ 
      //     orderId: razorpay_order_id, 
      //     paymentId: razorpay_payment_id, 
      //     signature: razorpay_signature 
      //   })
      // }).then(r => r.json());
      // return verified.success;

      return true;
    } catch (error) {
      console.error("Payment signature verification failed:", error);
      return false;
    }
  }
}

const razorpayService = new RazorpayService();
export default razorpayService;
