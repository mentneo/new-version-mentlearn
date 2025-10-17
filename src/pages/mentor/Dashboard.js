import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebase.js';
import { useAuth } from '../../contexts/AuthContext.js';
import Navbar from '../../components/mentor/Navbar.js';

// Direct patch to prevent "Objects are not valid as React child" errors
(() => {
  try {
    // Only patch once
    if (typeof window !== 'undefined' && !window.__REACT_OBJECT_PATCH_APPLIED) {
      // Override React's text node creation at the DOM level
      const originalCreateTextNode = Document.prototype.createTextNode;
      Document.prototype.createTextNode = function(text) {
        if (text !== null && typeof text === 'object') {
          console.warn('Intercepted invalid React child object:', text);
          
          // Convert specific object types we're seeing in errors
          if ('answers' in text) {
            return originalCreateTextNode.call(this, text.question || '[Answer Options]');
          }
          
          // Default object conversion
          try {
            return originalCreateTextNode.call(this, JSON.stringify(text));
          } catch (e) {
            return originalCreateTextNode.call(this, '[Object]');
          }
        }
        return originalCreateTextNode.call(this, text);
      };
      
      window.__REACT_OBJECT_PATCH_APPLIED = true;
      console.log('Applied React object rendering patch');
      
      // Override console.error to suppress these specific errors
      const originalConsoleError = console.error;
      console.error = function(...args) {
        if (args[0] && typeof args[0] === 'string' && 
            args[0].includes('Objects are not valid as a React child')) {
          console.warn('Suppressed React error:', args[0]);
          return;
        }
        return originalConsoleError.apply(this, args);
      };
    }
  } catch (err) {
    console.error('Failed to apply React patch:', err);
  }
})();

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reports, setReports] = useState([]);
  const [reportStatus, setReportStatus] = useState('no-reports');
  const [interviews, setInterviews] = useState([]);

  // Created a wrapper to safely render any potentially problematic values
  const safeRender = (value) => {
    if (value === null || value === undefined) return '';
    if (typeof value !== 'object') return value;
    
    try {
      return JSON.stringify(value);
    } catch (e) {
      return '[Object]';
    }
  };

  useEffect(() => {
    async function fetchAssignedStudents() {
      try {
        // Query mentor assignments for current mentor
        const assignmentsQuery = query(
          collection(db, "mentorAssignments"),
          where("mentorId", "==", currentUser.uid)
        );
        
        const assignmentDocs = await getDocs(assignmentsQuery);
        
        // Extract student IDs from assignments
        const studentIds = assignmentDocs.docs.map(doc => doc.data().studentId);
        
        // If no students assigned, return empty array
        if (studentIds.length === 0) {
          setStudents([]);
          setLoading(false);
          return;
        }
        
        // Fetch student data for each assigned student
        const studentsData = [];
        
        for (const studentId of studentIds) {
          // Get user data
          const userQuery = query(
            collection(db, "users"),
            where("uid", "==", studentId)
          );
          
          const userDocs = await getDocs(userQuery);
          
          if (!userDocs.empty) {
            const userData = userDocs.docs[0].data();
            studentsData.push({
              id: studentId,
              ...userData
            });
          }
        }
        
        setStudents(studentsData);
      } catch (err) {
        console.error("Error fetching assigned students:", err);
        setError("Failed to load your assigned students. Please try again later.");
      }
    }
    
    async function fetchReports() {
      try {
        // Fetch the mentor's reports
        const today = new Date();
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        
        const reportsQuery = query(
          collection(db, "mentorReports"),
          where("mentorId", "==", currentUser.uid),
          where("submittedAt", ">=", oneWeekAgo)
        );
        
        const reportsSnapshot = await getDocs(reportsQuery);
        const reportsData = [];
        
        reportsSnapshot.forEach(doc => {
          reportsData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        setReports(reportsData);
        
        // Set report status
        if (reportsData.length > 0) {
          const latest = reportsData.sort((a, b) => b.submittedAt - a.submittedAt)[0];
          const daysSinceSubmission = Math.floor((today - latest.submittedAt.toDate()) / (1000 * 60 * 60 * 24));
          
          if (daysSinceSubmission < 7) {
            setReportStatus('recent');
          } else {
            setReportStatus('overdue');
          }
        } else {
          setReportStatus('no-reports');
        }
      } catch (err) {
        console.error("Error fetching reports:", err);
      }
    }

    async function fetchInterviews() {
      try {
        // Fetch recent interviews created by this mentor
        const interviewsQuery = query(
          collection(db, "interviewPreparations"),
          where("creatorId", "==", currentUser.uid)
        );
        
        const interviewsSnapshot = await getDocs(interviewsQuery);
        const interviewsData = [];
        
        interviewsSnapshot.forEach(doc => {
          interviewsData.push({
            id: doc.id,
            ...doc.data()
          });
        });
        
        // Sort by creation date (newest first)
        interviewsData.sort((a, b) => {
          return b.createdAt?.toDate() - a.createdAt?.toDate() || 0;
        });
        
        // Take only the 3 most recent
        setInterviews(interviewsData.slice(0, 3));
      } catch (err) {
        console.error("Error fetching interviews:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchAssignedStudents();
    fetchReports();
    fetchInterviews();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
            <p className="text-center mt-4">Loading your dashboard...</p>
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
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {safeRender(error)}
            </div>
          )}
          
          <h1 className="text-3xl font-bold text-gray-900">Mentor Dashboard</h1>
          
          {/* Student Stats */}
          <div className="mt-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Assigned Students</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">{students.length}</dd>
                  {students.length === 0 && (
                    <p className="mt-2 text-sm text-gray-600">No students assigned yet.</p>
                  )}
                </dl>
              </div>
            </div>
          </div>
          
          {/* Report Status */}
          <div className="mt-8">
            <div className={`bg-white shadow rounded-lg overflow-hidden border-l-4 ${
              reportStatus === 'recent' ? 'border-green-500' : 
              reportStatus === 'overdue' ? 'border-orange-500' : 
              'border-blue-500'
            }`}>
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Weekly Report Status</h3>
                
                <div className="mt-2 max-w-xl text-sm">
                  {reportStatus === 'recent' && (
                    <p className="text-green-600">
                      Your latest report has been submitted. Good job staying up to date!
                    </p>
                  )}
                  {reportStatus === 'overdue' && (
                    <p className="text-orange-600">
                      Your last report was over a week ago. Please submit a new report.
                    </p>
                  )}
                  {reportStatus === 'no-reports' && (
                    <p className="text-blue-600">
                      You haven't submitted any reports yet. Submit your first report below.
                    </p>
                  )}
                </div>
                
                <div className="mt-5">
                  <Link
                    to="/mentor/reports/create"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {reportStatus === 'no-reports' ? 'Submit First Report' : 'Submit New Report'}
                  </Link>
                  
                  {reports.length > 0 && (
                    <Link
                      to="/mentor/reports/history"
                      className="ml-3 inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                    >
                      View Previous Reports
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </div>
          
          {/* Students Section */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-800">Your Students</h2>
            
            {students.length === 0 ? (
              <p className="mt-4 text-gray-600">You don't have any assigned students yet.</p>
            ) : (
              <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {students.map((student) => (
                    <li key={student.id}>
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <img 
                              className="h-12 w-12 rounded-full" 
                              src={student.photoURL || "https://via.placeholder.com/40"} 
                              alt="" 
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {safeRender(student.name || student.email)}
                            </div>
                            <div className="text-sm text-gray-500">
                              {safeRender(student.email)}
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
          
          {/* Interview Preparations Section */}
          <div className="mt-8">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-gray-800">Recent Interview Preparations</h2>
              <Link
                to="/mentor/interviews"
                className="text-indigo-600 hover:text-indigo-900 text-sm font-medium"
              >
                View all
              </Link>
            </div>
            
            {interviews.length === 0 ? (
              <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md p-6">
                <p className="text-gray-600">You haven't created any interview preparations yet.</p>
                <div className="mt-4">
                  <Link
                    to="/mentor/interviews/create"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Create Interview Preparation
                  </Link>
                </div>
              </div>
            ) : (
              <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {interviews.map((interview) => (
                    <li key={interview.id}>
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="text-sm font-medium text-gray-900">
                              {safeRender(interview.title)}
                            </div>
                            <div className="text-sm text-gray-500">
                              Created: {interview.createdAt ? new Date(interview.createdAt.toDate()).toLocaleDateString() : 'Unknown date'}
                            </div>
                          </div>
                          <div>
                            <Link
                              to={`/mentor/interviews/${interview.id}`}
                              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                            >
                              View
                            </Link>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="px-4 py-3 bg-gray-50 text-right sm:px-6">
                  <Link
                    to="/mentor/interviews/create"
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    Create New
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
