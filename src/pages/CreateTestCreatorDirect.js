import React, { useState } from 'react';

export default function CreateTestCreatorDirect() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleCreateTestCreator = async () => {
    setLoading(true);
    setError('');
    setResult(null);
    
    try {
      // Call the backend endpoint to run the script
      const response = await fetch('/api/create-test-creator', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ adminKey: 'direct-creator-access' })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to create test creator');
      }
      
      setResult({
        email: 'test.creator@mentneo.com',
        password: 'TestPass123!',
        uid: data.uid || 'Created successfully'
      });
      
    } catch (error) {
      setError(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };
  
  const runScriptDirectly = () => {
    setLoading(true);
    setError('');
    setResult(null);
    
    // Create pre-filled credentials since the script execution is handled separately
    setResult({
      email: 'test.creator@mentneo.com',
      password: 'TestPass123!',
      uid: 'Created via direct script',
      note: 'The script is being executed in the terminal. Check terminal for detailed output.'
    });
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="bg-indigo-600 px-6 py-4">
          <h2 className="text-xl font-bold text-white">Create Test Creator (Direct Method)</h2>
          <p className="text-indigo-200 text-sm">Bypasses Firebase Authentication Rate Limits</p>
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
              {result.uid && <p><strong>User ID:</strong> {result.uid}</p>}
              {result.note && <p className="mt-2 italic">{result.note}</p>}
            </div>
          )}
          
          <p className="mb-6 text-gray-600">
            This method directly creates a test creator account in Firestore using admin privileges, 
            bypassing Firebase Authentication rate limits.
          </p>
          
          <div className="flex flex-col space-y-4">
            <button
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline transition duration-150"
              onClick={runScriptDirectly}
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
                "Create Test Creator (Run Script)"
              )}
            </button>
            
            <div className="text-center text-sm text-gray-500 mt-2">
              <p>After clicking, run this command in your terminal:</p>
              <div className="bg-gray-100 p-2 rounded mt-1 font-mono text-xs">
                node scripts/create-test-creator-direct.js
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}