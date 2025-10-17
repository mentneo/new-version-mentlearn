import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.js';

export default function CreateTestCreator() {
  const { createTestCreator } = useAuth();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleCreateTestCreator = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    
    try {
      const credentials = await createTestCreator();
      setResult(credentials);
      console.log('Test creator created/updated:', credentials);
    } catch (error) {
      if (error.code === 'auth/too-many-requests') {
        setError(
          'Firebase has temporarily blocked attempts to sign in due to too many requests. ' +
          'Please wait a few minutes before trying again or use an existing account. ' +
          'This is a security measure to protect your account.'
        );
      } else {
        setError(`Error creating test creator: ${error.message}`);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-indigo-600 px-6 py-4">
          <h2 className="text-xl font-bold text-white">Create Test Creator</h2>
          <p className="text-indigo-200 text-sm">For development and testing purposes only</p>
        </div>
        
        <div className="p-6">
          {error && (
            <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded">
              <p>{error}</p>
            </div>
          )}
          
          {result && (
            <div className="mb-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded">
              <h3 className="font-bold mb-2">Test Creator Created!</h3>
              <p><strong>Email:</strong> {result.email}</p>
              <p><strong>Password:</strong> {result.password}</p>
              <p><strong>User ID:</strong> {result.uid}</p>
            </div>
          )}
          
          <p className="mb-6 text-gray-600">
            This will create a special test creator account with pre-configured data for testing the creator features.
            If the account already exists, it will be updated.
          </p>
          
          <div className="flex justify-center">
            <button
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline transition duration-150"
              onClick={handleCreateTestCreator}
              disabled={loading}
            >
              {loading ? (
                <div className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </div>
              ) : (
                "Create Test Creator"
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}