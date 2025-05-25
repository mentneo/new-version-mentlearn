import React from 'react';
import { SafeRenderer } from '../utils/reactPatcher';

/**
 * A safe wrapper component for quiz display
 * Use this to wrap any component that renders quiz data
 */
const SafeQuiz = ({ quiz, children, renderQuiz }) => {
  // Early validation
  if (!quiz) {
    return children || null;
  }

  // Make a safer version of the quiz data
  const safeQuiz = React.useMemo(() => {
    try {
      return {
        ...quiz,
        questions: Array.isArray(quiz.questions)
          ? quiz.questions.map(q => ({
              ...q,
              question: typeof q.question === 'object' ? JSON.stringify(q.question) : q.question || '',
              // Convert answers object to array of strings if needed
              answers: Array.isArray(q.answers)
                ? q.answers.map(a => typeof a === 'string' ? a : (a.text || String(a)))
                : []
            }))
          : []
      };
    } catch (err) {
      console.error('Error creating safe quiz:', err);
      return { title: quiz.title || 'Quiz', questions: [] };
    }
  }, [quiz]);

  // If a render function is provided, use it with the safe quiz
  if (typeof renderQuiz === 'function') {
    try {
      return renderQuiz(safeQuiz);
    } catch (err) {
      console.error('Error in quiz render function:', err);
      return <div>Error rendering quiz</div>;
    }
  }

  // Otherwise just render children inside the SafeRenderer
  return <SafeRenderer>{children}</SafeRenderer>;
};

/**
 * HOC to wrap components with SafeQuiz
 */
export const withSafeQuiz = (Component) => {
  const SafeComponent = (props) => {
    return (
      <SafeQuiz 
        quiz={props.quiz}
        renderQuiz={(safeQuiz) => <Component {...props} quiz={safeQuiz} />}
      />
    );
  };
  
  SafeComponent.displayName = `WithSafeQuiz(${Component.displayName || Component.name || 'Component'})`;
  return SafeComponent;
};

/**
 * ErrorBoundary for quiz components
 */
export class QuizErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Quiz component error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      // You can render any custom fallback UI
      return (
        <div className="quiz-error-boundary">
          <h3>Something went wrong with this quiz component.</h3>
          <p>Error: {this.state.error?.message || "Unknown error"}</p>
          {this.props.fallback}
        </div>
      );
    }

    return this.props.children;
  }
}

export default SafeQuiz;
