import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/student/Navbar';

export default function QuizResults() {
  const { currentUser } = useAuth();
  const { quizId, assignmentId } = useParams();
  const navigate = useNavigate();
  
  const [quiz, setQuiz] = useState(null);
  const [assignment, setAssignment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Get assignment data
        const assignmentRef = doc(db, "studentQuizzes", assignmentId);
        const assignmentDoc = await getDoc(assignmentRef);
        
        if (!assignmentDoc.exists()) {
          setError("Quiz results not found.");
          setLoading(false);
          return;
        }
        
        const assignmentData = assignmentDoc.data();
        
        // Verify ownership
        if (assignmentData.studentId !== currentUser.uid) {
          setError("You don't have permission to view these results.");
          setLoading(false);
          return;
        }
        
        // Verify completion
        if (!assignmentData.completed) {
          // Redirect to take the quiz if not completed
          navigate(`/student/quizzes/${quizId}/take/${assignmentId}`);
          return;
        }
        
        setAssignment(assignmentData);
        
        // Get quiz data
        const quizRef = doc(db, "quizzes", quizId);
        const quizDoc = await getDoc(quizRef);
        
        if (!quizDoc.exists()) {
          setError("Quiz not found.");
          setLoading(false);
          return;
        }
        
        setQuiz({
          id: quizId,
          ...quizDoc.data()
        });
        
      } catch (err) {
        console.error("Error fetching quiz results:", err);
        setError("Failed to load quiz results: " + err.message);
      } finally {
        setLoading(false);
      }
    }
    
    fetchData();
  }, [quizId, assignmentId, currentUser, navigate]);
  
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
            <p className="text-center mt-4">Loading results...</p>
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
  
  if (!quiz || !assignment) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <div className="flex justify-between">
                <div>
                  <h2 className="text-lg font-medium text-gray-900">{quiz.title} - Results</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Completed: {assignment.submittedAt?.toDate().toLocaleDateString() || 'Unknown'}
                  </p>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-indigo-600">{assignment.score}%</div>
                  <p className="text-sm text-gray-500">Score</p>
                </div>
              </div>
            </div>
            
            {assignment.feedback && (
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6 bg-blue-50">
                <h3 className="text-sm font-medium text-blue-900">Feedback from your mentor:</h3>
                <div className="mt-2 text-sm text-blue-700">
                  {assignment.feedback}
                </div>
              </div>
            )}
            
            <div className="border-t border-gray-200">
              <h3 className="px-4 py-3 bg-gray-50 text-sm font-medium text-gray-900">Your Answers</h3>
              
              <div className="divide-y divide-gray-200">
                {quiz.questions.map((question, index) => {
                  const userAnswer = assignment.answers ? assignment.answers[index] : null;
                  const isCorrect = userAnswer === question.correctAnswer;
                  
                  return (
                    <div key={index} className="px-4 py-5 sm:px-6">
                      <div className="mb-3">
                        <h4 className="text-sm font-medium text-gray-900">Question {index + 1}</h4>
                        <p className="mt-1 text-gray-800">{question.question}</p>
                      </div>
                      
                      <div className="ml-4 space-y-2">
                        {question.options.map((option, optionIndex) => (
                          <div
                            key={optionIndex}
                            className={`flex items-start ${
                              optionIndex === userAnswer && isCorrect
                                ? 'text-green-700'
                                : optionIndex === userAnswer
                                  ? 'text-red-700'
                                  : optionIndex === question.correctAnswer
                                    ? 'text-green-700'
                                    : ''
                            }`}
                          >
                            <div className="flex items-center h-5">
                              {optionIndex === userAnswer ? (
                                <span className="text-lg mr-2">
                                  {isCorrect ? '✓' : '✗'}
                                </span>
                              ) : optionIndex === question.correctAnswer ? (
                                <span className="text-lg mr-2">•</span>
                              ) : (
                                <span className="text-lg mr-2">&nbsp;</span>
                              )}
                            </div>
                            <div className="ml-2">
                              <p className="text-sm">
                                {option}
                                {optionIndex === question.correctAnswer && (
                                  <span className="ml-2 text-xs text-green-600 font-medium">(Correct answer)</span>
                                )}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="px-4 py-4 sm:px-6 bg-gray-50 flex justify-between">
              <Link
                to="/student/quizzes"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                Back to Quizzes
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
