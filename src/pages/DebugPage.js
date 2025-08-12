import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const DebugPage = () => {
  const { currentUser } = useAuth();
  const { darkMode } = useTheme();

  return (
    <div className={`min-h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-900'} p-4`}>
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Debug Page</h1>
        
        <div className={`p-6 rounded-lg shadow-lg mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className="text-xl font-semibold mb-4">Authentication Status</h2>
          {currentUser ? (
            <div>
              <p className="mb-2"><strong>Logged In:</strong> Yes</p>
              <p className="mb-2"><strong>User ID:</strong> {currentUser.uid}</p>
              <p className="mb-2"><strong>Email:</strong> {currentUser.email}</p>
            </div>
          ) : (
            <p className="text-red-500 font-medium">Not logged in</p>
          )}
        </div>
        
        <div className={`p-6 rounded-lg shadow-lg mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className="text-xl font-semibold mb-4">Theme Status</h2>
          <p className="mb-2"><strong>Dark Mode:</strong> {darkMode ? 'Enabled' : 'Disabled'}</p>
          <p className="mb-2"><strong>CSS Classes:</strong> {darkMode ? 'dark mode classes active' : 'light mode classes active'}</p>
        </div>
        
        <div className={`p-6 rounded-lg shadow-lg mb-6 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className="text-xl font-semibold mb-4">Navigation Links</h2>
          <div className="space-y-2">
            <p><Link to="/" className="text-blue-500 hover:underline">Home</Link></p>
            <p><Link to="/login" className="text-blue-500 hover:underline">Login</Link></p>
            <p><Link to="/student/dashboard" className="text-blue-500 hover:underline">Original Student Dashboard</Link></p>
            <p><Link to="/student/new-dashboard" className="text-blue-500 hover:underline">New Student Dashboard</Link></p>
            <p><Link to="/admin/dashboard" className="text-blue-500 hover:underline">Admin Dashboard</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DebugPage;
