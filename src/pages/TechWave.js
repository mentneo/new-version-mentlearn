import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaArrowRight, FaUsers, FaTrophy, FaCode, FaUserGraduate, FaRobot, FaCloud, FaCubes, FaChartBar, FaUserTie, FaStar, FaDiscord, FaGithub, FaLinkedin, FaTwitter, FaArrowLeft } from 'react-icons/fa/index.esm.js';
import MenteoLogo from '../components/MenteoLogo.js';

const learningTracks = [
	{
		icon: <FaCode className="text-2xl text-[#00d4ff]" />,
		title: 'Frontend Development',
		desc: 'React, HTML, CSS, UI/UX, Animations',
		progress: 60,
		duration: '3 months',
		link: '/courses/frontend',
	},
	{
		icon: <FaCloud className="text-2xl text-[#00d4ff]" />,
		title: 'Backend & Cloud',
		desc: 'Node.js, Express, AWS, APIs, DevOps',
		progress: 35,
		duration: '4 months',
		link: '/courses/backend',
	},
	{
		icon: <FaRobot className="text-2xl text-[#00d4ff]" />,
		title: 'Artificial Intelligence',
		desc: 'Python, ML, Deep Learning, NLP',
		progress: 20,
		duration: '5 months',
		link: '/courses/ai-ml',
	},
	{
		icon: <FaCubes className="text-2xl text-[#00d4ff]" />,
		title: 'Blockchain & Web3',
		desc: 'Solidity, Ethereum, DApps, Smart Contracts',
		progress: 10,
		duration: '2 months',
		link: '/courses/web3',
	},
	{
		icon: <FaChartBar className="text-2xl text-[#00d4ff]" />,
		title: 'Data Science',
		desc: 'Python, Pandas, Data Viz, ML',
		progress: 45,
		duration: '4 months',
		link: '/courses/data-science',
	},
];

const hackathons = [
	{
		name: 'Mentneo HackFest 2025',
		date: 'July 20, 2025',
		difficulty: 'Intermediate',
		cta: 'Register',
		link: '/events/hackfest-2025',
	},
	{
		name: 'AI Sprint Challenge',
		date: 'Aug 5, 2025',
		difficulty: 'Advanced',
		cta: 'Register',
		link: '/events/ai-sprint',
	},
	{
		name: 'Web3 Weekend',
		date: 'Sept 10, 2025',
		difficulty: 'Beginner',
		cta: 'Register',
		link: '/events/web3-weekend',
	},
];

const communityFeed = [
	{
		name: 'shyam',
		badge: 'Top Learner',
		project: 'Portfolio Website',
		likes: 42,
		avatar: 'https://ui-avatars.com/api/?name=shyam&background=007bff&color=fff',
	},
	{
		name: 'narmadha v',
		badge: 'Hackathon Winner',
		project: 'AI Chatbot',
		likes: 35,
		avatar: 'https://ui-avatars.com/api/?name=narmadha+v&background=6f42c1&color=fff',
	},
	{
		name: 'pradeep',
		badge: 'Community Star',
		project: 'Web3 DApp',
		likes: 29,
		avatar: 'https://ui-avatars.com/api/?name=pradeep&background=00d4ff&color=fff',
	},
];

const mentors = [
	{
		name: 'Abhi Yeduru',
		session: 'Live React Workshop 🚀',
		time: 'Starts in 2d 5h',
		cta: 'Join Now',
	},
	{
		name: 'yashwanth jada',
		session: 'AI with Python - Bootcamp',
		time: 'Starts in 5d 2h',
		cta: 'Join Now',
	},
];

const stats = [
	{ label: 'Learners', value: '10K+' },
	{ label: 'Projects', value: '100+' },
	{ label: 'Hackathons', value: '25+' },
	{ label: 'Mentors', value: '50+' },
];

