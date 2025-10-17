import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaArrowLeft, FaRocket, FaUser, FaSearch, FaDownload, FaCalendar, 
  FaBriefcase, FaMapMarkerAlt, FaClock, FaGraduationCap, FaCode, 
  FaUserTie, FaStar, FaRobot, FaChartLine, FaAward, FaBuilding,
  FaLinkedin, FaGithub, FaTwitter, FaPlay, FaArrowRight
} from 'react-icons/fa/index.esm.js';
import MenteoLogo from '../components/MenteoLogo.js';

const careerSteps = [
  {
    step: 1,
    title: "Learn Skills",
    desc: "Master tech skills via MentLearning courses",
    icon: <FaGraduationCap className="text-2xl" />,
    color: "#007bff"
  },
  {
    step: 2,
    title: "Build Projects",
    desc: "Create portfolio-worthy projects",
    icon: <FaCode className="text-2xl" />,
    color: "#6f42c1"
  },
  {
    step: 3,
    title: "Get Mentored",
    desc: "1:1 sessions with industry experts",
    icon: <FaUserTie className="text-2xl" />,
    color: "#00e5ff"
  },
  {
    step: 4,
    title: "Apply for Jobs",
    desc: "Access internship & placement openings",
    icon: <FaBriefcase className="text-2xl" />,
    color: "#ff6b35"
  },
  {
    step: 5,
    title: "Launch Career",
    desc: "Achieve success & build your future",
    icon: <FaRocket className="text-2xl" />,
    color: "#28a745"
  }
];

const jobListings = [
  {
    id: 1,
    company: "TechCorp",
    role: "Frontend Developer Intern",
    location: "Bangalore",
    type: "Remote",
    experience: "0-1 years",
    status: "Open",
    logo: "https://via.placeholder.com/40x40?text=TC"
  },
  {
    id: 2,
    company: "DataFlow Inc",
    role: "Data Analyst",
    location: "Hyderabad",
    type: "Onsite",
    experience: "1-2 years",
    status: "Open",
    logo: "https://via.placeholder.com/40x40?text=DF"
  },
  {
    id: 3,
    company: "AI Solutions",
    role: "Backend Developer",
    location: "Chennai",
    type: "Hybrid",
    experience: "0-2 years",
    status: "Closed",
    logo: "https://via.placeholder.com/40x40?text=AI"
  }
];

const mentors = [
  {
    name: "Abhi Yeduru",
    role: "Software Engineer @ Amazon",
    expertise: ["Frontend", "React", "JavaScript"],
    photo: "https://ui-avatars.com/api/?name=Abhi+Yeduru&background=007bff&color=fff"
  },
  {
    name: "Priya Sharma",
    role: "Data Scientist @ Google",
    expertise: ["AI", "Python", "Machine Learning"],
    photo: "https://ui-avatars.com/api/?name=Priya+Sharma&background=6f42c1&color=fff"
  },
  {
    name: "Rahul Kumar",
    role: "Full Stack Developer @ Microsoft",
    expertise: ["Node.js", "Cloud", "DevOps"],
    photo: "https://ui-avatars.com/api/?name=Rahul+Kumar&background=00e5ff&color=fff"
  }
];

const successStories = [
  {
    name: "Sharmila Dokala",
    company: "TCS",
    role: "Web Developer",
    quote: "Got placed as Web Developer after completing MentLearning Frontend Track.",
    photo: "https://ui-avatars.com/api/?name=Sharmila+Dokala&background=007bff&color=fff",
    companyLogo: "https://via.placeholder.com/30x30?text=TCS"
  },
  {
    name: "Varshitha K",
    company: "Infosys",
    role: "Software Engineer",
    quote: "MentLearning's practical approach helped me crack my dream job.",
    photo: "https://ui-avatars.com/api/?name=Varshitha+K&background=6f42c1&color=fff",
    companyLogo: "https://via.placeholder.com/30x30?text=INF"
  },
  {
    name: "Saransai Nalla",
    company: "Wipro",
    role: "Frontend Developer",
    quote: "The mentorship and projects made all the difference in my career.",
    photo: "https://ui-avatars.com/api/?name=Saransai+Nalla&background=00e5ff&color=fff",
    companyLogo: "https://via.placeholder.com/30x30?text=WIP"
  }
];

