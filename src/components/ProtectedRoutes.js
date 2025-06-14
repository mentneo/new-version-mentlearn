import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Basic protected route
export const ProtectedRoute = ({ children }) => {
  const { currentUser } = useAuth();
  const location = useLocation();
  
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  return children;
};

// Payment protected route
export const PaymentProtectedRoute = ({ children, requiresPayment = false }) => {
  const { currentUser, paymentStatus } = useAuth();
  const location = useLocation();
  
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  
  if (requiresPayment && (!paymentStatus || !paymentStatus.hasPaid)) {
    return <Navigate 
      to="/payment-flow" 
      state={{ 
        fromProtectedRoute: true,
        returnTo: location.pathname,
        ...location.state
      }} 
      replace 
    />;
  }
  
  return children;
};
