import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebase.js';
import { useAuth } from '../../contexts/AuthContext.js';
import { Link } from 'react-router-dom';
import { 
  FiCalendar, FiUser, FiBook, FiCheckCircle, FiClock, FiAlertCircle,
  FiExternalLink, FiEdit, FiSearch, FiFilter, FiDownload, FiX
} from 'react-icons/fi/index.js';
import { motion, AnimatePresence } from 'framer-motion';

export default function AssignmentSubmissions() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [submissions, setSubmissions] = useState([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // all, pending, submitted, graded
  const [courseFilter, setCourseFilter] = useState('all');
  const [assignmentFilter, setAssignmentFilter] = useState('all');
  
  // Grading Modal
  const [showGradingModal, setShowGradingModal] = useState(false);
  const [selectedSubmission, setSelectedSubmission] = useState(null);
  const [gradeInput, setGradeInput] = useState('');
  const [feedbackInput, setFeedbackInput] = useState('');
  const [gradingLoading, setGradingLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    fetchAllData();
  }, [currentUser]);

  useEffect(() => {
    applyFilters();
  }, [searchTerm, statusFilter, courseFilter, assignmentFilter, submissions]);

  const fetchAllData = async () => {
    try {
      setLoading(true);
      console.log('Fetching assignment submissions for creator:', currentUser.uid);

      // 1. Fetch courses created by this user
      const coursesQuery = query(
        collection(db, 'courses'),
        where('creatorId', '==', currentUser.uid)
      );
      const coursesSnapshot = await getDocs(coursesQuery);
      const coursesData = coursesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('Found courses:', coursesData.length);
      setCourses(coursesData);

      // 2. Get enrolled students from these courses
      const courseIds = coursesData.map(c => c.id);
      let enrolledStudentIds = [];
      
      if (courseIds.length > 0) {
        // Fetch enrollments for creator's courses
        for (let i = 0; i < courseIds.length; i += 10) {
          const batchIds = courseIds.slice(i, i + 10);
          const enrollmentsQuery = query(
            collection(db, 'enrollments'),
            where('courseId', 'in', batchIds)
          );
          const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
          const batchEnrollments = enrollmentsSnapshot.docs.map(doc => doc.data().studentId);
          enrolledStudentIds = [...enrolledStudentIds, ...batchEnrollments];
        }
      }
      
      // Remove duplicates
      enrolledStudentIds = [...new Set(enrolledStudentIds)];
      console.log('Enrolled students:', enrolledStudentIds.length);

      // 3. Fetch assignments created by this user
      const assignmentsQuery = query(
        collection(db, 'assignments'),
        where('creatorId', '==', currentUser.uid)
      );
      const assignmentsSnapshot = await getDocs(assignmentsQuery);
      const assignmentsData = assignmentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      console.log('Found assignments:', assignmentsData.length);
      setAssignments(assignmentsData);

      if (assignmentsData.length === 0) {
        setLoading(false);
        return;
      }

      // Get assignment IDs
      const assignmentIds = assignmentsData.map(a => a.id);

      // 4. Fetch all submissions for these assignments (batch if more than 10)
      let allSubmissions = [];
      
      for (let i = 0; i < assignmentIds.length; i += 10) {
        const batchIds = assignmentIds.slice(i, i + 10);
        const submissionsQuery = query(
          collection(db, 'submissions'),
          where('assignmentId', 'in', batchIds)
        );
        const submissionsSnapshot = await getDocs(submissionsQuery);
        const batchSubmissions = submissionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        allSubmissions = [...allSubmissions, ...batchSubmissions];
      }

      // Filter submissions to only include enrolled students
      const filteredSubmissions = allSubmissions.filter(submission =>
        enrolledStudentIds.includes(submission.studentId)
      );

      console.log('Found submissions from enrolled students:', filteredSubmissions.length);

      // 5. Fetch student data only for students who submitted
      const studentIds = [...new Set(filteredSubmissions.map(s => s.studentId))];
      const studentsData = [];
      
      for (const studentId of studentIds) {
        const studentDoc = await getDocs(query(collection(db, 'users'), where('uid', '==', studentId)));
        if (!studentDoc.empty) {
          studentsData.push({
            id: studentId,
            ...studentDoc.docs[0].data()
          });
        }
      }
      
      console.log('Found students:', studentsData.length);
      setStudents(studentsData);

      // 6. Combine data for display
      const enrichedSubmissions = filteredSubmissions.map(submission => {
        const assignment = assignmentsData.find(a => a.id === submission.assignmentId);
        const course = coursesData.find(c => c.id === assignment?.courseId);
        const student = studentsData.find(s => s.id === submission.studentId);

        return {
          ...submission,
          assignmentTitle: assignment?.title || 'Unknown Assignment',
          courseTitle: course?.title || 'Unknown Course',
          courseThumbnail: course?.thumbnailUrl || 'https://via.placeholder.com/100',
          studentName: student?.displayName || student?.email || 'Unknown Student',
          studentPhoto: student?.photoURL || 'https://via.placeholder.com/40',
          dueDate: assignment?.dueDate,
          assignmentData: assignment
        };
      });

      setSubmissions(enrichedSubmissions);
      setFilteredSubmissions(enrichedSubmissions);
      setLoading(false);
    } catch (err) {
      console.error('Error fetching submissions:', err);
      setError('Failed to load submissions. Please try again.');
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...submissions];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(sub =>
        sub.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.assignmentTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.courseTitle.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(sub => {
        if (statusFilter === 'pending') return !sub.submittedAt;
        if (statusFilter === 'submitted') return sub.submittedAt && !sub.gradedAt;
        if (statusFilter === 'graded') return sub.gradedAt;
        return true;
      });
    }

    // Course filter
    if (courseFilter !== 'all') {
      filtered = filtered.filter(sub => sub.assignmentData?.courseId === courseFilter);
    }

    // Assignment filter
    if (assignmentFilter !== 'all') {
      filtered = filtered.filter(sub => sub.assignmentId === assignmentFilter);
    }

    setFilteredSubmissions(filtered);
  };

  const handleGradeSubmission = (submission) => {
    setSelectedSubmission(submission);
    setGradeInput(submission.grade || '');
    setFeedbackInput(submission.feedback || '');
    setShowGradingModal(true);
  };

  const submitGrade = async () => {
    if (!gradeInput || gradeInput < 0 || gradeInput > 100) {
      setError('Please enter a valid grade (0-100)');
      return;
    }

    try {
      setGradingLoading(true);
      
      const submissionRef = doc(db, 'submissions', selectedSubmission.id);
      await updateDoc(submissionRef, {
        grade: parseFloat(gradeInput),
        feedback: feedbackInput,
        gradedAt: Timestamp.now(),
        gradedBy: currentUser.uid
      });

      setSuccess('Grade submitted successfully!');
      
      // Update local state
      const updatedSubmissions = submissions.map(sub =>
        sub.id === selectedSubmission.id
          ? { ...sub, grade: parseFloat(gradeInput), feedback: feedbackInput, gradedAt: new Date() }
          : sub
      );
      setSubmissions(updatedSubmissions);
      
      // Close modal
      setTimeout(() => {
        setShowGradingModal(false);
        setSelectedSubmission(null);
        setGradeInput('');
        setFeedbackInput('');
        setSuccess(null);
      }, 2000);
      
    } catch (err) {
      console.error('Error submitting grade:', err);
      setError('Failed to submit grade. Please try again.');
    } finally {
      setGradingLoading(false);
    }
  };

  const getStatusBadge = (submission) => {
    if (submission.gradedAt) {
      return {
        text: 'Graded',
        color: 'bg-green-100 text-green-800',
        icon: FiCheckCircle
      };
    } else if (submission.submittedAt) {
      return {
        text: 'Submitted',
        color: 'bg-yellow-100 text-yellow-800',
        icon: FiClock
      };
    } else {
      return {
        text: 'Pending',
        color: 'bg-gray-100 text-gray-800',
        icon: FiAlertCircle
      };
    }
  };

  const formatDate = (date) => {
    if (!date) return 'N/A';
    const d = date instanceof Date ? date : new Date(date.seconds * 1000);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading submissions...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Assignment Submissions</h1>
          <p className="mt-2 text-sm text-gray-600">
            Review and grade student submissions
          </p>
        </div>

        {/* Error & Success Messages */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start"
            >
              <FiAlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-3" />
              <div className="flex-1">
                <p className="text-sm text-red-800">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="ml-3 text-red-400 hover:text-red-600">
                <FiX size={20} />
              </button>
            </motion.div>
          )}

          {success && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="mb-6 bg-green-50 border border-green-200 rounded-lg p-4 flex items-start"
            >
              <FiCheckCircle className="h-5 w-5 text-green-400 mt-0.5 mr-3" />
              <div className="flex-1">
                <p className="text-sm text-green-800">{success}</p>
              </div>
              <button onClick={() => setSuccess(null)} className="ml-3 text-green-400 hover:text-green-600">
                <FiX size={20} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FiBook className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Submissions</p>
                <p className="text-2xl font-bold text-gray-900">{submissions.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <FiClock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Pending Review</p>
                <p className="text-2xl font-bold text-gray-900">
                  {submissions.filter(s => s.submittedAt && !s.gradedAt).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <FiCheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Graded</p>
                <p className="text-2xl font-bold text-gray-900">
                  {submissions.filter(s => s.gradedAt).length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6">
            <div className="flex items-center">
              <div className="p-3 bg-gray-100 rounded-lg">
                <FiUser className="h-6 w-6 text-gray-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Students</p>
                <p className="text-2xl font-bold text-gray-900">{students.length}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search students, assignments..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="submitted">Submitted</option>
              <option value="graded">Graded</option>
            </select>

            {/* Course Filter */}
            <select
              value={courseFilter}
              onChange={(e) => setCourseFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Courses</option>
              {courses.map(course => (
                <option key={course.id} value={course.id}>{course.title}</option>
              ))}
            </select>

            {/* Assignment Filter */}
            <select
              value={assignmentFilter}
              onChange={(e) => setAssignmentFilter(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Assignments</option>
              {assignments.map(assignment => (
                <option key={assignment.id} value={assignment.id}>{assignment.title}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Submissions List */}
        {filteredSubmissions.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-4">
              <FiBook className="h-12 w-12 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No submissions found</h3>
            <p className="text-gray-600 mb-6">
              {submissions.length === 0 
                ? "You haven't received any submissions yet."
                : "Try adjusting your filters to see more results."}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assignment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Submitted
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Grade
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredSubmissions.map((submission) => {
                    const status = getStatusBadge(submission);
                    const StatusIcon = status.icon;

                    return (
                      <tr key={submission.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              src={submission.studentPhoto}
                              alt={submission.studentName}
                              className="h-10 w-10 rounded-full object-cover"
                            />
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {submission.studentName}
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="text-sm text-gray-900">{submission.assignmentTitle}</div>
                          <div className="text-xs text-gray-500">
                            Due: {formatDate(submission.dueDate)}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center">
                            <img
                              src={submission.courseThumbnail}
                              alt={submission.courseTitle}
                              className="h-8 w-8 rounded object-cover"
                            />
                            <span className="ml-2 text-sm text-gray-900">{submission.courseTitle}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {submission.submittedAt ? formatDate(submission.submittedAt) : 'Not submitted'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                            <StatusIcon className="mr-1.5" size={14} />
                            {status.text}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {submission.grade !== undefined && submission.grade !== null ? (
                            <span className="text-sm font-medium text-gray-900">{submission.grade}/100</span>
                          ) : (
                            <span className="text-sm text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className="flex items-center space-x-3">
                            {submission.googleDriveUrl && (
                              <a
                                href={submission.googleDriveUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800"
                                title="View Submission"
                              >
                                <FiExternalLink size={18} />
                              </a>
                            )}
                            {submission.submittedAt && (
                              <button
                                onClick={() => handleGradeSubmission(submission)}
                                className="text-green-600 hover:text-green-800"
                                title={submission.gradedAt ? "Update Grade" : "Grade Submission"}
                              >
                                <FiEdit size={18} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Grading Modal */}
        {showGradingModal && selectedSubmission && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Grade Submission</h2>
                  <button
                    onClick={() => setShowGradingModal(false)}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FiX size={24} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Student Info */}
                <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                  <img
                    src={selectedSubmission.studentPhoto}
                    alt={selectedSubmission.studentName}
                    className="h-12 w-12 rounded-full object-cover"
                  />
                  <div>
                    <p className="font-medium text-gray-900">{selectedSubmission.studentName}</p>
                    <p className="text-sm text-gray-600">{selectedSubmission.assignmentTitle}</p>
                  </div>
                </div>

                {/* Google Drive Link */}
                {selectedSubmission.googleDriveUrl && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Submitted Work
                    </label>
                    <a
                      href={selectedSubmission.googleDriveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
                    >
                      <FiExternalLink className="mr-2" />
                      Open in Google Drive
                    </a>
                  </div>
                )}

                {/* Grade Input */}
                <div>
                  <label htmlFor="grade" className="block text-sm font-medium text-gray-700 mb-2">
                    Grade (0-100) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    id="grade"
                    min="0"
                    max="100"
                    value={gradeInput}
                    onChange={(e) => setGradeInput(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter grade"
                  />
                </div>

                {/* Feedback Input */}
                <div>
                  <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
                    Feedback
                  </label>
                  <textarea
                    id="feedback"
                    rows={4}
                    value={feedbackInput}
                    onChange={(e) => setFeedbackInput(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Provide feedback for the student..."
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => setShowGradingModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  disabled={gradingLoading}
                >
                  Cancel
                </button>
                <button
                  onClick={submitGrade}
                  disabled={gradingLoading}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {gradingLoading ? 'Submitting...' : 'Submit Grade'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  );
}
