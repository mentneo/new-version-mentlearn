import React from 'react';

/**
 * A component that safely renders its children by intercepting
 * invalid objects and rendering them as strings
 */
class SafeRenderer extends React.Component {
  componentDidMount() {
    this.applyMonkeyPatch();
  }

  componentWillUnmount() {
    this.removeMonkeyPatch();
  }

  // Apply the monkey patch to React's text creation function
  applyMonkeyPatch = () => {
    if (typeof window !== 'undefined') {
      // Store originals if not already done
      if (!window.__ORIGINAL_TEXT_NODE_IMPL) {
        const originalCreateTextNode = document.createTextNode.bind(document);
        window.__ORIGINAL_TEXT_NODE_IMPL = originalCreateTextNode;
        
        // Override document.createTextNode
        document.createTextNode = function(text) {
          // Handle objects
          if (typeof text === 'object' && text !== null) {
            console.warn('Object intercepted in text node creation:', text);
            
            // Handle specific object types
            if ('answers' in text && 'question' in text) {
              return originalCreateTextNode(text.question || '[Question]');
            } else if ('answers' in text) {
              return originalCreateTextNode('[Answers List]');
            } else if ('text' in text) {
              return originalCreateTextNode(text.text || '[Text]');
            }
            
            // Generic object handling
            try {
              return originalCreateTextNode(JSON.stringify(text));
            } catch (e) {
              return originalCreateTextNode('[Object]');
            }
          }
          
          return originalCreateTextNode(text);
        };
        
        console.log('React text node creation patched');
      }
    }
  };

  removeMonkeyPatch = () => {
    if (typeof window !== 'undefined' && window.__ORIGINAL_TEXT_NODE_IMPL) {
      document.createTextNode = window.__ORIGINAL_TEXT_NODE_IMPL;
      delete window.__ORIGINAL_TEXT_NODE_IMPL;
      console.log('React text node creation patch removed');
    }
  };

  render() {
    return <>{this.props.children}</>;
  }
}

export default SafeRenderer;
