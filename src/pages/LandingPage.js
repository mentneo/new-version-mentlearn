import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaChevronRight, 
  FaLaptopCode, 
  FaUsers, 
  FaRegLightbulb,
  FaGithub,
  FaLinkedin,
  FaTwitter,
  FaInstagram,
  FaPlay,
  FaStar,
  FaBars,
  FaTimes,
  FaArrowRight
} from 'react-icons/fa/index.esm.js';

// Tech icons for learning path
import { 
  SiHtml5, 
  SiCss3, 
  SiJavascript, 
  SiReact,
  SiNodedotjs,
  SiFirebase
} from 'react-icons/si/index.esm.js';

import MenteoLogo from '../components/MenteoLogo.js';
import ChatUsButton from '../components/ChatUsButton.js';

const LandingPage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Toggle mobile menu
  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="bg-gradient-to-b from-blue-50 to-white text-gray-800 min-h-screen">
      {/* Navbar */}
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
              <Link to="/courses" className="text-gray-600 hover:text-[#007bff] px-3 py-2 text-sm font-medium">Our Courses</Link>
              <Link to="/about" className="text-gray-600 hover:text-[#007bff] px-3 py-2 text-sm font-medium">About</Link>
              {/* Program dropdown */}
              <div className="relative group">
                <button className="text-gray-600 hover:text-[#007bff] px-3 py-2 text-sm font-medium flex items-center focus:outline-none">
                  Programs
                  <svg className="ml-1 h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {/* Make dropdown visible on hover and focus */}
                <div className="absolute left-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-200 z-50">
                  <Link to="/courses" className="block px-4 py-3 text-gray-700 hover:bg-[#f0f4ff] hover:text-[#007bff] text-sm font-semibold border-b border-gray-200">
                    All Courses
                  </Link>
                  <Link to="/courses/academy" className="block px-4 py-3 text-gray-700 hover:bg-[#f0f4ff] hover:text-[#007bff] text-sm">
                    Academy
                  </Link>
                  <Link to="/courses/techwave" className="block px-4 py-3 text-gray-700 hover:bg-[#f0f4ff] hover:text-[#007bff] text-sm">
                    TechWave
                  </Link>
                  <Link to="/courses/tech-career" className="block px-4 py-3 text-gray-700 hover:bg-[#f0f4ff] hover:text-[#007bff] text-sm">
                    Tech Career
                  </Link>
                </div>
              </div>
              <Link to="/hire-from-us" className="text-gray-600 hover:text-[#007bff] px-3 py-2 text-sm font-medium">Hire from Us</Link>
              <Link to="/login" className="text-gray-600 hover:text-[#007bff] px-3 py-2 text-sm font-medium">Log In</Link>
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

      {/* Mobile menu - NxtWave style */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 z-40 bg-black md:hidden"
              onClick={toggleMobileMenu}
            />
            
            {/* Slide-in menu */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: "tween", duration: 0.3 }}
              className="fixed inset-y-0 left-0 z-50 w-full max-w-xs bg-[#0c2442] md:hidden overflow-hidden flex flex-col"
            >
              {/* Header with close button */}
              <div className="px-4 py-4 flex items-center justify-between border-b border-gray-700">
                <div className="flex items-center">
                  <MenteoLogo size="small" />
                </div>
                <button
                  className="p-2 text-gray-300 focus:outline-none"
                  onClick={toggleMobileMenu}
                >
                  <FaTimes className="h-6 w-6" />
                </button>
              </div>

              {/* Menu items - Exactly like NxtWave's style */}
              <div className="flex-1 overflow-y-auto py-0">
                <nav className="px-0">
                  <Link to="/" className="block px-6 py-4 text-base font-medium text-white border-b border-gray-700 hover:bg-blue-900/20">
                    <div className="flex items-center justify-between">
                      <span>Home</span>
                      <FaArrowRight className="h-4 w-4 opacity-70" />
                    </div>
                  </Link>
                  {/* Our Courses menu item */}
                  <Link to="/courses" className="block px-6 py-4 text-base font-medium text-white border-b border-gray-700 hover:bg-blue-900/20">
                    <div className="flex items-center justify-between">
                      <span>Our Courses</span>
                      <FaArrowRight className="h-4 w-4 opacity-70" />
                    </div>
                  </Link>
                  {/* Academy menu item */}
                  <Link to="/courses/academy" className="block px-6 py-4 text-base font-medium text-white border-b border-gray-700 hover:bg-blue-900/20">
                    <div className="flex items-center justify-between">
                      <span>Academy</span>
                      <FaArrowRight className="h-4 w-4 opacity-70" />
                    </div>
                  </Link>
                  {/* Program items with indent - exactly like NxtWave */}
                  <div className="bg-blue-900/20">
                    <Link to="/courses/tech-career" className="block px-6 py-4 pl-10 text-base font-medium text-white border-b border-gray-700 hover:bg-blue-900/40">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="rounded-md w-8 h-8 bg-white mr-3 flex items-center justify-center">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" stroke="#042952" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                            </svg>
                          </div>
                          <span>Tech Career</span>
                        </div>
                        <FaArrowRight className="h-4 w-4 opacity-70" />
                      </div>
                    </Link>
                    
                    <Link to="/courses/techwave" className="block px-6 py-4 pl-10 text-base font-medium text-white border-b border-gray-700 hover:bg-blue-900/40">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <div className="rounded-md w-8 h-8 bg-white mr-3 flex items-center justify-center">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                              <path d="M22 19v2H2v-2M22 3v14h-3M2 3v14h3M3 3h18M8 3v10M16 3v13M11 3v7M19 3v10" stroke="#042952" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"></path>
                            </svg>
                          </div>
                          <span>TechWave</span>
                        </div>
                        <FaArrowRight className="h-4 w-4 opacity-70" />
                      </div>
                    </Link>
                  </div>
                  
                  <Link to="/reviews" className="block px-6 py-4 text-base font-medium text-white border-b border-gray-700 hover:bg-blue-900/20">
                    <div className="flex items-center justify-between">
                      <span>Reviews</span>
                      <FaArrowRight className="h-4 w-4 opacity-70" />
                    </div>
                  </Link>

                  <Link to="/hire-from-us" className="block px-6 py-4 text-base font-medium text-white border-b border-gray-700 hover:bg-blue-900/20">
                    <div className="flex items-center justify-between">
                      <span>Hire from Us</span>
                      <FaArrowRight className="h-4 w-4 opacity-70" />
                    </div>
                  </Link>
                </nav>
              </div>

              {/* Bottom action buttons */}
              <div className="p-6 border-t border-gray-700">
                <Link
                  to="/login"
                  className="block w-full py-3 px-4 rounded-md shadow text-center mb-3 bg-transparent border border-white text-white hover:bg-white/10"
                >
                  Login →
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center lg:text-left"
          >
            <h1 className="text-4xl md:text-5xl font-extrabold leading-tight text-gray-900">
              <span className="bg-gradient-to-r from-[#007bff] to-purple-500 text-transparent bg-clip-text">
                Transform Your College Life
              </span>
              <br />
              into a Career Launchpad
            </h1>
            <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto lg:mx-0">
              Join Mentneo's Full Stack Development Program and build real-world projects while learning. Get industry-ready with personalized mentorship.
            </p>
            <div className="mt-8 flex flex-col sm:flex-row justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
              <Link to="/signup" className="px-8 py-3 bg-[#007bff] hover:bg-blue-600 text-white font-medium rounded-lg shadow-lg shadow-blue-500/30 flex items-center justify-center">
                Start Learning <FaChevronRight className="ml-2" />
              </Link>
              <Link to="/demo" className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium rounded-lg flex items-center justify-center border border-gray-200">
                <FaPlay className="mr-2 text-[#007bff]" /> Book Free Demo
              </Link>
              {/* <Link to="/courses/academy" className="px-8 py-3 bg-gradient-to-r from-[#007bff] to-[#6f42c1] text-white font-medium rounded-lg flex items-center justify-center shadow hover:scale-105 transition-all">
                Explore Academy <FaChevronRight className="ml-2" />
              </Link> */}
            </div>
          </motion.div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="hidden lg:flex justify-center items-center relative"
          >
            <div className="w-64 h-64 relative">
              <div className="w-full h-full flex items-center justify-center animate-float">
                <MenteoLogo size="large" showText />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Trusted By Section */}
      <section className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-center text-sm font-semibold text-gray-500 uppercase tracking-wider mb-8">
            Students from These Colleges Are Leveling Up with Mentneo
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-8">
            {[
              "IIT Madras",
              "IIT Delhi",
              "IIT Bombay",
              "BITS Pilani",
              "VIT University",
              "IIIT Hyderabad"
            ].map((collegeName, index) => (
              <div key={index} className="flex items-center justify-center transition-all">
                <div className="bg-white h-16 w-full rounded-md flex items-center justify-center p-4 border border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all">
                  <div className="text-center font-semibold text-gray-800">
                    {collegeName}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Path Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900">
            Your <span className="bg-gradient-to-r from-[#007bff] to-purple-500 text-transparent bg-clip-text">Learning Path</span> to Success
          </h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Our structured curriculum takes you from basics to advanced full-stack development with hands-on projects at every step.
          </p>
        </motion.div>

        {/* Learning Path Timeline */}
        <div className="relative">
          {/* Timeline line */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-[#007bff] to-purple-600"></div>

          <div className="space-y-12">
            {[
              { icon: <SiHtml5 className="text-[#E34F26] text-4xl" />, title: "HTML & Structure", content: "Learn the building blocks of web pages and document structure." },
              { icon: <SiCss3 className="text-[#1572B6] text-4xl" />, title: "CSS & Styling", content: "Master the art of designing beautiful and responsive user interfaces." },
              { icon: <SiJavascript className="text-[#F7DF1E] text-4xl" />, title: "JavaScript", content: "Add interactivity and dynamic behavior to your websites." },
              { icon: <SiReact className="text-[#61DAFB] text-4xl" />, title: "React", content: "Build powerful single-page applications with the most popular frontend library." },
              { icon: <SiFirebase className="text-[#FFCA28] text-4xl" />, title: "Firebase", content: "Implement authentication, real-time database, and hosting." },
              { icon: <SiNodedotjs className="text-[#339933] text-4xl" />, title: "Backend Development", content: "Complete your skills with Node.js, Express, and MongoDB." },
            ].map((item, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className={`flex flex-col md:flex-row items-center ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
              >
                <div className={`flex-1 ${i % 2 === 0 ? 'md:text-right md:pr-12' : 'md:text-left md:pl-12'}`}>
                  <div className={`bg-white p-6 rounded-xl shadow-md ${i % 2 === 0 ? 'md:ml-auto' : 'md:mr-auto'} max-w-md border border-gray-100`}>
                    <div className="flex items-center mb-4 justify-center md:justify-start">
                      <div className="mr-4 p-3 bg-gray-100 rounded-lg">{item.icon}</div>
                      <h3 className="text-xl font-bold text-gray-900">{item.title}</h3>
                    </div>
                    <p className="text-gray-600">{item.content}</p>
                  </div>
                </div>
                <div className="hidden md:flex items-center justify-center relative z-10 w-12 h-12 bg-gradient-to-br from-[#007bff] to-purple-600 rounded-full border-4 border-white my-4 md:my-0">
                  <span className="text-white font-bold">{i + 1}</span>
                </div>
                <div className="flex-1 hidden md:block"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Student Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto bg-blue-50">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-3xl font-bold text-gray-900">Student <span className="bg-gradient-to-r from-[#007bff] to-purple-500 text-transparent bg-clip-text">Success Stories</span></h2>
          <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
            Hear from our students who have transformed their careers through Mentneo's programs.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {[
            { 
              name: "Sharmila Dokala", 
              role: "Frontend Development Student", 
              progress: "58% Complete",
              quote: "Mentneo's frontend development course has been amazing! The structured curriculum and hands-on projects helped me build a strong foundation in web development. I'm already 58% through the course and loving every module!" 
            },
            { 
              name: "K. Varshitha", 
              role: "Frontend Development Student", 
              progress: "82% Complete",
              quote: "I'm almost done with the frontend course and I can't believe how much I've learned! The practical approach and mentor support made complex concepts easy to understand. Highly recommend Mentneo to anyone serious about coding!" 
            },
            { 
              name: "Nalla Saransai", 
              role: "Frontend Development Student", 
              progress: "50% Complete",
              quote: "Halfway through my journey with Mentneo and it's been incredible! The project-based learning approach really helps in understanding real-world applications. The community support is fantastic too!" 
            },
            { 
              name: "Padma Anupoju", 
              role: "Frontend Development Student", 
              progress: "50% Complete",
              quote: "The quality of education at Mentneo is top-notch. The mentors are always available to help, and the course content is updated with latest industry trends. Great investment for my career!" 
            },
            { 
              name: "ACHANTA Siva Rama Krishna", 
              role: "Frontend Development Student", 
              progress: "45% Complete",
              quote: "Mentneo has exceeded my expectations! The interactive learning modules and practical assignments have significantly improved my coding skills. Looking forward to completing the remaining course!" 
            },
            { 
              name: "Asritha Dasari", 
              role: "Frontend Development Student", 
              progress: "42% Complete",
              quote: "The learning experience at Mentneo is phenomenal. From basic HTML to advanced React concepts, everything is explained clearly with practical examples. The support system is excellent!" 
            }
          ].map((testimonial, i) => (
            <motion.div 
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="bg-white rounded-xl overflow-hidden shadow-md"
            >
              <div className="border border-gray-100 rounded-xl overflow-hidden flex flex-col h-full">
                <div className="p-6 flex-grow">
                  <div className="flex items-center mb-4">
                    <div className="flex-shrink-0">
                      <img
                        className="h-12 w-12 rounded-full bg-gray-200 object-cover"
                        src={`https://ui-avatars.com/api/?name=${testimonial.name.replace(' ', '+')}&background=0062ff&color=fff`}
                        alt={testimonial.name}
                      />
                    </div>
                    <div className="ml-4">
                      <h3 className="text-lg font-medium text-gray-900">{testimonial.name}</h3>
                      <p className="text-sm text-gray-500">{testimonial.role}</p>
                      <p className="text-xs text-indigo-600 font-medium">{testimonial.progress}</p>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="absolute -top-2 -left-2 text-4xl text-[#007bff]/20">"</div>
                    <p className="text-gray-600 relative z-10 pl-4">{testimonial.quote}</p>
                  </div>
                </div>
                <div className="flex items-center px-6 py-2 bg-gray-50">
                  <div className="flex text-yellow-500">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <FaStar key={i} />
                    ))}
                  </div>
                  <span className="ml-2 text-sm text-gray-600">Verified Student</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* Additional testimonials in a scrolling section */}
        <div className="mt-16">
          <h3 className="text-xl font-bold text-center text-gray-900 mb-8">More Student Reviews</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[
              { 
                name: "K Sandhya", 
                progress: "37%", 
                quote: "The course structure is well-organized and the learning pace is perfect for working professionals." 
              },
              { 
                name: "P.N. Sasank", 
                progress: "32%", 
                quote: "Excellent mentorship and practical projects that prepare you for real-world development challenges." 
              },
              { 
                name: "Edupuganti Harshitha", 
                progress: "32%", 
                quote: "Mentneo's approach to teaching frontend development is comprehensive and easy to follow." 
              },
              { 
                name: "Komali Rama Siri", 
                progress: "26%", 
                quote: "Great platform for learning web development with hands-on experience and community support." 
              },
              { 
                name: "Y Saikrishna", 
                progress: "24%", 
                quote: "The course content is up-to-date with industry standards and the projects are very practical." 
              },
              { 
                name: "Pappala Rajeswari", 
                progress: "24%", 
                quote: "Amazing learning experience! The step-by-step approach makes complex topics easy to understand." 
              }
            ].map((review, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, x: i % 2 === 0 ? -20 : 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="bg-white p-4 rounded-lg shadow-sm border border-gray-100"
              >
                <div className="flex items-start">
                  <img
                    className="h-10 w-10 rounded-full bg-gray-200 object-cover mr-3"
                    src={`https://ui-avatars.com/api/?name=${review.name.replace(' ', '+')}&background=0062ff&color=fff`}
                    alt={review.name}
                  />
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-gray-900">{review.name}</h4>
                      <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded-full">{review.progress} Complete</span>
                    </div>
                    <p className="text-gray-600 text-sm">{review.quote}</p>
                    <div className="flex items-center mt-2">
                      <div className="flex text-yellow-400 text-xs">
                        {Array.from({ length: 5 }).map((_, i) => (
                          <FaStar key={i} />
                        ))}
                      </div>
                      <span className="ml-2 text-xs text-gray-500">Verified Student</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        <div className="text-center mt-12">
          <Link to="/reviews" className="inline-flex items-center text-[#007bff] hover:text-blue-700">
            View more reviews <FaChevronRight className="ml-2" />
          </Link>
        </div>
      </section>

      {/* Mentorship & Community Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl font-bold mb-6 text-gray-900">
              Learn with <span className="bg-gradient-to-r from-[#007bff] to-purple-500 text-transparent bg-clip-text">Expert Mentors</span> and a Supportive Community
            </h2>
            <p className="text-gray-600 mb-6">
              Our mentors are industry professionals who guide you through your learning journey with personalized feedback and support.
            </p>
            
            <div className="space-y-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-[#007bff] text-white">
                    <FaUsers />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">1:1 Mentorship Sessions</h3>
                  <p className="mt-2 text-gray-600">
                    Get personalized guidance from industry experts who help you overcome challenges.
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-[#007bff] text-white">
                    <FaLaptopCode />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Project Reviews</h3>
                  <p className="mt-2 text-gray-600">
                    Receive detailed code reviews and improvement suggestions for your projects.
                  </p>
                </div>
              </div>
              
              <div className="flex">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-[#007bff] text-white">
                    <FaRegLightbulb />
                  </div>
                </div>
                <div className="ml-4">
                  <h3 className="text-lg font-medium text-gray-900">Community Learning</h3>
                  <p className="mt-2 text-gray-600">
                    Join our active Discord community for peer learning and collaboration.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="relative"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#007bff] to-purple-500 rounded-lg blur-lg opacity-50"></div>
            <div className="relative bg-white p-6 rounded-lg shadow-md">
              <img
                src="https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&h=400&q=80"
                alt="Mentneo community"
                className="w-full rounded-lg"
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/600x400?text=Community+Learning";
                }}
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing / Offer Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="relative rounded-2xl overflow-hidden shadow-xl"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-purple-600"></div>
          <div className="relative bg-white/95 m-1 rounded-2xl overflow-hidden">
            <div className="py-12 px-4 sm:px-12 text-center">
              <h2 className="text-3xl font-bold mb-4 text-gray-900">Limited Time Early Access Offer</h2>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                Join our flagship Full Stack Development Program at a special launch price. Limited seats available.
              </p>
              
              <div className="flex justify-center items-center space-x-6 mb-8">
                <div>
                  <div className="text-gray-400 line-through">₹4,999</div>
                  <div className="text-5xl font-bold text-gray-900">₹999</div>
                </div>
                <div className="bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-medium">
                  Save 80%
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8 max-w-2xl mx-auto">
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="font-medium text-gray-800">100+ Hours of Content</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="font-medium text-gray-800">1:1 Mentorship</p>
                </div>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="font-medium text-gray-800">Project Portfolio</p>
                </div>
              </div>
              
              <Link to="/BookDemo" className="inline-flex items-center px-8 py-3 border border-transparent text-base font-medium rounded-md text-white bg-[#007bff] hover:bg-blue-600 shadow-md">
                Enroll Now <FaChevronRight className="ml-2" />
              </Link>
              <p className="mt-4 text-sm text-gray-500">
                30-day money-back guarantee. No questions asked.
              </p>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-12 px-4 sm:px-6 lg:py-16 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <Link to="/" className="flex items-center">
                <MenteoLogo />
              </Link>
              <p className="mt-4 text-gray-600 text-sm">
                Empowering students with cutting-edge tech education and mentorship.
              </p>
              <div className="mt-6 flex space-x-4">
                <Link to="/social/twitter" className="text-gray-400 hover:text-[#007bff]">
                  <FaTwitter />
                </Link>
                <Link to="/social/linkedin" className="text-gray-400 hover:text-[#007bff]">
                  <FaLinkedin />
                </Link>
                <Link to="/social/github" className="text-gray-400 hover:text-[#007bff]">
                  <FaGithub />
                </Link>
                <Link to="/social/instagram" className="text-gray-400 hover:text-[#007bff]">
                  <FaInstagram />
                </Link>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Programs
              </h3>
              <ul className="mt-4 space-y-2">
                <li><Link to="/courses/full-stack" className="text-base text-gray-600 hover:text-[#007bff]">Full Stack Development</Link></li>
                <li><Link to="/courses/frontend" className="text-base text-gray-600 hover:text-[#007bff]">Frontend Development</Link></li>
                <li><Link to="/courses/backend" className="text-base text-gray-600 hover:text-[#007bff]">Backend Development</Link></li>
                <li><Link to="/courses" className="text-base text-gray-600 hover:text-[#007bff]">All Courses</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Company
              </h3>
              <ul className="mt-4 space-y-2">
                <li><Link to="/about" className="text-base text-gray-600 hover:text-[#007bff]">About</Link></li>
                <li><Link to="/team" className="text-base text-gray-600 hover:text-[#007bff]">Our Team</Link></li>
                <li><Link to="/careers" className="text-base text-gray-600 hover:text-[#007bff]">Careers</Link></li>
                <li><Link to="/blog" className="text-base text-gray-600 hover:text-[#007bff]">Blog</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
                Legal
              </h3>
              <ul className="mt-4 space-y-2">
                <li><Link to="/privacy-policy" className="text-base text-gray-600 hover:text-[#007bff]">Privacy Policy</Link></li>
                <li><Link to="/terms" className="text-base text-gray-600 hover:text-[#007bff]">Terms of Service</Link></li>
                <li><Link to="/refund-policy" className="text-base text-gray-600 hover:text-[#007bff]">Refund Policy</Link></li>
                <li><Link to="/cookies" className="text-base text-gray-600 hover:text-[#007bff]">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="mt-12 border-t border-gray-200 pt-8">
            <p className="text-base text-gray-500 xl:text-center">
              © {new Date().getFullYear()} Mentneo Technologies Pvt. Ltd. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
      {/* Chat Us Button */}
      {/* If you want the ChatUsButton, uncomment the next line */}
      {/* <ChatUsButton /> */}
    </div>
  );
};

export default LandingPage;
