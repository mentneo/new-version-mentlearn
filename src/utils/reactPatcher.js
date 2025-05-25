/**
 * This file contains utilities to patch React's rendering mechanism
 * to prevent "Objects are not valid as a React child" errors
 */

import React from 'react';

/**
 * Monkey patches React.createElement to prevent objects being used as children
 */
export function patchReactCreateElement() {
  // Store original createElement
  if (!window.__ORIGINAL_CREATE_ELEMENT) {
    window.__ORIGINAL_CREATE_ELEMENT = React.createElement;
  }
  
  // Return if already patched
  if (window.__REACT_PATCHED) return;

  // Replace createElement with our safe version
  React.createElement = function(type, props, ...children) {
    // Process all children to ensure they're safe
    const safeChildren = children.map(child => {
      // Only process actual objects (not null, arrays, or React elements)
      if (child !== null && 
          typeof child === 'object' &&
          !Array.isArray(child) &&
          !React.isValidElement(child)) {
        
        console.warn('Converting object to string before render:', child);
        
        // Handle special cases for quiz components
        if (child.hasOwnProperty('answers') && child.hasOwnProperty('question')) {
          return child.question || 'Question';
        }
        
        if (child.hasOwnProperty('answers')) {
          return 'Answers';
        }
        
        if (child.hasOwnProperty('text')) {
          return child.text || '';
        }
        
        // Convert object to string
        try {
          return JSON.stringify(child);
        } catch (e) {
          return '[Object]';
        }
      }
      return child;
    });
    
    // Call original createElement with safe children
    return window.__ORIGINAL_CREATE_ELEMENT(type, props, ...safeChildren);
  };
  
  window.__REACT_PATCHED = true;
  console.log('React.createElement patched to prevent "Objects as children" errors');
}

/**
 * Restores the original React.createElement
 */
export function unpatchReactCreateElement() {
  if (window.__REACT_PATCHED && window.__ORIGINAL_CREATE_ELEMENT) {
    React.createElement = window.__ORIGINAL_CREATE_ELEMENT;
    window.__REACT_PATCHED = false;
    console.log('React.createElement restored to original');
  }
}

/**
 * Creates a safe wrapper component that renders its children safely
 */
export const SafeRenderer = ({ children }) => {
  if (!children) return null;
  
  const renderSafely = (child) => {
    if (child === null || child === undefined) {
      return null;
    }
    
    if (typeof child === 'string' || typeof child === 'number' || typeof child === 'boolean') {
      return child;
    }
    
    if (React.isValidElement(child)) {
      return React.cloneElement(child, {
        children: React.Children.map(child.props.children, renderSafely)
      });
    }
    
    if (Array.isArray(child)) {
      return child.map((item, index) => <React.Fragment key={index}>{renderSafely(item)}</React.Fragment>);
    }
    
    if (typeof child === 'object') {
      // Handle quiz-specific objects
      if ('answers' in child && 'question' in child) {
        return child.question || 'Question';
      }
      
      if ('answers' in child) {
        return 'Answers List';
      }
      
      if ('text' in child) {
        return child.text;
      }
      
      try {
        return JSON.stringify(child);
      } catch (e) {
        return '[Object]';
      }
    }
    
    return String(child);
  };
  
  return <>{renderSafely(children)}</>;
};
