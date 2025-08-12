import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { Link } from 'react-router-dom';

const ThemeTestPage = () => {
  const { darkMode, toggleDarkMode, themeStatus, forceThemeRefresh } = useTheme();
  const { currentUser } = useAuth();

  return (
    <div className="min-h-screen transition-colors duration-300 bg-white dark:bg-gray-800 text-black dark:text-white">
      <div className="max-w-4xl mx-auto p-4">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-4">Theme Test Page</h1>
          <p className="text-lg">
            This page tests the theme toggling functionality.
          </p>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left column */}
          <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Theme Information</h2>
            
            <div className="mb-6">
              <p className="mb-2">
                <span className="font-semibold">Current Theme:</span>{' '}
                <span className={darkMode ? "text-blue-400" : "text-blue-600"}>
                  {darkMode ? "Dark Mode" : "Light Mode"}
                </span>
              </p>
              
              <div className="flex flex-wrap gap-2 mt-4">
                <button
                  onClick={toggleDarkMode}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
                >
                  Toggle Theme
                </button>
                
                <button
                  onClick={forceThemeRefresh}
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors"
                >
                  Force Theme Refresh
                </button>
              </div>
            </div>
            
            <div>
              <h3 className="text-xl font-medium mb-2">Theme Status:</h3>
              <div className="bg-white dark:bg-gray-900 p-3 rounded-md">
                <p className="font-mono mb-1">
                  HTML has <code className="text-pink-500">.dark</code> class: {' '}
                  <span className={themeStatus.htmlHasDarkClass ? "text-green-500" : "text-red-500 font-semibold"}>
                    {themeStatus.htmlHasDarkClass ? 'Yes' : 'No'}
                  </span>
                </p>
                <p className="font-mono mb-1">
                  Body has <code className="text-pink-500">.dark-mode</code> class: {' '}
                  <span className={themeStatus.bodyHasDarkModeClass ? "text-green-500" : "text-red-500 font-semibold"}>
                    {themeStatus.bodyHasDarkModeClass ? 'Yes' : 'No'}
                  </span>
                </p>
                <p className="font-mono mb-1">
                  localStorage theme: {' '}
                  <span className="font-semibold">
                    {themeStatus.localStorageTheme}
                  </span>
                </p>
                <p className="font-mono">
                  System prefers dark: {' '}
                  <span className="font-semibold">
                    {themeStatus.mediaQueryPrefersDark ? 'Yes' : 'No'}
                  </span>
                </p>
              </div>
            </div>
          </div>

          {/* Right column */}
          <div className="bg-gray-100 dark:bg-gray-700 p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-semibold mb-4">Authentication</h2>
            
            <div className="mb-6">
              <p className="mb-2">
                <span className="font-semibold">Logged in:</span>{' '}
                <span className={currentUser ? "text-green-500" : "text-red-500"}>
                  {currentUser ? "Yes" : "No"}
                </span>
              </p>
              
              {currentUser && (
                <div className="bg-white dark:bg-gray-900 p-3 rounded-md mt-2">
                  <p className="mb-1">
                    <span className="font-semibold">Email:</span> {currentUser.email}
                  </p>
                  <p className="mb-1">
                    <span className="font-semibold">UID:</span> {currentUser.uid}
                  </p>
                </div>
              )}
            </div>
            
            <div className="mt-8">
              <h3 className="text-xl font-medium mb-3">Navigation</h3>
              <div className="flex flex-col space-y-2">
                <Link 
                  to="/simple"
                  className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors text-center"
                >
                  Simple Dashboard
                </Link>
                <Link 
                  to="/debug"
                  className="px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-white rounded-md transition-colors text-center"
                >
                  Debug Page
                </Link>
                <Link 
                  to="/student/dashboard"
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors text-center"
                >
                  Student Dashboard
                </Link>
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-8 bg-gray-100 dark:bg-gray-700 p-6 rounded-lg shadow-md">
          <h2 className="text-2xl font-semibold mb-4">Component Test</h2>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-900 p-4 rounded-lg">
              <h3 className="font-medium mb-2">Light Component</h3>
              <p>This component should always be light regardless of theme.</p>
            </div>
            
            <div className="bg-gray-800 text-white p-4 rounded-lg">
              <h3 className="font-medium mb-2">Dark Component</h3>
              <p>This component should always be dark regardless of theme.</p>
            </div>
            
            <div className="bg-white dark:bg-gray-900 text-black dark:text-white p-4 rounded-lg">
              <h3 className="font-medium mb-2">Responsive to Theme</h3>
              <p>This component should change based on the current theme.</p>
            </div>
            
            <div className="bg-gradient-to-r from-blue-500 to-purple-500 text-white p-4 rounded-lg">
              <h3 className="font-medium mb-2">Gradient Component</h3>
              <p>This uses a gradient and should look the same in both themes.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeTestPage;
