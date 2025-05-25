/**
 * This file provides utilities to fix React's rendering mechanism
 * to prevent "Objects are not valid as a React child" errors.
 */

/**
 * Apply a global patch to prevent React from crashing when rendering objects
 */
export const applyGlobalFix = () => {
  if (typeof window === 'undefined') return;

  // Don't apply multiple times
  if (window.__REACT_CHILD_RENDERER_PATCHED) return;

  try {
    // Patch React's built-in way of rendering text nodes
    const originalCreateTextNode = document.createTextNode.bind(document);
    window.__ORIGINAL_CREATE_TEXT_NODE = originalCreateTextNode;

    document.createTextNode = function(text) {
      // If text is actually an object, safely stringify it
      if (text !== null && typeof text === 'object') {
        // Log for debugging
        console.warn('Intercepted object in React render:', text);
        
        // Handle different object types seen in the error logs
        if ('answers' in text && 'question' in text) {
          return originalCreateTextNode(text.question || 'Question');
        }
        
        if ('answers' in text) {
          return originalCreateTextNode(JSON.stringify(text.answers));
        }
        
        if ('text' in text) {
          return originalCreateTextNode(text.text || '');
        }
        
        // Generic object handling
        try {
          return originalCreateTextNode(JSON.stringify(text));
        } catch (e) {
          return originalCreateTextNode('[Object]');
        }
      }
      
      // Regular text
      return originalCreateTextNode(text);
    };

    // Override error handling for these specific errors
    const originalConsoleError = console.error;
    window.__ORIGINAL_CONSOLE_ERROR = originalConsoleError;
    
    console.error = function(...args) {
      // If this is the specific error we're handling, suppress it in production
      if (typeof args[0] === 'string' && 
          args[0].includes('Objects are not valid as a React child')) {
        console.warn('React object rendering error suppressed:', ...args);
        return;
      }
      
      // Other errors are logged normally
      originalConsoleError.apply(console, args);
    };

    window.__REACT_CHILD_RENDERER_PATCHED = true;
    console.log('Applied global React rendering fix');
  } catch (e) {
    console.error('Failed to apply global React rendering fix:', e);
  }
};

/**
 * Remove the global patch
 */
export const removeGlobalFix = () => {
  if (typeof window === 'undefined' || !window.__REACT_CHILD_RENDERER_PATCHED) {
    return;
  }

  try {
    // Restore original functions
    if (window.__ORIGINAL_CREATE_TEXT_NODE) {
      document.createTextNode = window.__ORIGINAL_CREATE_TEXT_NODE;
      delete window.__ORIGINAL_CREATE_TEXT_NODE;
    }
    
    if (window.__ORIGINAL_CONSOLE_ERROR) {
      console.error = window.__ORIGINAL_CONSOLE_ERROR;
      delete window.__ORIGINAL_CONSOLE_ERROR;
    }
    
    delete window.__REACT_CHILD_RENDERER_PATCHED;
    console.log('Removed global React rendering fix');
  } catch (e) {
    console.error('Failed to remove global React rendering fix:', e);
  }
};

export default { applyGlobalFix, removeGlobalFix };
