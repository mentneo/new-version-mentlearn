import React, { useState, useEffect, useContext, createContext } from 'react';

// Create a theme context
const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [darkMode, setDarkMode] = useState(() => {
    // Check for saved theme preference or use system preference
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      return savedTheme === 'dark';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  const [themeStatus, setThemeStatus] = useState({
    htmlHasDarkClass: false,
    bodyHasDarkModeClass: false,
    localStorageTheme: 'checking...',
    mediaQueryPrefersDark: false
  });

  // Function to update theme DOM elements and classes
  const applyTheme = (isDark) => {
    // Update localStorage
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    
    // Apply to HTML element (for Tailwind)
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Apply to body as fallback
    if (isDark) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }

    // For debugging - update status
    setThemeStatus({
      htmlHasDarkClass: document.documentElement.classList.contains('dark'),
      bodyHasDarkModeClass: document.body.classList.contains('dark-mode'),
      localStorageTheme: localStorage.getItem('theme') || 'not set',
      mediaQueryPrefersDark: window.matchMedia('(prefers-color-scheme: dark)').matches
    });
    
    console.log('[ThemeContext]', isDark ? 'Dark mode applied' : 'Light mode applied');
  };

  // Apply theme whenever darkMode state changes
  useEffect(() => {
    applyTheme(darkMode);
  }, [darkMode]);

  // Force re-application of theme on component mount
  useEffect(() => {
    applyTheme(darkMode);
    
    // Check if theme was applied correctly after a short delay
    const timeoutId = setTimeout(() => {
      const htmlHasDark = document.documentElement.classList.contains('dark');
      const bodyHasDarkMode = document.body.classList.contains('dark-mode');
      
      if (darkMode && (!htmlHasDark || !bodyHasDarkMode)) {
        console.warn('[ThemeContext] Theme classes were not applied correctly, forcing reapplication');
        applyTheme(darkMode);
      }
    }, 100);
    
    return () => clearTimeout(timeoutId);
  }, []);

  const toggleDarkMode = () => {
    setDarkMode(prevMode => !prevMode);
  };

  return (
    <ThemeContext.Provider value={{ 
      darkMode, 
      toggleDarkMode, 
      themeStatus,
      forceThemeRefresh: () => applyTheme(darkMode)
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
