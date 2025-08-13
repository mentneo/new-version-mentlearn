import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '../firebase/firebase';
import { handleFirebaseError } from '../utils/errorHandler';
import { useTheme } from '../contexts/ThemeContext';
import { FaFacebookF, FaGoogle, FaApple, FaEnvelope, FaLock, FaUser, FaPhone, FaEye, FaEyeSlash, FaMoon, FaSun, FaArrowLeft } from 'react-icons/fa';
import logoImg from '../assets/mentneo-logo.png';
import logo3dImg from '../assets/mentneo-3d-logo.png';

export default function GradientSignup() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
    
    if (password !== confirmPassword) {
      return setError("Passwords do not match");
    }
    
    try {
      setError('');
      setLoading(true);
      
      // Create user with Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update profile display name
      await updateProfile(user, {
        displayName: name
      });
      
      // Create user document in Firestore
      await setDoc(doc(db, "users", user.uid), {
        name,
        email: user.email,
        phone,
        role: 'student', // Default role for new signups
        createdAt: serverTimestamp(),
      });
      
      // Redirect to dashboard
      navigate('/student/dashboard');
    } catch (error) {
      console.error("Signup error:", error);
      setError(handleFirebaseError(error));
    } finally {
      setLoading(false);
    }
  }

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  return (
    <div className={`flex min-h-screen w-full ${darkMode ? 'dark' : ''}`}>
      {/* Left Section - Signup Form with gradient background */}
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
          <h1 className="text-4xl font-bold text-white mb-2">Join Mentneo</h1>
          <p className="text-white text-opacity-90 mb-8">Create your account to start learning today.</p>
          
          {error && (
            <div className="bg-white bg-opacity-20 backdrop-filter backdrop-blur-lg rounded-lg p-4 mb-6 text-white border border-red-300">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaUser className="h-5 w-5 text-white" />
              </div>
              <input
                type="text"
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="block w-full pl-10 pr-3 py-3 bg-white bg-opacity-20 backdrop-filter backdrop-blur-md border-0 rounded-lg text-white placeholder-white placeholder-opacity-70 focus:ring-2 focus:ring-white focus:bg-opacity-30 focus:outline-none"
                placeholder="Full name"
              />
            </div>
            
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
                <FaPhone className="h-5 w-5 text-white" />
              </div>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 bg-white bg-opacity-20 backdrop-filter backdrop-blur-md border-0 rounded-lg text-white placeholder-white placeholder-opacity-70 focus:ring-2 focus:ring-white focus:bg-opacity-30 focus:outline-none"
                placeholder="Phone number (optional)"
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
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaLock className="h-5 w-5 text-white" />
              </div>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="block w-full pl-10 pr-10 py-3 bg-white bg-opacity-20 backdrop-filter backdrop-blur-md border-0 rounded-lg text-white placeholder-white placeholder-opacity-70 focus:ring-2 focus:ring-white focus:bg-opacity-30 focus:outline-none"
                placeholder="Confirm password"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                <button
                  type="button"
                  onClick={toggleConfirmPasswordVisibility}
                  className="text-white focus:outline-none"
                >
                  {showConfirmPassword ? <FaEyeSlash className="h-5 w-5" /> : <FaEye className="h-5 w-5" />}
                </button>
              </div>
            </div>
            
            <div className="mt-2">
              <p className="text-sm text-white text-opacity-90">
                Password must be at least 8 characters and include letters, numbers, and special characters.
              </p>
            </div>
            
            <div className="flex items-center mt-4">
              <input
                id="terms"
                name="terms"
                type="checkbox"
                required
                className="h-4 w-4 bg-transparent border-white rounded focus:ring-2 focus:ring-white"
              />
              <label htmlFor="terms" className="ml-2 block text-sm text-white">
                I agree to the <Link to="/terms" className="underline">Terms of Service</Link> and <Link to="/privacy" className="underline">Privacy Policy</Link>
              </label>
            </div>
            
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-3 px-4 bg-gradient-to-r from-orange-300 to-orange-400 rounded-lg shadow-md hover:from-orange-400 hover:to-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-300 focus:ring-opacity-50 transition-all duration-200 text-white font-semibold"
            >
              {loading ? "Creating account..." : "Sign up"}
            </button>
            
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white border-opacity-30"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-gradient-to-br from-pink-300 via-purple-400 to-blue-500 text-white">
                  Or sign up with
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
            
            <p className="mt-6 text-center text-white">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold hover:underline">
                Sign in
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Right Section - Feature Showcase */}
      <div className="hidden lg:block lg:w-1/2 bg-gradient-to-bl from-indigo-900 via-purple-900 to-blue-900 dark:from-slate-800 dark:via-slate-900 dark:to-black p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-400 to-pink-300 rounded-full filter blur-3xl opacity-20 -mt-24 -mr-24 dark:from-purple-600 dark:to-pink-500"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-blue-400 to-indigo-300 rounded-full filter blur-3xl opacity-20 -mb-24 -ml-24 dark:from-blue-600 dark:to-indigo-500"></div>
        
        {/* Logo in the top right */}
        <div className="absolute top-6 right-8">
          <img src={logo3dImg} alt="Mentneo 3D Logo" className="h-16 w-16" />
        </div>
        
        {/* Feature Card */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-full max-w-lg">
          <div className="bg-white bg-opacity-10 backdrop-filter backdrop-blur-xl rounded-2xl p-8 border border-white border-opacity-20 shadow-xl dark:border-opacity-10 dark:bg-opacity-5">
            <h2 className="text-2xl font-bold text-white mb-6">Premium Learning Experience</h2>
            
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-pink-400 to-purple-500 flex items-center justify-center text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-white font-medium">Learning How to Learn</p>
                  <p className="text-white text-opacity-70 text-sm">Master meta-learning techniques that help you learn any new skill faster.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-white font-medium">Premium Certifications</p>
                  <p className="text-white text-opacity-70 text-sm">Earn industry-recognized credentials that boost your career prospects.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-gradient-to-r from-green-400 to-teal-500 flex items-center justify-center text-white">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v1h8v-1zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-1a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v1h-3zM4.75 14.094A5.973 5.973 0 004 17v1H1v-1a3 3 0 013.75-2.906z" />
                  </svg>
                </div>
                <div className="ml-4">
                  <p className="text-white font-medium">Mentor Community</p>
                  <p className="text-white text-opacity-70 text-sm">Connect with expert mentors who guide you through your learning journey.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Quick Tip Card */}
        <div className="absolute bottom-12 right-12 max-w-xs">
          <div className="bg-white rounded-xl p-4 shadow-lg dark:bg-slate-800 dark:text-white">
            <p className="text-purple-800 font-medium text-sm mb-2 dark:text-purple-300">Did You Know?</p>
            <p className="text-gray-700 text-sm dark:text-gray-300">Students who complete our certification programs report a 40% increase in job interview success rates!</p>
            
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
