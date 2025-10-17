import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaArrowLeft, FaCheck, FaWhatsapp } from 'react-icons/fa/index.esm.js';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase.js';

const BookDemo = () => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    college: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field when user types
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.phoneNumber.trim()) {
      newErrors.phoneNumber = 'Phone number is required';
    } else if (!/^\d{10}$/.test(formData.phoneNumber.replace(/\D/g, ''))) {
      newErrors.phoneNumber = 'Phone number should be 10 digits';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Save to Firestore
      await addDoc(collection(db, "demoBookings"), {
        ...formData,
        status: 'pending',
        createdAt: serverTimestamp()
      });
      
      setIsSubmitting(false);
      setSubmitSuccess(true);
      
      // Reset form data
      setFormData({
        fullName: '',
        email: '',
        phoneNumber: '',
        college: ''
      });
      
    } catch (error) {
      console.error("Error booking demo:", error);
      setIsSubmitting(false);
      setErrors({ submit: 'Something went wrong. Please try again.' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white text-gray-800">
      {/* Decorative elements */}
      <div className="fixed inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-500 opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/3 -left-40 w-80 h-80 bg-purple-500 opacity-10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 right-1/4 w-80 h-80 bg-blue-500 opacity-10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 min-h-screen flex flex-col">
        {/* Back link */}
        <div className="mb-8">
          <Link to="/" className="flex items-center text-blue-600 hover:text-blue-800 transition-colors">
            <FaArrowLeft className="mr-2" />
            <span>Back to Home</span>
          </Link>
        </div>

        <AnimatePresence mode="wait">
          {!submitSuccess ? (
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
              className="flex-1 flex flex-col md:flex-row items-center justify-center gap-8 md:gap-16 py-8"
            >
              {/* Left side - Text and illustration */}
              <div className="w-full md:w-1/2 text-center md:text-left">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                >
                  <h1 className="text-4xl md:text-5xl font-bold mb-6">
                    <span className="inline-block">🚀</span> Ready to Start Your{' '}
                    <span className="bg-gradient-to-r from-[#007bff] to-purple-600 text-transparent bg-clip-text">
                      Mentneo Journey?
                    </span>
                  </h1>
                  
                  <p className="text-xl text-gray-600 mb-8">
                    Book your free demo session now and see how you can become a full stack developer from college.
                  </p>
                  
                  <div className="hidden md:block">
                    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 mb-6">
                      <h3 className="font-bold text-lg mb-2">What you'll learn in the demo:</h3>
                      <ul className="space-y-3">
                        {[
                          "Our unique learning methodology",
                          "Full stack curriculum roadmap",
                          "Mentor support system",
                          "Project-based learning approach",
                          "Career outcomes & placement support"
                        ].map((item, index) => (
                          <li key={index} className="flex items-start">
                            <span className="bg-blue-100 text-blue-600 rounded-full p-1 flex-shrink-0 mr-3">
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                              </svg>
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    
                    <div className="text-gray-600">
                      <p className="mb-2">
                        <span className="font-semibold">Trusted by 1000+ students</span> across 20+ colleges
                      </p>
                      <div className="flex -space-x-2">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <div key={i} className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-bold text-gray-600">
                            {['A', 'S', 'P', 'K', 'R'][i]}
                          </div>
                        ))}
                        <div className="w-8 h-8 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center text-xs font-bold text-blue-600">
                          +995
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </div>
              
              {/* Right side - Form */}
              <div className="w-full md:w-1/2 max-w-md">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.4 }}
                  className="relative"
                >
                  {/* Glassmorphism card with glow */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-lg opacity-30"></div>
                  <div className="relative bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl overflow-hidden border border-gray-200 p-8">
                    <h2 className="text-2xl font-bold mb-6 text-center">Book Your Free Demo</h2>
                    
                    <form onSubmit={handleSubmit}>
                      <div className="space-y-5">
                        {/* Full Name Field */}
                        <div>
                          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                            Full Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="fullName"
                            name="fullName"
                            type="text"
                            required
                            className={`appearance-none block w-full px-3 py-3 border ${
                              errors.fullName ? 'border-red-500' : 'border-gray-300'
                            } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                            placeholder="Your full name"
                            value={formData.fullName}
                            onChange={handleInputChange}
                          />
                          {errors.fullName && (
                            <p className="mt-1 text-sm text-red-500">{errors.fullName}</p>
                          )}
                        </div>
                        
                        {/* Email Field */}
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                            Email Address <span className="text-red-500">*</span>
                          </label>
                          <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className={`appearance-none block w-full px-3 py-3 border ${
                              errors.email ? 'border-red-500' : 'border-gray-300'
                            } rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                            placeholder="you@example.com"
                            value={formData.email}
                            onChange={handleInputChange}
                          />
                          {errors.email && (
                            <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                          )}
                        </div>
                        
                        {/* Phone Number Field */}
                        <div>
                          <label htmlFor="phoneNumber" className="block text-sm font-medium text-gray-700 mb-1">
                            Phone Number <span className="text-red-500">*</span>
                          </label>
                          <div className="flex rounded-md shadow-sm">
                            <span className="inline-flex items-center px-3 py-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500">
                              +91
                            </span>
                            <input
                              id="phoneNumber"
                              name="phoneNumber"
                              type="tel"
                              required
                              className={`appearance-none block w-full px-3 py-3 border ${
                                errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                              } rounded-r-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500`}
                              placeholder="Your phone number"
                              value={formData.phoneNumber}
                              onChange={handleInputChange}
                            />
                          </div>
                          {errors.phoneNumber && (
                            <p className="mt-1 text-sm text-red-500">{errors.phoneNumber}</p>
                          )}
                        </div>
                        
                        {/* College Field (Optional) */}
                        <div>
                          <label htmlFor="college" className="block text-sm font-medium text-gray-700 mb-1">
                            College Name / Year (Optional)
                          </label>
                          <input
                            id="college"
                            name="college"
                            type="text"
                            className="appearance-none block w-full px-3 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                            placeholder="Your college and year"
                            value={formData.college}
                            onChange={handleInputChange}
                          />
                        </div>

                        {/* Submit Button */}
                        <div className="pt-4">
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transform transition hover:scale-105 disabled:opacity-70 disabled:cursor-not-allowed"
                          >
                            {isSubmitting ? (
                              <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                            ) : (
                              'Book My Free Demo'
                            )}
                          </button>
                          
                          {errors.submit && (
                            <p className="mt-2 text-sm text-center text-red-500">{errors.submit}</p>
                          )}
                        </div>
                      </div>
                    </form>
                    
                    <div className="mt-6 text-center">
                      <div className="mb-3 text-gray-600 text-sm">
                        <span className="font-semibold">Trusted by 1000+ students</span> across 20+ colleges
                      </div>
                      
                      <a 
                        href="https://wa.me/919182146476?text=Hi%20Mentneo%2C%20I%20have%20a%20question%20about%20the%20demo%20session." 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center text-blue-600 hover:text-blue-800 text-sm"
                      >
                        <FaWhatsapp className="mr-1" /> Have questions? Chat with our mentor →
                      </a>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              className="flex-1 flex flex-col items-center justify-center text-center max-w-md mx-auto"
            >
              <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-green-100 flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 260, 
                    damping: 20,
                    delay: 0.3 
                  }}
                >
                  <FaCheck className="text-green-500 text-3xl" />
                </motion.div>
              </div>
              
              <h2 className="text-3xl font-bold mb-4">
                <span className="inline-block">🎉</span> You're All Set!
              </h2>
              
              <p className="text-xl text-gray-600 mb-8">
                Our team will contact you soon for your Mentneo demo session.
              </p>
              
              <div className="bg-white p-6 rounded-xl shadow-md border border-gray-100 mb-8">
                <h3 className="font-bold text-lg mb-4 text-gray-800">What happens next?</h3>
                <ol className="space-y-3 text-left">
                  <li className="flex items-start">
                    <span className="bg-blue-100 text-blue-700 rounded-full h-6 w-6 flex items-center justify-center font-bold text-sm mr-3 flex-shrink-0">1</span>
                    <span className="text-gray-600">Our counselor will call you within 24 hours</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-100 text-blue-700 rounded-full h-6 w-6 flex items-center justify-center font-bold text-sm mr-3 flex-shrink-0">2</span>
                    <span className="text-gray-600">We'll schedule a personalized demo at your convenient time</span>
                  </li>
                  <li className="flex items-start">
                    <span className="bg-blue-100 text-blue-700 rounded-full h-6 w-6 flex items-center justify-center font-bold text-sm mr-3 flex-shrink-0">3</span>
                    <span className="text-gray-600">Join the demo and explore how Mentneo can help your career</span>
                  </li>
                </ol>
              </div>
              
              <div className="mb-6 text-center">
                <a 
                  href="https://wa.me/919182146476?text=Hi%20Mentneo%2C%20I've%20just%20booked%20a%20demo%20and%20have%20a%20question." 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center text-blue-600 hover:text-blue-800"
                >
                  <FaWhatsapp className="mr-1" /> Have questions? Chat with our mentor directly
                </a>
              </div>
              
              <div className="flex space-x-4">
                <Link 
                  to="/" 
                  className="px-6 py-3 bg-white border border-gray-300 rounded-md text-gray-700 font-medium hover:bg-gray-50"
                >
                  Back to Home
                </Link>
                <Link 
                  to="/courses" 
                  className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-md font-medium hover:from-blue-700 hover:to-purple-700"
                >
                  Explore Courses
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default BookDemo;
