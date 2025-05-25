import React from 'react';

/**
 * Safely renders any value in React, preventing "Objects are not valid as a React child" errors
 * 
 * @param {any} value - The value to render safely
 * @param {Function} customRenderer - Optional custom renderer function for objects
 * @returns {React.ReactNode} - A safely renderable React node
 */
export const safeRender = (value, customRenderer = null) => {
  // Handle null and undefined
  if (value === null || value === undefined) {
    return '';
  }
  
  // Handle numbers, strings, and booleans directly
  if (typeof value === 'number' || typeof value === 'string' || typeof value === 'boolean') {
    return value;
  }
  
  // Handle arrays by safely rendering each item
  if (Array.isArray(value)) {
    return value.map((item, index) => <React.Fragment key={index}>{safeRender(item)}</React.Fragment>);
  }
  
  // Handle objects
  if (typeof value === 'object') {
    // Special handling for known problematic objects in quiz components
    if ('answers' in value && 'question' in value) {
      console.warn('Found question object being rendered directly:', value);
      return value.question;
    }
    
    if ('answers' in value) {
      console.warn('Found answers object being rendered directly:', value);
      return Array.isArray(value.answers) 
        ? value.answers.map((a, i) => <div key={i}>{safeRender(a)}</div>) 
        : 'Answers';
    }
    
    if ('text' in value) {
      console.warn('Found text object being rendered directly:', value);
      return value.text;
    }
    
    // Use custom renderer if provided
    if (customRenderer) {
      return customRenderer(value);
    }
    
    // Default object rendering - convert to JSON string
    try {
      return JSON.stringify(value);
    } catch (error) {
      console.error('Failed to stringify object:', error);
      return '[Object]';
    }
  }
  
  // Handle functions
  if (typeof value === 'function') {
    return '[Function]';
  }
  
  // Handle any other type
  return String(value);
};

/**
 * Safely renders quiz answers which might be objects
 * 
 * @param {any} answers - The answers value which might be an array of strings or objects
 * @returns {React.ReactNode} - A safely renderable version of the answers
 */
export const renderQuizAnswers = (answers) => {
  // If not an array or null/undefined, return empty array
  if (!answers || !Array.isArray(answers)) {
    return [];
  }
  
  // Map each answer to a safely renderable string
  return answers.map((answer, index) => {
    if (typeof answer === 'string') {
      return answer;
    }
    
    // If answer is an object with a text property
    if (answer && typeof answer === 'object' && 'text' in answer) {
      return answer.text;
    }
    
    // For any other case, attempt to stringify or return placeholder
    try {
      return typeof answer === 'object' ? JSON.stringify(answer) : String(answer);
    } catch (error) {
      return `Answer ${index + 1}`;
    }
  });
};

/**
 * Debug helper - logs problematic objects to console
 * 
 * @param {string} componentName - Name of the component for identification
 * @param {any} data - The data to check
 * @param {string} path - Current property path (for nested calls)
 */
export const debugObjectRendering = (componentName, data, path = '') => {
  if (data === null || data === undefined) {
    return;
  }
  
  if (typeof data === 'object' && !Array.isArray(data)) {
    console.log(`[DEBUG] ${componentName} - Object at ${path || 'root'}:`, data);
    
    // Recursively check all properties
    Object.keys(data).forEach(key => {
      const newPath = path ? `${path}.${key}` : key;
      debugObjectRendering(componentName, data[key], newPath);
    });
  } else if (Array.isArray(data)) {
    data.forEach((item, index) => {
      const newPath = path ? `${path}[${index}]` : `[${index}]`;
      debugObjectRendering(componentName, item, newPath);
    });
  }
};

/**
 * Apply global monkey patch to prevent React from crashing when rendering objects
 */
export const applyGlobalRenderPatch = () => {
  if (typeof window !== 'undefined') {
    // Store original Text renderer
    const originalCreateTextInstance = window.__REACT_INTERNAL_ORIGINAL_CREATE_TEXT_INSTANCE;
    
    // If not already patched
    if (!window.__REACT_RENDER_PATCHED && window.__REACT_DEVTOOLS_GLOBAL_HOOK__) {
      const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
      
      // Get React renderer
      const renderers = hook.renderers;
      if (renderers && renderers.size > 0) {
        const renderer = renderers.get(1);
        
        if (renderer && renderer.injectIntoDevTools) {
          try {
            // Store original createTextInstance function
            window.__REACT_INTERNAL_ORIGINAL_CREATE_TEXT_INSTANCE = renderer.createTextInstance;
            
            // Override createTextInstance to handle object children
            renderer.createTextInstance = (text, rootContainer, hostContext, internalHandle) => {
              let safeText = text;
              
              if (typeof text === 'object' && text !== null) {
                console.warn('Intercepted object being rendered as text:', text);
                // Handle specific object types we know about
                if ('answers' in text && 'question' in text) {
                  safeText = text.question || 'Question';
                } else if ('answers' in text) {
                  safeText = 'Answers';
                } else if ('text' in text) {
                  safeText = text.text || 'Answer';
                } else {
                  try {
                    safeText = JSON.stringify(text);
                  } catch (e) {
                    safeText = '[Object]';
                  }
                }
              }
              
              // Call original with safe text
              return window.__REACT_INTERNAL_ORIGINAL_CREATE_TEXT_INSTANCE(
                safeText, rootContainer, hostContext, internalHandle
              );
            };
            
            window.__REACT_RENDER_PATCHED = true;
            console.log('Applied global React renderer patch');
          } catch (error) {
            console.error('Failed to patch React renderer:', error);
          }
        }
      }
    }
  }
};

/**
 * Remove the global patch
 */
export const removeGlobalRenderPatch = () => {
  if (typeof window !== 'undefined' && 
      window.__REACT_RENDER_PATCHED && 
      window.__REACT_INTERNAL_ORIGINAL_CREATE_TEXT_INSTANCE) {
    
    const hook = window.__REACT_DEVTOOLS_GLOBAL_HOOK__;
    
    if (hook && hook.renderers && hook.renderers.size > 0) {
      const renderer = hook.renderers.get(1);
      
      if (renderer) {
        renderer.createTextInstance = window.__REACT_INTERNAL_ORIGINAL_CREATE_TEXT_INSTANCE;
        window.__REACT_RENDER_PATCHED = false;
        console.log('Removed global React renderer patch');
      }
    }
  }
};

export default safeRender;
