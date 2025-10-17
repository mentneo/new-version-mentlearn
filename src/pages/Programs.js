import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowRight, FaRocket, FaBookOpen, FaUserGraduate, FaLaptopCode } from 'react-icons/fa/index.esm.js';
import MenteoLogo from '../components/MenteoLogo.js';

const programs = [
  {
    title: "Academy",
    description: "Explore all Mentneo programs, learning paths, and mentorship.",
    link: "/courses/academy",
    icon: <FaRocket className="text-3xl text-[#007bff]" />
  },
  {
    title: "Tech Career",
    description: "Get career-ready with our Tech Career program and placement support.",
    link: "/courses/tech-career",
    icon: <FaUserGraduate className="text-3xl text-purple-500" />
  },
  {
    title: "TechWave",
    description: "Short-term, high-impact courses for trending tech skills.",
    link: "/courses/techwave",
    icon: <FaLaptopCode className="text-3xl text-green-400" />
  },
  {
    title: "Frontend Development",
    description: "Master HTML, CSS, JavaScript, and React for modern web apps.",
    link: "/courses/frontend",
    icon: <FaBookOpen className="text-3xl text-yellow-400" />
  },
  {
    title: "Backend Engineering",
    description: "Learn Node.js, Express, MongoDB, and scalable backend systems.",
    link: "/courses/backend",
    icon: <FaBookOpen className="text-3xl text-indigo-400" />
  },
  {
    title: "AI & Machine Learning",
    description: "Hands-on AI/ML with Python, real-world projects, and deployment.",
    link: "/courses/ai-ml",
    icon: <FaLaptopCode className="text-3xl text-pink-400" />
  }
];

const Programs = () => (
  <div className="min-h-screen bg-[#0a0a1a] text-white font-poppins">
    <section className="pt-24 pb-10 px-4 sm:px-8 max-w-7xl mx-auto text-center">
      <MenteoLogo size="large" showText />
      <h1 className="text-4xl md:text-5xl font-extrabold mt-6 mb-4 bg-gradient-to-r from-[#007bff] to-[#6f42c1] text-transparent bg-clip-text">
        Mentneo Programs
      </h1>
      <p className="text-lg text-gray-300 mb-10">
        Choose your path. Learn with mentorship. Build your tech career.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {programs.map((prog, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.1 }}
            className="bg-[#141426] rounded-2xl shadow-xl p-6 flex flex-col items-start hover:scale-105 transition-transform"
          >
            <div className="mb-4">{prog.icon}</div>
            <h3 className="text-xl font-bold mb-2">{prog.title}</h3>
            <p className="text-gray-300 mb-4">{prog.description}</p>
            <Link to={prog.link} className="mt-auto px-5 py-2 rounded-xl bg-gradient-to-r from-[#007bff] to-[#6f42c1] text-white font-semibold shadow hover:scale-105 transition-all flex items-center">
              Learn More <FaArrowRight className="ml-2" />
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  </div>
);

export default Programs;
