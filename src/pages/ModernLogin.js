import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';
import { handleFirebaseError } from '../utils/errorHandler';
import { useTheme } from '../contexts/ThemeContext';
import { FaFacebookF, FaTwitter, FaInstagram, FaYoutube, FaMoon, FaSun, FaEnvelope, FaLock } from 'react-icons/fa';

export default function ModernLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const { darkMode, toggleDarkMode } = useTheme();
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
      
      // Check if user document exists
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
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
      
      const userData = userDoc.data();
      console.log("User role from Firestore:", userData.role);
      
      // Redirect based on role
      if (userData.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (userData.role === 'mentor') {
        navigate('/mentor/dashboard');
      } else if (userData.role === 'student') {
        navigate('/student/dashboard');
      } else {
        // For safety, if role is undefined, treat as admin during initial setup
        console.log("Unknown or missing role, treating as admin for setup purposes");
        await setDoc(userDocRef, { role: 'admin' }, { merge: true });
        navigate('/admin/dashboard');
      }
    } catch (error) {
      console.error('Error signing in:', error);
      setError(handleFirebaseError(error));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`min-h-screen flex flex-col md:flex-row transition-colors duration-300 ${
      darkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-gray-900'
    }`}>
      {/* Left Side - Welcome Message */}
      <div className="relative w-full md:w-1/2 bg-gradient-to-r from-blue-600 to-purple-600 p-12 flex flex-col justify-center">
        {/* Overlay with background image */}
        <div 
          className="absolute inset-0 bg-black opacity-30 z-0"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            mixBlendMode: 'overlay'
          }}
        ></div>
        
        {/* Content */}
        <div className="relative z-10 max-w-md mx-auto md:mx-0 md:max-w-lg">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6">
            Welcome Back
          </h1>
          <p className="text-white text-lg mb-12 opacity-90">
            Log in to continue your learning journey with Mentneo. Access your courses, 
            track your progress, and connect with mentors to achieve your educational goals.
          </p>
          
          {/* Social Media Icons */}
          <div className="flex space-x-4 mt-auto">
            <a href="#" className="text-white hover:text-gray-200 transition-colors">
              <FaFacebookF className="h-6 w-6" />
            </a>
            <a href="#" className="text-white hover:text-gray-200 transition-colors">
              <FaTwitter className="h-6 w-6" />
            </a>
            <a href="#" className="text-white hover:text-gray-200 transition-colors">
              <FaInstagram className="h-6 w-6" />
            </a>
            <a href="#" className="text-white hover:text-gray-200 transition-colors">
              <FaYoutube className="h-6 w-6" />
            </a>
          </div>
        </div>
      </div>
      
      {/* Right Side - Login Form */}
      <div className={`w-full md:w-1/2 flex items-center justify-center p-6 md:p-12 ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <div className="w-full max-w-md">
          <div className="flex justify-end mb-8">
            <button
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${
                darkMode 
                  ? 'bg-gray-700 text-yellow-300 hover:bg-gray-600' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {darkMode ? <FaSun className="h-5 w-5" /> : <FaMoon className="h-5 w-5" />}
            </button>
          </div>
          
          <h2 className={`text-3xl font-bold mb-8 ${darkMode ? 'text-white' : 'text-gray-900'}`}>
            Sign In
          </h2>
          
          {error && (
            <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-700 text-red-700 dark:text-red-200 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="email" className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className={`h-5 w-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`pl-10 block w-full px-4 py-3 border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:ring-orange-500 focus:border-orange-500'
                  } rounded-lg shadow-sm focus:outline-none focus:ring-2`}
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label htmlFor="password" className={`block text-sm font-medium mb-2 ${
                darkMode ? 'text-gray-300' : 'text-gray-700'
              }`}>
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className={`h-5 w-5 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`} />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className={`pl-10 block w-full px-4 py-3 border ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-white focus:ring-blue-500 focus:border-blue-500' 
                      : 'bg-white border-gray-300 text-gray-900 focus:ring-orange-500 focus:border-orange-500'
                  } rounded-lg shadow-sm focus:outline-none focus:ring-2`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className={`h-4 w-4 rounded ${
                    darkMode 
                      ? 'bg-gray-700 border-gray-600 text-orange-500 focus:ring-blue-600' 
                      : 'bg-white border-gray-300 text-orange-500 focus:ring-orange-500'
                  }`}
                />
                <label htmlFor="remember-me" className={`ml-2 block text-sm ${
                  darkMode ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Remember me
                </label>
              </div>
              
              <div className="text-sm">
                <Link 
                  to="/forgot-password" 
                  className={`font-medium ${
                    darkMode 
                      ? 'text-blue-400 hover:text-blue-300' 
                      : 'text-orange-600 hover:text-orange-500'
                  }`}
                >
                  Lost your password?
                </Link>
              </div>
            </div>
            
            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500'
                }`}
              >
                {loading ? 'Signing in...' : 'Sign in'}
              </button>
            </div>
          </form>
          
          <div className="mt-8 text-center">
            <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>
              Don't have an account?{' '}
              <Link 
                to="/signup" 
                className={`font-medium ${
                  darkMode 
                    ? 'text-blue-400 hover:text-blue-300' 
                    : 'text-orange-600 hover:text-orange-500'
                }`}
              >
                Sign up
              </Link>
            </p>
            <p className={`mt-2 text-xs ${darkMode ? 'text-gray-500' : 'text-gray-500'}`}>
              By signing in, you agree to our{' '}
              <a href="#" className="underline hover:text-gray-600">Terms & Conditions</a>
              {' '}and{' '}
              <a href="#" className="underline hover:text-gray-600">Privacy Policy</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
