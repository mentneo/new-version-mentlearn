/**
 * This utility patches React's createElement to prevent the "Objects are not valid as React child" error
 * WARNING: This is a last-resort approach and should be used carefully
 */

import React from 'react';
import { safeRender } from './renderUtils';

// Store original createElement function
const originalCreateElement = React.createElement;

/**
 * Check if a child might cause rendering issues
 */
const isProblematicChild = (child) => {
  return child !== null && 
         typeof child === 'object' && 
         !React.isValidElement(child) && 
         !Array.isArray(child) &&
         typeof child.$$typeof !== 'symbol';
};

/**
 * Apply the patch to React.createElement
 */
export const applyPatch = () => {
  if (React.createElement === originalCreateElement) {
    // Override React.createElement to sanitize children
    React.createElement = function(type, props, ...children) {
      // Process children to ensure they're safe to render
      const safeChildren = children.map(child => {
        if (isProblematicChild(child)) {
          console.warn('Detected object being used as React child, converting to string:', child);
          
          // Special handling for answers object
          if (child && 'answers' in child) {
            console.warn('Found answers object:', child);
            return safeRender(child.answers);
          }
          
          return safeRender(child);
        }
        return child;
      });
      
      // Call the original createElement with sanitized children
      return originalCreateElement(type, props, ...safeChildren);
    };
    
    console.log('React.createElement patched to prevent "Objects as React children" errors');
  }
};

/**
 * Remove the patch and restore original behavior
 */
export const removePatch = () => {
  if (React.createElement !== originalCreateElement) {
    React.createElement = originalCreateElement;
    console.log('React.createElement restored to original');
  }
};

export default applyPatch;
