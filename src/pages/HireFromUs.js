import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaCode, 
  FaUsers, 
  FaGraduationCap,
  FaBriefcase, 
  FaCheck,
  FaArrowRight,
  FaGithub,
  FaLinkedin,
  FaBars,
  FaTimes,
  FaTwitter
} from 'react-icons/fa/index.esm.js';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/firebase.js';
import MenteoLogo from '../components/MenteoLogo.js';

const HireFromUs = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phone: '',
    hiringFor: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [errors, setErrors] = useState({});

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: null
      });
    }
  };

  // Form validation
  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.companyName.trim()) {
      newErrors.companyName = 'Company name is required';
    }
    
    if (!formData.contactName.trim()) {
      newErrors.contactName = 'Contact name is required';
    }
    
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.hiringFor.trim()) {
      newErrors.hiringFor = 'This field is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      await addDoc(collection(db, "hiringRequests"), {
        ...formData,
        status: 'new',
        createdAt: serverTimestamp()
      });
      
      setIsSubmitting(false);
      setSubmitSuccess(true);
      
      // Reset form data
      setFormData({
        companyName: '',
        contactName: '',
        email: '',
        phone: '',
        hiringFor: '',
        message: ''
      });
      
    } catch (error) {
      console.error("Error submitting hiring request:", error);
      setIsSubmitting(false);
      setErrors({ submit: 'Something went wrong. Please try again.' });
    }
  };

  // Sample student profiles
  const studentProfiles = [
    {
      id: 1,
      name: "Priya Sharma",
      role: "Full Stack Developer",
      skills: ["React", "Node.js", "MongoDB", "Express"],
      image: "https://i.pravatar.cc/300?img=28",
      bio: "Passionate full stack developer with experience in building scalable web applications using modern JavaScript frameworks.",
      github: "https://github.com",
      linkedin: "https://linkedin.com",
      experience: "1+ years"
    },
    {
      id: 2,
      name: "Rahul Singh",
      role: "Frontend Developer",
      skills: ["React", "Next.js", "TypeScript", "TailwindCSS"],
      image: "https://i.pravatar.cc/300?img=11",
      bio: "Creative frontend developer focused on building responsive and accessible user interfaces with modern frameworks.",
      github: "https://github.com",
      linkedin: "https://linkedin.com",
      experience: "1 year"
    },
    {
      id: 3,
      name: "Neha Patel",
      role: "Backend Developer",
      skills: ["Node.js", "Python", "AWS", "Docker"],
      image: "https://i.pravatar.cc/300?img=5",
      bio: "Backend developer with strong fundamentals in server-side programming and cloud infrastructure.",
      github: "https://github.com",
      linkedin: "https://linkedin.com",
      experience: "1.5 years"
    }
  ];

  // Benefits of hiring from Mentneo
  const benefits = [
    {
      icon: <FaCode />,
      title: "Tech-Ready Talent",
      description: "Our graduates are trained in the latest technologies and industry best practices, ready to contribute from day one."
    },
    {
      icon: <FaUsers />,
      title: "Diverse Skill Sets",
      description: "Access to a diverse pool of talent with expertise across frontend, backend, and full-stack development."
    },
    {
      icon: <FaGraduationCap />,
      title: "Continuous Learners",
      description: "Our students are taught how to learn efficiently, ensuring they can quickly adapt to your tech stack and requirements."
    },
    {
      icon: <FaBriefcase />,
      title: "Project Experience",
      description: "All candidates have built real-world projects, giving them practical experience that translates to your business needs."
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header/Navigation */}
      <nav className="bg-white/90 backdrop-blur-md fixed w-full z-50 border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link to="/" className="flex items-center">
                <MenteoLogo />
              </Link>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-8">
              <Link to="/" className="text-gray-600 hover:text-[#007bff] px-3 py-2 text-sm font-medium">Home</Link>
              <Link to="/courses" className="text-gray-600 hover:text-[#007bff] px-3 py-2 text-sm font-medium">Courses</Link>
              <Link to="/about" className="text-gray-600 hover:text-[#007bff] px-3 py-2 text-sm font-medium">About Us</Link>
              <Link to="/hire-from-us" className="text-indigo-600 font-medium px-3 py-2 text-sm border-b-2 border-indigo-600">Hire From Us</Link>
              <Link to="/login" className="text-gray-600 hover:text-[#007bff] px-3 py-2 text-sm font-medium">Login</Link>
              <Link to="/signup" className="bg-gradient-to-r from-[#007bff] to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-medium py-2 px-4 rounded-md">
                Join Now
              </Link>
            </div>

            {/* Mobile menu button */}
            <div className="md:hidden flex items-center">
              <button
                className="inline-flex items-center justify-center p-2 rounded-md text-gray-600 hover:text-[#007bff] focus:outline-none"
                onClick={toggleMobileMenu}
              >
                <span className="sr-only">{mobileMenuOpen ? 'Close menu' : 'Open menu'}</span>
                {mobileMenuOpen ? (
                  <FaTimes className="block h-6 w-6" />
                ) : (
                  <FaBars className="block h-6 w-6" />
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile menu implementation would go here */}

      {/* Hero Section */}
      <div className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
            <span className="block">Hire Industry-Ready</span>
            <span className="block text-indigo-600">Tech Talent</span>
          </h1>
          <p className="mt-3 max-w-md mx-auto text-base text-gray-500 sm:text-lg md:mt-5 md:text-xl md:max-w-3xl">
            Access a pool of skilled developers trained in the latest technologies and industry best practices.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
            <a 
              href="#contact-form" 
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-md shadow-md flex items-center justify-center"
            >
              Hire Our Talent <FaArrowRight className="ml-2" />
            </a>
            <a 
              href="#candidates" 
              className="px-8 py-3 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium rounded-md shadow-sm"
            >
              Meet Our Candidates
            </a>
          </div>
        </motion.div>
      </div>

      {/* Sub-navigation */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex overflow-x-auto scrollbar-hide">
            <button 
              onClick={() => setActiveTab('overview')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'overview' 
                  ? 'text-indigo-600 border-b-2 border-indigo-600' 
                  : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'
              }`}
            >
              Overview
            </button>
            <button 
              onClick={() => setActiveTab('candidates')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'candidates' 
                  ? 'text-indigo-600 border-b-2 border-indigo-600' 
                  : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'
              }`}
            >
              Our Candidates
            </button>
            <button 
              onClick={() => setActiveTab('hiring')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'hiring' 
                  ? 'text-indigo-600 border-b-2 border-indigo-600' 
                  : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'
              }`}
            >
              Hiring Process
            </button>
            <button 
              onClick={() => setActiveTab('contact')}
              className={`py-4 px-6 text-sm font-medium ${
                activeTab === 'contact' 
                  ? 'text-indigo-600 border-b-2 border-indigo-600' 
                  : 'text-gray-500 hover:text-gray-700 border-b-2 border-transparent'
              }`}
            >
              Contact Us
            </button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Overview Section */}
          {activeTab === 'overview' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center mb-16">
                <h2 className="text-3xl font-extrabold text-gray-900">Why Hire From Mentneo?</h2>
                <p className="mt-4 text-lg text-gray-500 max-w-3xl mx-auto">
                  Our students are trained not just in technical skills but also in problem-solving, communication, and collaborative work.
                </p>
              </div>

              {/* Benefits grid */}
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
                {benefits.map((benefit, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white p-6 rounded-lg shadow-md border border-gray-100"
                  >
                    <div className="w-12 h-12 rounded-md bg-indigo-100 text-indigo-600 flex items-center justify-center mb-4">
                      {benefit.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                    <p className="text-gray-500">{benefit.description}</p>
                  </motion.div>
                ))}
              </div>

              {/* Testimonial */}
              <div className="mt-16 bg-indigo-600 rounded-lg shadow-xl overflow-hidden">
                <div className="px-6 py-12 md:p-12 md:flex items-center">
                  <div className="md:w-1/2 mb-8 md:mb-0">
                    <img 
                      src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1740&q=80" 
                      alt="Team collaboration" 
                      className="rounded-lg shadow-lg w-full h-64 object-cover"
                    />
                  </div>
                  <div className="md:w-1/2 md:pl-12">
                    <blockquote className="text-white">
                      <p className="text-xl font-medium italic">
                        "The developers we hired from Mentneo were well-prepared, quick to adapt to our tech stack, and brought fresh perspectives to our team. Their training in modern web technologies made them valuable contributors from day one."
                      </p>
                      <footer className="mt-6">
                        <p className="font-semibold">Sarah Johnson</p>
                        <p className="text-indigo-200">CTO at TechInnovate</p>
                      </footer>
                    </blockquote>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* Candidates Section */}
          {activeTab === 'candidates' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              id="candidates"
            >
              <div className="text-center mb-16">
                <h2 className="text-3xl font-extrabold text-gray-900">Meet Our Candidates</h2>
                <p className="mt-4 text-lg text-gray-500 max-w-3xl mx-auto">
                  Our graduates are equipped with in-demand skills and ready to tackle real-world challenges in your organization.
                </p>
              </div>

              {/* Student profiles */}
              <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                {studentProfiles.map((student, index) => (
                  <motion.div
                    key={student.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: index * 0.1 }}
                    className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200"
                  >
                    <div className="p-6">
                      <div className="flex items-center mb-4">
                        <img 
                          src={student.image} 
                          alt={student.name} 
                          className="w-16 h-16 rounded-full object-cover mr-4"
                        />
                        <div>
                          <h3 className="text-lg font-semibold text-gray-900">{student.name}</h3>
                          <p className="text-indigo-600">{student.role}</p>
                        </div>
                      </div>
                      <p className="text-gray-600 mb-4">{student.bio}</p>
                      <div className="mb-4">
                        <p className="text-sm font-medium text-gray-500 mb-2">Skills:</p>
                        <div className="flex flex-wrap gap-2">
                          {student.skills.map((skill, i) => (
                            <span 
                              key={i} 
                              className="px-3 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500">{student.experience} experience</span>
                        <div className="flex space-x-3">
                          <a 
                            href={student.github} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <FaGithub />
                          </a>
                          <a 
                            href={student.linkedin} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-gray-500 hover:text-gray-700"
                          >
                            <FaLinkedin />
                          </a>
                        </div>
                      </div>
                    </div>
                    <div className="bg-gray-50 px-6 py-4">
                      <a 
                        href="#contact-form" 
                        className="text-indigo-600 font-medium flex items-center hover:text-indigo-700"
                      >
                        Request this candidate <FaArrowRight className="ml-2" />
                      </a>
                    </div>
                  </motion.div>
                ))}
              </div>

              <div className="mt-12 text-center">
                <a 
                  href="#contact-form"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  View All Available Candidates
                </a>
              </div>
            </motion.div>
          )}

          {/* Hiring Process Section */}
          {activeTab === 'hiring' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
            >
              <div className="text-center mb-16">
                <h2 className="text-3xl font-extrabold text-gray-900">Our Hiring Process</h2>
                <p className="mt-4 text-lg text-gray-500 max-w-3xl mx-auto">
                  A simple and efficient process to connect you with the right talent for your needs.
                </p>
              </div>

              {/* Process steps */}
              <div className="relative">
                {/* Timeline line */}
                <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-indigo-200"></div>
                
                {/* Steps */}
                {[
                  {
                    title: "Submit Your Requirements",
                    description: "Fill out our hiring request form with your specific needs, tech stack, and role requirements."
                  },
                  {
                    title: "Review Pre-Screened Candidates",
                    description: "We'll match your requirements with our pool of qualified candidates and share their profiles with you."
                  },
                  {
                    title: "Interview Selected Candidates",
                    description: "Conduct technical and cultural fit interviews with the candidates that match your needs."
                  },
                  {
                    title: "Make Your Selection",
                    description: "Choose the candidates that best fit your team and we'll facilitate the hiring process."
                  }
                ].map((step, index) => (
                  <div key={index} className="relative mb-12">
                    <div className="flex flex-col md:flex-row items-center">
                      <div className={`md:w-1/2 mb-6 md:mb-0 ${index % 2 === 0 ? 'md:pr-12 md:text-right' : 'md:order-last md:pl-12'}`}>
                        <div className={`p-6 rounded-lg shadow-md bg-white border border-gray-100 ${index % 2 === 0 ? 'md:ml-auto' : 'md:mr-auto'}`}>
                          <h3 className="text-xl font-bold text-gray-900 mb-2">{step.title}</h3>
                          <p className="text-gray-600">{step.description}</p>
                        </div>
                      </div>
                      
                      <div className="hidden md:flex items-center justify-center z-10 w-12 h-12 rounded-full bg-indigo-600 text-white text-xl font-bold border-4 border-white">
                        {index + 1}
                      </div>
                      
                      <div className="md:w-1/2"></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-12 text-center">
                <a 
                  href="#contact-form"
                  className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Start Hiring Now
                </a>
              </div>
            </motion.div>
          )}

          {/* Contact Section */}
          {activeTab === 'contact' && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.5 }}
              id="contact-form"
            >
              <div className="text-center mb-16">
                <h2 className="text-3xl font-extrabold text-gray-900">Get In Touch</h2>
                <p className="mt-4 text-lg text-gray-500 max-w-3xl mx-auto">
                  Fill out the form below, and we'll connect you with candidates that match your requirements.
                </p>
              </div>

              <div className="bg-white shadow-lg rounded-lg overflow-hidden">
                <div className="md:flex">
                  <div className="md:w-1/3 bg-indigo-600 text-white p-8">
                    <h3 className="text-2xl font-bold mb-4">Hiring Request</h3>
                    <p className="mb-6">
                      Tell us about your company and the roles you're looking to fill. Our team will get back to you within 24 hours.
                    </p>
                    
                    <div className="space-y-4">
                      <div className="flex items-start">
                        <FaCheck className="mt-1 mr-3 text-indigo-200" />
                        <p>Access to pre-screened candidates</p>
                      </div>
                      <div className="flex items-start">
                        <FaCheck className="mt-1 mr-3 text-indigo-200" />
                        <p>Zero placement fees</p>
                      </div>
                      <div className="flex items-start">
                        <FaCheck className="mt-1 mr-3 text-indigo-200" />
                        <p>2-week trial period available</p>
                      </div>
                      <div className="flex items-start">
                        <FaCheck className="mt-1 mr-3 text-indigo-200" />
                        <p>Ongoing support during onboarding</p>
                      </div>
                    </div>
                    
                    <div className="mt-8">
                      <p className="font-semibold">Contact directly:</p>
                      <p className="mt-2">hiring@mentneo.com</p>
                      <p>+91 9182146476</p>
                    </div>
                  </div>
                  
                  <div className="md:w-2/3 p-8">
                    {!submitSuccess ? (
                      <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                          <div>
                            <label htmlFor="companyName" className="block text-sm font-medium text-gray-700">
                              Company Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="companyName"
                              id="companyName"
                              value={formData.companyName}
                              onChange={handleInputChange}
                              className={`mt-1 block w-full border ${errors.companyName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                            />
                            {errors.companyName && (
                              <p className="mt-1 text-sm text-red-500">{errors.companyName}</p>
                            )}
                          </div>

                          <div>
                            <label htmlFor="contactName" className="block text-sm font-medium text-gray-700">
                              Contact Name <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              name="contactName"
                              id="contactName"
                              value={formData.contactName}
                              onChange={handleInputChange}
                              className={`mt-1 block w-full border ${errors.contactName ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                            />
                            {errors.contactName && (
                              <p className="mt-1 text-sm text-red-500">{errors.contactName}</p>
                            )}
                          </div>

                          <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                              Email <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="email"
                              name="email"
                              id="email"
                              value={formData.email}
                              onChange={handleInputChange}
                              className={`mt-1 block w-full border ${errors.email ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                            />
                            {errors.email && (
                              <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                            )}
                          </div>

                          <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                              Phone Number
                            </label>
                            <input
                              type="text"
                              name="phone"
                              id="phone"
                              value={formData.phone}
                              onChange={handleInputChange}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="hiringFor" className="block text-sm font-medium text-gray-700">
                            What roles are you hiring for? <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            name="hiringFor"
                            id="hiringFor"
                            value={formData.hiringFor}
                            onChange={handleInputChange}
                            placeholder="e.g., Frontend Developer, Full Stack Developer, etc."
                            className={`mt-1 block w-full border ${errors.hiringFor ? 'border-red-500' : 'border-gray-300'} rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm`}
                          />
                          {errors.hiringFor && (
                            <p className="mt-1 text-sm text-red-500">{errors.hiringFor}</p>
                          )}
                        </div>

                        <div>
                          <label htmlFor="message" className="block text-sm font-medium text-gray-700">
                            Additional Details
                          </label>
                          <textarea
                            id="message"
                            name="message"
                            rows={4}
                            value={formData.message}
                            onChange={handleInputChange}
                            placeholder="Tell us about your requirements, tech stack, and any specific skills you're looking for."
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                        </div>

                        <div>
                          <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            {isSubmitting ? 'Submitting...' : 'Submit Hiring Request'}
                          </button>
                        </div>
                      </form>
                    ) : (
                      <div className="text-center py-12">
                        <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                          <FaCheck className="h-6 w-6 text-green-600" />
                        </div>
                        <h3 className="mt-6 text-xl font-medium text-gray-900">Thank you for your interest!</h3>
                        <p className="mt-2 text-gray-500">
                          We've received your hiring request and our team will get in touch with you within 24 hours.
                        </p>
                        <div className="mt-6">
                          <button
                            type="button"
                            onClick={() => setSubmitSuccess(false)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            Submit Another Request
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900">Frequently Asked Questions</h2>
            <p className="mt-4 text-lg text-gray-500">
              Common questions about hiring from Mentneo
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {[
              {
                question: "What is the hiring process like?",
                answer: "Our hiring process is designed to be simple and efficient. You submit your requirements, we match you with pre-screened candidates, you interview them, and make your selection. We provide support throughout the process."
              },
              {
                question: "Are there any placement fees?",
                answer: "No, we don't charge any placement fees. We believe in providing value to both our students and hiring partners without any hidden costs."
              },
              {
                question: "What skills do your candidates have?",
                answer: "Our candidates are trained in modern web technologies including React, Node.js, MongoDB, Express, and more. They have experience with both frontend and backend development."
              },
              {
                question: "Can we hire for internships or part-time roles?",
                answer: "Yes, we have candidates available for full-time positions, part-time roles, and internships. Let us know your requirements and we'll match you accordingly."
              },
              {
                question: "How are candidates vetted?",
                answer: "All our candidates go through a rigorous training program and are evaluated based on their technical skills, problem-solving abilities, and soft skills before being recommended to hiring partners."
              },
              {
                question: "What locations do you support?",
                answer: "We have candidates available for both remote and on-site positions across major tech hubs in India. Many of our candidates are open to relocation for the right opportunity."
              }
            ].map((faq, index) => (
              <div key={index} className="bg-gray-50 rounded-lg p-6 shadow-sm">
                <h3 className="text-lg font-medium text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center mb-4">
                <div className="bg-white rounded-full p-2">
                  <MenteoLogo />
                </div>
              </div>
              <p className="text-gray-300 mb-4">
                Mentneo connects talented developers with forward-thinking companies. Our mission is to bridge the gap between education and industry needs.
              </p>
              <div className="flex space-x-4">
                <Link to="/social/twitter" className="text-gray-400 hover:text-white">
                  <span className="sr-only">Twitter</span>
                  <FaTwitter className="h-5 w-5" />
                </Link>
                <Link to="/social/linkedin" className="text-gray-400 hover:text-white">
                  <span className="sr-only">LinkedIn</span>
                  <FaLinkedin className="h-5 w-5" />
                </Link>
                <Link to="/social/github" className="text-gray-400 hover:text-white">
                  <span className="sr-only">GitHub</span>
                  <FaGithub className="h-5 w-5" />
                </Link>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Resources</h3>
              <ul className="space-y-2">
                <li><Link to="/students" className="text-gray-300 hover:text-white">For Students</Link></li>
                <li><Link to="/companies" className="text-gray-300 hover:text-white">For Companies</Link></li>
                <li><Link to="/blog" className="text-gray-300 hover:text-white">Blog</Link></li>
                <li><Link to="/success-stories" className="text-gray-300 hover:text-white">Success Stories</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4">Company</h3>
              <ul className="space-y-2">
                <li><Link to="/about" className="text-gray-300 hover:text-white">About Us</Link></li>
                <li><Link to="/contact" className="text-gray-300 hover:text-white">Contact</Link></li>
                <li><Link to="/privacy" className="text-gray-300 hover:text-white">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-gray-300 hover:text-white">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 border-t border-gray-700 pt-8">
            <p className="text-gray-400 text-center">
              &copy; {new Date().getFullYear()} Mentneo. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default HireFromUs;
