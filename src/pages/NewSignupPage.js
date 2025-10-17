import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.js';
import { FaEnvelope, FaLock, FaUser, FaEye, FaEyeSlash, FaArrowLeft, FaCheckCircle, FaGift } from 'react-icons/fa/index.esm.js';

export default function NewSignupPage() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [accountType, setAccountType] = useState('student');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [referralCode, setReferralCode] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Check for referral code in URL
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const ref = params.get('ref');
    if (ref) {
      setReferralCode(ref);
    }
  }, [location.search]);

  // Password strength checker
  const getPasswordStrength = (password) => {
    if (!password) return { strength: 0, text: 'No password', color: 'gray' };
    
    let strength = 0;
    if (password.length > 6) strength += 1;
    if (password.length > 10) strength += 1;
    if (/[A-Z]/.test(password)) strength += 1;
    if (/[0-9]/.test(password)) strength += 1;
    if (/[^A-Za-z0-9]/.test(password)) strength += 1;
    
    if (strength < 2) return { strength: 1, text: 'Weak', color: 'red' };
    if (strength < 4) return { strength: 2, text: 'Medium', color: 'yellow' };
    return { strength: 3, text: 'Strong', color: 'green' };
  };
  
  const passwordStrength = getPasswordStrength(password);

  async function handleSubmit(e) {
    e.preventDefault();

    // Form validation
    if (!firstName || !lastName || !email || !password || !confirmPassword) {
      return setError('Please fill in all fields');
    }
    
    if (!agreed) {
      return setError('You must agree to the Terms of Service and Privacy Policy');
    }
    
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    
    if (passwordStrength.strength < 2) {
      return setError('Please use a stronger password');
    }

    try {
      setError('');
      setLoading(true);
      
      // Create the user with firebase auth
      await signup(email, password, {
        firstName,
        lastName,
        displayName: `${firstName} ${lastName}`,
        role: accountType,
        referredBy: referralCode || null,
        createdAt: new Date()
      });
      
      // Redirect to the appropriate page based on account type
      if (accountType === 'student') {
        navigate('/student/dashboard');
      } else if (accountType === 'mentor') {
        navigate('/mentor/dashboard');
      }
    } catch (err) {
      console.error('Signup error:', err);
      setError('Failed to create an account. ' + (err.message || ''));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Link to="/" className="flex items-center justify-center text-blue-600 dark:text-blue-400 mb-6">
          <FaArrowLeft className="mr-2" />
          <span>Back to Home</span>
        </Link>
        <h2 className="mt-2 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400">
            Sign in
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative dark:bg-red-900 dark:border-red-700 dark:text-red-100" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="flex space-x-4">
              <div className="flex-1">
                <label htmlFor="first-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  First name
                </label>
                <div className="mt-1">
                  <input
                    id="first-name"
                    name="first-name"
                    type="text"
                    autoComplete="given-name"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="py-3 px-4 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                  />
                </div>
              </div>
              
              <div className="flex-1">
                <label htmlFor="last-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                  Last name
                </label>
                <div className="mt-1">
                  <input
                    id="last-name"
                    name="last-name"
                    type="text"
                    autoComplete="family-name"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="py-3 px-4 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email address
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaEnvelope className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="py-3 pl-10 pr-3 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                  placeholder="you@example.com"
                />
              </div>
            </div>

            <div>
              <label htmlFor="referralCode" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Referral Code (Optional)
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaGift className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="referralCode"
                  name="referralCode"
                  type="text"
                  value={referralCode}
                  onChange={(e) => setReferralCode(e.target.value)}
                  className="py-3 pl-10 pr-3 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                  placeholder="Enter referral code (if any)"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Account type
              </label>
              <div className="mt-2 grid grid-cols-2 gap-3">
                <div 
                  className={`flex items-center justify-center py-2 px-4 border ${
                    accountType === 'student' 
                      ? 'bg-blue-50 border-blue-500 dark:bg-blue-900 dark:border-blue-400' 
                      : 'border-gray-300 dark:border-gray-600'
                  } rounded-md cursor-pointer`}
                  onClick={() => setAccountType('student')}
                >
                  <input
                    type="radio"
                    name="account-type"
                    checked={accountType === 'student'}
                    onChange={() => setAccountType('student')}
                    className="sr-only"
                  />
                  <span className={`${
                    accountType === 'student' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'
                  } text-sm font-medium`}>
                    Student
                  </span>
                </div>
                <div 
                  className={`flex items-center justify-center py-2 px-4 border ${
                    accountType === 'mentor' 
                      ? 'bg-blue-50 border-blue-500 dark:bg-blue-900 dark:border-blue-400' 
                      : 'border-gray-300 dark:border-gray-600'
                  } rounded-md cursor-pointer`}
                  onClick={() => setAccountType('mentor')}
                >
                  <input
                    type="radio"
                    name="account-type"
                    checked={accountType === 'mentor'}
                    onChange={() => setAccountType('mentor')}
                    className="sr-only"
                  />
                  <span className={`${
                    accountType === 'mentor' ? 'text-blue-700 dark:text-blue-300' : 'text-gray-700 dark:text-gray-300'
                  } text-sm font-medium`}>
                    Mentor
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="py-3 pl-10 pr-10 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                  placeholder="••••••••"
                />
                <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-500 focus:outline-none"
                  >
                    {showPassword ? (
                      <FaEyeSlash className="h-5 w-5" />
                    ) : (
                      <FaEye className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
              {password && (
                <div className="mt-1">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${
                        passwordStrength.color === 'red' ? 'bg-red-500' : 
                        passwordStrength.color === 'yellow' ? 'bg-yellow-500' : 
                        'bg-green-500'
                      }`} 
                      style={{ width: `${(passwordStrength.strength / 3) * 100}%` }}
                    ></div>
                  </div>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Password strength: <span className={`font-medium text-${passwordStrength.color}-500`}>{passwordStrength.text}</span>
                  </p>
                </div>
              )}
            </div>

            <div>
              <label htmlFor="confirm-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm password
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaLock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="confirm-password"
                  name="confirm-password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="py-3 pl-10 pr-3 block w-full rounded-md border-gray-300 dark:border-gray-700 dark:bg-gray-700 dark:text-white focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                  placeholder="••••••••"
                />
                {password && confirmPassword && (
                  <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                    {password === confirmPassword ? (
                      <FaCheckCircle className="h-5 w-5 text-green-500" />
                    ) : null}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="font-medium text-gray-700 dark:text-gray-300">
                  I agree to the <Link to="/terms" className="text-blue-600 hover:text-blue-500">Terms of Service</Link> and <Link to="/privacy" className="text-blue-600 hover:text-blue-500">Privacy Policy</Link>
                </label>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Creating account...' : 'Create account'}
              </button>
            </div>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Or sign up with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.84 9.49.5.09.68-.22.68-.485 0-.236-.008-.866-.013-1.7-2.782.603-3.37-1.34-3.37-1.34-.454-1.156-1.11-1.464-1.11-1.464-.908-.62.07-.608.07-.608 1.003.07 1.532 1.03 1.532 1.03.892 1.53 2.34 1.09 2.91.833.09-.647.35-1.086.636-1.336-2.22-.253-4.555-1.11-4.555-4.943 0-1.09.39-1.984 1.03-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.377.202 2.394.1 2.647.64.7 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.933.359.309.678.92.678 1.855 0 1.337-.012 2.417-.012 2.745 0 .267.18.578.688.48C19.138 20.16 22 16.416 22 12c0-5.523-4.477-10-10-10z" />
                </svg>
              </button>

              <button
                type="button"
                className="w-full flex justify-center py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-700 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600"
              >
                <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
