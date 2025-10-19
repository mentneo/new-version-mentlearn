import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/firebase.js';
import { useAuth } from '../../contexts/AuthContext.js';
import { FiCalendar, FiClock, FiAlertCircle, FiCheckCircle, FiFileText, FiFilter, FiSearch, FiChevronRight, FiX, FiChevronDown, FiUpload } from 'react-icons/fi/index.js';
import { motion } from 'framer-motion';

export default function LearnIQAssignments() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  
  // Fetch assignments and courses
  useEffect(() => {
    const fetchAssignments = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        
        // Fetch all assignments for the student
        // Note: Try with orderBy first, if it fails due to missing index, fetch without ordering
        let assignmentsQuery;
        let assignmentsSnapshot;
        
        try {
          // Try with orderBy (requires composite index)
          assignmentsQuery = query(
            collection(db, "assignments"),
            where("studentIds", "array-contains", currentUser.uid),
            orderBy("dueDate")
          );
          assignmentsSnapshot = await getDocs(assignmentsQuery);
        } catch (indexError) {
          console.log("Composite index not available, fetching without orderBy:", indexError);
          // Fallback: fetch without orderBy
          assignmentsQuery = query(
            collection(db, "assignments"),
            where("studentIds", "array-contains", currentUser.uid)
          );
          assignmentsSnapshot = await getDocs(assignmentsQuery);
        }
        
        console.log("Fetched assignments count:", assignmentsSnapshot.docs.length);
        
        // Create a set of course IDs to fetch course details
        const courseIds = new Set();
        
        // Process assignment data
        const assignmentsData = await Promise.all(
          assignmentsSnapshot.docs.map(async (docSnapshot) => {
            const data = docSnapshot.data();
            console.log("Assignment data:", docSnapshot.id, data);
            courseIds.add(data.courseId);
            
            // Check if assignment is submitted
            let submissionData = null;
            
            try {
              const submissionsQuery = query(
                collection(db, "submissions"),
                where("assignmentId", "==", docSnapshot.id),
                where("studentId", "==", currentUser.uid)
              );
              
              const submissionsSnapshot = await getDocs(submissionsQuery);
              if (!submissionsSnapshot.empty) {
                submissionData = submissionsSnapshot.docs[0].data();
              }
            } catch (submissionError) {
              console.error("Error fetching submission:", submissionError);
            }
            
            // Calculate status
            let status = 'pending';
            const now = new Date();
            
            // Handle both Timestamp and regular date objects
            let dueDate;
            if (data.dueDate) {
              if (data.dueDate.seconds) {
                dueDate = new Date(data.dueDate.seconds * 1000);
              } else if (data.dueDate instanceof Date) {
                dueDate = data.dueDate;
              } else if (typeof data.dueDate === 'string') {
                dueDate = new Date(data.dueDate);
              } else {
                dueDate = new Date(); // Fallback to current date
              }
            } else {
              dueDate = new Date(); // Fallback to current date
            }
            
            if (submissionData) {
              status = 'submitted';
              if (submissionData.grade !== undefined) {
                status = 'graded';
              }
            } else if (dueDate < now) {
              status = 'overdue';
            }
            
            return {
              id: docSnapshot.id,
              ...data,
              status,
              submission: submissionData,
              dueDate: dueDate
            };
          })
        );
        
        // Sort by due date manually if we didn't use orderBy
        assignmentsData.sort((a, b) => a.dueDate - b.dueDate);
        
        console.log("Processed assignments:", assignmentsData);
        setAssignments(assignmentsData);
        
        // Fetch course details
        const coursesData = [];
        for (const courseId of courseIds) {
          try {
            const courseDoc = await getDoc(doc(db, "courses", courseId));
            if (courseDoc.exists()) {
              coursesData.push({
                id: courseDoc.id,
                ...courseDoc.data()
              });
            }
          } catch (courseError) {
            console.error("Error fetching course:", courseId, courseError);
          }
        }
        
        console.log("Fetched courses:", coursesData);
        setCourses(coursesData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching assignments:", error);
        setLoading(false);
      }
    };
    
    fetchAssignments();
  }, [currentUser]);
  
  // Filter and search assignments
  const filteredAssignments = assignments.filter(assignment => {
    // Filter by status
    if (filterStatus !== 'all' && assignment.status !== filterStatus) {
      return false;
    }
    
    // Filter by course
    if (filterCourse !== 'all' && assignment.courseId !== filterCourse) {
      return false;
    }
    
    // Search by title or description
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return (
        assignment.title?.toLowerCase().includes(query) ||
        assignment.description?.toLowerCase().includes(query) ||
        assignment.courseName?.toLowerCase().includes(query)
      );
    }
    
    return true;
  });
  
  // Format date for display
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };
  
  // Calculate days remaining or overdue
  const getDaysRemaining = (dueDate) => {
    const now = new Date();
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `${Math.abs(diffDays)} days overdue`;
    } else if (diffDays === 0) {
      return "Due today";
    } else if (diffDays === 1) {
      return "Due tomorrow";
    } else {
      return `${diffDays} days left`;
    }
  };
  
  // Get status badge color
  const getStatusColor = (status) => {
    switch (status) {
      case 'submitted':
        return 'bg-yellow-100 text-yellow-800';
      case 'graded':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'pending':
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };
  
  // Get status icon
  const StatusIcon = ({ status }) => {
    switch (status) {
      case 'submitted':
        return <FiUpload size={16} className="text-yellow-500" />;
      case 'graded':
        return <FiCheckCircle size={16} className="text-green-500" />;
      case 'overdue':
        return <FiAlertCircle size={16} className="text-red-500" />;
      case 'pending':
      default:
        return <FiClock size={16} className="text-blue-500" />;
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Assignments</h1>
        <p className="mt-1 text-sm text-gray-500">
          View and manage all your course assignments
        </p>
      </div>

      {/* Google Drive Submission Section */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-200 rounded-xl shadow-sm mb-6 overflow-hidden">
        <div className="p-6">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-blue-600 text-white">
                <FiUpload size={24} />
              </div>
            </div>
            <div className="ml-4 flex-1">
              <h3 className="text-lg font-semibold text-gray-900">Submit Your Assignments</h3>
              <p className="mt-1 text-sm text-gray-600">
                Upload your completed assignments to our Google Drive folder. All submissions are organized and reviewed by your instructors.
              </p>
              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <a
                  href="https://drive.google.com/drive/folders/1HSJata1zk7DVCefLGJYKaWei-CEriZd4?usp=share_link"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors"
                >
                  <FiUpload size={18} className="mr-2" />
                  Upload to Google Drive
                  <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                <a
                  href="https://drive.google.com/drive/folders/1HSJata1zk7DVCefLGJYKaWei-CEriZd4?usp=share_link"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center px-6 py-3 border border-blue-300 text-sm font-medium rounded-lg text-blue-700 bg-white hover:bg-blue-50 transition-colors"
                >
                  View Submissions Folder
                </a>
              </div>
              <div className="mt-3 flex items-start">
                <FiAlertCircle size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="ml-2 text-xs text-gray-600">
                  <strong>Important:</strong> Please name your files as "YourName_AssignmentTitle_Date" (e.g., JohnDoe_Module1Assignment_2025-10-19) for easy identification.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Filters and search */}
      <div className="bg-white shadow rounded-xl mb-6">
        <div className="p-4 sm:p-6 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <FiSearch size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search assignments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full rounded-md border border-gray-300 bg-white py-2 pl-10 pr-3 text-sm placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
          </div>
          
          <div className="relative">
            <button
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              onClick={() => setFilterMenuOpen(!filterMenuOpen)}
            >
              <FiFilter size={16} className="mr-2 -ml-1" />
              Filters
              <FiChevronDown size={16} className="ml-2 -mr-1" />
            </button>
            
            {filterMenuOpen && (
              <div className="origin-top-right absolute right-0 mt-2 w-64 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                <div className="py-1" role="none">
                  <div className="px-4 py-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="all">All statuses</option>
                      <option value="pending">Pending</option>
                      <option value="submitted">Submitted</option>
                      <option value="graded">Graded</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </div>
                  
                  <div className="px-4 py-2">
                    <label className="block text-xs font-medium text-gray-700 mb-1">Course</label>
                    <select
                      value={filterCourse}
                      onChange={(e) => setFilterCourse(e.target.value)}
                      className="block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="all">All courses</option>
                      {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.title}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="px-4 py-2 border-t border-gray-100">
                    <button
                      className="text-xs text-blue-600 hover:text-blue-500"
                      onClick={() => {
                        setFilterStatus('all');
                        setFilterCourse('all');
                      }}
                    >
                      Reset filters
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
        
        {/* Filter pills */}
        {(filterStatus !== 'all' || filterCourse !== 'all') && (
          <div className="px-6 pb-4 flex flex-wrap gap-2">
            {filterStatus !== 'all' && (
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Status: {filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                <button 
                  onClick={() => setFilterStatus('all')}
                  className="ml-1 inline-flex"
                >
                  <FiX size={12} />
                </button>
              </div>
            )}
            
            {filterCourse !== 'all' && (
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Course: {courses.find(c => c.id === filterCourse)?.title || filterCourse}
                <button 
                  onClick={() => setFilterCourse('all')}
                  className="ml-1 inline-flex"
                >
                  <FiX size={12} />
                </button>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Assignments list */}
      <div className="bg-white shadow rounded-xl">
        {loading ? (
          <div className="p-6 flex justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="p-6 text-center">
            <FiFileText size={48} className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No assignments found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchQuery || filterStatus !== 'all' || filterCourse !== 'all' ? 
                "Try adjusting your search filters to find what you're looking for." :
                "You don't have any assignments yet."}
            </p>
          </div>
        ) : (
          <div className="overflow-hidden">
            <ul role="list" className="divide-y divide-gray-200">
              {filteredAssignments.map((assignment) => {
                // Find the course for this assignment
                const course = courses.find(c => c.id === assignment.courseId);
                
                return (
                  <motion.li
                    key={assignment.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="block hover:bg-gray-50">
                      <div className="px-4 py-4 sm:px-6">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center flex-1">
                            <div className="flex-shrink-0 mr-4">
                              <div className={`p-2 rounded-full ${
                                assignment.status === 'submitted' ? 'bg-yellow-100' :
                                assignment.status === 'graded' ? 'bg-green-100' :
                                assignment.status === 'overdue' ? 'bg-red-100' :
                                'bg-blue-100'
                              }`}>
                                <StatusIcon status={assignment.status} />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {assignment.title}
                              </p>
                              <p className="mt-1 text-xs text-gray-500 truncate">
                                {course?.title || "Unknown Course"}
                              </p>
                            </div>
                          </div>
                          
                          <div className="ml-2 flex items-center gap-2">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                              {assignment.status.charAt(0).toUpperCase() + assignment.status.slice(1)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="mt-2 sm:flex sm:justify-between sm:items-center">
                          <div className="sm:flex sm:items-center gap-4">
                            {assignment.type && (
                              <p className="flex items-center text-xs text-gray-500">
                                <FiFileText size={12} className="mr-1.5" />
                                {assignment.type.charAt(0).toUpperCase() + assignment.type.slice(1)}
                              </p>
                            )}
                            <div className="mt-2 flex items-center text-xs text-gray-500 sm:mt-0">
                              <FiCalendar size={12} className="mr-1.5" />
                              <p>
                                Due {formatDate(assignment.dueDate)}
                                <span className={`ml-2 font-medium ${
                                  assignment.status === 'overdue' ? 'text-red-600' : 
                                  new Date(assignment.dueDate) - new Date() < 24 * 60 * 60 * 1000 ? 'text-yellow-600' : 'text-gray-600'
                                }`}>
                                  {getDaysRemaining(assignment.dueDate)}
                                </span>
                              </p>
                            </div>
                          </div>
                          
                          <div className="mt-3 sm:mt-0 flex items-center gap-2">
                            {assignment.status !== 'submitted' && assignment.status !== 'graded' && (
                              <a
                                href="https://drive.google.com/drive/folders/1HSJata1zk7DVCefLGJYKaWei-CEriZd4?usp=share_link"
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
                              >
                                <FiUpload size={14} className="mr-1" />
                                Submit
                              </a>
                            )}
                            <Link
                              to={`/student/student-dashboard/assignments/${assignment.id}`}
                              className="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-500"
                            >
                              View Details
                              <FiChevronRight size={14} className="ml-1" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.li>
                );
              })}
            </ul>
          </div>
        )}
      </div>
      
      {/* Calendar View Toggle - Future feature */}
      <div className="mt-6 flex items-center justify-center">
        <button
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <FiCalendar size={16} className="mr-2 -ml-1" />
          Calendar View
        </button>
        <p className="ml-2 text-xs text-gray-500">Coming Soon</p>
      </div>
    </div>
  );
}