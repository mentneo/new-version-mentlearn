import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

// This component displays comprehensive debugging information
// to help troubleshoot the white page issue
export default function DebuggingPage() {
  const { currentUser } = useAuth();
  const { darkMode, toggleDarkMode, themeStatus, forceThemeRefresh } = useTheme();
  const [htmlClasses, setHtmlClasses] = useState([]);
  const [bodyClasses, setBodyClasses] = useState([]);
  const [pageState, setPageState] = useState({
    documentLoaded: false,
    windowWidth: 0,
    windowHeight: 0,
    userAgent: '',
    platform: '',
    cookiesEnabled: false,
    localStorageAvailable: false,
    darkModeMediaQuery: false
  });

  // Collect page information
  useEffect(() => {
    setHtmlClasses(Array.from(document.documentElement.classList));
    setBodyClasses(Array.from(document.body.classList));
    
    setPageState({
      documentLoaded: document.readyState === 'complete',
      windowWidth: window.innerWidth,
      windowHeight: window.innerHeight,
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      cookiesEnabled: navigator.cookieEnabled,
      localStorageAvailable: !!window.localStorage,
      darkModeMediaQuery: window.matchMedia('(prefers-color-scheme: dark)').matches
    });
    
    const handleResize = () => {
      setPageState(prev => ({
        ...prev,
        windowWidth: window.innerWidth,
        windowHeight: window.innerHeight
      }));
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Force theme refresh
  const handleForceThemeRefresh = () => {
    if (forceThemeRefresh) {
      forceThemeRefresh();
      // Update class information after refresh
      setTimeout(() => {
        setHtmlClasses(Array.from(document.documentElement.classList));
        setBodyClasses(Array.from(document.body.classList));
      }, 100);
    }
  };

  return (
    <div className="min-h-screen p-6 bg-white dark:bg-gray-900 text-black dark:text-white transition-colors duration-300">
      <div className="max-w-4xl mx-auto">
        <header className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">Debugging Page</h1>
          <p className="text-gray-600 dark:text-gray-300">
            This page provides debugging information to troubleshoot rendering issues
          </p>
        </header>

        {/* Theme Controls */}
        <div className="mb-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Theme Controls</h2>
          <div className="flex flex-wrap gap-3">
            <button
              onClick={toggleDarkMode}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Toggle Theme ({darkMode ? 'Dark' : 'Light'})
            </button>
            <button
              onClick={handleForceThemeRefresh}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
            >
              Force Theme Refresh
            </button>
          </div>
        </div>

        {/* Navigation */}
        <div className="mb-8 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Navigation</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Link 
              to="/simple"
              className="px-4 py-2 bg-blue-500 text-white rounded text-center hover:bg-blue-600 transition-colors"
            >
              Simple Dashboard
            </Link>
            <Link 
              to="/student/simple-dashboard"
              className="px-4 py-2 bg-green-500 text-white rounded text-center hover:bg-green-600 transition-colors"
            >
              Student Simple Dashboard
            </Link>
            <Link 
              to="/"
              className="px-4 py-2 bg-gray-500 text-white rounded text-center hover:bg-gray-600 transition-colors"
            >
              Home
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Info */}
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4">Authentication</h2>
            <div className="p-3 bg-white dark:bg-gray-700 rounded">
              <p><strong>Logged in:</strong> {currentUser ? 'Yes' : 'No'}</p>
              {currentUser && (
                <>
                  <p><strong>User ID:</strong> {currentUser.uid}</p>
                  <p><strong>Email:</strong> {currentUser.email}</p>
                </>
              )}
            </div>
          </div>

          {/* Theme Info */}
          <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow">
            <h2 className="text-2xl font-semibold mb-4">Theme Information</h2>
            <div className="p-3 bg-white dark:bg-gray-700 rounded mb-3">
              <p><strong>Current Mode:</strong> {darkMode ? 'Dark' : 'Light'}</p>
              <p><strong>HTML has .dark class:</strong> {themeStatus?.htmlHasDarkClass ? 'Yes' : 'No'}</p>
              <p><strong>Body has .dark-mode class:</strong> {themeStatus?.bodyHasDarkModeClass ? 'Yes' : 'No'}</p>
              <p><strong>localStorage theme:</strong> {themeStatus?.localStorageTheme}</p>
              <p><strong>System prefers dark:</strong> {themeStatus?.mediaQueryPrefersDark ? 'Yes' : 'No'}</p>
            </div>
            
            <h3 className="text-lg font-medium mb-2">HTML Element Classes:</h3>
            <div className="p-3 bg-white dark:bg-gray-700 rounded mb-3">
              {htmlClasses.length === 0 ? (
                <p>No classes</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {htmlClasses.map((cls, index) => (
                    <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded text-sm">
                      {cls}
                    </span>
                  ))}
                </div>
              )}
            </div>
            
            <h3 className="text-lg font-medium mb-2">Body Element Classes:</h3>
            <div className="p-3 bg-white dark:bg-gray-700 rounded">
              {bodyClasses.length === 0 ? (
                <p>No classes</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {bodyClasses.map((cls, index) => (
                    <span key={index} className="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded text-sm">
                      {cls}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Browser Info */}
        <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Browser Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-3 bg-white dark:bg-gray-700 rounded">
              <p><strong>Document Loaded:</strong> {pageState.documentLoaded ? 'Yes' : 'No'}</p>
              <p><strong>Window Size:</strong> {pageState.windowWidth} x {pageState.windowHeight}</p>
              <p><strong>Platform:</strong> {pageState.platform}</p>
            </div>
            <div className="p-3 bg-white dark:bg-gray-700 rounded">
              <p><strong>Cookies Enabled:</strong> {pageState.cookiesEnabled ? 'Yes' : 'No'}</p>
              <p><strong>localStorage Available:</strong> {pageState.localStorageAvailable ? 'Yes' : 'No'}</p>
              <p><strong>System Dark Mode:</strong> {pageState.darkModeMediaQuery ? 'Yes' : 'No'}</p>
            </div>
          </div>
        </div>

        {/* Component Tests */}
        <div className="mt-6 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow">
          <h2 className="text-2xl font-semibold mb-4">Component Tests</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-white dark:bg-gray-700 p-4 rounded">
              <h3 className="font-medium">Light Component</h3>
              <p className="text-sm">This component should be light in light mode and dark in dark mode</p>
            </div>
            <div className="bg-blue-500 text-white p-4 rounded">
              <h3 className="font-medium">Colored Component</h3>
              <p className="text-sm">This component should have the same color in both modes</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
