import React, { useEffect, useState } from 'react';
import { Container, Card, Button, Alert } from 'react-bootstrap';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../contexts/AuthContext';

const PaymentSuccess = () => {
  const { courseId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [paymentInfo, setPaymentInfo] = useState(null);
  const [error, setError] = useState(null);

  // Get payment details from URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const paymentId = queryParams.get('razorpay_payment_id');
  const orderId = queryParams.get('razorpay_order_id');
  const signature = queryParams.get('razorpay_signature');

  useEffect(() => {
    const verifyPayment = async () => {
      if (!currentUser || !paymentId || !orderId || !signature) {
        setError("Invalid payment verification data");
        setLoading(false);
        return;
      }

      try {
        // Get payment details from Firestore
        const paymentDocRef = doc(db, "payments", paymentId);
        const paymentDoc = await getDoc(paymentDocRef);
        
        if (paymentDoc.exists()) {
          setPaymentInfo(paymentDoc.data());
        } else {
          // Record this payment success in Firestore if not already recorded
          // This is a fallback in case webhook hasn't processed yet
          const userRef = doc(db, "users", currentUser.uid);
          await updateDoc(userRef, {
            hasPaid: true,
            accessGranted: true,
            paymentDate: new Date(),
            paymentId: paymentId,
            orderId: orderId
          });
          
          setPaymentInfo({
            amount: 4999,
            status: 'success',
            date: new Date()
          });
        }
      } catch (error) {
        console.error("Error verifying payment:", error);
        setError("Failed to verify payment. Please contact support.");
      } finally {
        setLoading(false);
      }
    };

    verifyPayment();
  }, [currentUser, paymentId, orderId, signature]);

  const handleContinueToDashboard = () => {
    navigate('/student/dashboard');
  };

  return (
    <Container className="mt-5">
      <Card className="shadow">
        <Card.Body className="p-5 text-center">
          {loading ? (
            <div>
              <i className="bi bi-hourglass-split fs-1 text-primary mb-3"></i>
              <h3>Verifying Payment...</h3>
              <p>Please wait while we verify your payment.</p>
            </div>
          ) : error ? (
            <div>
              <Alert variant="danger">
                <i className="bi bi-exclamation-circle-fill me-2"></i>
                {error}
              </Alert>
              <Button 
                variant="primary" 
                className="mt-3"
                onClick={() => navigate('/payment-flow')}
              >
                Try Again
              </Button>
            </div>
          ) : (
            <div>
              <i className="bi bi-check-circle-fill fs-1 text-success mb-3"></i>
              <h2 className="mb-4">Payment Successful!</h2>
              
              <div className="payment-details bg-light p-4 mb-4 rounded">
                <p className="mb-2">
                  <strong>Amount:</strong> ₹{paymentInfo?.amount || '4999'}
                </p>
                <p className="mb-2">
                  <strong>Payment ID:</strong> {paymentId}
                </p>
                <p className="mb-2">
                  <strong>Date:</strong> {paymentInfo?.date ? new Date(paymentInfo.date.seconds * 1000).toLocaleString() : new Date().toLocaleString()}
                </p>
              </div>
              
              <p className="mb-4">
                Thank you for your payment. You now have full access to all courses and features.
              </p>
              
              <Button 
                variant="primary" 
                size="lg" 
                onClick={handleContinueToDashboard}
              >
                Continue to Dashboard
              </Button>
            </div>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PaymentSuccess;
