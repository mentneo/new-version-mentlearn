import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';
import { handleFirebaseError } from '../utils/errorHandler';
import { useTheme } from '../contexts/ThemeContext';
import { FaFacebookF, FaGoogle, FaApple, FaEnvelope, FaLock, FaEye, FaEyeSlash, FaMoon, FaSun, FaArrowLeft } from 'react-icons/fa';
import logoImg from '../assets/mentneo-logo.png';
import logo3dImg from '../assets/mentneo-3d-logo.png';

export default function GradientLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { darkMode, toggleDarkMode } = useTheme();
  const navigate = useNavigate();
  
  // Apply dark mode class to body
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  async function handleSubmit(e) {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      
      // Sign in user with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Check if user document exists in users collection
      const userDocRef = doc(db, "users", user.uid);
      let userSnap = await getDoc(userDocRef);
      let userData = null;
      let isCreator = false;
      
      if (userSnap.exists()) {
        userData = userSnap.data();
      } else {
        // Check creators collection
        const creatorDocRef = doc(db, "creators", user.uid);
        const creatorSnap = await getDoc(creatorDocRef);
        
        if (creatorSnap.exists()) {
          userData = creatorSnap.data();
          isCreator = true;
        }
      }
      
      if (!userData) {
        // Create user document if it doesn't exist (fallback)
        await setDoc(userDocRef, {
          email: user.email,
          createdAt: new Date(),
        });
        navigate('/student/dashboard');
        return;
      }
      
      // Redirect based on user role
      const userRole = isCreator ? 'creator' : (userData.role || 'student');
      if (userRole === 'admin') {
        navigate('/admin/dashboard');
      } else if (userRole === 'creator') {
        navigate('/creator/dashboard');
      } else if (userRole === 'mentor') {
        navigate('/mentor/dashboard');
      } else {
        navigate('/student/dashboard');
      }
    } catch (error) {
      console.error("Login error:", error);
      setError(handleFirebaseError(error));
    } finally {
      setLoading(false);
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className={`flex min-h-screen w-full ${darkMode ? 'dark' : ''}`}>
      {/* Left Section - Login Form with gradient background */}
      <div className="w-full lg:w-1/2 flex flex-col p-8 md:p-12 justify-center relative bg-gradient-to-br from-pink-300 via-purple-400 to-blue-500 dark:from-indigo-900 dark:via-purple-900 dark:to-blue-800">
        {/* Top navigation with back button, logo, and dark mode toggle */}
        <div className="absolute top-6 left-8 right-8 flex justify-between items-center">
          <div className="flex items-center">
            <button 
              onClick={() => navigate('/')} 
              className="mr-4 p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white transition-colors duration-200"
              aria-label="Go back"
            >
              <FaArrowLeft className="h-5 w-5" />
            </button>
            <div className="flex items-center">
              <img src={logo3dImg} alt="Mentneo 3D Logo" className="h-10 w-10 mr-2" />
              <img src={logoImg} alt="Mentneo Logo" className="h-8" />
            </div>
          </div>
          
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-full bg-white bg-opacity-20 hover:bg-opacity-30 text-white transition-colors duration-200"
            aria-label={darkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {darkMode ? <FaSun className="h-5 w-5" /> : <FaMoon className="h-5 w-5" />}
          </button>
        </div>
        
        <div className="max-w-md mx-auto w-full mt-16">
          <h1 className="text-4xl font-bold text-white mb-2">Welcome back</h1>
          <p className="text-white text-opacity-90 mb-8">Please enter your account details.</p>
          
          {error && (
            <div className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-lg p-4 mb-6 text-white border border-red-300">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaEnvelope className="h-5 w-5 text-white" />
              </div>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="block w-full pl-10 pr-3 py-3 bg-white bg-opacity-20 backdrop-filter backdrop-blur-md border-0 rounded-lg text-white placeholder-white placeholder-opacity-70 focus:ring-2 focus:ring-white focus:bg-opacity-30 focus:outline-none"
                placeholder="Email address"
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-white" />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="block w-full pl-10 pr-10 py-3 bg-white bg-opacity-20 backdrop-filter backdrop-blur-md border-0 rounded-lg text-white placeholder-white placeholder-opacity-70 focus:ring-2 focus:ring-white focus:bg-opacity-30 focus:outline-none"
                placeholder="Password"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onClick={togglePasswordVisibility}
                  className="text-white focus:outline-none"
                >
                  {showPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                </button>
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
                  className="h-4 w-4 bg-transparent border-white rounded focus:ring-2 focus:ring-white"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-white">
                  Remember me
                </label>
              </div>
              <div className="text-sm">
                <Link to="/forgot-password" className="font-medium text-white hover:text-white hover:underline">
                  Forgot password?
                </Link>
              </div>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 bg-gradient-to-r from-orange-300 to-orange-400 rounded-lg shadow-md hover:from-orange-400 hover:to-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-opacity-50 transition-all duration-200 text-white font-semibold"
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
            
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white border-opacity-30"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gradient-to-br from-pink-300 via-purple-400 to-blue-500 text-white">
                  Or continue with
                </span>
              </div>
            </div>
            
            <div className="flex space-x-4 justify-center">
              <button
                type="button"
                className="flex items-center justify-center w-12 h-12 rounded-full bg-white bg-opacity-20 backdrop-filter backdrop-blur-md hover:bg-opacity-30 transition-all duration-200"
              >
                <FaGoogle className="h-5 w-5 text-white" />
              </button>
              <button
                type="button"
                className="flex items-center justify-center w-12 h-12 rounded-full bg-white bg-opacity-20 backdrop-filter backdrop-blur-md hover:bg-opacity-30 transition-all duration-200"
              >
                <FaFacebookF className="h-5 w-5 text-white" />
              </button>
              <button
                type="button"
                className="flex items-center justify-center w-12 h-12 rounded-full bg-white bg-opacity-20 backdrop-filter backdrop-blur-md hover:bg-opacity-30 transition-all duration-200"
              >
                <FaApple className="h-5 w-5 text-white" />
              </button>
            </div>
            
            <p className="mt-8 text-center text-white">
              Don't have an account?{' '}
              <Link to="/signup" className="font-semibold hover:underline">
                Sign up
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Right Section - Testimonial */}
      <div className="hidden lg:block lg:w-1/2 bg-gradient-to-bl from-indigo-900 via-purple-900 to-blue-900 dark:from-slate-800 dark:via-slate-900 dark:to-black p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-400 to-pink-300 rounded-full filter blur-3xl opacity-20 -mt-24 -mr-24 dark:from-purple-600 dark:to-pink-500"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-400 to-indigo-300 rounded-full filter blur-3xl opacity-20 -mb-24 -ml-24 dark:from-blue-600 dark:to-indigo-500"></div>
        
        {/* Logo in the top right */}
        <div className="absolute top-6 right-8">
          <img src={logo3dImg} alt="Mentneo 3D Logo" className="h-16 w-16" />
        </div>
        
        {/* Testimonial Card */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-lg">
          <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-xl rounded-2xl p-8 border border-white border-opacity-20 shadow-xl dark:border-opacity-10 dark:bg-opacity-5">
            <h2 className="text-2xl font-bold text-white mb-6">What our Learners Said</h2>
            
            <p className="text-white text-opacity-90 text-lg mb-6 italic">
              "Mentneo has completely transformed my learning experience. The platform's innovative approach to 'learning how to learn' 
              gave me the tools to master new skills faster than I ever thought possible."
            </p>
            
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center text-white font-bold text-xl">
                A
              </div>
              <div className="ml-4">
                <p className="text-white font-semibold">Abhi yeduru</p>
                <p className="text-white text-opacity-70 text-sm">Data Scientist at mentneo</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick Tip Card */}
        <div className="absolute bottom-12 right-12 max-w-xs">
          <div className="bg-white rounded-xl p-4 shadow-lg dark:bg-slate-800 dark:text-white">
            <p className="text-purple-800 font-medium text-sm mb-2 dark:text-purple-300">Learning Tip</p>
            <p className="text-gray-700 text-sm dark:text-gray-300">Spaced repetition can improve your retention by up to 90%. Try our premium certificates to master this technique!</p>
            
            <div className="mt-3 flex -space-x-2 overflow-hidden">
              <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gradient-to-r from-blue-400 to-indigo-500"></div>
              <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gradient-to-r from-pink-400 to-purple-500"></div>
              <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gradient-to-r from-yellow-400 to-orange-500"></div>
              <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gradient-to-r from-green-400 to-teal-500"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
