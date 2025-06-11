import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import RazorpayService from '../utils/RazorpayService';
import { Button, Spinner, Alert, Container, Card, Row, Col, Badge, ListGroup } from 'react-bootstrap';
import { collection, getDocs, query, where, limit } from 'firebase/firestore';
import { db } from '../firebase/firebase';
import '../styles/PaymentStyles.css';

const SignupPaymentFlow = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { currentUser, userDetails } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [paymentInitiated, setPaymentInitiated] = useState(false);
  const [courses, setCourses] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState('complete');
  
  // Pricing plans
  const pricingPlans = {
    complete: {
      name: 'Complete Bundle',
      price: 4999,
      originalPrice: 8999,
      discount: '44%',
      features: [
        'Access to all current courses',
        'Future course updates for 1 year',
        'Live mentorship sessions',
        'Interview preparation',
        'Project reviews',
        'Certificate of completion',
        'Priority support'
      ]
    },
    basic: {
      name: 'Basic Plan',
      price: 2999,
      originalPrice: 4999,
      discount: '40%',
      features: [
        'Access to selected courses',
        'Self-paced learning',
        'Community support',
        'Certificate of completion'
      ]
    }
  };

  // Fetch available courses
  useEffect(() => {
    const fetchCourses = async () => {
      try {
        // Try to fetch courses from Firestore
        try {
          const coursesQuery = query(collection(db, 'courses'), where('isActive', '==', true), limit(10));
          const coursesSnapshot = await getDocs(coursesQuery);
          const coursesList = coursesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          
          if (coursesList.length > 0) {
            setCourses(coursesList);
            return;
          }
        } catch (err) {
          console.error('Error fetching actual courses:', err);
        }
        
        // Fallback to sample courses if no courses found or error
        setCourses([
          { id: '1', title: 'Full Stack Web Development', premium: false, level: 'Beginner to Advanced' },
          { id: '2', title: 'React.js Masterclass', premium: false, level: 'Intermediate' },
          { id: '3', title: 'Node.js Backend Development', premium: false, level: 'Intermediate' },
          { id: '4', title: 'Advanced JavaScript', premium: true, level: 'Advanced' },
          { id: '5', title: 'Firebase & Cloud Functions', premium: true, level: 'Advanced' },
          { id: '6', title: 'UI/UX Design Fundamentals', premium: false, level: 'Beginner' }
        ]);
      } catch (error) {
        console.error('Error in course fetching process:', error);
        // Even if fetch fails, show some sample courses
        setCourses([
          { id: '1', title: 'Web Development Fundamentals', premium: false, level: 'Beginner' },
          { id: '2', title: 'Advanced React Patterns', premium: true, level: 'Advanced' }
        ]);
      }
    };
    
    fetchCourses();
  }, []);

  // Start payment flow when component mounts
  useEffect(() => {
    // Check if user is coming directly from signup or with autoInitiate flag
    const comingFromSignup = location.state?.fromSignup === true;
    const shouldAutoInitiate = location.state?.autoInitiate === true || comingFromSignup;
    
    // Automatically initiate payment if user exists and not already initiated
    if (currentUser && !paymentInitiated && shouldAutoInitiate) {
      console.log("Auto-initiating payment after signup");
      setTimeout(() => {
        // Short timeout to ensure component is fully rendered before showing payment
        initiatePayment();
      }, 500);
    } else if (currentUser && !paymentInitiated) {
      console.log("Payment page loaded but not auto-initiating");
    }
  }, [currentUser, location.state, paymentInitiated]);

  const initiatePayment = async () => {
    if (!currentUser) return;
    
    setLoading(true);
    setPaymentInitiated(true);
    
    try {
      console.log("Creating Razorpay order for plan:", selectedPlan);
      const plan = pricingPlans[selectedPlan];
      
      // Create Razorpay order
      const orderData = await RazorpayService.createOrder(
        currentUser.uid,
        plan.price, // Use selected plan price
        {
          name: userDetails?.name || currentUser.displayName || '',
          email: userDetails?.email || currentUser.email || '',
          phone: userDetails?.phone || ''
        },
        selectedPlan // Pass selected plan info
      );
      
      console.log("Order created, opening payment dialog", orderData);
      
      // Process payment with enhanced error handling
      await RazorpayService.processPayment(
        orderData,
        {
          id: currentUser.uid,
          name: userDetails?.name || currentUser.displayName || '',
          email: userDetails?.email || currentUser.email || '',
          phone: userDetails?.phone || '',
          plan: selectedPlan
        },
        // Success callback
        (response, data) => {
          console.log('Payment successful:', response);
          navigate('/payment-verification', { 
            state: { 
              paymentSuccess: true,
              message: "Payment successful! Your account is pending verification by our team.",
              plan: selectedPlan
            } 
          });
        },
        // Failure callback with improved error logging
        (error) => {
          console.error('Payment failed details:', {
            errorMessage: error.message,
            errorObject: error,
            orderData: orderData,
            userId: currentUser.uid
          });
          
          let errorMessage = 'Something went wrong with the payment process.';
          
          // Provide more specific error messages based on common Razorpay errors
          if (error.message?.includes('network')) {
            errorMessage = 'Network error occurred. Please check your internet connection and try again.';
          } else if (error.message?.includes('cancelled') || error.description?.includes('cancelled')) {
            errorMessage = 'Payment was cancelled. You can try again when ready.';
          } else if (error.message?.includes('authentication') || error.message?.includes('authorized')) {
            errorMessage = 'Payment authorization failed. Please try with a different payment method.';
          } else if (error.message?.includes('insufficient')) {
            errorMessage = 'Payment failed due to insufficient funds. Please try with a different card/method.';
          }
          
          setError('Payment failed: ' + errorMessage);
          setLoading(false);
          setPaymentInitiated(false);
        }
      );
    } catch (error) {
      console.error('Error initiating payment:', error);
      let errorMessage = 'Failed to initiate payment. Please try again.';
      
      // Check for specific errors
      if (error.message?.includes('script')) {
        errorMessage = 'Failed to load payment gateway. Please check your internet connection and try again.';
      } else if (error.message?.includes('order')) {
        errorMessage = 'Failed to create payment order. Please try again or contact support.';
      }
      
      setError(errorMessage);
      setLoading(false);
      setPaymentInitiated(false);
    }
  };

  const renderCourseList = () => {
    if (courses.length === 0) {
      return (
        <div className="text-center p-4">
          <Spinner animation="border" size="sm" className="me-2" />
          Loading course information...
        </div>
      );
    }

    return (
      <ListGroup variant="flush">
        {courses.slice(0, 5).map(course => (
          <ListGroup.Item key={course.id} className="d-flex justify-content-between align-items-center">
            <div>
              <strong>{course.title}</strong>
              {selectedPlan === 'complete' && course.premium && 
                <Badge bg="success" className="ms-2">Premium</Badge>
              }
            </div>
            <Badge bg={selectedPlan === 'complete' || !course.premium ? "success" : "secondary"} pill>
              {selectedPlan === 'complete' || !course.premium ? "Included" : "Not included"}
            </Badge>
          </ListGroup.Item>
        ))}
        {courses.length > 5 && (
          <ListGroup.Item className="text-center text-muted">
            +{courses.length - 5} more courses
          </ListGroup.Item>
        )}
      </ListGroup>
    );
  };

  if (loading) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "70vh" }}>
        <Card className="shadow text-center p-4" style={{ maxWidth: "500px" }}>
          <Card.Body>
            <Spinner animation="border" role="status" className="mb-4" />
            <h3>Processing Payment...</h3>
            <p className="text-muted">Please do not refresh or close this page.</p>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="d-flex justify-content-center align-items-center" style={{ minHeight: "70vh" }}>
        <Card className="shadow p-4" style={{ maxWidth: "500px" }}>
          <Card.Body>
            <Alert variant="danger">
              <Alert.Heading>Payment Failed</Alert.Heading>
              <p>{error}</p>
            </Alert>
            <div className="d-flex justify-content-between mt-3">
              <Button variant="primary" onClick={() => setPaymentInitiated(false)}>
                Try Again
              </Button>
              <Button variant="outline-secondary" onClick={() => navigate('/student/dashboard')}>
                Continue to Dashboard
              </Button>
            </div>
          </Card.Body>
        </Card>
      </Container>
    );
  }

  // Only updating the button styling in the return statement
  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col lg={10}>
          <Card className="shadow border-0 mb-4 payment-container">
            <Card.Header className="payment-header">
              <h2 className="mb-0 text-center">Choose Your Learning Plan</h2>
            </Card.Header>
            <Card.Body className="p-4">
              <Row>
                <Col md={7} className="mb-4 mb-md-0">
                  <h3 className="mb-4">Included Courses</h3>
                  {renderCourseList()}
                  
                  <h4 className="mt-4 mb-3">What You'll Learn</h4>
                  <ListGroup variant="flush">
                    <ListGroup.Item className="course-list-item">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      Full-stack web development with React and Node.js
                    </ListGroup.Item>
                    <ListGroup.Item className="course-list-item">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      Modern JavaScript ES6+ concepts and practices
                    </ListGroup.Item>
                    <ListGroup.Item className="course-list-item">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      Database design with MongoDB and Firebase
                    </ListGroup.Item>
                    <ListGroup.Item className="course-list-item">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      Building responsive UI with React and Bootstrap
                    </ListGroup.Item>
                    <ListGroup.Item className="course-list-item">
                      <i className="bi bi-check-circle-fill text-success me-2"></i>
                      Authentication and security best practices
                    </ListGroup.Item>
                  </ListGroup>
                </Col>
                
                <Col md={5}>
                  <div className="pricing-options">
                    <div 
                      className={`pricing-plan mb-3 p-3 position-relative ${selectedPlan === 'complete' ? 'plan-selected' : 'border rounded'}`} 
                      onClick={() => setSelectedPlan('complete')}
                      style={{ cursor: 'pointer' }}
                    >
                      {selectedPlan === 'complete' && (
                        <Badge bg="danger" className="discount-badge">
                          {pricingPlans.complete.discount} OFF
                        </Badge>
                      )}
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h5 className="mb-0">{pricingPlans.complete.name}</h5>
                        {selectedPlan === 'complete' && <Badge bg="primary">SELECTED</Badge>}
                      </div>
                      <div className="price-section">
                        <span className="text-muted text-decoration-line-through">₹{pricingPlans.complete.originalPrice}</span>
                        <span className="ms-2 h4">₹{pricingPlans.complete.price}</span>
                      </div>
                      <hr />
                      <ul className="feature-list ps-3 mb-0">
                        {pricingPlans.complete.features.map((feature, idx) => (
                          <li key={idx} className="mb-2">
                            <i className="bi bi-check-circle-fill text-success me-2"></i>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div 
                      className={`pricing-plan p-3 position-relative ${selectedPlan === 'basic' ? 'plan-selected' : 'border rounded'}`} 
                      onClick={() => setSelectedPlan('basic')}
                      style={{ cursor: 'pointer' }}
                    >
                      {selectedPlan === 'basic' && (
                        <Badge bg="danger" className="discount-badge">
                          {pricingPlans.basic.discount} OFF
                        </Badge>
                      )}
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <h5 className="mb-0">{pricingPlans.basic.name}</h5>
                        {selectedPlan === 'basic' && <Badge bg="primary">SELECTED</Badge>}
                      </div>
                      <div className="price-section">
                        <span className="text-muted text-decoration-line-through">₹{pricingPlans.basic.originalPrice}</span>
                        <span className="ms-2 h4">₹{pricingPlans.basic.price}</span>
                      </div>
                      <hr />
                      <ul className="feature-list ps-3 mb-0">
                        {pricingPlans.basic.features.map((feature, idx) => (
                          <li key={idx} className="mb-2">
                            <i className="bi bi-check-circle-fill text-success me-2"></i>
                            {feature}
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="mt-4">
                      <Button 
                        variant="primary" 
                        size="lg" 
                        className="w-100 py-3 payment-btn" 
                        onClick={initiatePayment}
                        disabled={loading}
                      >
                        {loading ? (
                          <>
                            <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" className="me-2" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <i className="bi bi-lock-fill me-2"></i>
                            Proceed to Secure Payment (₹{pricingPlans[selectedPlan].price})
                          </>
                        )}
                      </Button>
                      
                      <div className="text-center mt-3">
                        <small className="text-muted d-block">
                          <i className="bi bi-shield-check me-1"></i>
                          Secure Payment via Razorpay
                        </small>
                        <small className="text-muted d-block mt-1">
                          <i className="bi bi-headset me-1"></i>
                          Need help? Contact support@mentlearn.in
                        </small>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
};

export default SignupPaymentFlow;
