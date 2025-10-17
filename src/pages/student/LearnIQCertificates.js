import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiAward, FiCalendar, FiUser, FiBook, FiShare2, FiDownload, FiArrowLeft, FiLink, FiMail } from 'react-icons/fi/index.js';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext.js';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase.js';

export default function LearnIQCertificates() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [certificates, setCertificates] = useState([]);
  const [selectedCertificate, setSelectedCertificate] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [coursesMap, setCoursesMap] = useState({});
  
  useEffect(() => {
    const fetchCertificates = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        
        // Fetch certificates
        const certificatesQuery = query(
          collection(db, "certificates"),
          where("studentId", "==", currentUser.uid)
        );
        
        const certificatesSnapshot = await getDocs(certificatesQuery);
        
        // Extract course IDs to fetch course details
        const courseIds = new Set();
        const certificatesData = certificatesSnapshot.docs.map(doc => {
          const data = doc.data();
          if (data.courseId) courseIds.add(data.courseId);
          return { id: doc.id, ...data };
        });
        
        // Fetch course details
        const coursesData = {};
        for (const courseId of courseIds) {
          const courseDoc = await getDoc(doc(db, "courses", courseId));
          if (courseDoc.exists()) {
            coursesData[courseId] = courseDoc.data();
          }
        }
        
        setCoursesMap(coursesData);
        setCertificates(certificatesData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching certificates:", error);
        setLoading(false);
      }
    };
    
    fetchCertificates();
  }, [currentUser]);
  
  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp instanceof Date ? timestamp : timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };
  
  // Handle certificate sharing
  const handleShare = (certificate) => {
    setSelectedCertificate(certificate);
    setShowShareModal(true);
  };
  
  // Handle certificate viewing
  const handleView = (certificate) => {
    setSelectedCertificate(certificate);
    setShowViewModal(true);
  };
  
  // Copy certificate link to clipboard
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text)
      .then(() => {
        alert('Certificate link copied to clipboard!');
      })
      .catch(err => {
        console.error('Failed to copy: ', err);
      });
  };
  
  return (
    <div className="max-w-7xl mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Certificates</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and share your achievements
        </p>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : certificates.length === 0 ? (
        <div className="bg-white shadow rounded-xl p-8 text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-yellow-100">
            <FiAward size={32} className="text-yellow-600" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No Certificates Yet</h3>
          <p className="mt-2 text-sm text-gray-500">
            Complete courses to earn certificates that showcase your skills and knowledge.
          </p>
          <div className="mt-6">
            <Link
              to="/student/courses"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Browse Courses
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates.map((certificate) => (
            <motion.div
              key={certificate.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white shadow rounded-xl overflow-hidden"
            >
              {/* Certificate header with gradient background */}
              <div className="h-24 bg-gradient-to-r from-blue-500 to-indigo-600 relative flex items-center justify-center">
                <FiAward size={40} className="text-white opacity-80" />
                <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-white to-transparent"></div>
              </div>
              
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  {certificate.title || "Certificate of Completion"}
                </h3>
                
                <p className="text-sm text-gray-600 mb-4">
                  {coursesMap[certificate.courseId]?.title || certificate.courseName || "Course"}
                </p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-start">
                    <FiCalendar size={16} className="text-gray-500 mt-0.5 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">Issued On</p>
                      <p className="text-sm text-gray-800">{formatDate(certificate.issuedDate)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <FiUser size={16} className="text-gray-500 mt-0.5 mr-2" />
                    <div>
                      <p className="text-xs text-gray-500">Issued To</p>
                      <p className="text-sm text-gray-800">{currentUser?.displayName || "Student"}</p>
                    </div>
                  </div>
                  
                  {certificate.instructor && (
                    <div className="flex items-start">
                      <FiUser size={16} className="text-gray-500 mt-0.5 mr-2" />
                      <div>
                        <p className="text-xs text-gray-500">Instructor</p>
                        <p className="text-sm text-gray-800">{certificate.instructor}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="flex items-center justify-between mt-6">
                  <button
                    onClick={() => handleView(certificate)}
                    className="px-3 py-2 text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    View Certificate
                  </button>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => handleShare(certificate)}
                      className="p-2 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      title="Share"
                    >
                      <FiShare2 size={18} />
                    </button>
                    
                    <a
                      href={certificate.certificateUrl}
                      download
                      className="p-2 rounded-full text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                      title="Download"
                    >
                      <FiDownload size={18} />
                    </a>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}
      
      {/* Share Modal */}
      {showShareModal && selectedCertificate && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowShareModal(false)}></div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                    <FiShare2 className="h-6 w-6 text-blue-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">Share Certificate</h3>
                    <div className="mt-4">
                      <p className="text-sm text-gray-500 mb-4">Share your achievement with your network</p>
                      
                      <div className="flex justify-around mb-6">
                        <button className="p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700" title="Share on LinkedIn">
                          <FiShare2 size={20} />
                        </button>
                        <button className="p-3 rounded-full bg-blue-400 text-white hover:bg-blue-500" title="Share on Twitter">
                          <FiShare2 size={20} />
                        </button>
                        <button className="p-3 rounded-full bg-blue-800 text-white hover:bg-blue-900" title="Share on Facebook">
                          <FiShare2 size={20} />
                        </button>
                        <button className="p-3 rounded-full bg-red-500 text-white hover:bg-red-600" title="Share via Email">
                          <FiMail size={20} />
                        </button>
                      </div>
                      
                      <div className="relative">
                        <input
                          type="text"
                          readOnly
                          value={selectedCertificate.certificateUrl || "https://mentneo.com/certificate/verify/" + selectedCertificate.id}
                          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                        <button
                          onClick={() => copyToClipboard(selectedCertificate.certificateUrl || "https://mentneo.com/certificate/verify/" + selectedCertificate.id)}
                          className="absolute inset-y-0 right-0 px-3 flex items-center bg-gray-100 hover:bg-gray-200 rounded-r-md border-l border-gray-300"
                        >
                          Copy
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowShareModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* View Certificate Modal */}
      {showViewModal && selectedCertificate && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowViewModal(false)}></div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="flex justify-between items-center mb-4">
                  <button
                    onClick={() => setShowViewModal(false)}
                    className="p-1 rounded-full hover:bg-gray-100"
                  >
                    <FiArrowLeft size={20} />
                  </button>
                  
                  <div className="flex space-x-2">
                    <a
                      href={selectedCertificate.certificateUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-md text-blue-600 hover:bg-blue-50 flex items-center"
                    >
                      <FiLink size={16} className="mr-1" />
                      <span className="text-sm">Open in New Tab</span>
                    </a>
                    
                    <a
                      href={selectedCertificate.certificateUrl}
                      download
                      className="p-2 rounded-md text-blue-600 hover:bg-blue-50 flex items-center"
                    >
                      <FiDownload size={16} className="mr-1" />
                      <span className="text-sm">Download</span>
                    </a>
                  </div>
                </div>
                
                {/* Certificate Preview */}
                <div className="bg-gray-100 rounded-lg p-1">
                  <div className="w-full aspect-[1.4] bg-white rounded shadow-inner flex items-center justify-center">
                    {selectedCertificate.certificateUrl ? (
                      <iframe
                        src={selectedCertificate.certificateUrl}
                        title="Certificate"
                        className="w-full h-full rounded"
                      />
                    ) : (
                      <div className="text-center p-8">
                        <FiAward size={64} className="mx-auto text-yellow-500 mb-4" />
                        <h2 className="text-2xl font-bold text-gray-800 mb-2">Certificate of Completion</h2>
                        <p className="text-lg text-gray-600 mb-4">This certifies that</p>
                        <p className="text-xl font-bold text-gray-800 mb-4">{currentUser?.displayName || "Student"}</p>
                        <p className="text-lg text-gray-600 mb-2">has successfully completed</p>
                        <p className="text-xl font-bold text-gray-800 mb-4">
                          {coursesMap[selectedCertificate.courseId]?.title || selectedCertificate.courseName || "Course"}
                        </p>
                        <p className="text-md text-gray-600 mb-4">Issued on {formatDate(selectedCertificate.issuedDate)}</p>
                        <div className="flex justify-center items-center">
                          <div className="h-16 w-32 border-b border-gray-300 mx-4 flex items-center justify-center">
                            <span className="text-sm text-gray-400">Instructor Signature</span>
                          </div>
                          <div className="h-16 w-32 border-b border-gray-300 mx-4 flex items-center justify-center">
                            <span className="text-sm text-gray-400">Institution</span>
                          </div>
                        </div>
                        <p className="mt-6 text-xs text-gray-500">
                          Verify this certificate at: mentneo.com/verify/{selectedCertificate.id}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowViewModal(false)}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}