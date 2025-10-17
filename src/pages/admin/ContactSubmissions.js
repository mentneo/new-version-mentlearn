import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.js';
import { collection, query, orderBy, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase.js';
import { FaEnvelope, FaEnvelopeOpen, FaCheck, FaExclamationTriangle } from 'react-icons/fa/index.esm.js';

const ContactSubmissions = () => {
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSubmission, setSelectedSubmission] = useState(null);

  // Protect route - only admin access
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
    } else if (userRole !== 'admin') {
      navigate('/dashboard');
    }
  }, [currentUser, userRole, navigate]);

  // Fetch contact submissions
  useEffect(() => {
    if (currentUser && userRole === 'admin') {
      setLoading(true);
      const q = query(collection(db, "contactSubmissions"), orderBy("createdAt", "desc"));
      
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const submissionData = [];
        snapshot.forEach((doc) => {
          submissionData.push({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate()
          });
        });
        setSubmissions(submissionData);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching contact submissions:", error);
        setLoading(false);
      });
      
      return () => unsubscribe();
    }
  }, [currentUser, userRole]);

  // Handle marking as read
  const markAsRead = async (id) => {
    try {
      await updateDoc(doc(db, "contactSubmissions", id), {
        status: 'read'
      });
    } catch (error) {
      console.error("Error updating submission status:", error);
    }
  };

  // Handle marking as responded
  const markAsResponded = async (id) => {
    try {
      await updateDoc(doc(db, "contactSubmissions", id), {
        status: 'responded'
      });
    } catch (error) {
      console.error("Error updating submission status:", error);
    }
  };

  // Get status badge
  const getStatusBadge = (status) => {
    switch (status) {
      case 'new':
        return <span className="px-2 py-1 text-xs font-bold rounded-full bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200">New</span>;
      case 'read':
        return <span className="px-2 py-1 text-xs font-bold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">Read</span>;
      case 'responded':
        return <span className="px-2 py-1 text-xs font-bold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">Responded</span>;
      default:
        return null;
    }
  };

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleString();
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-slate-900">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-8">
          Contact Form Submissions
        </h1>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
          </div>
        ) : (
          <div className="bg-white dark:bg-slate-800 shadow overflow-hidden rounded-lg">
            <div className="flex">
              {/* Submissions List */}
              <div className="w-1/3 border-r border-gray-200 dark:border-gray-700">
                <ul className="divide-y divide-gray-200 dark:divide-gray-700">
                  {submissions.length === 0 ? (
                    <li className="px-6 py-8 text-center text-gray-500 dark:text-gray-400">
                      <FaExclamationTriangle className="mx-auto h-12 w-12 mb-4 text-gray-400 dark:text-gray-500" />
                      <p>No contact form submissions yet</p>
                    </li>
                  ) : (
                    submissions.map((submission) => (
                      <li 
                        key={submission.id}
                        className={`px-4 py-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-slate-700 ${selectedSubmission?.id === submission.id ? 'bg-gray-100 dark:bg-slate-700' : ''}`}
                        onClick={() => {
                          setSelectedSubmission(submission);
                          if (submission.status === 'new') {
                            markAsRead(submission.id);
                          }
                        }}
                      >
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                              {submission.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                              {submission.subject || 'No subject'}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                              {formatDate(submission.createdAt)}
                            </p>
                          </div>
                          <div className="ml-4">
                            {submission.status === 'new' ? (
                              <FaEnvelope className="h-4 w-4 text-red-600 dark:text-red-400" />
                            ) : submission.status === 'read' ? (
                              <FaEnvelopeOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            ) : (
                              <FaCheck className="h-4 w-4 text-green-600 dark:text-green-400" />
                            )}
                          </div>
                        </div>
                        <div className="mt-2">
                          {getStatusBadge(submission.status)}
                        </div>
                      </li>
                    ))
                  )}
                </ul>
              </div>

              {/* Submission Detail */}
              <div className="w-2/3 p-6">
                {!selectedSubmission ? (
                  <div className="h-full flex items-center justify-center">
                    <p className="text-gray-500 dark:text-gray-400 text-center">
                      Select a submission from the list to view details
                    </p>
                  </div>
                ) : (
                  <div>
                    <div className="flex justify-between items-center mb-6">
                      <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                        {selectedSubmission.subject || 'No subject'}
                      </h2>
                      <div>
                        {getStatusBadge(selectedSubmission.status)}
                      </div>
                    </div>

                    <div className="bg-gray-50 dark:bg-slate-700 p-4 rounded-lg mb-6">
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400">From:</p>
                        <p className="text-base text-gray-900 dark:text-white">
                          {selectedSubmission.name} ({selectedSubmission.email})
                        </p>
                      </div>
                      <div className="mb-4">
                        <p className="text-sm text-gray-500 dark:text-gray-400">Date:</p>
                        <p className="text-base text-gray-900 dark:text-white">
                          {formatDate(selectedSubmission.createdAt)}
                        </p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Message:</p>
                      <div className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-gray-700 p-4 rounded-lg">
                        <p className="text-base text-gray-900 dark:text-white whitespace-pre-wrap">
                          {selectedSubmission.message}
                        </p>
                      </div>
                    </div>

                    <div className="flex justify-between">
                      <div>
                        <a 
                          href={`mailto:${selectedSubmission.email}?subject=RE: ${selectedSubmission.subject || 'Your message to Mentneo'}`}
                          className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none"
                          onClick={() => markAsResponded(selectedSubmission.id)}
                        >
                          Reply via Email
                        </a>
                      </div>
                      <div className="flex space-x-2">
                        {selectedSubmission.status !== 'responded' && (
                          <button
                            onClick={() => markAsResponded(selectedSubmission.id)}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200 dark:bg-indigo-900 dark:text-indigo-200 dark:hover:bg-indigo-800 focus:outline-none"
                          >
                            Mark as Responded
                          </button>
                        )}
                        {selectedSubmission.status === 'new' && (
                          <button
                            onClick={() => markAsRead(selectedSubmission.id)}
                            className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:hover:bg-blue-800 focus:outline-none"
                          >
                            Mark as Read
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContactSubmissions;
