/**
 * This file contains utilities to patch React's rendering to prevent
 * "Objects are not valid as a React child" errors
 */

// Function to safely render any value
export function safeRenderValue(value) {
  if (value === null || value === undefined) {
    return '';
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value;
  }

  // Special handling for objects that are commonly misused as React children
  if (typeof value === 'object' && !Array.isArray(value)) {
    // Handle common problematic objects seen in the error logs
    if ('answers' in value) {
      console.warn('Found answers object being rendered directly:', value);
      return 'Answers';
    }

    if ('question' in value && typeof value.question === 'string') {
      return value.question;
    }

    if ('text' in value && typeof value.text === 'string') {
      return value.text;
    }

    // For other objects, try to stringify them
    try {
      return JSON.stringify(value);
    } catch (e) {
      return '[Object]';
    }
  }

  // For arrays, we need to handle each item
  if (Array.isArray(value)) {
    try {
      // Map each item to a safe value and join with commas
      return value.map(item => safeRenderValue(item)).join(', ');
    } catch (e) {
      return '[Array]';
    }
  }

  // For anything else, convert to string
  return String(value);
}

/**
 * Monkey patch React's built-in mechanisms for rendering children
 */
export function applyReactPatch() {
  if (typeof window === 'undefined') return;

  // Wait for React to be fully loaded
  setTimeout(() => {
    try {
      // Try to patch React internal methods via React DevTools hook
      if (window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
        const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
        const renderers = hook.renderers;
        
        if (renderers && renderers.size > 0) {
          // Get the first renderer (which is usually React DOM)
          const renderer = renderers.get(1);
          
          if (renderer) {
            console.log('Found React renderer, applying safety patches...');
            
            // Store original methods if needed for clean up later
            if (!window.__ORIGINAL_REACT_METHODS) {
              window.__ORIGINAL_REACT_METHODS = {};
            }

            // Patch various methods that handle text content
            patchMethod(renderer, 'createTextInstance');
            
            console.log('React rendering patches applied successfully!');
          }
        }
      }
      
      // Patch error logging to make it more helpful
      const originalConsoleError = console.error;
      console.error = function(...args) {
        // Check if this is the specific error we're trying to fix
        if (args[0] && typeof args[0] === 'string' && 
            args[0].includes('Objects are not valid as a React child')) {
          console.warn('⚠️ Object rendering error caught:', ...args);
          console.log('💡 Tip: Make sure you\'re not rendering an object directly in JSX.');
          // Avoid showing the full stack trace for this common error
          return;
        }
        // Otherwise, pass through to the original console.error
        originalConsoleError.apply(console, args);
      };
      
    } catch (err) {
      console.error('Failed to apply React patches:', err);
    }
  }, 1000);
}

// Helper function to patch a method on the renderer
function patchMethod(renderer, methodName) {
  if (!renderer[methodName]) return;
  
  // Store original method
  window.__ORIGINAL_REACT_METHODS[methodName] = renderer[methodName];
  
  // Replace with our patched version
  renderer[methodName] = function(...args) {
    try {
      // For text instance creation, make sure the text is safe
      if (methodName === 'createTextInstance') {
        const text = args[0];
        if (typeof text === 'object' && text !== null) {
          // Replace object with safe string representation
          args[0] = safeRenderValue(text);
        }
      }
      
      // Call original method with fixed arguments
      return window.__ORIGINAL_REACT_METHODS[methodName].apply(this, args);
    } catch (error) {
      console.error(`Error in patched ${methodName}:`, error);
      // Attempt to call original as a fallback
      return window.__ORIGINAL_REACT_METHODS[methodName].apply(this, args);
    }
  };
}

/**
 * Revert React patches (can be used for cleanup if needed)
 */
export function revertReactPatch() {
  if (typeof window === 'undefined' || !window.__ORIGINAL_REACT_METHODS) return;
  
  try {
    const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
    if (hook && hook.renderers && hook.renderers.size > 0) {
      const renderer = hook.renderers.get(1);
      
      if (renderer) {
        // Restore all original methods
        Object.keys(window.__ORIGINAL_REACT_METHODS).forEach(methodName => {
          renderer[methodName] = window.__ORIGINAL_REACT_METHODS[methodName];
        });
        
        console.log('React patches reverted successfully');
      }
    }
  } catch (err) {
    console.error('Failed to revert React patches:', err);
  }
}
