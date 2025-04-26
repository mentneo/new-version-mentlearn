import React, { useState } from 'react';
import { doc, setDoc } from 'firebase/firestore';
import { db, auth } from '../firebase/firebase';
import { useNavigate } from 'react-router-dom';

export default function DirectAdminAccess() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const makeCurrentUserAdmin = async () => {
    if (!auth.currentUser) {
      setError("No user is currently logged in");
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      setSuccess('');
      
      const user = auth.currentUser;
      
      // Set the current user as admin
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        email: user.email,
        role: 'admin',
        name: user.email?.split('@')[0] || 'Admin User',
        updatedAt: new Date().toISOString()
      }, { merge: true });
      
      setSuccess(`Successfully set ${user.email} as admin`);
      setTimeout(() => {
        navigate('/admin/dashboard');
      }, 3000);
    } catch (err) {
      console.error("Error making user admin:", err);
      setError("Failed to update user role: " + err.message);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h1 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Emergency Admin Access
          </h1>
          <p className="mt-2 text-center text-sm text-gray-600">
            Use this page to grant admin privileges to the current user
          </p>
        </div>
        
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">{error}</div>}
        {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">{success}</div>}
        
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-lg font-medium mb-4">Make current user admin</h2>
          <p className="text-sm text-gray-500 mb-4">
            This will set the currently logged in user ({auth.currentUser?.email || 'none'}) as an admin.
          </p>
          
          <button
            onClick={makeCurrentUserAdmin}
            disabled={loading || !auth.currentUser}
            className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white 
              ${!auth.currentUser || loading ? 'bg-gray-300' : 'bg-red-600 hover:bg-red-700'}`}
          >
            {loading ? 'Processing...' : 'Grant Admin Rights'}
          </button>
          
          <div className="mt-4 text-center">
            <button
              onClick={() => navigate('/login')}
              className="text-sm text-indigo-600 hover:text-indigo-500"
            >
              Return to login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
