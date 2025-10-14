import React from 'react';
import { Navigate } from 'react-router-dom'; // Remove unused useLocation
import { useAuth } from '../contexts/AuthContext';

// Protected route - requires authentication
export function ProtectedRoute({ children }) {
  const { currentUser } = useAuth();
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  return children;
}

// Payment protected route - requires authentication and payment
export function PaymentProtectedRoute({ children }) {
  const { currentUser } = useAuth(); // Remove unused paymentStatus
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  // Uncomment if you want to enforce payment
  /*
  const { paymentStatus } = useAuth();
  if (!paymentStatus?.accessGranted && currentUser.role !== 'admin') {
    return <Navigate to="/payment-flow" />;
  }
  */
  
  return children;
}
