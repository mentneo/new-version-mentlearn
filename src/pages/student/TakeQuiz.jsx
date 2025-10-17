import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebase.js';
import { useAuth } from '../../contexts/AuthContext.js';
import Navbar from '../../components/student/Navbar.js';

export default function TakeQuiz() {
  const { currentUser } = useAuth();
  const { quizId, assignmentId } = useParams();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    async function fetchQuizData() {
      try {
        setLoading(true);
        
        // First get the assignment data to verify permissions
        const assignmentRef = doc(db, "studentQuizzes", assignmentId);
        const assignmentDoc = await getDoc(assignmentRef);
        
        if (!assignmentDoc.exists()) {
          setError("Quiz assignment not found.");
          setLoading(false);
          return;
        }
        
        const assignmentData = assignmentDoc.data();
        
        // Verify this assignment belongs to the current user
        if (assignmentData.studentId !== currentUser.uid) {
          setError("You don't have permission to take this quiz.");
          setLoading(false);
          return;
        }
        
        // Check if already completed
        if (assignmentData.completed) {
          navigate(`/student/quizzes/${quizId}/results/${assignmentId}`);
          return;
        }
        
        // Now get the actual quiz content
        const quizRef = doc(db, "quizzes", quizId);
        const quizDoc = await getDoc(quizRef);
        
        if (!quizDoc.exists()) {
          setError("Quiz not found.");
          setLoading(false);
          return;
        }
        
        const quizData = quizDoc.data();
        setQuiz({
          id: quizId,
          ...quizData
        });
        
        // Initialize answers array (null means no answer selected)
        setAnswers(new Array(quizData.questions?.length || 0).fill(null));
        
        // Set time limit if present
        if (quizData.timeLimit) {
          setTimeLeft(quizData.timeLimit * 60); // convert to seconds
        }
      } catch (err) {
        console.error("Error loading quiz:", err);
        setError("Failed to load quiz: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    
    if (currentUser) {
      fetchQuizData();
    }
  }, [quizId, assignmentId, currentUser, navigate]);
  
  // Timer effect
  useEffect(() => {
    if (!timeLeft) return;
    
    const timerId = setInterval(() => {
      setTimeLeft(time => {
        if (time <= 1) {
          clearInterval(timerId);
          handleSubmit();
          return 0;
        }
        return time - 1;
      });
    }, 1000);
    
    return () => clearInterval(timerId);
  }, [timeLeft]); // eslint-disable-line react-hooks/exhaustive-deps
  
  const handleAnswer = (optionIndex) => {
    const newAnswers = [...answers];
    newAnswers[currentQuestion] = optionIndex;
    setAnswers(newAnswers);
  };
  
  const handleNext = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };
  
  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };
  
  const calculateScore = () => {
    let correctCount = 0;
    
    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correctCount++;
      }
    });
    
    return Math.round((correctCount / quiz.questions.length) * 100);
  };
  
  const handleSubmit = async () => {
    if (submitting) return;
    
    try {
      setSubmitting(true);
      
      // Calculate score
      const score = calculateScore();
      
      // Update the assignment record
      const assignmentRef = doc(db, "studentQuizzes", assignmentId);
      await updateDoc(assignmentRef, {
        completed: true,
        submittedAt: serverTimestamp(),
        answers,
        score,
        status: 'completed'
      });
      
      // Redirect to results page
      navigate(`/student/quizzes/${quizId}/results/${assignmentId}`);
    } catch (err) {
      console.error("Error submitting quiz:", err);
      setError("Failed to submit quiz: " + err.message);
      setSubmitting(false);
    }
  };
  
  // Format time left as MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' + secs : secs}`;
  };
  
  // Check if all questions have been answered
  const allAnswered = answers.every(answer => answer !== null);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
            <p className="text-center mt-4">Loading quiz...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
            <button
              onClick={() => navigate('/student/quizzes')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Back to Quizzes
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!quiz || !quiz.questions || quiz.questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
              This quiz doesn't have any questions.
            </div>
            <button
              onClick={() => navigate('/student/quizzes')}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
            >
              Back to Quizzes
            </button>
          </div>
        </div>
      </div>
    );
  }

  const question = quiz.questions[currentQuestion];

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h2 className="text-lg font-medium text-gray-900">{quiz.title}</h2>
                <p className="mt-1 text-sm text-gray-500">
                  Question {currentQuestion + 1} of {quiz.questions.length}
                </p>
              </div>
              
              {timeLeft && (
                <div className={`text-lg font-medium ${timeLeft < 60 ? 'text-red-600 animate-pulse' : 'text-gray-900'}`}>
                  Time left: {formatTime(timeLeft)}
                </div>
              )}
            </div>
            
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">{question.question}</h3>
              
              <div className="space-y-3">
                {question.options.map((option, index) => (
                  <div key={index} className="flex items-center">
                    <input
                      type="radio"
                      id={`option-${index}`}
                      name={`question-${currentQuestion}`}
                      checked={answers[currentQuestion] === index}
                      onChange={() => handleAnswer(index)}
                      className="h-4 w-4 text-indigo-600 border-gray-300 focus:ring-indigo-500"
                    />
                    <label htmlFor={`option-${index}`} className="ml-3 block text-sm font-medium text-gray-700">
                      {option}
                    </label>
                  </div>
                ))}
              </div>
              
              <div className="mt-6 flex justify-between">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={currentQuestion === 0}
                  className={`inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md ${
                    currentQuestion === 0 
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  Previous
                </button>
                
                {currentQuestion < quiz.questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={handleNext}
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Next
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className={`inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                      submitting ? 'bg-gray-400 cursor-wait' : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {submitting ? 'Submitting...' : 'Submit Quiz'}
                  </button>
                )}
              </div>
            </div>
            
            {/* Question navigation */}
            <div className="border-t border-gray-200 px-4 py-4 sm:px-6 bg-gray-50">
              <div className="flex flex-wrap gap-2">
                {quiz.questions.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentQuestion(index)}
                    className={`w-8 h-8 flex items-center justify-center rounded-full text-sm ${
                      currentQuestion === index 
                        ? 'bg-indigo-600 text-white'
                        : answers[index] !== null
                          ? 'bg-green-100 text-green-800 border border-green-500'
                          : 'bg-gray-100 text-gray-800 border border-gray-300'
                    }`}
                  >
                    {index + 1}
                  </button>
                ))}
              </div>
              
              <div className="mt-4 flex justify-between">
                <div className="text-sm text-gray-500">
                  {answers.filter(a => a !== null).length} of {quiz.questions.length} questions answered
                </div>
                
                {!allAnswered && currentQuestion === quiz.questions.length - 1 && (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="text-sm text-indigo-600 hover:text-indigo-900"
                  >
                    Submit anyway
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
