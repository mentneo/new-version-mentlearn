import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  FaUserGraduate, 
  FaChalkboardTeacher, 
  FaBook, 
  FaMoneyBillWave, 
  FaTachometerAlt, 
  FaSignOutAlt, 
  FaBars, 
  FaTimes, 
  FaUser,
  FaUserPlus
} from 'react-icons/fa';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  }

  return (
    <nav className="bg-gray-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <Link to="/admin/dashboard" className="text-white font-bold text-xl">
                Mentneo Admin
              </Link>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                <Link
                  to="/admin/dashboard"
                  className="text-white hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  <FaTachometerAlt className="inline-block mr-1" /> Dashboard
                </Link>
                <Link
                  to="/admin/students"
                  className="text-white hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  <FaUserGraduate className="inline-block mr-1" /> Students
                </Link>
                <Link
                  to="/admin/mentors"
                  className="text-white hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  <FaChalkboardTeacher className="inline-block mr-1" /> Mentors
                </Link>
                <Link
                  to="/admin/courses"
                  className="text-white hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  <FaBook className="inline-block mr-1" /> Courses
                </Link>
                <Link
                  to="/admin/enrollments"
                  className="text-white hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  <FaUserPlus className="inline-block mr-1" /> Enrollments
                </Link>
                <Link
                  to="/admin/payments"
                  className="text-white hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium"
                >
                  <FaMoneyBillWave className="inline-block mr-1" /> Payments
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
                    className="max-w-xs bg-gray-800 rounded-full flex items-center text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
                    id="user-menu-button"
                  >
                    <span className="sr-only">Open user menu</span>
                    <FaUser className="h-8 w-8 rounded-full p-1 bg-gray-700 text-white" />
                  </button>
                </div>
              </div>
              <button
                onClick={handleLogout}
                className="ml-3 text-white hover:bg-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                <FaSignOutAlt className="inline-block mr-1" /> Sign out
              </button>
            </div>
          </div>
          <div className="-mr-2 flex md:hidden">
            {/* Mobile menu button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-gray-700 focus:outline-none"
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
              to="/admin/dashboard"
              className="text-white hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              <FaTachometerAlt className="inline-block mr-1" /> Dashboard
            </Link>
            <Link
              to="/admin/students"
              className="text-white hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              <FaUserGraduate className="inline-block mr-1" /> Students
            </Link>
            <Link
              to="/admin/mentors"
              className="text-white hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              <FaChalkboardTeacher className="inline-block mr-1" /> Mentors
            </Link>
            <Link
              to="/admin/courses"
              className="text-white hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              <FaBook className="inline-block mr-1" /> Courses
            </Link>
            <Link
              to="/admin/enrollments"
              className="text-white hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              <FaUserPlus className="inline-block mr-1" /> Enrollments
            </Link>
            <Link
              to="/admin/payments"
              className="text-white hover:bg-gray-700 block px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsOpen(false)}
            >
              <FaMoneyBillWave className="inline-block mr-1" /> Payments
            </Link>
            <button
              onClick={() => {
                handleLogout();
                setIsOpen(false);
              }}
              className="text-white hover:bg-gray-700 block w-full text-left px-3 py-2 rounded-md text-base font-medium"
            >
              <FaSignOutAlt className="inline-block mr-1" /> Sign out
            </button>
          </div>
        </div>
      )}
    </nav>
  );
}
