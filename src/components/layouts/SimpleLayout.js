import React, { useEffect } from 'react';
import SimpleNavbar from '../student/SimpleNavbar';
import { useTheme } from '../../contexts/ThemeContext';

const SimpleLayout = ({ children }) => {
  const { darkMode, forceThemeRefresh } = useTheme();
  
  // Ensure theme is applied when the layout mounts
  useEffect(() => {
    if (forceThemeRefresh) {
      console.log('[SimpleLayout] Forcing theme refresh');
      forceThemeRefresh();
    }
    
    console.log('[SimpleLayout] Mounted with theme:', darkMode ? 'dark' : 'light');
    
    // Add dark class to html element directly as a fallback
    if (darkMode) {
      document.documentElement.classList.add('dark');
      document.body.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.classList.remove('dark-mode');
    }
  }, [darkMode, forceThemeRefresh]);
  
  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-gray-900 text-white' 
        : 'bg-gray-100 text-gray-900'
    }`}>
      <SimpleNavbar />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="bg-white dark:bg-gray-800 shadow-inner py-6 mt-auto">
        <div className="container mx-auto px-4">
          <p className="text-center text-gray-500 dark:text-gray-400">
            © {new Date().getFullYear()} Mentneo Learning Platform. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default SimpleLayout;
