import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/student/Navbar';

export default function StudentQuizzes() {
  const { currentUser } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending', 'completed'

  useEffect(() => {
    async function fetchQuizzes() {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        
        // Query all quizzes assigned to this student
        const quizzesQuery = query(
          collection(db, "studentQuizzes"),
          where("studentId", "==", currentUser.uid)
        );
        
        const querySnapshot = await getDocs(quizzesQuery);
        const quizzesData = [];
        
        querySnapshot.forEach((doc) => {
          quizzesData.push({
            id: doc.id,
            ...doc.data(),
            dueDate: doc.data().dueDate?.toDate(),
            assignedAt: doc.data().assignedAt?.toDate(),
            submittedAt: doc.data().submittedAt?.toDate()
          });
        });
        
        // Sort quizzes: pending ones by due date, then completed ones by submission date
        quizzesData.sort((a, b) => {
          // First separate by completion status
          if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
          }
          
          // For pending quizzes, sort by due date (if available) or assigned date
          if (!a.completed) {
            const aDate = a.dueDate || a.assignedAt || new Date();
            const bDate = b.dueDate || b.assignedAt || new Date();
            return aDate - bDate; // Earlier due dates first
          }
          
          // For completed quizzes, sort by submission date (most recent first)
          return (b.submittedAt || b.assignedAt || new Date()) - 
                 (a.submittedAt || a.assignedAt || new Date());
        });
        
        setQuizzes(quizzesData);
      } catch (err) {
        console.error("Error fetching quizzes:", err);
        setError("Failed to load your quizzes. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    
    fetchQuizzes();
  }, [currentUser]);

  const getStatusBadge = (quiz) => {
    if (quiz.completed) {
      return (
        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
          Completed
        </span>
      );
    }
    
    if (quiz.dueDate && new Date() > quiz.dueDate) {
      return (
        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-red-100 text-red-800">
          Overdue
        </span>
      );
    }
    
    return (
      <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
        Pending
      </span>
    );
  };

  // Filter quizzes based on active tab
  const filteredQuizzes = quizzes.filter(quiz => activeTab === 'pending' ? !quiz.completed : quiz.completed);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
            <p className="text-center mt-4">Loading your quizzes...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">My Quizzes</h1>
          
          {error && (
            <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          {/* Tabs */}
          <div className="mt-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('pending')}
                className={`${
                  activeTab === 'pending'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Pending
                <span className="ml-2 py-0.5 px-2.5 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                  {quizzes.filter(quiz => !quiz.completed).length}
                </span>
              </button>
              
              <button
                onClick={() => setActiveTab('completed')}
                className={`${
                  activeTab === 'completed'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
              >
                Completed
                <span className="ml-2 py-0.5 px-2.5 text-xs font-medium rounded-full bg-green-100 text-green-800">
                  {quizzes.filter(quiz => quiz.completed).length}
                </span>
              </button>
            </nav>
          </div>
          
          {/* Quiz list */}
          {filteredQuizzes.length === 0 ? (
            <div className="mt-6 text-center py-12 bg-white rounded-lg shadow">
              <p className="text-gray-500">
                {activeTab === 'pending'
                  ? "You don't have any pending quizzes."
                  : "You haven't completed any quizzes yet."
                }
              </p>
              
              {activeTab === 'completed' && quizzes.some(quiz => !quiz.completed) && (
                <button
                  onClick={() => setActiveTab('pending')}
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                >
                  View Pending Quizzes
                </button>
              )}
            </div>
          ) : (
            <div className="mt-6 grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
              {filteredQuizzes.map(quiz => (
                <div key={quiz.id} className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
                  <div className="px-4 py-5 sm:px-6">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium text-gray-900 truncate">{quiz.quizTitle}</h3>
                      {getStatusBadge(quiz)}
                    </div>
                    <p className="mt-1 text-sm text-gray-500">Assigned by: {quiz.assignedByName || "Mentor"}</p>
                  </div>
                  
                  <div className="px-4 py-4 sm:px-6">
                    <div className="text-sm text-gray-500">
                      {quiz.assignedAt && (
                        <p>Assigned: {quiz.assignedAt.toLocaleDateString()}</p>
                      )}
                      
                      {quiz.dueDate && (
                        <p className={`${
                          new Date() > quiz.dueDate ? 'text-red-600 font-semibold' : ''
                        }`}>
                          Due: {quiz.dueDate.toLocaleDateString()}
                        </p>
                      )}
                      
                      {quiz.completed && quiz.submittedAt && (
                        <p>Submitted: {quiz.submittedAt.toLocaleDateString()}</p>
                      )}
                      
                      {quiz.completed && quiz.score !== undefined && (
                        <p className="mt-1 text-lg font-semibold text-green-600">Score: {quiz.score}%</p>
                      )}
                    </div>
                    
                    {quiz.feedback && (
                      <div className="mt-3 p-3 bg-blue-50 rounded-md">
                        <p className="text-sm font-medium text-blue-800">Feedback:</p>
                        <p className="text-sm text-blue-700">{quiz.feedback}</p>
                      </div>
                    )}
                    
                    <div className="mt-4">
                      {!quiz.completed ? (
                        <Link
                          to={`/student/quizzes/${quiz.quizId}/take/${quiz.id}`}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        >
                          Take Quiz
                        </Link>
                      ) : (
                        <Link
                          to={`/student/quizzes/${quiz.quizId}/results/${quiz.id}`}
                          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                        >
                          View Results
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
