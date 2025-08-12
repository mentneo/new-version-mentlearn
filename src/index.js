import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { applyGlobalFix } from './utils/fixReactRendering';
import SafeRenderer from './components/SafeRenderer';
import ErrorBoundary from './components/ErrorBoundary';

// Apply our global fix immediately before any rendering happens
applyGlobalFix();

// Initialize theme before app renders
const initializeTheme = () => {
  // Check for saved theme preference
  const savedTheme = localStorage.getItem('theme');
  const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  // Apply theme class based on saved preference or system preference
  const shouldUseDarkMode = savedTheme === 'dark' || (!savedTheme && systemPrefersDark);
  
  if (shouldUseDarkMode) {
    document.documentElement.classList.add('dark');
    document.body.classList.add('dark-mode');
    console.log('[Theme Init] Dark mode applied at startup');
  } else {
    document.documentElement.classList.remove('dark');
    document.body.classList.remove('dark-mode');
    console.log('[Theme Init] Light mode applied at startup');
  }
};

// Run theme initialization
initializeTheme();

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <SafeRenderer>
        <App />
      </SafeRenderer>
    </ErrorBoundary>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
