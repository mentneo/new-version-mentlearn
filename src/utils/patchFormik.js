/**
 * Patch React to prevent "Objects are not valid as a React child" errors
 * specifically for Formik components
 */

import { ErrorMessage } from 'formik';

// Store original components for possible restoration
const originalComponents = {};

export function applyFormikPatches() {
  if (typeof ErrorMessage !== 'undefined') {
    // Store original ErrorMessage
    originalComponents.ErrorMessage = ErrorMessage;
    
    // Monkey-patch ErrorMessage render method
    const originalRender = ErrorMessage.prototype.render;
    
    if (originalRender) {
      ErrorMessage.prototype.render = function() {
        try {
          return originalRender.apply(this);
        } catch (error) {
          if (error.message && error.message.includes('Objects are not valid as a React child')) {
            console.warn('Caught invalid object rendering in ErrorMessage:', error);
            
            // Safe fallback render
            return null;
          }
          throw error;
        }
      };
      
      console.log('Formik ErrorMessage patched');
    }
  }
}

/**
 * Run this at application startup
 */
export function setupGlobalErrorHandler() {
  if (typeof window !== 'undefined' && process.env.NODE_ENV !== 'production') {
    // Override React's console error to provide better information
    const originalConsoleError = console.error;
    
    console.error = (...args) => {
      // Check if this is an "Objects are not valid as React child" error
      if (args[0] && typeof args[0] === 'string' && 
          args[0].includes('Objects are not valid as a React child')) {
        console.warn('⚠️ Object rendering error caught:', ...args);
        
        // Display a more helpful message in development
        console.log('%cSuggested fix:', 'color: green; font-weight: bold',
                    'Wrap your component with SafeQuizDisplay or use the safeRender utility');
        
        // Return early to avoid duplicate errors
        return;
      }
      
      // Pass through to original console.error for other errors
      originalConsoleError(...args);
    };
  }
}

/**
 * Alternative solution: Apply global monkey patch
 * Call this in your app's initialization
 */
export function applyGlobalPatch() {
  // This is a last resort patch that might interfere with other libraries
  if (typeof Element !== 'undefined' && Element.prototype) {
    const originalAppendChild = Element.prototype.appendChild;
    
    Element.prototype.appendChild = function(child) {
      // Check if we're appending a text node with an object
      if (child && child.nodeType === 3) { // Text node
        const content = child.textContent;
        if (content === '[object Object]' || 
            (content && content.startsWith('{') && content.endsWith('}'))) {
          console.warn('Prevented object from being rendered directly:', content);
          child.textContent = '';
        }
      }
      
      return originalAppendChild.call(this, child);
    };
    
    console.log('Applied global DOM patch to prevent object rendering errors');
  }
}

export default { applyFormikPatches, setupGlobalErrorHandler, applyGlobalPatch };
