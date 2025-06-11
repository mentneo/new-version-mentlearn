import React, { useEffect, useState } from 'react';
import { Container, Card, Button, Alert } from 'react-bootstrap';
import { useNavigate, useLocation } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../contexts/AuthContext';
// Import the CSS
import '../../styles/PaymentStyles.css';

const PaymentVerification = () => {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [verificationStatus, setVerificationStatus] = useState('pending');
  const [loading, setLoading] = useState(true);

  const message = location.state?.message || "Your payment has been received. Your account is now pending verification by our team.";
  const plan = location.state?.plan || "complete";
  
  // Check verification status
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    const checkVerificationStatus = async () => {
      try {
        const userRef = doc(db, 'users', currentUser.uid);
        const userSnap = await getDoc(userRef);
        
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setVerificationStatus(userData.verificationStatus || 'pending');
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error checking verification status:', error);
        setLoading(false);
      }
    };
    
    checkVerificationStatus();
    
    // Set up interval to check verification status every 30 seconds
    const intervalId = setInterval(checkVerificationStatus, 30000);
    
    return () => clearInterval(intervalId);
  }, [currentUser, navigate]);

  const handleEmailSupport = () => {
    window.location.href = 'mailto:support@mentlearn.in?subject=Account%20Verification%20Request';
  };

  return (
    <Container className="py-5">
      <Card className="shadow mx-auto payment-container" style={{ maxWidth: '700px' }}>
        <Card.Header className="payment-header text-white py-3 text-center">
          <h2 className="mb-0">Payment Successful</h2>
        </Card.Header>
        <Card.Body className="p-4 text-center">
          <div className="verification-icon mb-4">
            {loading ? (
              <i className="bi bi-hourglass-split text-primary payment-pulse"></i>
            ) : verificationStatus === 'approved' ? (
              <i className="bi bi-check-circle-fill verification-approved"></i>
            ) : (
              <i className="bi bi-clock-history verification-pending"></i>
            )}
          </div>
          
          <h3 className="mb-3">
            {loading ? "Checking status..." : 
             verificationStatus === 'approved' ? "Account Verified!" : 
             "Verification Pending"}
          </h3>
          
          <p className="lead mb-4">{message}</p>
          
          <Alert variant="info" className="mb-4">
            <h5>Next Steps:</h5>
            <p>
              {verificationStatus === 'approved' ? 
                "Your account has been verified. You now have full access to all course materials." :
                "Our team will verify your payment and activate your account within 24 hours. You'll receive an email notification when your account is ready."}
            </p>
          </Alert>
          
          <div className="plan-details p-3 mb-4 bg-light rounded">
            <h5>Your Plan: {plan === 'complete' ? 'Complete Bundle' : 'Basic Plan'}</h5>
            <p className="mb-0">
              {plan === 'complete' ? 
                "You'll have access to all courses and premium features once verified." :
                "You'll have access to selected courses once verified."}
            </p>
          </div>
          
          <div className="d-grid gap-3">
            {verificationStatus === 'approved' ? (
              <Button variant="primary" size="lg" className="payment-btn" onClick={() => navigate('/student/dashboard')}>
                Continue to Dashboard
              </Button>
            ) : (
              <>
                <Button variant="outline-primary" onClick={() => navigate('/')}>
                  Return to Home Page
                </Button>
                <Button variant="link" onClick={handleEmailSupport}>
                  Need help? Contact support
                </Button>
              </>
            )}
          </div>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default PaymentVerification;
