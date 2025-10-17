import React, { useState, useEffect, useContext } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { AuthContext } from '../../contexts/AuthContext';
import activityTracker from '../../utils/activityTracker';
import QuizQuestion from './QuizQuestion';
import QuizResults from './QuizResults';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import api from '../../config/api';

/**
 * Quiz Component
 * Renders a quiz with questions, tracks user progress, and submits results
 */
const Quiz = () => {
  const { courseId, quizId } = useParams();
  const history = useHistory();
  const { currentUser } = useContext(AuthContext);
  
  const [quiz, setQuiz] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState(null);
  const [startTime, setStartTime] = useState(null);
  
  // Load quiz data
  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const response = await api.get(`/courses/${courseId}/quizzes/${quizId}`);
        setQuiz(response.data);
        setStartTime(new Date());
        
        // Track quiz start
        if (currentUser) {
          activityTracker.setUserId(currentUser._id);
          activityTracker.trackQuizStart(courseId, quizId, response.data.title);
        }
      } catch (err) {
        setError('Failed to load quiz. Please try again.');
        console.error('Error loading quiz:', err);
      }
    };
    
    fetchQuiz();
  }, [courseId, quizId, currentUser]);
  
  // Handle answer selection
  const handleAnswerSelect = (questionId, selectedOption) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: selectedOption
    }));
  };
  
  // Move to next question
  const handleNextQuestion = () => {
    if (currentQuestionIndex < quiz.questions.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1);
    }
  };
  
  // Move to previous question
  const handlePrevQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1);
    }
  };
  
  // Submit quiz answers
  const handleSubmitQuiz = async () => {
    // Calculate time spent
    const endTime = new Date();
    const timeSpentSeconds = Math.round((endTime - startTime) / 1000);
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Track quiz submission
      if (currentUser) {
        activityTracker.trackQuizSubmission(
          courseId, 
          quizId, 
          quiz.title, 
          Object.entries(answers).map(([questionId, answer]) => ({
            questionId,
            selectedOption: answer
          })),
          timeSpentSeconds
        );
      }
      
      // Submit to API
      const response = await api.post(`/courses/${courseId}/quizzes/${quizId}/submit`, {
        answers,
        timeSpent: timeSpentSeconds
      });
      
      setResults(response.data);
      
      // Track quiz completion with score
      if (currentUser) {
        activityTracker.trackQuizCompletion(
          courseId,
          quizId,
          quiz.title,
          response.data.score,
          Object.entries(answers).map(([questionId, answer]) => ({
            questionId,
            selectedOption: answer,
            isCorrect: response.data.correctAnswers[questionId] === answer
          })),
          timeSpentSeconds
        );
      }
    } catch (err) {
      setError('Failed to submit quiz. Please try again.');
      console.error('Error submitting quiz:', err);
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle retaking the quiz
  const handleRetakeQuiz = () => {
    setAnswers({});
    setCurrentQuestionIndex(0);
    setResults(null);
    setStartTime(new Date());
    
    // Track quiz start again
    if (currentUser) {
      activityTracker.trackQuizStart(courseId, quizId, quiz.title);
    }
  };
  
  // Return to course
  const handleReturnToCourse = () => {
    history.push(`/courses/${courseId}`);
  };
  
  if (error) {
    return <ErrorMessage message={error} />;
  }
  
  if (!quiz) {
    return <LoadingSpinner />;
  }
  
  // Show results if quiz has been submitted
  if (results) {
    return (
      <QuizResults
        results={results}
        quiz={quiz}
        answers={answers}
        onRetake={handleRetakeQuiz}
        onReturn={handleReturnToCourse}
      />
    );
  }
  
  // Current question to display
  const currentQuestion = quiz.questions[currentQuestionIndex];
  
  // Check if all questions have been answered
  const allQuestionsAnswered = quiz.questions.every(q => answers[q.id]);
  
  return (
    <div className="quiz-container">
      <div className="quiz-header">
        <h1>{quiz.title}</h1>
        <div className="quiz-progress">
          Question {currentQuestionIndex + 1} of {quiz.questions.length}
        </div>
      </div>
      
      <QuizQuestion
        question={currentQuestion}
        selectedOption={answers[currentQuestion.id]}
        onSelectAnswer={(option) => handleAnswerSelect(currentQuestion.id, option)}
      />
      
      <div className="quiz-navigation">
        <button
          className="btn btn-secondary"
          onClick={handlePrevQuestion}
          disabled={currentQuestionIndex === 0}
        >
          Previous
        </button>
        
        {currentQuestionIndex === quiz.questions.length - 1 ? (
          <button
            className="btn btn-primary"
            onClick={handleSubmitQuiz}
            disabled={isSubmitting || !allQuestionsAnswered}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Quiz'}
          </button>
        ) : (
          <button
            className="btn btn-primary"
            onClick={handleNextQuestion}
            disabled={!answers[currentQuestion.id]}
          >
            Next
          </button>
        )}
      </div>
      
      <div className="quiz-questions-nav">
        {quiz.questions.map((q, index) => (
          <button
            key={q.id}
            className={`question-nav-btn ${index === currentQuestionIndex ? 'active' : ''} ${
              answers[q.id] ? 'answered' : ''
            }`}
            onClick={() => setCurrentQuestionIndex(index)}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Quiz;