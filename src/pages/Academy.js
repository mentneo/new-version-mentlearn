import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaArrowRight, FaBookOpen, FaUserGraduate, FaCertificate, FaRocket, FaUsers, FaClock, FaStar, FaCalendarAlt, FaLaptopCode, FaArrowLeft 
} from 'react-icons/fa';
import MenteoLogo from '../components/MenteoLogo';

const featuredCourses = [
  {
    title: "Full Stack Development",
    description: "Master HTML, CSS, JS, React, Node, and build real-world projects.",
    duration: "6 Months • Beginner–Advanced",
    mentor: "Abhi Yeduru",
    cta: "Enroll Now",
    link: "/courses/full-stack",
    icon: <FaRocket className="text-3xl text-[#007bff]" />
  },
  {
    title: "Frontend Development",
    description: "Learn UI/UX, HTML, CSS, JavaScript, and React from scratch.",
    duration: "3 Months • Beginner",
    mentor: "Sharmila Dokala",
    cta: "Enroll Now",
    link: "/courses/frontend",
    icon: <FaBookOpen className="text-3xl text-purple-500" />
  },
  {
    title: "Backend Engineering",
    description: "Node.js, Express, MongoDB, APIs, and scalable backend systems.",
    duration: "3 Months • Intermediate",
    mentor: "K. Varshitha",
    cta: "Enroll Now",
    link: "/courses/backend",
    icon: <FaUserGraduate className="text-3xl text-green-400" />
  },
  {
    title: "AI & Machine Learning",
    description: "Python, ML algorithms, real-world AI projects, and deployment.",
    duration: "4 Months • Intermediate",
    mentor: "Nalla Saransai",
    cta: "Enroll Now",
    link: "/courses/ai-ml",
    icon: <FaLaptopCode className="text-3xl text-yellow-400" />
  }
];

const learningPath = [
  { label: "HTML", icon: <FaBookOpen className="text-[#E34F26]" /> },
  { label: "CSS", icon: <FaBookOpen className="text-[#1572B6]" /> },
  { label: "JavaScript", icon: <FaBookOpen className="text-[#F7DF1E]" /> },
  { label: "React", icon: <FaBookOpen className="text-[#61DAFB]" /> },
  { label: "Firebase", icon: <FaBookOpen className="text-[#FFCA28]" /> },
  { label: "Project", icon: <FaRocket className="text-[#007bff]" /> }
];

const whyMentneo = [
  {
    icon: <FaUsers className="text-3xl text-[#007bff]" />,
    title: "Expert Mentorship",
    desc: "Learn from industry professionals and get 1:1 guidance."
  },
  {
    icon: <FaRocket className="text-3xl text-purple-500" />,
    title: "Real-world Projects",
    desc: "Build a portfolio with hands-on, practical projects."
  },
  {
    icon: <FaCertificate className="text-3xl text-green-400" />,
    title: "Certificate of Completion",
    desc: "Earn a recognized certificate after course completion."
  },
  {
    icon: <FaClock className="text-3xl text-yellow-400" />,
    title: "Affordable Pricing",
    desc: "Early access at just ₹999 for a limited time."
  }
];

const testimonials = [
  {
    name: "revanth",
    college: "VIT University",
    course: "Frontend Development",
    review: "Mentneo Academy helped me build real projects and land my first internship. The mentorship and community are amazing!",
    image: "https://ui-avatars.com/api/?name=Sharmila+Dokala&background=007bff&color=fff"
  },
  {
    name: "madhav",
    college: "IIT Madras",
    course: "Full Stack Development",
    review: "The learning path is clear and the projects are challenging. I feel industry-ready thanks to Mentneo.",
    image: "https://ui-avatars.com/api/?name=K+Varshitha&background=6f42c1&color=fff"
  },
  {
    name: "vijay",
    college: "BITS Pilani",
    course: "AI & Machine Learning",
    review: "The AI/ML course was hands-on and practical. The mentors are always available to help.",
    image: "https://ui-avatars.com/api/?name=Nalla+Saransai&background=00c851&color=fff"
  }
];

