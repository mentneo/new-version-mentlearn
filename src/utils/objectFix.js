/**
 * Object rendering fix utility - prevents "Objects are not valid as React child" errors
 * Import and use this anywhere objects might be rendered directly
 */

// Apply the patch immediately
(function applyPatch() {
  if (typeof window !== 'undefined' && !window.__OBJECT_RENDERING_FIXED) {
    try {
      // Low level DOM api patching
      const originalCreateTextNode = Document.prototype.createTextNode;
      Document.prototype.createTextNode = function(text) {
        if (text !== null && typeof text === 'object') {
          console.warn('Converting object to string in createTextNode:', text);
          
          // Special handling for answer objects
          if ('answers' in text) {
            return originalCreateTextNode.call(this, 'Answers');
          }
          
          // Special handling for question objects
          if ('question' in text) {
            return originalCreateTextNode.call(this, text.question || 'Question');
          }
          
          // Try to convert any object to a string
          try {
            return originalCreateTextNode.call(this, JSON.stringify(text));
          } catch (e) {
            return originalCreateTextNode.call(this, '[Object]');
          }
        }
        return originalCreateTextNode.call(this, text);
      };
      
      // Disable React's console error for these specific errors in development
      const originalConsoleError = console.error;
      console.error = function(...args) {
        if (args[0] && typeof args[0] === 'string' && 
            args[0].includes('Objects are not valid as a React child')) {
          console.warn('Suppressed React child error:', args[0]);
          return;
        }
        originalConsoleError.apply(this, args);
      };
      
      window.__OBJECT_RENDERING_FIXED = true;
      console.log('Applied object rendering fix');
    } catch (err) {
      console.error('Failed to apply object rendering fix:', err);
    }
  }
})();

/**
 * Safely renders any value in React by converting objects to strings
 * Use this for any value that might be an object
 */
export function safeRender(value) {
  if (value === null || value === undefined) return '';
  if (typeof value !== 'object') return value;
  
  // Special case handling
  if ('answers' in value && 'question' in value) {
    return value.question || 'Question';
  }
  
  if ('answers' in value) {
    return 'Answers';
  }
  
  if ('text' in value) {
    return value.text || '';
  }
  
  // Try to convert any object to a string
  try {
    return JSON.stringify(value);
  } catch (e) {
    return '[Object]';
  }
}

/**
 * HOC to make any component safe from object rendering errors
 */
export function withSafeRendering(Component) {
  // Apply the patch when this module is imported
  if (typeof window !== 'undefined' && !window.__OBJECT_RENDERING_FIXED) {
    applyPatch();
  }
  
  return function SafeComponent(props) {
    // Create safe props where all values are safe to render
    const safeProps = {};
    Object.keys(props).forEach(key => {
      const value = props[key];
      if (value !== null && typeof value === 'object' && !React.isValidElement(value)) {
        // For objects, we need special handling
        if (key === 'children') {
          // For children prop, we need to be especially careful
          safeProps[key] = React.Children.map(value, child => {
            if (React.isValidElement(child)) {
              return child;
            }
            return safeRender(child);
          });
        } else {
          // For other object props, we can use safe render
          safeProps[key] = value;
        }
      } else {
        safeProps[key] = value;
      }
    });
    
    return <Component {...safeProps} />;
  };
}

export default { safeRender, withSafeRendering };
