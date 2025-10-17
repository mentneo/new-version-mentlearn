import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import LearnIQNavbar from './LearnIQNavbar.js';
import { FiBell, FiSearch } from 'react-icons/fi/index.js';
import { useAuth } from '../../contexts/AuthContext.js';

export default function LearnIQDashboardLayout() {
  const { currentUser } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  
  return (
    <div className="h-screen flex overflow-hidden bg-gray-50">
      {/* Sidebar component */}
      <LearnIQNavbar />
      
      {/* Main content */}
      <div className="flex-1 overflow-auto focus:outline-none">
        <div className="relative z-10 flex-shrink-0 flex h-16 bg-white border-b border-gray-200 lg:border-none shadow-sm lg:hidden">
          <div className="flex-1 flex justify-end px-4 sm:px-6 lg:px-8">
            <div className="ml-4 flex items-center md:ml-6">
              <button
                type="button"
                className="p-1 rounded-full text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
              >
                <span className="sr-only">View notifications</span>
                <FiBell className="h-6 w-6" aria-hidden="true" />
              </button>
            </div>
          </div>
        </div>
        
        {/* Desktop header */}
        <div className="hidden lg:block relative z-10 flex-shrink-0 h-16 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex items-center justify-between h-full px-6">
            <div className="relative w-72">
              <div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center">
                <FiSearch className="h-5 w-5 text-gray-400" aria-hidden="true" />
              </div>
              <input
                type="text"
                name="search"
                id="search"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full rounded-lg border-0 py-2 pl-10 pr-3 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 sm:text-sm sm:leading-6"
                placeholder="Search courses, assignments..."
              />
            </div>
            
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  type="button"
                  className="flex items-center justify-center rounded-full bg-white p-1.5 text-gray-500 hover:text-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                >
                  <span className="sr-only">View notifications</span>
                  <FiBell className="h-6 w-6" aria-hidden="true" />
                </button>
                
                {/* Notification dot */}
                <div className="absolute top-0 right-0 block h-2.5 w-2.5 rounded-full bg-red-400 ring-2 ring-white" />
                
                {/* Notifications dropdown */}
                {notificationsOpen && (
                  <div className="origin-top-right absolute right-0 mt-2 w-80 rounded-lg shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                    <div className="py-2">
                      <div className="px-4 py-2 border-b border-gray-200">
                        <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                      </div>
                      <div className="max-h-72 overflow-y-auto">
                        {/* Sample notifications */}
                        <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                          <p className="text-sm text-gray-900 font-medium">Assignment due tomorrow</p>
                          <p className="text-xs text-gray-500 mt-0.5">Your JavaScript Fundamentals assignment is due tomorrow at 11:59 PM</p>
                          <p className="text-xs text-gray-400 mt-1">1 hour ago</p>
                        </div>
                        <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                          <p className="text-sm text-gray-900 font-medium">New course material available</p>
                          <p className="text-xs text-gray-500 mt-0.5">React Hooks module has been updated with new content</p>
                          <p className="text-xs text-gray-400 mt-1">Yesterday</p>
                        </div>
                        <div className="px-4 py-3 hover:bg-gray-50 cursor-pointer">
                          <p className="text-sm text-gray-900 font-medium">Feedback received</p>
                          <p className="text-xs text-gray-500 mt-0.5">Your instructor has provided feedback on your recent assignment</p>
                          <p className="text-xs text-gray-400 mt-1">2 days ago</p>
                        </div>
                      </div>
                      <div className="px-4 py-2 border-t border-gray-200">
                        <a href="/student/dashboard/notifications" className="text-xs text-blue-600 font-medium hover:text-blue-500">
                          View all notifications
                        </a>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              {/* Profile dropdown */}
              <div className="flex items-center">
                <img
                  className="h-9 w-9 rounded-full object-cover border border-gray-200"
                  src={currentUser?.photoURL || "https://via.placeholder.com/40?text=User"}
                  alt="Profile"
                />
              </div>
            </div>
          </div>
        </div>
        
        {/* Main content area */}
        <main className="flex-1 relative pb-8 z-0 overflow-y-auto">
          <div className="mt-2">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <Outlet />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}