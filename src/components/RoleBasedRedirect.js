import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';

/**
 * RoleBasedRedirect Component
 * Redirects users to their appropriate dashboard based on their role
 */
export default function RoleBasedRedirect() {
  const { currentUser, userRole, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return; // Wait for auth to finish loading

    if (!currentUser) {
      // Not logged in, redirect to login
      navigate('/login');
      return;
    }

    // Redirect based on user role
    console.log('RoleBasedRedirect - User role:', userRole);
    
    switch (userRole) {
      case 'admin':
        navigate('/admin/dashboard');
        break;
      case 'creator':
        navigate('/creator/dashboard');
        break;
      case 'mentor':
        navigate('/mentor/dashboard');
        break;
      case 'data_analyst':
        navigate('/data-analyst/dashboard');
        break;
      case 'student':
      default:
        // Default to student dashboard
        navigate('/student/student-dashboard');
        break;
    }
  }, [currentUser, userRole, loading, navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading your dashboard...</h2>
        <p className="text-gray-600">Please wait while we set things up</p>
      </div>
    </div>
  );
}
