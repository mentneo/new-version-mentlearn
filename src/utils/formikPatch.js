import React from 'react';
import { ErrorMessage as FormikErrorMessage } from 'formik';

/**
 * A safe version of Formik's ErrorMessage component that prevents rendering objects directly
 */
export const SafeErrorMessage = ({ name, component, render, children, ...rest }) => {
  const renderError = (errorMsg) => {
    // Handle object error messages
    if (errorMsg && typeof errorMsg === 'object') {
      console.warn('Object error message received:', errorMsg);
      
      // Try to extract text from common object formats
      if ('message' in errorMsg) return errorMsg.message;
      if ('text' in errorMsg) return errorMsg.text;
      if ('error' in errorMsg) return errorMsg.error;
      
      // Last resort: stringify
      try {
        return JSON.stringify(errorMsg);
      } catch (e) {
        return 'Invalid input';
      }
    }
    
    return errorMsg;
  };

  // Override render prop if provided
  const safeRender = render 
    ? (msg) => render(renderError(msg))
    : undefined;
  
  // If component is provided, we need to ensure it receives safe props
  const safeComponent = component
    ? (props) => {
        const safeProps = {
          ...props,
          children: renderError(props.children)
        };
        
        return React.createElement(component, safeProps);
      }
    : undefined;

  return (
    <FormikErrorMessage
      name={name}
      component={safeComponent}
      render={safeRender}
      {...rest}
    >
      {children}
    </FormikErrorMessage>
  );
};

/**
 * Safely converts form values to prevent React rendering errors
 */
export const safeFormValues = (values) => {
  if (!values) return {};
  
  const safeValues = {};
  
  Object.keys(values).forEach(key => {
    const value = values[key];
    
    if (value === null || value === undefined) {
      safeValues[key] = '';
    }
    else if (typeof value === 'object' && !Array.isArray(value)) {
      // Handle nested objects
      if ('question' in value) {
        safeValues[key] = value.question || '';
      }
      else if ('text' in value) {
        safeValues[key] = value.text || '';
      }
      else if ('answers' in value) {
        safeValues[key] = 'Answers List';
      }
      else {
        try {
          safeValues[key] = JSON.stringify(value);
        } catch (e) {
          safeValues[key] = '[Object]';
        }
      }
    }
    else if (Array.isArray(value)) {
      // Handle arrays
      safeValues[key] = value.map(item => {
        if (item === null || item === undefined) return '';
        if (typeof item === 'object') {
          if ('text' in item) return item.text || '';
          if ('question' in item) return item.question || '';
          try {
            return JSON.stringify(item);
          } catch (e) {
            return '[Object]';
          }
        }
        return item;
      });
    }
    else {
      // Primitive values
      safeValues[key] = value;
    }
  });
  
  return safeValues;
};

export default SafeErrorMessage;
