import React, { useEffect } from 'react';
import NewStudentNavbar from '../student/NewStudentNavbar';
import Footer from './Footer';
import { useTheme } from '../../contexts/ThemeContext';

const StudentLayout = ({ children }) => {
  const { darkMode, forceThemeRefresh } = useTheme();
  
  // Ensure theme is applied when the layout mounts
  useEffect(() => {
    if (forceThemeRefresh) {
      forceThemeRefresh();
    }
    
    console.log('[StudentLayout] Mounted with theme:', darkMode ? 'dark' : 'light');
  }, [darkMode, forceThemeRefresh]);
  
  return (
    <div className={`min-h-screen transition-colors duration-300 ${
      darkMode 
        ? 'bg-gray-900 text-white dark' 
        : 'bg-gray-100 text-gray-900'
    }`}>
      <NewStudentNavbar />
      <main className="pb-16">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default StudentLayout;
