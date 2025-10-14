import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaHtml5, FaCss3Alt, FaJs, FaReact, FaPython, FaDatabase, FaGithub, FaGraduationCap, FaClock, FaCertificate, FaPhone, FaWhatsapp, FaStar, FaQuoteLeft } from 'react-icons/fa';
import { SiMongodb, SiDjango, SiFlask } from 'react-icons/si';
import { useTheme } from '../contexts/ThemeContext';
import MenteoLogo from '../components/MenteoLogo';

export default function FullStackCoursePage() {
  const { darkMode, toggleDarkMode } = useTheme();
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const phoneNumber = "+919182146476";

  // Testimonial data
  const testimonials = [
    {
      id: 1,
      name: "Ravi Kumar",
      role: "Frontend Developer",
      image: "https://randomuser.me/api/portraits/men/32.jpg",
      text: "Mentneo's Full Stack program completely transformed my career. The project-based approach helped me build a strong portfolio that impressed my interviewers.",
      rating: 5
    },
    {
      id: 2,
      name: "Priya Sharma",
      role: "Software Engineer",
      image: "https://randomuser.me/api/portraits/women/44.jpg",
      text: "The curriculum is so well structured. I went from knowing nothing about programming to building full-stack applications in just a few months!",
      rating: 5
    },
    {
      id: 3,
      name: "Arjun Patel",
      role: "Freelance Developer",
      image: "https://randomuser.me/api/portraits/men/67.jpg",
      text: "What sets Mentneo apart is how they teach you to think like a developer. The mentors are incredibly supportive and always available to help.",
      rating: 4.5
    }
  ];

  // Curriculum modules
  const modules = [
    {
      id: 1,
      title: "HTML5 & CSS3 Fundamentals",
      icon: <div className="flex"><FaHtml5 className="text-orange-500 mr-2" /><FaCss3Alt className="text-blue-500" /></div>,
      description: "Master modern semantic HTML5 and CSS3 including Flexbox, CSS Grid, animations, and responsive design principles.",
      duration: "3 weeks",
      projects: 4
    },
    {
      id: 2,
      title: "JavaScript Deep Dive",
      icon: <FaJs className="text-yellow-400" />,
      description: "Comprehensive JavaScript course covering ES6+, DOM manipulation, async programming, and modern JS frameworks.",
      duration: "4 weeks",
      projects: 5
    },
    {
      id: 3,
      title: "React & Frontend Development",
      icon: <FaReact className="text-blue-400" />,
      description: "Learn React from fundamentals to advanced patterns. Build dynamic SPAs with state management, routing, and hooks.",
      duration: "5 weeks",
      projects: 6
    },
    {
      id: 4,
      title: "Python & Backend Development",
      icon: <div className="flex"><FaPython className="text-blue-600 mr-2" /><SiDjango className="text-green-700 mr-2" /><SiFlask className="text-gray-700" /></div>,
      description: "Build robust backends with Python. Master Flask and Django for creating APIs, authentication, and database integration.",
      duration: "5 weeks",
      projects: 4
    },
    {
      id: 5,
      title: "MongoDB & Database Design",
      icon: <div className="flex"><SiMongodb className="text-green-500 mr-2" /><FaDatabase className="text-blue-500" /></div>,
      description: "Learn NoSQL database design with MongoDB. Master CRUD operations, schema design, and database optimization.",
      duration: "3 weeks",
      projects: 3
    },
    {
      id: 6,
      title: "Git, GitHub & Deployment",
      icon: <FaGithub className="text-gray-700 dark:text-gray-300" />,
      description: "Master version control with Git and GitHub. Learn CI/CD, deployment strategies, and cloud hosting platforms.",
      duration: "2 weeks",
      projects: 3
    }
  ];

  // Function to handle the contact button click
  const handleContactClick = () => {
    setIsContactModalOpen(true);
  };

  // Function to handle the call option
  const handleCallClick = () => {
    window.location.href = `tel:${phoneNumber}`;
    setIsContactModalOpen(false);
  };

  // Function to handle the WhatsApp option
  const handleWhatsAppClick = () => {
    window.open(`https://wa.me/${phoneNumber}?text=Hi%20Mentneo,%20I'm%20interested%20in%20the%20Full%20Stack%20Development%20Course`, '_blank');
    setIsContactModalOpen(false);
  };

  // Function to render stars for ratings
  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) {
        stars.push(<FaStar key={i} className="text-yellow-400" />);
      } else if (i - rating < 1) {
        stars.push(<FaStar key={i} className="text-yellow-400 opacity-50" />);
      } else {
        stars.push(<FaStar key={i} className="text-gray-300" />);
      }
    }
    return stars;
  };

  return (
    <div className={`min-h-screen ${darkMode ? 'dark' : ''}`}>
      <div className="bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-800 min-h-screen">
        
        {/* Header/Navigation */}
        <header className="sticky top-0 z-50 bg-white bg-opacity-90 dark:bg-gray-900 dark:bg-opacity-90 backdrop-filter backdrop-blur-lg shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              {/* Logo */}
              <div className="flex items-center">
                <MenteoLogo />
              </div>
              
              {/* Desktop Navigation */}
              <nav className="hidden md:flex items-center space-x-8">
                <Link to="/" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">Home</Link>
                <Link to="/courses" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">Courses</Link>
                <Link to="/about" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">About</Link>
                <Link to="/contact" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">Contact</Link>
              </nav>
              
              {/* Authentication and Theme Toggle */}
              <div className="flex items-center">
                <button
                  onClick={toggleDarkMode}
                  className="p-2 rounded-full text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 focus:outline-none mr-2"
                >
                  {darkMode ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                    </svg>
                  )}
                </button>
                <div className="hidden md:flex space-x-2">
                  <Link to="/login" className="px-4 py-2 border border-transparent rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800">
                    Log in
                  </Link>
                  <Link to="/signup" className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600">
                    Sign up
                  </Link>
                </div>
                <button
                  onClick={handleContactClick}
                  className="ml-4 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700"
                >
                  Enroll Now
                </button>
              </div>
            </div>
          </div>
        </header>
        
        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="relative z-10 flex flex-col md:flex-row items-center">
              {/* Text Content */}
              <div className="md:w-1/2 md:pr-12">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 dark:text-white">
                  <span className="block">Full Stack Development</span>
                  <span className="block mt-1 bg-gradient-to-r from-purple-600 to-blue-500 bg-clip-text text-transparent">Learn Smart, Build Fast</span>
                </h1>
                <p className="mt-6 text-xl text-gray-600 dark:text-gray-300 max-w-3xl">
                  Master HTML, CSS, JavaScript, React, Python, Flask/Django, MongoDB, and DSA in one comprehensive program.
                </p>
                
                {/* Price and CTA */}
                <div className="mt-8 flex items-center">
                  <span className="text-3xl font-bold text-gray-900 dark:text-white">₹3,999</span>
                  <span className="ml-2 line-through text-gray-500 dark:text-gray-400">₹5,999</span>
                  <span className="ml-2 text-sm text-green-600 font-medium dark:text-green-400">33% off</span>
                </div>
                
                <button
                  onClick={handleContactClick}
                  className="mt-6 px-8 py-4 rounded-lg shadow-lg bg-gradient-to-r from-purple-600 to-blue-500 hover:from-purple-700 hover:to-blue-600 text-white font-bold text-lg transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
                >
                  Join Now
                </button>
                
                {/* Trust Badges */}
                <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <FaGraduationCap className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">1000+ Students Enrolled</span>
                  </div>
                  <div className="flex items-center">
                    <FaClock className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">Lifetime Access</span>
                  </div>
                  <div className="flex items-center">
                    <FaCertificate className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                    <span className="ml-2 text-sm text-gray-600 dark:text-gray-300">Certification Included</span>
                  </div>
                </div>
              </div>
              
              {/* Hero Image with Tech Icons */}
              <div className="md:w-1/2 mt-12 md:mt-0 relative">
                <div className="relative rounded-xl overflow-hidden shadow-2xl transform rotate-1">
                  <img 
                    src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1471&q=80" 
                    alt="Students learning to code" 
                    className="w-full h-auto rounded-xl"
                  />
                </div>
                
                {/* Floating Tech Icons */}
                <div className="absolute top-0 left-0 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg">
                  <FaHtml5 className="h-8 w-8 text-orange-500" />
                </div>
                <div className="absolute top-1/4 right-0 transform translate-x-1/3 bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg">
                  <FaCss3Alt className="h-8 w-8 text-blue-500" />
                </div>
                <div className="absolute top-1/2 left-0 transform -translate-x-1/4 bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg">
                  <FaJs className="h-8 w-8 text-yellow-400" />
                </div>
                <div className="absolute bottom-1/4 right-0 transform translate-x-1/4 bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg">
                  <FaReact className="h-8 w-8 text-blue-400" />
                </div>
                <div className="absolute bottom-0 left-1/3 transform translate-y-1/3 bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg">
                  <FaPython className="h-8 w-8 text-blue-600" />
                </div>
                <div className="absolute top-3/4 left-3/4 bg-white dark:bg-gray-800 p-2 rounded-full shadow-lg">
                  <SiMongodb className="h-8 w-8 text-green-500" />
                </div>
              </div>
            </div>
          </div>
          
          {/* Background Decorations */}
          <div className="absolute top-0 left-0 w-40 h-40 bg-purple-300 dark:bg-purple-900 rounded-full filter blur-3xl opacity-20 -translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 right-0 w-60 h-60 bg-blue-300 dark:bg-blue-900 rounded-full filter blur-3xl opacity-20 translate-x-1/3 translate-y-1/3"></div>
        </section>
        
        {/* About the Course Section */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">About the Course</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto mt-4"></div>
            </div>
            
            <div className="max-w-3xl mx-auto text-center">
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed">
                At Mentneo, we believe that quality education should be accessible to everyone. Our Full Stack Development program is designed to transform beginners into job-ready developers through structured learning, hands-on projects, and personalized mentorship.
              </p>
              <p className="text-lg text-gray-600 dark:text-gray-300 leading-relaxed mt-6">
                Whether you're looking to switch careers, upskill in your current role, or simply explore the world of programming, this comprehensive course will give you the skills and confidence to build professional web applications from scratch.
              </p>
            </div>
            
            {/* Key Stats */}
            <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 text-center shadow-sm">
                <div className="text-4xl font-bold text-purple-600 dark:text-purple-400">25+</div>
                <div className="mt-2 text-lg font-medium text-gray-800 dark:text-gray-200">Real-world Projects</div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Build a diverse portfolio to showcase to employers</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 text-center shadow-sm">
                <div className="text-4xl font-bold text-blue-600 dark:text-blue-400">100+</div>
                <div className="mt-2 text-lg font-medium text-gray-800 dark:text-gray-200">Students Reached</div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Join our growing community of developers</p>
              </div>
              <div className="bg-gray-50 dark:bg-gray-800 rounded-xl p-8 text-center shadow-sm">
                <div className="text-4xl font-bold text-indigo-600 dark:text-indigo-400">1+</div>
                <div className="mt-2 text-lg font-medium text-gray-800 dark:text-gray-200">Countries</div>
                <p className="mt-2 text-gray-600 dark:text-gray-400">Connect with learners from around the world</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Curriculum Section */}
        <section className="py-16 bg-gray-50 dark:bg-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Course Curriculum</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto mt-4"></div>
              <p className="mt-6 text-lg text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
                Our curriculum is designed to take you from beginner to professional developer with step-by-step modules and hands-on projects.
              </p>
            </div>
            
            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
              {modules.map((module) => (
                <div 
                  key={module.id} 
                  className="bg-white dark:bg-gray-900 rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300"
                >
                  <div className="p-6">
                    <div className="text-2xl mb-4">
                      {module.icon}
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">{module.title}</h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-4">{module.description}</p>
                    <div className="flex justify-between text-sm text-gray-500 dark:text-gray-400">
                      <span>Duration: {module.duration}</span>
                      <span>{module.projects} Projects</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Instructor Section */}
        <section className="py-16 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Meet Your Instructor</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto mt-4"></div>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="bg-white dark:bg-gray-800 rounded-2xl overflow-hidden shadow-lg p-8 backdrop-filter backdrop-blur-lg bg-opacity-60 dark:bg-opacity-60 border border-gray-200 dark:border-gray-700">
                <div className="flex flex-col md:flex-row items-center">
                  <div className="mb-6 md:mb-0 md:mr-8">
                    <div className="w-40 h-40 relative">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"></div>
                      <img
                        src="https://randomuser.me/api/portraits/men/32.jpg"
                        alt="Instructor"
                        className="absolute inset-1 rounded-full object-cover"
                      />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Abhiram Yeduru</h3>
                    <p className="text-blue-600 dark:text-blue-400 font-medium mb-4">Lead Instructor & Full Stack Developer</p>
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      With over 8 years of industry experience in web development and teaching, Abhiram has helped hundreds of students transition into successful tech careers. He specializes in modern JavaScript frameworks, Python backend development, and cloud architecture.
                    </p>
                    <div className="mt-6 flex space-x-4">
                      <Link to="/social/facebook" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                        </svg>
                      </Link>
                      <Link to="/social/twitter" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd"></path>
                        </svg>
                      </Link>
                      <Link to="/social/linkedin" className="text-gray-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400">
                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                          <path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z" clipRule="evenodd"></path>
                        </svg>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        {/* Testimonials Section */}
        <section className="py-16 bg-gray-50 dark:bg-gray-800 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white">Student Testimonials</h2>
              <div className="w-24 h-1 bg-gradient-to-r from-purple-500 to-blue-500 mx-auto mt-4"></div>
            </div>
            
            <div className="grid gap-8 md:grid-cols-3">
              {testimonials.map((testimonial) => (
                <div 
                  key={testimonial.id}
                  className="bg-white dark:bg-gray-900 rounded-2xl overflow-hidden shadow-md p-8 backdrop-filter backdrop-blur-lg bg-opacity-60 dark:bg-opacity-60 border border-gray-200 dark:border-gray-700"
                >
                  <div className="flex justify-between items-start mb-6">
                    <div className="flex items-center">
                      <img 
                        src={testimonial.image} 
                        alt={testimonial.name} 
                        className="h-12 w-12 rounded-full object-cover"
                      />
                      <div className="ml-4">
                        <h4 className="text-lg font-medium text-gray-900 dark:text-white">{testimonial.name}</h4>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{testimonial.role}</p>
                      </div>
                    </div>
                    <div className="flex">
                      {renderStars(testimonial.rating)}
                    </div>
                  </div>
                  <div>
                    <FaQuoteLeft className="h-6 w-6 text-purple-400 mb-4 opacity-30" />
                    <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                      {testimonial.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
        
        {/* Final CTA Section */}
        <section className="py-16 bg-gradient-to-r from-purple-600 to-blue-600 dark:from-purple-900 dark:to-blue-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl font-bold text-white mb-6">Ready to start your developer journey?</h2>
            <p className="text-xl text-purple-100 max-w-3xl mx-auto mb-8">
              Join our Full Stack Development Program today and transform your career with in-demand skills.
            </p>
            <button
              onClick={handleContactClick}
              className="px-8 py-4 rounded-lg shadow-lg bg-white text-purple-600 font-bold text-lg hover:bg-gray-100 transition-transform transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white focus:ring-opacity-50"
            >
              Enroll Now for ₹3,999
            </button>
          </div>
        </section>
        
        {/* Footer */}
        <footer className="bg-gray-900 text-gray-300 py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
              <div className="col-span-1 md:col-span-1">
                <div className="flex items-center mb-4">
                  <MenteoLogo />
                </div>
                <p className="text-sm text-gray-400 mb-4">
                  Empowering the next generation of developers through accessible, quality education.
                </p>
                <div className="flex space-x-4">
                  <Link to="/social/facebook" className="text-gray-400 hover:text-white">
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd"></path>
                    </svg>
                  </Link>
                  <Link to="/social/twitter" className="text-gray-400 hover:text-white">
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M8.29 20.251c7.547 0 11.675-6.253 11.675-11.675 0-.178 0-.355-.012-.53A8.348 8.348 0 0022 5.92a8.19 8.19 0 01-2.357.646 4.118 4.118 0 001.804-2.27 8.224 8.224 0 01-2.605.996 4.107 4.107 0 00-6.993 3.743 11.65 11.65 0 01-8.457-4.287 4.106 4.106 0 001.27 5.477A4.072 4.072 0 012.8 9.713v.052a4.105 4.105 0 003.292 4.022 4.095 4.095 0 01-1.853.07 4.108 4.108 0 003.834 2.85A8.233 8.233 0 012 18.407a11.616 11.616 0 006.29 1.84"></path>
                    </svg>
                  </Link>
                  <Link to="/social/linkedin" className="text-gray-400 hover:text-white">
                    <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path fillRule="evenodd" d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10c5.51 0 10-4.48 10-10S17.51 2 12 2zm6.605 4.61a8.502 8.502 0 011.93 5.314c-.281-.054-3.101-.629-5.943-.271-.065-.141-.12-.293-.184-.445a25.416 25.416 0 00-.564-1.236c3.145-1.28 4.577-3.124 4.761-3.362zM12 3.475c2.17 0 4.154.813 5.662 2.148-.152.216-1.443 1.941-4.48 3.08-1.399-2.57-2.95-4.675-3.189-5A8.687 8.687 0 0112 3.475zm-3.633.803a53.896 53.896 0 013.167 4.935c-3.992 1.063-7.517 1.04-7.896 1.04a8.581 8.581 0 014.729-5.975zM3.453 12.01v-.26c.37.01 4.512.065 8.775-1.215.25.477.477.965.694 1.453-.109.033-.228.065-.336.098-4.404 1.42-6.747 5.303-6.942 5.629a8.522 8.522 0 01-2.19-5.705zM12 20.547a8.482 8.482 0 01-5.239-1.8c.152-.315 1.888-3.656 6.703-5.337.022-.01.033-.01.054-.022a35.318 35.318 0 011.823 6.475 8.4 8.4 0 01-3.341.684zm4.761-1.465c-.086-.52-.542-3.015-1.659-6.084 2.679-.423 5.022.271 5.314.369a8.468 8.468 0 01-3.655 5.715z" clipRule="evenodd"></path>
                    </svg>
                  </Link>
                </div>
              </div>
              <div className="col-span-1">
                <h3 className="text-lg font-medium text-white mb-4">Quick Links</h3>
                <ul className="space-y-2">
                  <li><Link to="/" className="text-gray-400 hover:text-white">Home</Link></li>
                  <li><Link to="/courses" className="text-gray-400 hover:text-white">Courses</Link></li>
                  <li><Link to="/about" className="text-gray-400 hover:text-white">About Us</Link></li>
                  <li><Link to="/contact" className="text-gray-400 hover:text-white">Contact</Link></li>
                  <li><Link to="/login" className="text-gray-400 hover:text-white">Login</Link></li>
                </ul>
              </div>
              <div className="col-span-1">
                <h3 className="text-lg font-medium text-white mb-4">Courses</h3>
                <ul className="space-y-2">
                  <li><Link to="/courses/fullstack" className="text-gray-400 hover:text-white">Full Stack Development</Link></li>
                  <li><Link to="/courses/python" className="text-gray-400 hover:text-white">Python Programming</Link></li>
                  <li><Link to="/courses/javascript" className="text-gray-400 hover:text-white">JavaScript Mastery</Link></li>
                  <li><Link to="/courses/react" className="text-gray-400 hover:text-white">React Development</Link></li>
                  <li><Link to="/courses/mongodb" className="text-gray-400 hover:text-white">MongoDB for Developers</Link></li>
                </ul>
              </div>
              <div className="col-span-1">
                <h3 className="text-lg font-medium text-white mb-4">Contact Us</h3>
                <ul className="space-y-2">
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-400">info@mentneo.com</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span className="text-gray-400">+91 9182146476</span>
                  </li>
                  <li className="flex items-start">
                    <svg className="h-6 w-6 text-gray-400 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-gray-400">Hyderabad, India</span>
                  </li>
                </ul>
              </div>
            </div>
            <div className="border-t border-gray-800 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-400 text-sm">© 2025 Mentneo. All rights reserved.</p>
              <div className="mt-4 md:mt-0 flex space-x-6">
                <Link to="/terms" className="text-gray-400 hover:text-white text-sm">Terms of Service</Link>
                <Link to="/privacy" className="text-gray-400 hover:text-white text-sm">Privacy Policy</Link>
                <Link to="/refund" className="text-gray-400 hover:text-white text-sm">Refund Policy</Link>
              </div>
            </div>
          </div>
        </footer>
        
        {/* Contact Modal */}
        {isContactModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto" aria-labelledby="modal-title" role="dialog" aria-modal="true">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" aria-hidden="true" onClick={() => setIsContactModalOpen(false)}></div>
              
              <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
              
              <div className="inline-block align-bottom bg-white dark:bg-gray-900 rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-white dark:bg-gray-900 px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900 dark:text-white" id="modal-title">
                        Contact Us to Enroll
                      </h3>
                      <div className="mt-6 space-y-4">
                        <button
                          onClick={handleCallClick}
                          className="w-full flex items-center justify-center px-4 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                        >
                          <FaPhone className="mr-2" /> Call Now
                        </button>
                        <button
                          onClick={handleWhatsAppClick}
                          className="w-full flex items-center justify-center px-4 py-3 border border-transparent textBase font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                        >
                          <FaWhatsapp className="mr-2" /> Chat on WhatsApp
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 dark:bg-gray-800 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button 
                    type="button">
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
