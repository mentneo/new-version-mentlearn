import React, { useEffect } from 'react';
import { safeRender, renderQuizAnswers, debugObjectRendering } from '../../utils/renderUtils';

/**
 * Error Boundary specifically for quiz rendering issues
 */
class QuizErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Quiz rendering error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="quiz-error p-4 bg-red-50 text-red-700 border border-red-200 rounded">
          <p>Something went wrong loading this quiz component.</p>
          <small>{this.state.error?.message || ''}</small>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * A wrapper component that makes quiz rendering safe
 * Prevents "Objects are not valid as a React child" errors
 */
const QuizRenderSafe = ({ quiz, renderFn, debugMode = false }) => {
  useEffect(() => {
    if (debugMode) {
      console.log('QuizRenderSafe - Debugging quiz data');
      debugObjectRendering('QuizRenderSafe', quiz);
    }
  }, [quiz, debugMode]);

  // Handle empty quiz
  if (!quiz) {
    return null;
  }

  // Make a safe copy of the quiz with any answers objects properly rendered
  const safeQuiz = {
    ...quiz,
    questions: quiz.questions?.map(question => ({
      ...question,
      // Make sure question is a string, not an object
      question: typeof question.question === 'object' 
        ? (question.question.question || JSON.stringify(question.question)) 
        : question.question,
      // Convert answers to a safe format if they exist
      ...(question.answers ? {
        answers: renderQuizAnswers(question.answers)
      } : {})
    }))
  };

  // Render using the provided render function inside an error boundary
  return (
    <QuizErrorBoundary>
      {renderFn(safeQuiz)}
    </QuizErrorBoundary>
  );
};

/**
 * A higher-order component that wraps a component to make quiz rendering safe
 */
export const withSafeQuizRendering = (Component) => {
  return function SafeComponent(props) {
    return (
      <QuizRenderSafe
        quiz={props.quiz}
        renderFn={(safeQuiz) => <Component {...props} quiz={safeQuiz} />}
        debugMode={props.debugMode}
      />
    );
  };
};

/**
 * Safely renders quiz questions and answers using the recommended pattern
 */
export const SafeQuizDisplay = ({ questions = [] }) => {
  // Make sure questions is an array and each question has required properties
  const safeQuestions = Array.isArray(questions) 
    ? questions.map(q => ({
        question: typeof q.question === 'object' ? q.question.question || '' : (q.question || ''),
        answers: Array.isArray(q.answers) 
          ? q.answers.map(ans => typeof ans === 'object' ? ans.text || '' : String(ans))
          : []
      }))
    : [];

  // Use the pattern provided in the prompt
  return (
    <div className="safe-quiz-display">
      {safeQuestions.map((q, i) => (
        <div key={i} className="question-item mb-4">
          <h3 className="font-bold">{q.question}</h3>
          <ul className="list-disc pl-5 mt-2">
            {q.answers.map((ans, j) => <li key={j}>{ans}</li>)}
          </ul>
        </div>
      ))}
    </div>
  );
};

// Monkey patch for ErrorMessage component in Formik
if (typeof window !== 'undefined') {
  // Wait for DOM and React to be ready
  setTimeout(() => {
    try {
      // Find all error message divs and patch them
      const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
          if (mutation.addedNodes) {
            mutation.addedNodes.forEach(node => {
              if (node.nodeType === 1) { // Element node
                // Find Formik error messages
                const errorDivs = node.querySelectorAll('.Formik-error');
                errorDivs.forEach(div => {
                  // Check if child is an object and not a string
                  Array.from(div.childNodes).forEach(child => {
                    if (child.nodeType === 3) { // Text node
                      const text = child.textContent;
                      // If text looks like an object representation, replace it
                      if (text.includes('[object Object]') || text.includes('{')) {
                        div.textContent = 'Invalid input value';
                      }
                    }
                  });
                });
              }
            });
          }
        });
      });
      
      // Start observing document for error messages
      observer.observe(document.body, { childList: true, subtree: true });
    } catch (e) {
      console.error('Failed to set up error message observer:', e);
    }
  }, 1000);
}

export default QuizRenderSafe;
