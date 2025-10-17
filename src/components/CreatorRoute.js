import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';

export default function CreatorRoute({ children }) {
  const { currentUser, loading } = useAuth();
  const location = useLocation();

  // Show loading while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  // Check if the user is authenticated
  if (!currentUser) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }

  // Check if the user is a creator
  if (currentUser.role !== 'creator') {
    console.log("Unauthorized access attempt to creator page. User details:", {
      uid: currentUser.uid,
      email: currentUser.email,
      role: currentUser.role,
      name: currentUser.name
    });
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}
