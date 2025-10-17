import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiArrowLeft, 
  FiCalendar, 
  FiClock, 
  FiUsers, 
  FiFileText,
  FiCheckCircle,
  FiEdit2,
  FiTrash2,
  FiDownload
} from 'react-icons/fi';
import { db } from '../../firebase/firebase.js';
import { doc, getDoc, collection, query, where, getDocs, updateDoc, deleteDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';

const AssignmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [assignment, setAssignment] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [gradingStudentId, setGradingStudentId] = useState(null);
  const [gradeValue, setGradeValue] = useState('');
  const [feedback, setFeedback] = useState('');

  useEffect(() => {
    fetchAssignmentDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchAssignmentDetails = async () => {
    try {
      console.log('📖 Fetching assignment details for:', id);
      
      // Check if user is authenticated
      if (!currentUser) {
        console.error('❌ No current user');
        alert('Please log in to view assignments');
        navigate('/login');
        return;
      }
      
      // Fetch assignment
      const assignmentDoc = await getDoc(doc(db, 'assignments', id));
      if (!assignmentDoc.exists()) {
        console.error('❌ Assignment not found');
        setLoading(false);
        alert('Assignment not found');
        navigate('/mentor/assignments');
        return;
      }

      const assignmentData = {
        id: assignmentDoc.id,
        ...assignmentDoc.data(),
        dueDate: assignmentDoc.data().dueDate?.toDate()
      };
      
      // Check if current user is the mentor who created this assignment
      if (assignmentData.mentorId !== currentUser.uid) {
        console.error('❌ Not authorized to view this assignment');
        setLoading(false);
        alert('You are not authorized to view this assignment');
        navigate('/mentor/assignments');
        return;
      }
      
      setAssignment(assignmentData);
      console.log('✅ Assignment loaded:', assignmentData.title);

      // Fetch submissions
      try {
        const submissionsQuery = query(
          collection(db, 'submissions'),
          where('assignmentId', '==', id)
        );
        const submissionsSnapshot = await getDocs(submissionsQuery);
        const submissionsData = submissionsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          submittedAt: doc.data().submittedAt?.toDate()
        }));
        setSubmissions(submissionsData);
        console.log('📝 Found submissions:', submissionsData.length);
      } catch (submissionError) {
        console.warn('⚠️ Could not fetch submissions:', submissionError);
      }

      // Fetch student details
      if (assignmentData.studentIds && assignmentData.studentIds.length > 0) {
        const studentsData = [];
        for (const studentId of assignmentData.studentIds) {
          try {
            const studentDoc = await getDoc(doc(db, 'users', studentId));
            if (studentDoc.exists()) {
              studentsData.push({
                id: studentDoc.id,
                ...studentDoc.data()
              });
            }
          } catch (studentError) {
            console.warn(`⚠️ Could not fetch student ${studentId}:`, studentError);
          }
        }
        setStudents(studentsData);
        console.log('👥 Found students:', studentsData.length);
      }

      setLoading(false);
    } catch (error) {
      console.error('❌ Error fetching assignment details:', error);
      console.error('Error details:', error.message);
      setLoading(false);
      alert('Error loading assignment details: ' + (error.message || 'Unknown error'));
      navigate('/mentor/assignments');
    }
  };

  const handleGradeSubmission = async (submissionId, studentId) => {
    if (!gradeValue) {
      alert('Please enter a grade');
      return;
    }

    try {
      const submissionRef = doc(db, 'submissions', submissionId);
      await updateDoc(submissionRef, {
        grade: parseInt(gradeValue),
        feedback: feedback,
        gradedAt: new Date(),
        gradedBy: currentUser.uid,
        status: 'graded'
      });

      console.log('✅ Submission graded successfully');
      alert('Submission graded successfully!');
      
      // Reset form
      setGradingStudentId(null);
      setGradeValue('');
      setFeedback('');
      
      // Refresh data
      fetchAssignmentDetails();
    } catch (error) {
      console.error('❌ Error grading submission:', error);
      alert('Error grading submission');
    }
  };

  const handleDeleteAssignment = async () => {
    if (!window.confirm('Are you sure you want to delete this assignment? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteDoc(doc(db, 'assignments', id));
      console.log('✅ Assignment deleted');
      alert('Assignment deleted successfully');
      navigate('/mentor/assignments');
    } catch (error) {
      console.error('❌ Error deleting assignment:', error);
      alert('Error deleting assignment');
    }
  };

  const formatDate = (date) => {
    if (!date) return 'No date';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStudentSubmission = (studentId) => {
    return submissions.find(s => s.studentId === studentId);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Assignment not found</h2>
          <Link to="/mentor/assignments" className="text-indigo-600 hover:text-indigo-700 mt-4 inline-block">
            Back to Assignments
          </Link>
        </div>
      </div>
    );
  }

  const submittedCount = submissions.length;
  const gradedCount = submissions.filter(s => s.status === 'graded').length;
  const totalStudents = students.length;
  const averageGrade = gradedCount > 0 
    ? (submissions.filter(s => s.grade).reduce((sum, s) => sum + s.grade, 0) / gradedCount).toFixed(1)
    : 'N/A';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/mentor/assignments')}
            className="inline-flex items-center text-indigo-600 hover:text-indigo-700 mb-4"
          >
            <FiArrowLeft className="mr-2" />
            Back to Assignments
          </button>
          
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{assignment.title}</h1>
              <p className="text-gray-600">{assignment.description}</p>
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => alert('Edit functionality coming soon')}
                className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
              >
                <FiEdit2 className="text-xl" />
              </button>
              <button
                onClick={handleDeleteAssignment}
                className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <FiTrash2 className="text-xl" />
              </button>
            </div>
          </div>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Students</p>
                <p className="text-2xl font-bold text-gray-900">{totalStudents}</p>
              </div>
              <FiUsers className="text-3xl text-indigo-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Submissions</p>
                <p className="text-2xl font-bold text-gray-900">{submittedCount}/{totalStudents}</p>
              </div>
              <FiFileText className="text-3xl text-blue-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Graded</p>
                <p className="text-2xl font-bold text-gray-900">{gradedCount}/{submittedCount}</p>
              </div>
              <FiCheckCircle className="text-3xl text-green-600" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Average Grade</p>
                <p className="text-2xl font-bold text-gray-900">{averageGrade}</p>
              </div>
              <FiCheckCircle className="text-3xl text-yellow-600" />
            </div>
          </motion.div>
        </div>

        {/* Assignment Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl p-6 shadow-sm mb-8"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Assignment Details</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="flex items-center">
              <FiCalendar className="text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Due Date</p>
                <p className="font-medium text-gray-900">{formatDate(assignment.dueDate)}</p>
              </div>
            </div>

            <div className="flex items-center">
              <FiClock className="text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Points</p>
                <p className="font-medium text-gray-900">{assignment.points || 100}</p>
              </div>
            </div>

            <div className="flex items-center">
              <FiFileText className="text-gray-400 mr-3" />
              <div>
                <p className="text-sm text-gray-600">Course</p>
                <p className="font-medium text-gray-900">{assignment.courseId || 'General'}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Student Submissions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-xl p-6 shadow-sm"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Student Submissions</h2>
          
          {students.length === 0 ? (
            <p className="text-gray-600 text-center py-8">No students assigned to this assignment</p>
          ) : (
            <div className="space-y-4">
              {students.map((student) => {
                const submission = getStudentSubmission(student.id);
                const isGrading = gradingStudentId === student.id;
                
                return (
                  <div key={student.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-gray-900">
                            {student.displayName || student.email}
                          </h3>
                          {submission ? (
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              submission.status === 'graded' 
                                ? 'bg-green-100 text-green-700'
                                : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {submission.status === 'graded' ? 'Graded' : 'Submitted'}
                            </span>
                          ) : (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">
                              Not Submitted
                            </span>
                          )}
                        </div>
                        
                        {submission ? (
                          <div className="mt-3 space-y-2">
                            <p className="text-sm text-gray-600">
                              <strong>Submitted:</strong> {formatDate(submission.submittedAt)}
                            </p>
                            {submission.content && (
                              <p className="text-sm text-gray-600">
                                <strong>Response:</strong> {submission.content}
                              </p>
                            )}
                            {submission.fileUrl && (
                              <a
                                href={submission.fileUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center text-sm text-indigo-600 hover:text-indigo-700"
                              >
                                <FiDownload className="mr-1" />
                                Download Submission
                              </a>
                            )}
                            
                            {submission.status === 'graded' ? (
                              <div className="mt-3 p-3 bg-green-50 rounded-lg">
                                <p className="text-sm font-medium text-green-900">
                                  Grade: {submission.grade}/{assignment.points || 100}
                                </p>
                                {submission.feedback && (
                                  <p className="text-sm text-green-700 mt-1">
                                    Feedback: {submission.feedback}
                                  </p>
                                )}
                              </div>
                            ) : isGrading ? (
                              <div className="mt-3 p-3 bg-gray-50 rounded-lg space-y-3">
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Grade (out of {assignment.points || 100})
                                  </label>
                                  <input
                                    type="number"
                                    min="0"
                                    max={assignment.points || 100}
                                    value={gradeValue}
                                    onChange={(e) => setGradeValue(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                  />
                                </div>
                                <div>
                                  <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Feedback (Optional)
                                  </label>
                                  <textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    rows={3}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="Add feedback for the student..."
                                  />
                                </div>
                                <div className="flex gap-2">
                                  <button
                                    onClick={() => handleGradeSubmission(submission.id, student.id)}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                                  >
                                    Submit Grade
                                  </button>
                                  <button
                                    onClick={() => {
                                      setGradingStudentId(null);
                                      setGradeValue('');
                                      setFeedback('');
                                    }}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                  >
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() => setGradingStudentId(student.id)}
                                className="mt-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
                              >
                                Grade Submission
                              </button>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm text-gray-500 mt-2">
                            Waiting for submission...
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default AssignmentDetail;
