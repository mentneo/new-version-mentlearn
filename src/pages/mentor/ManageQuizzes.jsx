import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, doc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase.js';
import { useAuth } from '../../contexts/AuthContext.js';
import Navbar from '../../components/mentor/Navbar';

// Safe render function for any potentially problematic values
const safeRender = (value) => {
  if (value === null || value === undefined) return '';
  if (typeof value !== 'object') return value;
  
  try {
    return JSON.stringify(value);
  } catch (e) {
    return '[Object]';
  }
};

export default function ManageQuizzes() {
  const { currentUser } = useAuth();
  const [quizzes, setQuizzes] = useState([]);
  const [studentSubmissions, setStudentSubmissions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'assigned', 'submitted'

  // Check for success message in session storage
  useEffect(() => {
    const quizCreated = window.sessionStorage.getItem('quizCreated');
    const quizTitle = window.sessionStorage.getItem('quizTitle');
    
    if (quizCreated === 'true' && quizTitle) {
      setSuccessMessage(`Quiz "${quizTitle}" was created successfully.`);
      
      // Clear the session storage
      window.sessionStorage.removeItem('quizCreated');
      window.sessionStorage.removeItem('quizTitle');
    }
    
    const assignmentSuccess = window.sessionStorage.getItem('assignmentSuccess');
    if (assignmentSuccess) {
      setSuccessMessage(assignmentSuccess);
      window.sessionStorage.removeItem('assignmentSuccess');
    }
  }, []);

  // Fetch quizzes
  useEffect(() => {
    async function fetchQuizzes() {
      try {
        setLoading(true);
        
        // Query quizzes created by this mentor
        const quizzesQuery = query(
          collection(db, "quizzes"),
          where("creatorId", "==", currentUser.uid)
        );
        
        const quizzesSnapshot = await getDocs(quizzesQuery);
        const quizzesData = [];
        
        quizzesSnapshot.forEach(doc => {
          quizzesData.push({
            id: doc.id,
            ...doc.data(),
            questionsCount: doc.data().questions ? doc.data().questions.length : 0,
          });
        });
        
        // Sort by creation date, newest first
        quizzesData.sort((a, b) => {
          return (b.createdAt?.toDate() || 0) - (a.createdAt?.toDate() || 0);
        });
        
        setQuizzes(quizzesData);
        
        // Fetch student submissions for each quiz
        const submissionsData = {};
        
        // Query for student quizzes assigned by this mentor
        const submissionsQuery = query(
          collection(db, "studentQuizzes"),
          where("assignedBy", "==", currentUser.uid)
        );
        
        const submissionsSnapshot = await getDocs(submissionsQuery);
        
        submissionsSnapshot.forEach(doc => {
          const submission = doc.data();
          const quizId = submission.quizId;
          
          if (!submissionsData[quizId]) {
            submissionsData[quizId] = {
              assigned: 0,
              completed: 0,
              pending: 0,
              submissions: []
            };
          }
          
          submissionsData[quizId].assigned++;
          
          if (submission.completed) {
            submissionsData[quizId].completed++;
          } else {
            submissionsData[quizId].pending++;
          }
          
          submissionsData[quizId].submissions.push({
            id: doc.id,
            ...submission
          });
        });
        
        setStudentSubmissions(submissionsData);
      } catch (err) {
        console.error("Error fetching quizzes:", err);
        setError("Failed to load quizzes. Please try again later.");
      } finally {
        setLoading(false);
      }
    }
    
    fetchQuizzes();
  }, [currentUser]);

  const handleDeleteQuiz = async (quizId) => {
    try {
      // Delete the quiz document
      await deleteDoc(doc(db, "quizzes", quizId));
      
      // Update local state
      setQuizzes(quizzes.filter(quiz => quiz.id !== quizId));
      setSuccessMessage("Quiz deleted successfully.");
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Error deleting quiz:", err);
      setError("Failed to delete quiz. Please try again.");
    }
  };

  // Filter quizzes based on active tab
  const filteredQuizzes = quizzes.filter(quiz => {
    if (activeTab === 'all') return true;
    if (activeTab === 'assigned') return studentSubmissions[quiz.id]?.assigned > 0;
    if (activeTab === 'submitted') return studentSubmissions[quiz.id]?.completed > 0;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
            <p className="text-center mt-4">Loading quizzes...</p>
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
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">My Quizzes</h1>
            <div className="flex space-x-2">
              <Link 
                to="/mentor/create-quiz"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Create Quiz
              </Link>
              <Link 
                to="/mentor/assign-to-students"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Assign to Students
              </Link>
            </div>
          </div>
          
          {error && (
            <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}
          
          {successMessage && (
            <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
              {successMessage}
              <button 
                className="absolute top-0 bottom-0 right-0 px-4"
                onClick={() => setSuccessMessage("")}
              >
                <span className="text-green-500">&times;</span>
              </button>
            </div>
          )}
          
          {/* Tab Navigation */}
          <div className="mt-6 border-b border-gray-200">
            <nav className="-mb-px flex space-x-8" aria-label="Tabs">
              {['All Quizzes', 'Assigned', 'Submitted'].map((tab, index) => {
                const key = ['all', 'assigned', 'submitted'][index];
                return (
                  <button
                    key={key}
                    onClick={() => setActiveTab(key)}
                    className={`${
                      activeTab === key
                        ? 'border-indigo-500 text-indigo-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
                  >
                    {tab}
                    {key !== 'all' && (
                      <span className={`ml-2 py-0.5 px-2 rounded-full text-xs ${
                        activeTab === key ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {key === 'assigned' 
                          ? Object.values(studentSubmissions).reduce((acc, curr) => acc + curr.assigned, 0) 
                          : Object.values(studentSubmissions).reduce((acc, curr) => acc + curr.completed, 0)}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
          
          {filteredQuizzes.length === 0 ? (
            <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md p-6 text-center">
              <p className="text-gray-500">
                {activeTab === 'all' 
                  ? "You haven't created any quizzes yet." 
                  : activeTab === 'assigned'
                    ? "You haven't assigned any quizzes to students yet."
                    : "No students have submitted quizzes yet."}
              </p>
              {activeTab === 'all' && (
                <Link 
                  to="/mentor/create-quiz"
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
                >
                  Create Your First Quiz
                </Link>
              )}
              {activeTab === 'assigned' && quizzes.length > 0 && (
                <Link 
                  to="/mentor/assign-to-students"
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                  Assign Quizzes to Students
                </Link>
              )}
            </div>
          ) : (
            <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {filteredQuizzes.map((quiz) => (
                  <li key={quiz.id}>
                    <div className="px-4 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900">{safeRender(quiz.title)}</h3>
                          <p className="mt-1 text-sm text-gray-500">
                            {quiz.questionsCount} question{quiz.questionsCount !== 1 ? 's' : ''}
                          </p>
                          {quiz.description && (
                            <p className="mt-1 text-sm text-gray-600">{safeRender(quiz.description)}</p>
                          )}
                          
                          {/* Submission stats */}
                          {studentSubmissions[quiz.id] && (
                            <div className="mt-2 flex space-x-4 text-xs">
                              <span className="text-blue-600">
                                <span className="font-medium">{studentSubmissions[quiz.id].assigned}</span> assigned
                              </span>
                              <span className="text-green-600">
                                <span className="font-medium">{studentSubmissions[quiz.id].completed}</span> completed
                              </span>
                              <span className="text-orange-600">
                                <span className="font-medium">{studentSubmissions[quiz.id].pending}</span> pending
                              </span>
                            </div>
                          )}
                        </div>
                        <div className="flex space-x-2">
                          <Link
                            to={`/mentor/quizzes/${quiz.id}`}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                          >
                            View
                          </Link>
                          {studentSubmissions[quiz.id]?.completed > 0 && (
                            <Link
                              to={`/mentor/quiz-submissions/${quiz.id}`}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                            >
                              Review Submissions
                            </Link>
                          )}
                          <Link
                            to={`/mentor/quizzes/edit/${quiz.id}`}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500"
                          >
                            Edit
                          </Link>
                          <Link
                            to={`/mentor/assign-to-students?type=quiz&id=${quiz.id}`}
                            className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                          >
                            Assign
                          </Link>
                          {!studentSubmissions[quiz.id]?.assigned && deleteConfirm === quiz.id ? (
                            <div className="flex space-x-1">
                              <button 
                                onClick={() => handleDeleteQuiz(quiz.id)}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                              >
                                Confirm
                              </button>
                              <button 
                                onClick={() => setDeleteConfirm(null)}
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : !studentSubmissions[quiz.id]?.assigned && (
                            <button 
                              onClick={() => setDeleteConfirm(quiz.id)}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                              Delete
                            </button>
                          )}
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-gray-500">
                        Created: {quiz.createdAt?.toDate().toLocaleDateString() || 'Unknown date'}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
