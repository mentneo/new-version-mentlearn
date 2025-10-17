import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc, updateDoc } from 'firebase/firestore';
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

export default function QuizSubmissions() {
  const { quizId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [submissions, setSubmissions] = useState([]);
  const [quiz, setQuiz] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [feedback, setFeedback] = useState('');
  
  // Fetch quiz and submissions data
  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);
        
        // Get quiz details
        const quizRef = doc(db, "quizzes", quizId);
        const quizSnap = await getDoc(quizRef);
        
        if (!quizSnap.exists()) {
          setError("Quiz not found.");
          setLoading(false);
          return;
        }
        
        const quizData = quizSnap.data();
        setQuiz({
          id: quizId,
          ...quizData
        });
        
        // Get student submissions for this quiz
        const submissionsQuery = query(
          collection(db, "studentQuizzes"),
          where("quizId", "==", quizId),
          where("assignedBy", "==", currentUser.uid),
          where("completed", "==", true)
        );
        
        const submissionsSnap = await getDocs(submissionsQuery);
        
        if (submissionsSnap.empty) {
          setSubmissions([]);
          setLoading(false);
          return;
        }
        
        const submissionsData = [];
        
        for (const doc of submissionsSnap.docs) {
          const submission = doc.data();
          submissionsData.push({
            id: doc.id,
            ...submission
          });
        }
        
        // Sort by submission date (most recent first)
        submissionsData.sort((a, b) => {
          return (b.submittedAt?.toDate() || 0) - (a.submittedAt?.toDate() || 0);
        });
        
        setSubmissions(submissionsData);
      } catch (err) {
        console.error("Error fetching quiz submissions:", err);
        setError("Failed to load quiz submissions. Please try again.");
      } finally {
        setLoading(false);
      }
    }
    
    if (quizId && currentUser) {
      fetchData();
    }
  }, [quizId, currentUser]);
  
  const handleFeedbackSubmit = async (submissionId) => {
    try {
      const submissionRef = doc(db, "studentQuizzes", submissionId);
      
      await updateDoc(submissionRef, {
        feedback,
        gradedBy: currentUser.uid,
        gradedAt: new Date()
      });
      
      // Update local state
      setSubmissions(submissions.map(sub => 
        sub.id === submissionId 
          ? { ...sub, feedback, gradedBy: currentUser.uid, gradedAt: new Date() } 
          : sub
      ));
      
      setSuccess("Feedback submitted successfully.");
      setSelectedSubmission(null);
      setFeedback('');
    } catch (err) {
      console.error("Error submitting feedback:", err);
      setError("Failed to submit feedback. Please try again.");
    }
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
            <p className="text-center mt-4">Loading quiz submissions...</p>
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Quiz Submissions: {quiz ? safeRender(quiz.title) : ''}
              </h1>
              {quiz && (
                <p className="mt-1 text-sm text-gray-500">
                  {quiz.questions?.length || 0} Questions
                </p>
              )}
            </div>
            <div>
              <button
                onClick={() => navigate('/mentor/quizzes')}
                className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Back to Quizzes
              </button>
            </div>
          </div>
          
          {error && (
            <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
              {success}
              <button 
                className="absolute top-0 bottom-0 right-0 px-4"
                onClick={() => setSuccess(null)}
              >
                <span className="text-green-500">&times;</span>
              </button>
            </div>
          )}
          
          {submissions.length === 0 ? (
            <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center">
              <p className="text-gray-500">No submissions found for this quiz.</p>
              <Link 
                to="/mentor/quizzes" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 mt-2"
              >
                Return to Quizzes
              </Link>
            </div>
          ) : (
            <div className="mt-6 bg-white shadow overflow-hidden sm:rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Score
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {submissions.map(submission => (
                    <tr key={submission.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {safeRender(submission.studentName)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {safeRender(submission.studentId)}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {submission.submittedAt?.toDate().toLocaleString() || 'Unknown'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {submission.score !== undefined && submission.score !== null ? (
                          <div className="text-sm text-gray-900">
                            {submission.score}/{quiz.questions?.length || 'N/A'}
                          </div>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                            Not graded
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {submission.feedback ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Feedback given
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-800">
                            Needs feedback
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => {
                            setSelectedSubmission(submission);
                            setFeedback(submission.feedback || '');
                          }}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Review
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          
          {/* Submission Review Modal */}
          {selectedSubmission && (
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="px-6 py-4 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">
                      Review Submission: {safeRender(selectedSubmission.studentName)}
                    </h3>
                    <button
                      onClick={() => setSelectedSubmission(null)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <span className="sr-only">Close</span>
                      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
                
                <div className="px-6 py-4">
                  <div className="mb-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Submission Details</h4>
                    <p className="text-sm text-gray-600">
                      Submitted on: {selectedSubmission.submittedAt?.toDate().toLocaleString()}
                    </p>
                    {selectedSubmission.score !== undefined && (
                      <p className="text-sm text-gray-600">
                        Score: {selectedSubmission.score}/{quiz?.questions?.length || 'N/A'}
                      </p>
                    )}
                  </div>
                  
                  <div className="mb-6">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Student Answers</h4>
                    <div className="bg-gray-50 p-4 rounded-md">
                      {selectedSubmission.answers ? (
                        <div className="space-y-4">
                          {selectedSubmission.answers.map((answer, index) => (
                            <div key={index} className="border-b border-gray-200 pb-3 last:border-b-0 last:pb-0">
                              <div className="text-sm font-medium">Question {index + 1}:</div>
                              <div className="text-sm text-gray-600 mt-1">
                                {quiz?.questions?.[index]?.question || 'Unknown question'}
                              </div>
                              <div className="text-sm mt-2">
                                <span className="font-medium">Student answer:</span> Option {answer + 1}
                              </div>
                              <div className="text-sm mt-1">
                                <span className="font-medium">Correct answer:</span> Option {(quiz?.questions?.[index]?.correctAnswer || 0) + 1}
                              </div>
                              <div className={`text-sm mt-1 ${answer === quiz?.questions?.[index]?.correctAnswer ? 'text-green-600' : 'text-red-600'}`}>
                                {answer === quiz?.questions?.[index]?.correctAnswer ? '✓ Correct' : '✗ Incorrect'}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No answer data available</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-1">
                      Provide Feedback
                    </label>
                    <textarea
                      id="feedback"
                      rows="4"
                      value={feedback}
                      onChange={(e) => setFeedback(e.target.value)}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Enter feedback for the student..."
                    ></textarea>
                  </div>
                </div>
                
                <div className="px-6 py-3 bg-gray-50 text-right">
                  <button
                    type="button"
                    onClick={() => setSelectedSubmission(null)}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 mr-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => handleFeedbackSubmit(selectedSubmission.id)}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Submit Feedback
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