const TechWave = () => {
	const navigate = useNavigate();

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
					<h1 className="text-4xl md:text-5xl font-extrabold mt-6 mb-4 bg-gradient-to-r from-[#007bff] to-[#00d4ff] text-transparent bg-clip-text drop-shadow-glow">
						Welcome to TechWave 🌊 — Powered by Mentneo
					</h1>
					<p className="text-lg text-gray-300 mb-8">
						Learn. Build. Compete. Grow with India’s smartest tech learners.
					</p>
					<div className="flex flex-col sm:flex-row justify-center gap-4">
						<Link
							to="#tracks"
							className="px-8 py-3 rounded-2xl bg-gradient-to-r from-[#007bff] to-[#00d4ff] text-white font-semibold shadow-lg hover:scale-105 transition-all"
						>
							Explore Learning Paths
						</Link>
						{/* Change to external WhatsApp link */}
						<a
							href="https://chat.whatsapp.com/J8LucMCXgTnEwzHKgPfIB2"
							target="_blank"
							rel="noopener noreferrer"
							className="px-8 py-3 rounded-2xl border-2 border-[#00d4ff] text-[#00d4ff] font-semibold hover:bg-[#00d4ff] hover:text-[#0a0a1a] transition-all text-center"
						>
							Join Community
						</a>
					</div>
				</motion.div>
				{/* Abstract waves background */}
				<div className="absolute inset-0 pointer-events-none z-0">
					<svg
						width="100%"
						height="100%"
						viewBox="0 0 1440 320"
						className="absolute bottom-0 left-0 opacity-30"
					>
						<path
							fill="#00d4ff"
							fillOpacity="0.2"
							d="M0,160L60,170.7C120,181,240,203,360,197.3C480,192,600,160,720,154.7C840,149,960,171,1080,181.3C1200,192,1320,192,1380,192L1440,192L1440,320L1380,320C1320,320,1200,320,1080,320C960,320,840,320,720,320C600,320,480,320,360,320C240,320,120,320,60,320L0,320Z"
						></path>
					</svg>
				</div>
			</section>

			{/* Learning Tracks */}
			<section id="tracks" className="py-16 px-4 sm:px-8 max-w-7xl mx-auto">
				<h2 className="text-3xl font-bold mb-10 text-center bg-gradient-to-r from-[#007bff] to-[#00d4ff] text-transparent bg-clip-text">
					Learning Tracks
				</h2>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
					{learningTracks.map((track, idx) => (
						<motion.div
							key={idx}
							initial={{ opacity: 0, y: 30 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5, delay: idx * 0.1 }}
							className="bg-[#10102a] rounded-2xl shadow-xl p-6 flex flex-col items-start hover:scale-105 transition-transform border border-[#1a1a3a]"
						>
							<div className="mb-3">{track.icon}</div>
							<h3 className="text-lg font-bold mb-1">{track.title}</h3>
							<p className="text-gray-300 mb-2">{track.desc}</p>
							<div className="w-full bg-[#22224a] rounded-full h-2 mb-2">
								<div
									className="bg-gradient-to-r from-[#007bff] to-[#00d4ff] h-2 rounded-full"
									style={{ width: `${track.progress}%` }}
								></div>
							</div>
							<div className="text-xs text-gray-400 mb-4">
								{track.duration}
							</div>
							<Link
								to={track.link}
								className="mt-auto px-4 py-2 rounded-xl bg-gradient-to-r from-[#007bff] to-[#00d4ff] text-white font-semibold shadow hover:scale-105 transition-all flex items-center"
							>
								Start Learning <FaArrowRight className="ml-2" />
							</Link>
						</motion.div>
					))}
				</div>
			</section>

			{/* Hackathons & Events */}
			<section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto">
				<h2 className="text-2xl font-bold mb-8 text-center text-white">
					Hackathons & Events
				</h2>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
					{hackathons.map((event, idx) => (
						<motion.div
							key={idx}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5, delay: idx * 0.1 }}
							className="bg-[#10102a] rounded-2xl p-6 shadow-lg flex flex-col border border-[#1a1a3a]"
						>
							<div className="flex items-center mb-2">
								<FaTrophy className="text-[#00d4ff] mr-2" />
								<span className="font-semibold">{event.name}</span>
							</div>
							<div className="text-sm text-gray-400 mb-1">
								{event.date}
							</div>
							<div className="text-xs text-[#00d4ff] mb-4">
								{event.difficulty}
							</div>
							<Link
								to={event.link}
								className="mt-auto px-4 py-2 rounded-xl bg-gradient-to-r from-[#007bff] to-[#00d4ff] text-white font-semibold shadow hover:scale-105 transition-all flex items-center"
							>
								{event.cta} <FaArrowRight className="ml-2" />
							</Link>
						</motion.div>
					))}
				</div>
			</section>

			{/* Community Feed */}
			<section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto">
				<h2 className="text-2xl font-bold mb-8 text-center text-white">
					Community Feed
				</h2>
				<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
					{communityFeed.map((user, idx) => (
						<motion.div
							key={idx}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5, delay: idx * 0.1 }}
							className="bg-[#10102a] rounded-2xl p-6 shadow-lg flex flex-col items-center border border-[#1a1a3a]"
						>
							<img
								src={user.avatar}
								alt={user.name}
								className="h-16 w-16 rounded-full mb-3 border-4 border-[#00d4ff]"
							/>
							<h4 className="font-semibold text-lg">{user.name}</h4>
							<div className="text-xs text-[#00d4ff] mb-1">{user.badge}</div>
							<div className="text-sm text-gray-300 mb-2">{user.project}</div>
							<div className="flex items-center text-yellow-400">
								<FaStar className="mr-1" /> {user.likes}
							</div>
						</motion.div>
					))}
				</div>
			</section>

			{/* Mentor's Corner */}
			<section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto">
				<h2 className="text-2xl font-bold mb-8 text-center text-white">
					Mentor’s Corner
				</h2>
				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					{mentors.map((mentor, idx) => (
						<motion.div
							key={idx}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5, delay: idx * 0.1 }}
							className="bg-[#10102a] rounded-2xl p-6 shadow-lg flex flex-col border border-[#1a1a3a]"
						>
							<div className="flex items-center mb-2">
								<FaUserTie className="text-[#00d4ff] mr-2" />
								<span className="font-semibold">{mentor.name}</span>
							</div>
							<div className="text-sm text-gray-300 mb-1">
								{mentor.session}
							</div>
							<div className="text-xs text-[#00d4ff] mb-4">
								{mentor.time}
							</div>
							<button className="mt-auto px-4 py-2 rounded-xl bg-gradient-to-r from-[#007bff] to-[#00d4ff] text-white font-semibold shadow hover:scale-105 transition-all flex items-center">
								{mentor.cta} <FaArrowRight className="ml-2" />
							</button>
						</motion.div>
					))}
				</div>
			</section>

			{/* TechWave Stats */}
			<section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto">
				<h2 className="text-2xl font-bold mb-8 text-center text-white">
					TechWave Stats
				</h2>
				<div className="grid grid-cols-2 sm:grid-cols-4 gap-8 text-center">
					{stats.map((stat, idx) => (
						<motion.div
							key={idx}
							initial={{ opacity: 0, y: 20 }}
							whileInView={{ opacity: 1, y: 0 }}
							viewport={{ once: true }}
							transition={{ duration: 0.5, delay: idx * 0.1 }}
							className="bg-[#10102a] rounded-2xl p-8 shadow-lg border border-[#1a1a3a]"
						>
							<div className="text-3xl font-extrabold bg-gradient-to-r from-[#007bff] to-[#00d4ff] text-transparent bg-clip-text mb-2">
								{stat.value}
							</div>
							<div className="text-gray-300 text-lg">{stat.label}</div>
						</motion.div>
					))}
				</div>
			</section>

			{/* Footer */}
			<footer className="bg-[#10102a] border-t border-[#1a1a3a] py-10 px-4 sm:px-8">
				<div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
					<div className="flex items-center gap-3">
						<MenteoLogo size="small" />
						<span className="text-white font-bold text-lg">
							TechWave by Mentneo
						</span>
					</div>
					<div className="flex gap-6 text-gray-400 text-sm">
						<Link to="/courses" className="hover:text-white">
							Courses
						</Link>
						<Link to="/community" className="hover:text-white">
							Community
						</Link>
						<Link to="/about" className="hover:text-white">
							About
						</Link>
						<Link to="/contact" className="hover:text-white">
							Contact
						</Link>
						<Link to="/careers" className="hover:text-white">
							Careers
						</Link>
					</div>
					<div className="flex gap-4 text-xl text-[#00d4ff]">
						<a
							href="https://discord.gg/"
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-white"
						>
							<FaDiscord />
						</a>
						<a
							href="https://github.com/"
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-white"
						>
							<FaGithub />
						</a>
						<a
							href="https://linkedin.com/"
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-white"
						>
							<FaLinkedin />
						</a>
						<a
							href="https://twitter.com/"
							target="_blank"
							rel="noopener noreferrer"
							className="hover:text-white"
						>
							<FaTwitter />
						</a>
					</div>
				</div>
				<div className="text-center text-gray-500 text-xs mt-6">
					Powered by Mentneo © 2025
				</div>
			</footer>
		</div>
	);
};

export default TechWave;