const Academy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white font-poppins">
      {/* Back Button */}
      <div className="fixed top-4 left-4 z-50">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center px-4 py-2 bg-[#141426] hover:bg-[#1a1a3a] rounded-xl border border-[#1a1a3a] text-white transition-all"
        >
          <FaArrowLeft className="mr-2" />
          Back
        </button>
      </div>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-4 sm:px-8 max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center"
        >
          <MenteoLogo size="large" showText />
          <h1 className="text-4xl md:text-5xl font-extrabold mt-6 mb-4 bg-gradient-to-r from-[#007bff] to-[#6f42c1] text-transparent bg-clip-text">
            Upskill with Mentneo Academy 🚀
          </h1>
          <p className="text-lg text-gray-300 mb-8">
            Explore full-stack, AI, and development programs with expert mentorship and real projects.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <Link to="#courses" className="px-8 py-3 rounded-2xl bg-gradient-to-r from-[#007bff] to-[#6f42c1] text-white font-semibold shadow-lg hover:scale-105 transition-all">
              Explore Courses
            </Link>
            <Link to="/demo" className="px-8 py-3 rounded-2xl border-2 border-[#007bff] text-[#007bff] font-semibold hover:bg-[#007bff] hover:text-white transition-all">
              Book a Demo
            </Link>
          </div>
          {/* Optional illustration */}
          <div className="mt-10 flex justify-center">
            <img
              src="/mentneo-academy-hero.svg"
              alt="Mentneo Academy Illustration"
              className="w-full max-w-xl rounded-2xl shadow-lg"
              style={{ background: "rgba(0,123,255,0.05)" }}
              onError={e => { e.target.style.display = 'none'; }}
            />
          </div>
        </motion.div>
      </section>

      {/* Featured Courses */}
      <section id="courses" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold mb-10 text-center bg-gradient-to-r from-[#007bff] to-[#6f42c1] text-transparent bg-clip-text">
          Featured Courses & Programs
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {featuredCourses.map((course, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-[#141426] rounded-2xl shadow-xl p-6 flex flex-col items-start hover:scale-105 transition-transform"
            >
              <div className="mb-4">{course.icon}</div>
              <h3 className="text-xl font-bold mb-2">{course.title}</h3>
              <p className="text-gray-300 mb-4">{course.description}</p>
              <div className="flex items-center text-sm text-gray-400 mb-2">
                <FaClock className="mr-2" /> {course.duration}
              </div>
              <div className="flex items-center text-sm text-gray-400 mb-4">
                <FaUserGraduate className="mr-2" /> Mentor: {course.mentor}
              </div>
              <Link to={course.link} className="mt-auto px-5 py-2 rounded-xl bg-gradient-to-r from-[#007bff] to-[#6f42c1] text-white font-semibold shadow hover:scale-105 transition-all flex items-center">
                {course.cta} <FaArrowRight className="ml-2" />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Learning Path */}
      <section className="py-16 px-4 sm:px-8 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold mb-8 text-center text-white">Full Stack Learning Path</h2>
        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
          {learningPath.map((step, idx) => (
            <React.Fragment key={idx}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                className="bg-[#141426] rounded-2xl px-6 py-4 flex flex-col items-center shadow-lg"
              >
                <div className="mb-2">{step.icon}</div>
                <div className="font-semibold">{step.label}</div>
              </motion.div>
              {idx < learningPath.length - 1 && (
                <div className="hidden md:block text-3xl text-[#007bff] font-bold">→</div>
              )}
            </React.Fragment>
          ))}
        </div>
        <div className="text-center mt-6 text-gray-400">Beginner <span className="mx-2">→</span> Advanced</div>
      </section>

      {/* Why Choose Mentneo */}
      <section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-8 text-center text-white">Why Choose Mentneo Academy?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {whyMentneo.map((item, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-[#141426] rounded-2xl p-6 flex flex-col items-center shadow-lg"
            >
              <div className="mb-4">{item.icon}</div>
              <h4 className="text-lg font-semibold mb-2">{item.title}</h4>
              <p className="text-gray-300 text-center">{item.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto">
        <h2 className="text-2xl font-bold mb-8 text-center text-white">Student Success Stories</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {testimonials.map((t, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: idx * 0.1 }}
              className="bg-[#141426] rounded-2xl p-6 flex flex-col items-center shadow-lg"
            >
              <img src={t.image} alt={t.name} className="h-16 w-16 rounded-full mb-4 border-4 border-[#007bff]" />
              <h4 className="font-semibold text-lg">{t.name}</h4>
              <div className="text-sm text-gray-400 mb-1">{t.college}</div>
              <div className="text-xs text-indigo-400 mb-2">{t.course}</div>
              <p className="text-gray-300 text-center mb-2">"{t.review}"</p>
              <div className="flex text-yellow-400">
                {Array.from({ length: 5 }).map((_, i) => (
                  <FaStar key={i} />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Upcoming Batches / Demo CTA */}
      <section className="py-16 px-4 sm:px-8 max-w-4xl mx-auto text-center">
        <div className="bg-gradient-to-r from-[#007bff] to-[#6f42c1] rounded-2xl p-10 shadow-xl flex flex-col items-center">
          <h3 className="text-2xl font-bold mb-2 text-white">Join the Next Batch</h3>
          <p className="text-gray-200 mb-6">Limited seats available. Secure your spot now!</p>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <Link to="/signup" className="px-8 py-3 rounded-2xl bg-white text-[#007bff] font-semibold shadow hover:scale-105 transition-all">
              Enroll Now
            </Link>
            <Link to="/demo" className="px-8 py-3 rounded-2xl border-2 border-white text-white font-semibold hover:bg-white hover:text-[#007bff] transition-all">
              Book a Demo
            </Link>
          </div>
          <div className="flex items-center justify-center gap-2 text-white text-sm mt-2">
            <FaCalendarAlt className="mr-2" />
            Next batch starts: <span className="font-semibold ml-1">Nov 06, 2025</span>
            <span className="ml-4 bg-yellow-400 text-[#0a0a1a] px-3 py-1 rounded-full text-xs font-bold">Limited Seats</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#141426] border-t border-gray-800 py-10 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-3">
            <MenteoLogo size="small" />
            <span className="text-white font-bold text-lg">Mentneo Academy</span>
          </div>
          <div className="flex gap-6 text-gray-400 text-sm">
            <Link to="/courses" className="hover:text-white">Courses</Link>
            <Link to="/about" className="hover:text-white">About</Link>
            <Link to="/contact" className="hover:text-white">Contact</Link>
            <Link to="/terms" className="hover:text-white">Terms</Link>
          </div>
          <div className="flex gap-4 text-xl text-gray-400">
            <a href="https://twitter.com/" target="_blank" rel="noopener noreferrer" className="hover:text-[#007bff]"><FaStar /></a>
            <a href="https://linkedin.com/" target="_blank" rel="noopener noreferrer" className="hover:text-[#007bff]"><FaUserGraduate /></a>
            <a href="https://github.com/" target="_blank" rel="noopener noreferrer" className="hover:text-[#007bff]"><FaBookOpen /></a>
          </div>
        </div>
        <div className="text-center text-gray-500 text-xs mt-6">
          © {new Date().getFullYear()} Mentneo Academy. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default Academy;
