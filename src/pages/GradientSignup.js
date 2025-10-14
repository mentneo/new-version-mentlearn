import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { motion } from 'framer-motion';
import { 
  FaEye, 
  FaEyeSlash, 
  FaGoogle, 
  FaGithub, 
  FaLinkedin,
  FaShieldAlt,
  FaCheckCircle,
  FaUserGraduate,
  FaRocket
} from 'react-icons/fa';
import MenteoLogo from '../components/MenteoLogo';

const GradientSignup = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);
    setError('');

    try {
      await signup(formData.email, formData.password, {
        name: `${formData.firstName} ${formData.lastName}`,
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        role: 'student'
      });
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Signup error:', error);
      setError(error.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#1a1a2e] to-[#16213e] text-white overflow-hidden relative">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 opacity-20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-1/3 -left-40 w-80 h-80 bg-purple-500 opacity-20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute -bottom-40 right-1/4 w-80 h-80 bg-blue-500 opacity-20 rounded-full blur-3xl animate-pulse delay-2000"></div>
      </div>

      <div className="relative z-10 min-h-screen flex">
        {/* Left Section - Hero */}
        <div className="hidden lg:flex lg:w-1/2 flex-col justify-center items-center p-12 relative">
          <motion.div
            initial={{ opacity: 0, x: -50 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-md text-center"
          >
            <div className="mb-8">
              <div className="w-32 h-32 mx-auto mb-6 relative">
                <div className="w-full h-full bg-gradient-to-br from-[#007bff] to-[#6f42c1] rounded-2xl flex items-center justify-center transform -rotate-12 hover:rotate-0 transition-transform duration-500">
                  <FaRocket className="text-5xl text-white" />
                </div>
              </div>
            </div>
            
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[#007bff] to-[#6f42c1] text-transparent bg-clip-text">
              Launch Your Tech Career 🚀
            </h1>
            <p className="text-lg text-gray-300 mb-6">
              Join thousands of students who transformed their college life into a successful Full Stack development career with Mentlearning.
            </p>
            
            <div className="grid grid-cols-2 gap-4 text-sm text-gray-400">
              <div className="flex items-center">
                <FaCheckCircle className="text-green-400 mr-2" />
                <span>Real Projects</span>
              </div>
              <div className="flex items-center">
                <FaCheckCircle className="text-green-400 mr-2" />
                <span>1:1 Mentorship</span>
              </div>
              <div className="flex items-center">
                <FaCheckCircle className="text-green-400 mr-2" />
                <span>Job Guarantee</span>
              </div>
              <div className="flex items-center">
                <FaCheckCircle className="text-green-400 mr-2" />
                <span>Live Support</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Right Section - Signup Form */}
        <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 lg:p-12">
          <div className="w-full max-w-md">
            {/* Logo */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center mb-8"
            >
              <Link to="/" className="inline-block">
                <MenteoLogo size="large" />
              </Link>
            </motion.div>

            {/* Form Card */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              {/* Glassmorphism background */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-purple-600/10 rounded-2xl blur-xl"></div>
              <div className="relative bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
                <div className="text-center mb-6">
                  <h2 className="text-2xl font-bold mb-2">Join Mentlearning</h2>
                  <p className="text-gray-300">Start your Full Stack development journey today</p>
                </div>

                {/* Error Message */}
                {error && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 mb-4 text-red-200 text-sm"
                  >
                    {error}
                  </motion.div>
                )}

                {/* Signup Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Name Fields */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block text-sm font-medium text-gray-300 mb-2">
                        First Name
                      </label>
                      <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        value={formData.firstName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm placeholder-gray-400 text-white transition-all duration-300"
                        placeholder="First name"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block text-sm font-medium text-gray-300 mb-2">
                        Last Name
                      </label>
                      <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        value={formData.lastName}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm placeholder-gray-400 text-white transition-all duration-300"
                        placeholder="Last name"
                        required
                      />
                    </div>
                  </div>

                  {/* Email Field */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-2">
                      Email Address
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm placeholder-gray-400 text-white transition-all duration-300"
                      placeholder="Enter your email"
                      required
                    />
                  </div>

                  {/* Phone Field */}
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-300 mb-2">
                      Phone Number (Optional)
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm placeholder-gray-400 text-white transition-all duration-300"
                      placeholder="Your phone number"
                    />
                  </div>

                  {/* Password Fields */}
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
                        Password
                      </label>
                      <div className="relative">
                        <input
                          id="password"
                          name="password"
                          type={showPassword ? 'text' : 'password'}
                          value={formData.password}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm placeholder-gray-400 text-white transition-all duration-300 pr-12"
                          placeholder="Create password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                          {showPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-2">
                        Confirm Password
                      </label>
                      <div className="relative">
                        <input
                          id="confirmPassword"
                          name="confirmPassword"
                          type={showConfirmPassword ? 'text' : 'password'}
                          value={formData.confirmPassword}
                          onChange={handleInputChange}
                          className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent backdrop-blur-sm placeholder-gray-400 text-white transition-all duration-300 pr-12"
                          placeholder="Confirm password"
                          required
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
                        >
                          {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Signup Button */}
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 bg-gradient-to-r from-[#007bff] to-[#6f42c1] hover:from-blue-600 hover:to-purple-700 rounded-lg font-medium text-white shadow-lg hover:shadow-blue-500/25 transform hover:scale-105 transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none mt-6"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                        Creating Account...
                      </div>
                    ) : (
                      'Create Account'
                    )}
                  </button>
                </form>

                {/* Divider */}
                <div className="my-6 flex items-center">
                  <div className="flex-grow border-t border-white/20"></div>
                  <span className="flex-shrink-0 px-4 text-gray-400 text-sm">Or sign up with</span>
                  <div className="flex-grow border-t border-white/20"></div>
                </div>

                {/* Social Signup */}
                <div className="grid grid-cols-3 gap-3">
                  <button className="flex items-center justify-center py-3 px-4 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 transition-all duration-300 hover:scale-105">
                    <FaGoogle className="text-xl text-red-400" />
                  </button>
                  <button className="flex items-center justify-center py-3 px-4 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 transition-all duration-300 hover:scale-105">
                    <FaGithub className="text-xl text-gray-300" />
                  </button>
                  <button className="flex items-center justify-center py-3 px-4 bg-white/10 hover:bg-white/20 rounded-lg border border-white/20 transition-all duration-300 hover:scale-105">
                    <FaLinkedin className="text-xl text-blue-400" />
                  </button>
                </div>

                {/* Login Link */}
                <div className="text-center mt-6">
                  <p className="text-gray-300">
                    Already have an account?{' '}
                    <Link
                      to="/login"
                      className="text-blue-400 hover:text-blue-300 font-medium transition-colors"
                    >
                      Sign in here
                    </Link>
                  </p>
                </div>

                {/* Security Section */}
                <div className="mt-6 pt-6 border-t border-white/20">
                  <div className="flex items-center justify-center space-x-6 text-xs text-gray-400">
                    <div className="flex items-center">
                      <FaShieldAlt className="mr-1" />
                      <span>Secure</span>
                    </div>
                    <div className="flex items-center">
                      <FaCheckCircle className="mr-1" />
                      <span>Verified</span>
                    </div>
                    <div className="flex items-center">
                      <FaUserGraduate className="mr-1" />
                      <span>Mentorship Certified</span>
                    </div>
                  </div>
                  <p className="text-center text-xs text-gray-500 mt-2">
                    Your data is safe with us
                  </p>
                </div>
              </div>
            </motion.div>

            {/* Footer */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="text-center mt-8"
            >
              <div className="flex justify-center space-x-6 text-xs text-gray-500 mb-2">
                <Link to="/terms" className="hover:text-gray-300 transition-colors">Terms</Link>
                <Link to="/privacy" className="hover:text-gray-300 transition-colors">Privacy</Link>
                <Link to="/contact" className="hover:text-gray-300 transition-colors">Contact</Link>
              </div>
              <p className="text-xs text-gray-600">
                © 2025 Mentlearning | All rights reserved
              </p>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GradientSignup;
