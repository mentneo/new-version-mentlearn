import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.js';
import { 
  FaUserGraduate, 
  FaClipboardList,
  FaTachometerAlt,
  FaSignOutAlt, 
  FaBars, 
  FaTimes,
  FaUser,
  FaBriefcase,
  FaClipboardCheck
} from 'react-icons/fa';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  // Add effect to check for image loading issues
  useEffect(() => {
    // Log available image paths to help debug
    console.log("Base URL:", window.location.origin);
    
    // Check if common image paths are accessible
    const testImageAccess = (path) => {
      const img = new Image();
      img.onload = () => console.log(`Image exists: ${path}`);
      img.onerror = () => console.log(`Image not found: ${path}`);
      img.src = path;
    };
    
    // Test common image paths
    testImageAccess(`${window.location.origin}/images/logo.png`);
    testImageAccess(`${window.location.origin}/uploads/courses/default.png`);
  }, []);

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  }

  return (
    <nav className="bg-green-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/mentor/dashboard" className="text-white font-bold text-xl">
                Mentneo Mentor
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  to="/mentor/dashboard"
                  className="text-white hover:bg-green-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  <FaTachometerAlt className="inline-block mr-1" /> Dashboard
                </Link>
                <Link
                  to="/mentor/assignment-submissions"
                  className="text-white hover:bg-green-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  <FaClipboardCheck className="inline-block mr-1" /> Assignments
                </Link>
                <Link
                  to="/mentor/quizzes"
                  className="text-white hover:bg-green-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  <FaClipboardList className="inline-block mr-1" /> Quizzes
                </Link>
                <Link
                  to="/mentor/interviews"
                  className="text-white hover:bg-green-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  <FaBriefcase className="inline-block mr-1" /> Interviews
                </Link>
                <Link
                  to="/mentor/reports"
                  className="text-white hover:bg-green-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  <FaUserGraduate className="inline-block mr-1" /> Reports
                </Link>
              </div>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <div className="relative">
                <div>
                  <button
                    type="button"
                    className="max-w-xs bg-green-800 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-green-800 focus:ring-white"
                    id="user-menu-button"
                  >
                    <span className="sr-only">Open user menu</span>
                    <FaUser className="h-8 w-8 rounded-full p-1 bg-green-700 text-white" />
                  </button>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="ml-3 text-white hover:bg-green-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                <FaSignOutAlt className="inline-block mr-1" /> Sign out
              </button>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-green-700 focus:outline-none"
            >
              <span className="sr-only">Open main menu</span>
              {isOpen ? <FaTimes className="block h-6 w-6" /> : <FaBars className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu, show/hide based on menu state */}
      {isOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            <Link
              to="/mentor/dashboard"
              className="text-white hover:bg-green-700 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              <FaTachometerAlt className="inline-block mr-1" /> Dashboard
            </Link>
            <Link
              to="/mentor/assignment-submissions"
              className="text-white hover:bg-green-700 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              <FaClipboardCheck className="inline-block mr-1" /> Assignments
            </Link>
            <Link
              to="/mentor/quizzes"
              className="text-white hover:bg-green-700 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              <FaClipboardList className="inline-block mr-1" /> Quizzes
            </Link>
            <Link
              to="/mentor/interviews"
              className="text-white hover:bg-green-700 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              <FaBriefcase className="inline-block mr-1" /> Interviews
            </Link>
            <Link
              to="/mentor/reports"
              className="text-white hover:bg-green-700 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              <FaUserGraduate className="inline-block mr-1" /> Reports
            </Link>
            <button
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }}
              className="text-white hover:bg-green-700 block w-full text-left px-3 py-2 rounded-md text-base font-medium"
            >
              <FaSignOutAlt className="inline-block mr-1" /> Sign out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
