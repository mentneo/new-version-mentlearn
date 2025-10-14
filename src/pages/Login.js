import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';
import { handleFirebaseError } from '../utils/errorHandler';
import { FaArrowLeft } from 'react-icons/fa';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      
      console.log("Attempting login for:", email);
      
      // Sign in user with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      console.log("Login successful for UID:", user.uid);
      
      // Check if user document exists in users collection
      const userDocRef = doc(db, "users", user.uid);
      let userDoc = await getDoc(userDocRef);
      let userData = null;
      let isCreator = false;
      
      if (userDoc.exists()) {
        userData = userDoc.data();
      } else {
        // Check creators collection
        const creatorDocRef = doc(db, "creators", user.uid);
        const creatorDoc = await getDoc(creatorDocRef);
        
        if (creatorDoc.exists()) {
          userData = creatorDoc.data();
          isCreator = true;
        }
      }
      
      if (!userData) {
        console.log("Creating new user document with admin role");
        // First user gets admin role - this is for initial setup
        await setDoc(userDocRef, {
          uid: user.uid,
          email: user.email,
          name: email.split('@')[0], // Default name from email
          role: 'admin', // First login user is admin
          createdAt: new Date().toISOString()
        });
        
        console.log("Admin user document created successfully");
        navigate('/admin/dashboard');
        return;
      }
      
      const userRole = isCreator ? 'creator' : (userData.role || 'student');
      console.log("User role from Firestore:", userRole);
      
      // Redirect based on role
      if (userRole === 'admin') {
        navigate('/admin/dashboard');
      } else if (userRole === 'creator') {
        navigate('/creator/dashboard');
      } else if (userRole === 'mentor') {
        navigate('/mentor/dashboard');
      } else if (userRole === 'student') {
        navigate('/student/dashboard');
      } else {
        // For safety, if role is undefined, treat as student
        console.log("Unknown or missing role, treating as student");
        navigate('/student/dashboard');
      }
    } catch (error) {
      console.error('Error signing in:', error);
      setError(handleFirebaseError(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Or{' '}
            <Link to="/signup" className="font-medium text-indigo-600 hover:text-indigo-500">
              create a new account
            </Link>
          </p>
        </div>
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">{error}</div>}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <label htmlFor="email-address" className="sr-only">Email address</label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link to="/forgot-password" className="font-medium text-indigo-600 hover:text-indigo-500">
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </div>
        </form>
      </div>
      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center px-4 py-2 mt-4 ml-4 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-100 transition-all"
      >
        <FaArrowLeft className="mr-2" />
        Back
      </button>
    </div>
  );
}