const TechCareer = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('All');

  const filters = ['All', 'Frontend', 'Backend', 'Data Science', 'AI/ML'];

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white font-poppins">
      {/* Back Button */}
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center px-4 py-2 bg-[#10102a] hover:bg-[#1a1a3a] rounded-xl border border-[#1a1a3a] text-white transition-all"
        >
          <FaArrowLeft className="mr-2" />
          Back
        </button>
      </div>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-8 max-w-7xl mx-auto relative overflow-hidden">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <MenteoLogo size="large" showText />
          <h1 className="text-4xl md:text-6xl font-extrabold mt-6 mb-4 bg-gradient-to-r from-[#007bff] to-[#00e5ff] text-transparent bg-clip-text">
            Your Tech Career Starts Here 🚀
          </h1>
          <p className="text-lg text-gray-300 mb-8 max-w-3xl mx-auto">
            From learning to earning — Mentneo helps you build skills, portfolios, and get placed in top companies.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/profile/create"
              className="px-8 py-3 rounded-2xl bg-gradient-to-r from-[#007bff] to-[#6f42c1] text-white font-semibold shadow-lg hover:scale-105 transition-all"
            >
              Create Career Profile
            </Link>
            <Link
              to="#jobs"
              className="px-8 py-3 rounded-2xl border-2 border-[#00e5ff] text-[#00e5ff] font-semibold hover:bg-[#00e5ff] hover:text-[#0a0a1a] transition-all"
            >
              Explore Jobs
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Career Roadmap */}
      <section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-12 text-center bg-gradient-to-r from-[#007bff] to-[#00e5ff] text-transparent bg-clip-text">
          Your Career Journey
        </h2>
        <div className="relative">
          {/* Timeline line */}
          <div className="hidden md:block absolute left-1/2 transform -translate-x-1/2 h-full w-1 bg-gradient-to-b from-[#007bff] to-[#00e5ff]"></div>
          
          <div className="space-y-12">
            {careerSteps.map((step, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className={`flex flex-col md:flex-row items-center ${i % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'}`}
              >
                <div className={`flex-1 ${i % 2 === 0 ? 'md:text-right md:pr-12' : 'md:text-left md:pl-12'}`}>
                  <div className={`bg-[#10102a] p-6 rounded-xl border border-[#1a1a3a] ${i % 2 === 0 ? 'md:ml-auto' : 'md:mr-auto'} max-w-md hover:border-[${step.color}] transition-all`}>
                    <div className="flex items-center mb-4 justify-center md:justify-start">
                      <div className="mr-4 p-3 rounded-lg" style={{ backgroundColor: step.color }}>
                        {step.icon}
                      </div>
                      <h3 className="text-xl font-bold">{step.title}</h3>
                    </div>
                    <p className="text-gray-300">{step.desc}</p>
                  </div>
                </div>
                <div className="hidden md:flex items-center justify-center relative z-10 w-12 h-12 rounded-full border-4 border-white my-4 md:my-0" style={{ backgroundColor: step.color }}>
                  <span className="text-white font-bold">{step.step}</span>
                </div>
                <div className="flex-1 hidden md:block"></div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Job Board */}
      <section id="jobs" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center text-white">Job & Internship Board</h2>
        
        {/* Search and Filters */}
        <div className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-[#10102a] border border-[#1a1a3a] rounded-lg text-white placeholder-gray-400"
            />
          </div>
          <div className="flex gap-2 overflow-x-auto">
            {filters.map((filter) => (
              <button
                key={filter}
                onClick={() => setSelectedFilter(filter)}
                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                  selectedFilter === filter
                    ? 'bg-[#007bff] text-white'
                    : 'bg-[#10102a] text-gray-400 hover:text-white border border-[#1a1a3a]'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>

        {/* Job Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobListings.map((job) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-[#10102a] rounded-xl p-6 border border-[#1a1a3a] hover:border-[#007bff] transition-all"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center">
                  <img src={job.logo} alt={job.company} className="w-10 h-10 rounded-lg mr-3" />
                  <div>
                    <h3 className="font-bold text-white">{job.role}</h3>
                    <p className="text-gray-400 text-sm">{job.company}</p>
                  </div>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs ${
                  job.status === 'Open' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                }`}>
                  {job.status}
                </span>
              </div>
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-gray-400 text-sm">
                  <FaMapMarkerAlt className="mr-2" />
                  {job.location} • {job.type}
                </div>
                <div className="flex items-center text-gray-400 text-sm">
                  <FaClock className="mr-2" />
                  {job.experience}
                </div>
              </div>
              <button 
                disabled={job.status === 'Closed'}
                className={`w-full py-2 rounded-lg font-semibold transition-all ${
                  job.status === 'Open'
                    ? 'bg-[#007bff] text-white hover:bg-blue-600'
                    : 'bg-gray-600 text-gray-400 cursor-not-allowed'
                }`}
              >
                {job.status === 'Open' ? 'Apply Now' : 'Position Filled'}
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Resume Builder */}
      <section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="bg-[#10102a] rounded-2xl p-8 border border-[#1a1a3a]">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4 text-white">AI-Powered Resume Builder</h2>
            <p className="text-gray-300">Create professional resumes that get you noticed by recruiters</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-[#007bff] rounded-full flex items-center justify-center mx-auto mb-4">
                <FaUser className="text-2xl text-white" />
              </div>
              <h3 className="font-bold mb-2">Build Profile</h3>
              <p className="text-gray-400 text-sm">Add your skills, projects, and experience</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#6f42c1] rounded-full flex items-center justify-center mx-auto mb-4">
                <FaRobot className="text-2xl text-white" />
              </div>
              <h3 className="font-bold mb-2">AI Optimization</h3>
              <p className="text-gray-400 text-sm">Our AI optimizes your resume for ATS systems</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-[#00e5ff] rounded-full flex items-center justify-center mx-auto mb-4">
                <FaDownload className="text-2xl text-white" />
              </div>
              <h3 className="font-bold mb-2">Download & Apply</h3>
              <p className="text-gray-400 text-sm">Download as PDF and start applying</p>
            </div>
          </div>
          <div className="text-center mt-8">
            <button className="px-8 py-3 bg-gradient-to-r from-[#007bff] to-[#6f42c1] text-white font-semibold rounded-lg hover:scale-105 transition-all">
              Build My Resume
            </button>
          </div>
        </div>
      </section>

      {/* Mentors Section */}
      <section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center text-white">Learn from Industry Experts</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {mentors.map((mentor, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-[#10102a] rounded-xl p-6 border border-[#1a1a3a] hover:border-[#007bff] transition-all text-center"
            >
              <img src={mentor.photo} alt={mentor.name} className="w-20 h-20 rounded-full mx-auto mb-4 border-4 border-[#007bff]" />
              <h3 className="font-bold text-lg mb-1">{mentor.name}</h3>
              <p className="text-gray-400 text-sm mb-4">{mentor.role}</p>
              <div className="flex flex-wrap justify-center gap-2 mb-4">
                {mentor.expertise.map((skill, i) => (
                  <span key={i} className="px-2 py-1 bg-[#007bff] text-white text-xs rounded-full">
                    {skill}
                  </span>
                ))}
              </div>
              <button className="w-full py-2 bg-gradient-to-r from-[#007bff] to-[#6f42c1] text-white rounded-lg font-semibold hover:scale-105 transition-all">
                Book a Session
              </button>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Placement Stats */}
      <section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-8 text-center text-white">Placement Statistics</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          {[
            { value: "500+", label: "Internships" },
            { value: "100+", label: "Job Offers" },
            { value: "2000+", label: "Career-Ready Students" },
            { value: "95%", label: "Placement Rate" }
          ].map((stat, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-[#10102a] rounded-xl p-6 border border-[#1a1a3a]"
            >
              <div className="text-3xl font-extrabold bg-gradient-to-r from-[#007bff] to-[#00e5ff] text-transparent bg-clip-text mb-2">
                {stat.value}
              </div>
              <div className="text-gray-300">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* AI Career Coach */}
      <section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-[#007bff] to-[#6f42c1] rounded-2xl p-8 text-center">
          <div className="max-w-3xl mx-auto">
            <FaRobot className="text-6xl text-white mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4 text-white">Meet Mentneo.AI – Your Personal Career Advisor</h2>
            <p className="text-lg mb-6 text-blue-100">
              Get personalized career guidance, resume feedback, interview preparation, and job suggestions powered by AI.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white/10 rounded-lg p-4">
                <h3 className="font-bold mb-2">Resume Feedback</h3>
                <p className="text-sm text-blue-100">AI-powered resume analysis and optimization</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <h3 className="font-bold mb-2">Interview Prep</h3>
                <p className="text-sm text-blue-100">Practice with AI interviewer and get feedback</p>
              </div>
              <div className="bg-white/10 rounded-lg p-4">
                <h3 className="font-bold mb-2">Job Matching</h3>
                <p className="text-sm text-blue-100">Smart job recommendations based on your profile</p>
              </div>
            </div>
            <button className="px-8 py-3 bg-white text-[#007bff] font-semibold rounded-lg hover:scale-105 transition-all">
              Try Mentneo.AI
            </button>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto text-center">
        <div className="bg-[#10102a] rounded-2xl p-12 border border-[#1a1a3a]">
          <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[#007bff] to-[#00e5ff] text-transparent bg-clip-text">
            Ready to Build Your Tech Career?
          </h2>
          <p className="text-gray-300 mb-8 max-w-2xl mx-auto">
            Join thousands of students who have transformed their careers with Mentneo's comprehensive learning and placement program.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link
              to="/signup"
              className="px-8 py-3 bg-gradient-to-r from-[#007bff] to-[#6f42c1] text-white font-semibold rounded-lg hover:scale-105 transition-all"
            >
              Join MentLearning
            </Link>
            <Link
              to="/demo"
              className="px-8 py-3 border-2 border-[#00e5ff] text-[#00e5ff] font-semibold rounded-lg hover:bg-[#00e5ff] hover:text-[#0a0a1a] transition-all"
            >
              Book a Career Demo
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#10102a] border-t border-[#1a1a3a] py-10 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <MenteoLogo size="small" />
            <span className="text-white font-bold text-lg">TechCareer by Mentneo</span>
          </div>
          <div className="flex gap-6 text-gray-400 text-sm">
            <Link to="/" className="hover:text-white">Home</Link>
            <Link to="/courses" className="hover:text-white">Courses</Link>
            <Link to="/mentorship" className="hover:text-white">Mentorship</Link>
            <Link to="/careers" className="hover:text-white">Careers</Link>
            <Link to="/contact" className="hover:text-white">Contact</Link>
          </div>
          <div className="flex gap-4 text-xl text-[#00e5ff]">
            <a href="#" className="hover:text-white"><FaLinkedin /></a>
            <a href="#" className="hover:text-white"><FaGithub /></a>
            <a href="#" className="hover:text-white"><FaTwitter /></a>
          </div>
        </div>
        <div className="text-center text-gray-500 text-xs mt-6">
          © 2025 Mentneo — Empowering Future Tech Careers
        </div>
      </footer>
    </div>
  );
};

export default TechCareer;
