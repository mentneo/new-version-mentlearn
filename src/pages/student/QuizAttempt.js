import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/student/Navbar';
import { FaArrowLeft, FaCheck, FaTimes, FaRedo } from 'react-icons/fa';

export default function QuizAttempt() {
  const { quizId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [score, setScore] = useState(null);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    async function fetchQuizData() {
      try {
        const quizRef = doc(db, "quizzes", quizId);
        const quizDoc = await getDoc(quizRef);
        
        if (!quizDoc.exists()) {
          setError("Quiz not found.");
          setLoading(false);
          return;
        }
        
        const quizData = { id: quizDoc.id, ...quizDoc.data() };
        
        // Randomize question order if specified in quiz settings
        if (quizData.randomizeQuestions) {
          quizData.questions = [...quizData.questions].sort(() => Math.random() - 0.5);
        }
        
        // Initialize timer if quiz has time limit
        if (quizData.timeLimit) {
          setTimeLeft(quizData.timeLimit * 60); // Convert minutes to seconds
        }
        
        setQuiz(quizData);
      } catch (err) {
        console.error("Error fetching quiz data:", err);
        setError("Failed to load quiz. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchQuizData();
  }, [quizId]);

  // Timer countdown effect
  useEffect(() => {
    if (timeLeft === null || timeLeft <= 0 || quizCompleted) return;
    
    const timer = setInterval(() => {
      setTimeLeft(prev => prev - 1);
    }, 1000);
    
    if (timeLeft === 0) {
      handleSubmitQuiz();
    }
    
    return () => clearInterval(timer);
  }, [timeLeft, quizCompleted]);

  const handleAnswerSelect = (questionIndex, answerId) => {
    const question = quiz.questions[questionIndex];
    
    if (question.type === 'single') {
      // For single select, replace the current answer
      setSelectedAnswers({
        ...selectedAnswers,
        [questionIndex]: [answerId]
      });
    } else if (question.type === 'multiple') {
      // For multiple select, toggle the answer
      const currentAnswers = selectedAnswers[questionIndex] || [];
      
      if (currentAnswers.includes(answerId)) {
        setSelectedAnswers({
          ...selectedAnswers,
          [questionIndex]: currentAnswers.filter(id => id !== answerId)
        });
      } else {
        setSelectedAnswers({
          ...selectedAnswers,
          [questionIndex]: [...currentAnswers, answerId]
        });
      }
    }
  };

  const handleNextQuestion = () => {
    if (currentQuestion < quiz.questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevQuestion = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const calculateScore = () => {
    let correctAnswers = 0;
    let totalQuestions = quiz.questions.length;
    
    quiz.questions.forEach((question, index) => {
      const selectedAnswerIds = selectedAnswers[index] || [];
      const correctAnswerIds = question.answers
        .filter(answer => answer.isCorrect)
        .map(answer => answer.id);
      
      // Check if arrays are equivalent (same elements regardless of order)
      const isCorrect = 
        selectedAnswerIds.length === correctAnswerIds.length &&
        selectedAnswerIds.every(id => correctAnswerIds.includes(id));
      
      if (isCorrect) {
        correctAnswers++;
      }
    });
    
    return {
      correctAnswers,
      totalQuestions,
      percentage: Math.round((correctAnswers / totalQuestions) * 100)
    };
  };

  const handleSubmitQuiz = async () => {
    try {
      const scoreResult = calculateScore();
      setScore(scoreResult);
      setQuizCompleted(true);
      
      // Save quiz attempt to Firestore
      await addDoc(collection(db, "quizAttempts"), {
        quizId,
        quizTitle: quiz.title,
        studentId: currentUser.uid,
        selectedAnswers,
        score: scoreResult.percentage,
        correctAnswers: scoreResult.correctAnswers,
        totalQuestions: scoreResult.totalQuestions,
        timestamp: serverTimestamp()
      });
      
    } catch (err) {
      console.error("Error submitting quiz:", err);
      setError("Failed to submit quiz. Please try again.");
    }
  };

  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds < 10 ? '0' : ''}${remainingSeconds}`;
  };

  const isQuestionAnswered = (questionIndex) => {
    return selectedAnswers[questionIndex] && selectedAnswers[questionIndex].length > 0;
  };

  const isAnswerCorrect = (questionIndex, answerId) => {
    if (!quizCompleted) return false;
    
    const question = quiz.questions[questionIndex];
    const answer = question.answers.find(a => a.id === answerId);
    
    return answer?.isCorrect || false;
  };

  const isUserAnswerCorrect = (questionIndex) => {
    if (!quizCompleted) return false;
    
    const question = quiz.questions[questionIndex];
    const selectedAnswerIds = selectedAnswers[questionIndex] || [];
    const correctAnswerIds = question.answers
      .filter(answer => answer.isCorrect)
      .map(answer => answer.id);
    
    return (
      selectedAnswerIds.length === correctAnswerIds.length &&
      selectedAnswerIds.every(id => correctAnswerIds.includes(id))
    );
  };

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
            <Link
              to="/student/dashboard"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
            >
              <FaArrowLeft className="mr-2" /> Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (quizCompleted && !showReview) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:px-6 text-center">
                <h2 className="text-2xl font-bold text-gray-900">Quiz Completed!</h2>
                <p className="mt-1 max-w-2xl text-sm text-gray-500 mx-auto">
                  {quiz.title}
                </p>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
                <div className="text-center">
                  <div className="mx-auto w-32 h-32 flex items-center justify-center rounded-full bg-green-100 mb-4">
                    <span className="text-4xl font-bold text-green-600">{score.percentage}%</span>
                  </div>
                  <p className="text-gray-700">
                    You answered {score.correctAnswers} out of {score.totalQuestions} questions correctly.
                  </p>
                  
                  <div className="mt-6 grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                    <button
                      onClick={() => setShowReview(true)}
                      className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      Review Answers
                    </button>
                    <Link
                      to="/student/dashboard"
                      className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Back to Dashboard
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            {/* Quiz Header */}
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{quiz.title}</h2>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  {quizCompleted ? 'Quiz Review' : `Question ${currentQuestion + 1} of ${quiz.questions.length}`}
                </p>
              </div>
              {timeLeft !== null && !quizCompleted && (
                <div className={`text-sm font-medium ${timeLeft < 60 ? 'text-red-600' : 'text-gray-700'}`}>
                  Time Left: {formatTime(timeLeft)}
                </div>
              )}
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 h-1">
              <div 
                className="bg-indigo-600 h-1" 
                style={{ width: `${((currentQuestion + 1) / quiz.questions.length) * 100}%` }}
              ></div>
            </div>
            
            {/* Question Content */}
            <div className="px-4 py-5 sm:p-6">
              {showReview ? (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Quiz Review</h3>
                  
                  <div className="space-y-6">
                    {quiz.questions.map((question, index) => (
                      <div 
                        key={index} 
                        className={`p-4 rounded-md ${
                          isUserAnswerCorrect(index) ? 'bg-green-50' : 'bg-red-50'
                        }`}
                      >
                        <div className="flex items-start">
                          <div className={`flex-shrink-0 mt-0.5 ${
                            isUserAnswerCorrect(index) ? 'text-green-600' : 'text-red-600'
                          }`}>
                            {isUserAnswerCorrect(index) ? (
                              <FaCheck className="h-5 w-5" />
                            ) : (
                              <FaTimes className="h-5 w-5" />
                            )}
                          </div>
                          <div className="ml-3">
                            <h4 className="text-base font-medium text-gray-900">
                              {question.question}
                            </h4>
                            <div className="mt-2 space-y-2">
                              {question.answers.map((answer) => (
                                <div 
                                  key={answer.id} 
                                  className={`p-2 rounded ${
                                    answer.isCorrect ? 'bg-green-100' : 
                                    (selectedAnswers[index] || []).includes(answer.id) && !answer.isCorrect ? 'bg-red-100' : 'bg-gray-100'
                                  }`}
                                >
                                  <div className="flex items-center">
                                    <div className="ml-3">
                                      <p className={`text-sm ${
                                        answer.isCorrect ? 'text-green-700 font-medium' : 
                                        (selectedAnswers[index] || []).includes(answer.id) && !answer.isCorrect ? 'text-red-700' : 'text-gray-700'
                                      }`}>
                                        {answer.text}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                            {!isUserAnswerCorrect(index) && (
                              <div className="mt-3 text-sm text-gray-500">
                                <p className="font-medium text-gray-700">Correct Answer(s):</p>
                                <p>
                                  {question.answers
                                    .filter(answer => answer.isCorrect)
                                    .map(answer => answer.text)
                                    .join(', ')}
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 flex justify-between">
                    <button
                      onClick={() => setShowReview(false)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Back to Results
                    </button>
                    <Link
                      to="/student/dashboard"
                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                    >
                      Finish Review
                    </Link>
                  </div>
                </div>
              ) : (
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">
                    {quiz.questions[currentQuestion].question}
                  </h3>
                  
                  <div className="mt-4 space-y-2">
                    {quiz.questions[currentQuestion].answers.map((answer) => (
                      <button
                        key={answer.id}
                        onClick={() => !quizCompleted && handleAnswerSelect(currentQuestion, answer.id)}
                        disabled={quizCompleted}
                        className={`w-full p-3 text-left rounded-md ${
                          (selectedAnswers[currentQuestion] || []).includes(answer.id)
                            ? quizCompleted
                              ? isAnswerCorrect(currentQuestion, answer.id)
                                ? 'bg-green-100 border-green-400'
                                : 'bg-red-100 border-red-400'
                              : 'bg-indigo-100 border-indigo-400'
                            : quizCompleted && isAnswerCorrect(currentQuestion, answer.id)
                              ? 'bg-green-100 border-green-400'
                              : 'bg-white border-gray-300'
                        } border hover:bg-gray-50 transition-colors`}
                      >
                        <div className="flex items-start">
                          <div className="flex-shrink-0 h-5 w-5 relative top-0.5">
                            {quiz.questions[currentQuestion].type === 'single' ? (
                              <div className={`rounded-full h-4 w-4 border ${
                                (selectedAnswers[currentQuestion] || []).includes(answer.id)
                                  ? 'border-indigo-600'
                                  : 'border-gray-300'
                              }`}>
                                {(selectedAnswers[currentQuestion] || []).includes(answer.id) && (
                                  <div className="rounded-full h-2 w-2 m-0.5 bg-indigo-600"></div>
                                )}
                              </div>
                            ) : (
                              <div className={`rounded h-4 w-4 border ${
                                (selectedAnswers[currentQuestion] || []).includes(answer.id)
                                  ? 'bg-indigo-600 border-indigo-600'
                                  : 'border-gray-300'
                              }`}>
                                {(selectedAnswers[currentQuestion] || []).includes(answer.id) && (
                                  <svg className="h-4 w-4 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                                  </svg>
                                )}
                              </div>
                            )}
                          </div>
                          <div className="ml-3 text-sm">
                            {answer.text}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                  
                  {quizCompleted && (
                    <div className="mt-6 bg-yellow-50 border border-yellow-400 text-yellow-800 p-4 rounded-md">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2h-1V9z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <div className="ml-3">
                          <p className="text-sm">
                            This quiz has been completed. Use the navigation below to review all questions.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Navigation Controls */}
                  <div className="mt-6 flex justify-between">
                    <button
                      onClick={handlePrevQuestion}
                      disabled={currentQuestion === 0}
                      className={`px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${
                        currentQuestion === 0
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-white text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      Previous
                    </button>
                    
                    <div className="flex">
                      {!quizCompleted && (
                        <button
                          onClick={handleSubmitQuiz}
                          className="ml-3 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                        >
                          Submit Quiz
                        </button>
                      )}
                      
                      {currentQuestion < quiz.questions.length - 1 ? (
                        <button
                          onClick={handleNextQuestion}
                          className="ml-3 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                        >
                          Next
                        </button>
                      ) : (
                        quizCompleted && (
                          <button
                            onClick={() => setShowReview(true)}
                            className="ml-3 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                          >
                            Review All
                          </button>
                        )
                      )}
                    </div>
                  </div>
                  
                  {/* Question Navigation */}
                  <div className="mt-6">
                    <div className="text-sm font-medium text-gray-700 mb-2">Question Navigation:</div>
                    <div className="flex flex-wrap gap-2">
                      {quiz.questions.map((_, index) => (
                        <button
                          key={index}
                          onClick={() => setCurrentQuestion(index)}
                          className={`w-8 h-8 flex items-center justify-center rounded-full text-sm font-medium ${
                            currentQuestion === index
                              ? 'bg-indigo-600 text-white'
                              : isQuestionAnswered(index)
                                ? 'bg-indigo-100 text-indigo-600'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {index + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
