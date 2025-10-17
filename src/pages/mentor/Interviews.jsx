import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { collection, query, where, getDocs, deleteDoc, doc, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/firebase.js';
import { useAuth } from '../../contexts/AuthContext.js';
import Navbar from '../../components/mentor/Navbar';
import { FaEye, FaEdit, FaTrash, FaUserPlus } from 'react-icons/fa/index.esm.js';

export default function Interviews() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  useEffect(() => {
    async function fetchInterviews() {
      try {
        setLoading(true);
        
        // Query interviews created by this mentor
        const interviewsQuery = query(
          collection(db, "interviewPreparations"),
          where("creatorId", "==", currentUser.uid),
          orderBy("createdAt", "desc")
        );
        
        const interviewDocs = await getDocs(interviewsQuery);
        
        const interviewsData = [];
        interviewDocs.forEach(doc => {
          interviewsData.push({
            id: doc.id,
            ...doc.data(),
            createdAt: doc.data().createdAt?.toDate() || new Date()
          });
        });
        
        setInterviews(interviewsData);
      } catch (err) {
        console.error("Error fetching interviews:", err);
        setError("Failed to load your interview preparations.");
      } finally {
        setLoading(false);
      }
    }

    fetchInterviews();
  }, [currentUser]);

  const handleDeleteConfirm = (interviewId) => {
    setDeleteConfirm(interviewId);
  };

  const handleDelete = async (interviewId) => {
    try {
      // Delete the interview
      await deleteDoc(doc(db, "interviewPreparations", interviewId));
      
      // Remove from state
      setInterviews(interviews.filter(interview => interview.id !== interviewId));
      
      // Clear confirmation
      setDeleteConfirm(null);
    } catch (err) {
      console.error("Error deleting interview:", err);
      setError("Failed to delete interview preparation.");
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric', 
      month: 'short', 
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Interview Preparations</h1>
            <button
              type="button"
              onClick={() => navigate('/mentor/interviews/create')}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Create New Interview
            </button>
          </div>
          
          {error && (
            <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          {loading ? (
            <div className="mt-8 flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
          ) : interviews.length === 0 ? (
            <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">No interview preparations yet</h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>Get started by creating your first interview preparation.</p>
                </div>
                <div className="mt-5">
                  <Link
                    to="/mentor/interviews/create"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Create Interview
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-8 flex flex-col">
              <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                  <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Title
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Created
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Document
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
                        {interviews.map((interview) => (
                          <tr key={interview.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm font-medium text-gray-900">
                                {interview.title}
                              </div>
                              <div className="text-sm text-gray-500">
                                {interview.description ? (
                                  interview.description.length > 50 
                                    ? interview.description.substring(0, 50) + '...' 
                                    : interview.description
                                ) : ''}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {formatDate(interview.createdAt)}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {interview.documentUrl ? (
                                <a 
                                  href={interview.documentUrl} 
                                  target="_blank" 
                                  rel="noopener noreferrer"
                                  className="text-indigo-600 hover:text-indigo-900"
                                >
                                  {interview.documentName || 'View Document'}
                                </a>
                              ) : (
                                'No document'
                              )}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                {interview.status || 'Active'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              {deleteConfirm === interview.id ? (
                                <div className="flex justify-end items-center space-x-2">
                                  <span className="text-sm text-gray-500">Confirm?</span>
                                  <button 
                                    onClick={() => handleDelete(interview.id)}
                                    className="text-red-600 hover:text-red-900"
                                  >
                                    Yes
                                  </button>
                                  <button 
                                    onClick={() => setDeleteConfirm(null)}
                                    className="text-gray-600 hover:text-gray-900"
                                  >
                                    No
                                  </button>
                                </div>
                              ) : (
                                <div className="flex justify-end space-x-3">
                                  <Link
                                    to={`/mentor/interviews/${interview.id}`}
                                    className="text-indigo-600 hover:text-indigo-900"
                                    title="View"
                                  >
                                    <FaEye />
                                  </Link>
                                  <Link
                                    to={`/mentor/interviews/${interview.id}/edit`}
                                    className="text-blue-600 hover:text-blue-900"
                                    title="Edit"
                                  >
                                    <FaEdit />
                                  </Link>
                                  <button
                                    onClick={() => navigate(`/mentor/assign-to-students?type=interview&id=${interview.id}`)}
                                    className="text-green-600 hover:text-green-900"
                                    title="Assign to students"
                                  >
                                    <FaUserPlus />
                                  </button>
                                  <button
                                    onClick={() => handleDeleteConfirm(interview.id)}
                                    className="text-red-600 hover:text-red-900"
                                    title="Delete"
                                  >
                                    <FaTrash />
                                  </button>
                                </div>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
