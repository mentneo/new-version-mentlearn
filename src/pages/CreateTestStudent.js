import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext.js';

export default function CreateTestStudent() {
  const { createTestStudent } = useAuth();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleCreateTestStudent = async () => {
    try {
      setLoading(true);
      setError('');
      setMessage('');

      await createTestStudent();
      setMessage('Test student created successfully! Email: test.student@mentneo.com, Password: TestPass123!');
    } catch (err) {
      console.error('Error creating test student:', err);
      setError(err.message || 'Failed to create test student');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="max-w-md w-full bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          Create Test Student
        </h1>

        <div className="space-y-4">
          <p className="text-gray-600 text-center">
            This will create a test student account with free access to all courses.
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-md p-4">
            <h3 className="text-sm font-medium text-blue-800 mb-2">Test Account Details:</h3>
            <p className="text-sm text-blue-700"><strong>Email:</strong> test.student@mentneo.com</p>
            <p className="text-sm text-blue-700"><strong>Password:</strong> TestPass123!</p>
          </div>

          {message && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <p className="text-sm text-green-800">{message}</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          <button
            onClick={handleCreateTestStudent}
            disabled={loading}
            className={`w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
              loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
            }`}
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                Creating...
              </>
            ) : (
              'Create Test Student'
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
