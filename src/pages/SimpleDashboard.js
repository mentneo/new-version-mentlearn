import React from 'react';
import { useAuth } from '../contexts/AuthContext.js';
import { Link } from 'react-router-dom';

const SimpleDashboard = () => {
  const { currentUser, logout } = useAuth();
  
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto bg-white rounded-lg shadow-md p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Temporary Dashboard</h1>
          <p className="mt-2 text-gray-600">
            This is a simplified dashboard while we fix some issues.
          </p>
        </div>
        
        <div className="mt-8 border-t border-gray-200 pt-6">
          <h2 className="text-xl font-semibold text-gray-900">Your Account</h2>
          <div className="mt-4 bg-gray-50 p-4 rounded-md">
            <p><strong>Email:</strong> {currentUser?.email || 'Not logged in'}</p>
            <p><strong>User ID:</strong> {currentUser?.uid || 'Not available'}</p>
          </div>
        </div>
        
        <div className="mt-8 border-t border-gray-200 pt-6">
          <h2 className="text-xl font-semibold text-gray-900">Navigation</h2>
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Link 
              to="/debug"
              className="bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-3 rounded-md text-center font-medium"
            >
              Debug Page
            </Link>
            <Link 
              to="/student/dashboard"
              className="bg-green-100 text-green-700 hover:bg-green-200 px-4 py-3 rounded-md text-center font-medium"
            >
              Original Dashboard
            </Link>
            <Link 
              to="/admin/dashboard"
              className="bg-purple-100 text-purple-700 hover:bg-purple-200 px-4 py-3 rounded-md text-center font-medium"
            >
              Admin Dashboard
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-100 text-red-700 hover:bg-red-200 px-4 py-3 rounded-md text-center font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleDashboard;
