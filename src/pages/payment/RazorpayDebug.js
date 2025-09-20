import React, { useState, useEffect } from 'react';
import { Container, Card, ListGroup, Button, Form, Alert } from 'react-bootstrap';
import { useAuth } from '../../contexts/AuthContext';
import RazorpayService from '../../utils/RazorpayService';

const RazorpayDebug = () => {
  // const { currentUser } = useAuth();
  const [razorpayLoaded, setRazorpayLoaded] = useState(false);
  const [environment, setEnvironment] = useState({});
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    // Check if Razorpay is loaded
    const checkRazorpay = () => {
      if (window.Razorpay) {
        setRazorpayLoaded(true);
      }
    };

    // Try to load Razorpay manually
    const loadRazorpay = () => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.async = true;
      
      script.onload = () => {
        console.log('Razorpay script loaded successfully in debug page');
        setRazorpayLoaded(true);
      };
      
      script.onerror = (error) => {
        console.error('Failed to load Razorpay script in debug page:', error);
      };
      
      document.body.appendChild(script);
    };

    // Collect environment info
    const collectEnvironmentInfo = () => {
      setEnvironment({
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        cookiesEnabled: navigator.cookieEnabled,
        screenWidth: window.screen.width,
        screenHeight: window.screen.height,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        dotNetRuntime: window.navigator.userAgent.indexOf('.NET') > -1,
        isHttps: window.location.protocol === 'https:',
        hasLocalStorage: !!window.localStorage,
        hasSessionStorage: !!window.sessionStorage
      });
    };

    checkRazorpay();
    if (!window.Razorpay) {
      loadRazorpay();
    }
    collectEnvironmentInfo();
  }, []);

  const runRazorpayTest = () => {
    try {
      if (!window.Razorpay) {
        setTestResult({
          success: false,
          message: 'Razorpay script failed to load. Try refreshing the page.'
        });
        return;
      }

      // Create a test instance (won't actually charge anything)
      const rzp = new window.Razorpay({
        key: 'rzp_test_tSkVPhb1dwSOoX', // This is safe to use directly in the test page
        amount: 100,
        currency: 'INR',
        name: 'Test Transaction',
        description: 'Test Payment',
        image: 'https://mentlearn.in/logo.png',
        handler: function() {
          setTestResult({
            success: true,
            message: 'Razorpay test instance created successfully!'
          });
        },
        prefill: {
          name: 'Test User',
          email: 'test@example.com',
          contact: '9999999999'
        },
        notes: {
          address: 'Test Address'
        },
        theme: {
          color: '#4568dc'
        }
      });

      setTestResult({
        success: true,
        message: 'Razorpay test instance created successfully! Click Open to test the payment flow.'
      });

      window.testRazorpay = () => rzp.open();
    } catch (error) {
      console.error('Razorpay test error:', error);
      setTestResult({
        success: false,
        message: `Razorpay test failed: ${error.message || 'Unknown error'}`
      });
    }
  };

  return (
    <Container className="py-5">
      <h1 className="mb-4">Razorpay Payment Debugging</h1>
      
      <Card className="mb-4">
        <Card.Header>Razorpay Status</Card.Header>
        <Card.Body>
          <Alert variant={razorpayLoaded ? "success" : "danger"}>
            Razorpay Script: {razorpayLoaded ? "Loaded ✅" : "Not Loaded ❌"}
          </Alert>
          <Button 
            variant="primary" 
            onClick={runRazorpayTest}
            disabled={!razorpayLoaded}
          >
            Test Razorpay Configuration
          </Button>
          
          {testResult && (
            <Alert variant={testResult.success ? "success" : "danger"} className="mt-3">
              {testResult.message}
              {testResult.success && (
                <Button 
                  variant="outline-primary" 
                  size="sm" 
                  className="ms-3"
                  onClick={() => window.testRazorpay()}
                >
                  Open Test Checkout
                </Button>
              )}
            </Alert>
          )}
        </Card.Body>
      </Card>
      
      <Card className="mb-4">
        <Card.Header>Environment Information</Card.Header>
        <ListGroup variant="flush">
          {Object.entries(environment).map(([key, value]) => (
            <ListGroup.Item key={key} className="d-flex justify-content-between">
              <strong>{key}:</strong> <span>{String(value)}</span>
            </ListGroup.Item>
          ))}
        </ListGroup>
      </Card>
      
      <Card>
        <Card.Header>Test Payment</Card.Header>
        <Card.Body>
          <Form.Group className="mb-3">
            <Form.Label>Test Card Number</Form.Label>
            <Form.Control readOnly value="4111 1111 1111 1111" />
            <Form.Text className="text-muted">
              Use this test card number for Razorpay sandbox testing
            </Form.Text>
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>Expiry</Form.Label>
            <Form.Control readOnly value="Any future date" />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>CVV</Form.Label>
            <Form.Control readOnly value="Any 3 digits" />
          </Form.Group>
          
          <Form.Group className="mb-3">
            <Form.Label>OTP</Form.Label>
            <Form.Control readOnly value="1234" />
          </Form.Group>
        </Card.Body>
      </Card>
    </Container>
  );
};

export default RazorpayDebug;
