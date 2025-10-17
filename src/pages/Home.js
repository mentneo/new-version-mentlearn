import React, { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase/firebase.js';
import CourseCard from '../components/CourseCard.jsx';
import { Link } from 'react-router-dom';
import { FaGraduationCap, FaLaptopCode, FaChalkboardTeacher, FaArrowRight } from 'react-icons/fa/index.esm.js';

export default function Home() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
  const q = collection(db, 'courses');
  const unsubscribe = onSnapshot(q, (snapshot) => {
      const courseList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCourses(courseList);
      setLoading(false);
    }, (err) => {
      setError('Failed to load courses.');
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="bg-white">
      {/* Hero section */}
      <div className="relative bg-indigo-600">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-r from-indigo-800 to-indigo-700 mix-blend-multiply" />
        </div>
        <div className="relative max-w-7xl mx-auto py-24 px-4 sm:py-32 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">Mentneo Learning Platform</h1>
          <p className="mt-6 text-xl text-indigo-100 max-w-3xl">
            Advance your skills with personalized mentorship, structured learning paths, and on-demand resources designed to help you succeed.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row sm:space-x-4 space-y-4 sm:space-y-0">
            <Link to="/signup" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50">
              Get started
              <FaArrowRight className="ml-2 -mr-1 h-5 w-5" />
            </Link>
            <button
              onClick={() => {
                const el = document.getElementById('available-courses-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
              className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              type="button"
            >
              Browse Courses
            </button>
            <Link to="/login" className="inline-flex items-center justify-center px-5 py-3 border border-white text-base font-medium rounded-md text-white hover:bg-indigo-500">
              Sign in
            </Link>
            <Link to="/modern-login" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md bg-orange-500 text-white hover:bg-orange-600">
              Modern Sign in
            </Link>
          </div>
        </div>
      </div>

      {/* Available Courses section */}
      <div id="available-courses-section" className="py-12 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Available Courses</h2>
          {loading ? (
            <div className="text-center py-8 text-gray-500">Loading courses...</div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : courses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">No courses available at the moment.</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {courses.map(course => (
                <CourseCard key={course.id} course={course} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Features section */}
      <div className="py-12 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="lg:text-center">
            <h2 className="text-base text-indigo-600 font-semibold tracking-wide uppercase">Features</h2>
            <p className="mt-2 text-3xl leading-8 font-extrabold tracking-tight text-gray-900 sm:text-4xl">
              Everything you need to succeed
            </p>
            <p className="mt-4 max-w-2xl text-xl text-gray-500 lg:mx-auto">
              Our platform combines structured learning, personalized mentorship, and practical tools to help you achieve your learning goals.
            </p>
          </div>

          <div className="mt-10">
            <div className="space-y-10 md:space-y-0 md:grid md:grid-cols-2 md:gap-x-8 md:gap-y-10">
              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <FaGraduationCap className="h-6 w-6" />
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Structured Learning Paths</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Follow carefully designed learning paths that take you from basics to advanced topics with clear progression.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <FaChalkboardTeacher className="h-6 w-6" />
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Personalized Mentorship</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Get guidance from experienced mentors who provide personalized feedback and help you overcome challenges.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <FaLaptopCode className="h-6 w-6" />
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Interactive Content</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Learn through video lectures, interactive quizzes, and real-world projects that reinforce your knowledge.
                  </p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white">
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <div className="ml-16">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Interview Preparation</h3>
                  <p className="mt-2 text-base text-gray-500">
                    Practice with common interview questions and get feedback to help you land your dream job.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA section */}
      <div className="bg-indigo-50">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:py-16 lg:px-8 lg:flex lg:items-center lg:justify-between">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 sm:text-4xl">
            <span className="block">Ready to dive in?</span>
            <span className="block text-indigo-600">Start your learning journey today.</span>
          </h2>
          <div className="mt-8 flex lg:mt-0 lg:flex-shrink-0">
            <div className="inline-flex rounded-md shadow">
              <Link to="/signup" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700">
                Get started
              </Link>
            </div>
            <div className="ml-3 inline-flex rounded-md shadow">
              <Link to="/login" className="inline-flex items-center justify-center px-5 py-3 border border-transparent text-base font-medium rounded-md text-indigo-600 bg-white hover:bg-indigo-50">
                Sign in
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white">
        <div className="max-w-7xl mx-auto py-12 px-4 overflow-hidden sm:px-6 lg:px-8">
          <p className="mt-8 text-center text-base text-gray-500">
            &copy; 2023 Mentneo Learning Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
