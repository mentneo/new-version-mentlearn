import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiArrowLeft, 
  FiCalendar, 
  FiClock, 
  FiFileText,
  FiCheckCircle,
  FiAlertCircle,
  FiUpload,
  FiDownload,
  FiUser
} from 'react-icons/fi/index.js';
import { db } from '../../firebase/firebase.js';
import { doc, getDoc, collection, query, where, getDocs, addDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext.js';

const AssignmentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [course, setCourse] = useState(null);
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [submissionContent, setSubmissionContent] = useState('');
  const [fileUrl, setFileUrl] = useState('');

  useEffect(() => {
    fetchAssignmentDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchAssignmentDetails = async () => {
    try {
      console.log('📖 Student fetching assignment details for:', id);
      
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
        navigate('/student-dashboard/assignments');
        return;
      }

      const assignmentData = {
        id: assignmentDoc.id,
        ...assignmentDoc.data(),
        dueDate: assignmentDoc.data().dueDate?.toDate()
      };
      
      // Check if student is assigned to this assignment
      if (!assignmentData.studentIds || !assignmentData.studentIds.includes(currentUser.uid)) {
        console.error('❌ Student not assigned to this assignment');
        setLoading(false);
        alert('You are not assigned to this assignment');
        navigate('/student-dashboard/assignments');
        return;
      }
      
      setAssignment(assignmentData);
      console.log('✅ Assignment loaded:', assignmentData.title);

      // Fetch mentor details
      if (assignmentData.mentorId) {
        try {
          const mentorDoc = await getDoc(doc(db, 'users', assignmentData.mentorId));
          if (mentorDoc.exists()) {
            setMentor(mentorDoc.data());
          }
        } catch (mentorError) {
          console.warn('⚠️ Could not fetch mentor details:', mentorError);
        }
      }

      // Fetch course details if available
      if (assignmentData.courseId) {
        try {
          const courseDoc = await getDoc(doc(db, 'courses', assignmentData.courseId));
          if (courseDoc.exists()) {
            setCourse(courseDoc.data());
          }
        } catch (courseError) {
          console.warn('⚠️ Could not fetch course details:', courseError);
        }
      }

      // Fetch student's submission
      try {
        const submissionsQuery = query(
          collection(db, 'submissions'),
          where('assignmentId', '==', id),
          where('studentId', '==', currentUser.uid)
        );
        const submissionsSnapshot = await getDocs(submissionsQuery);
        
        if (!submissionsSnapshot.empty) {
          const submissionData = {
            id: submissionsSnapshot.docs[0].id,
            ...submissionsSnapshot.docs[0].data(),
            submittedAt: submissionsSnapshot.docs[0].data().submittedAt?.toDate()
          };
          setSubmission(submissionData);
          setSubmissionContent(submissionData.content || '');
          setFileUrl(submissionData.fileUrl || '');
          console.log('✅ Submission found');
        } else {
          console.log('📝 No submission found yet');
        }
      } catch (submissionError) {
        console.warn('⚠️ Could not fetch submission:', submissionError);
      }

      setLoading(false);
    } catch (error) {
      console.error('❌ Error fetching assignment details:', error);
      console.error('Error details:', error.message);
      setLoading(false);
      alert('Error loading assignment details: ' + (error.message || 'Unknown error'));
      navigate('/student-dashboard/assignments');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!submissionContent.trim() && !fileUrl.trim()) {
      alert('Please add some content or a file URL before submitting');
      return;
    }

    setSubmitting(true);
    try {
      const submissionData = {
        assignmentId: id,
        studentId: currentUser.uid,
        content: submissionContent,
        fileUrl: fileUrl,
        submittedAt: new Date(),
        status: 'submitted'
      };

      if (submission) {
        // Update existing submission
        await updateDoc(doc(db, 'submissions', submission.id), {
          ...submissionData,
          updatedAt: new Date()
        });
        console.log('✅ Submission updated');
        alert('Assignment resubmitted successfully!');
      } else {
        // Create new submission
        const submissionRef = await addDoc(collection(db, 'submissions'), submissionData);
        console.log('✅ Submission created with ID:', submissionRef.id);
        alert('Assignment submitted successfully!');
      }

      // Refresh data
      await fetchAssignmentDetails();
    } catch (error) {
      console.error('❌ Error submitting assignment:', error);
      alert('Error submitting assignment. Please try again.');
    } finally {
      setSubmitting(false);
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

  const getDaysRemaining = (dueDate) => {
    if (!dueDate) return '';
    const now = new Date();
    const due = new Date(dueDate);
    const diff = due - now;
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) return `${Math.abs(days)} days overdue`;
    if (days === 0) return 'Due today';
    if (days === 1) return 'Due tomorrow';
    return `${days} days remaining`;
  };

  const getStatus = () => {
    if (!submission) return 'pending';
    if (submission.status === 'graded') return 'graded';
    if (submission.status === 'submitted') return 'submitted';
    
    const now = new Date();
    const due = new Date(assignment?.dueDate);
    if (due < now) return 'overdue';
    return 'pending';
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Pending', icon: <FiClock /> },
      submitted: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Submitted', icon: <FiCheckCircle /> },
      graded: { bg: 'bg-green-100', text: 'text-green-700', label: 'Graded', icon: <FiCheckCircle /> },
      overdue: { bg: 'bg-red-100', text: 'text-red-700', label: 'Overdue', icon: <FiAlertCircle /> }
    };
    
    const badge = badges[status] || badges.pending;
    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${badge.bg} ${badge.text}`}>
        {badge.icon}
        {badge.label}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Assignment not found</h2>
          <Link to="/student/assignments" className="text-blue-600 hover:text-blue-700 mt-4 inline-block">
            Back to Assignments
          </Link>
        </div>
      </div>
    );
  }

  const status = getStatus();
  const isOverdue = new Date(assignment.dueDate) < new Date() && !submission;
  const canSubmit = !submission || submission.status !== 'graded';

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <button
            onClick={() => navigate('/student/assignments')}
            className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4"
          >
            <FiArrowLeft className="mr-2" />
            Back to Assignments
          </button>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{assignment.title}</h1>
                {getStatusBadge(status)}
              </div>
              <p className="text-gray-600">{assignment.description}</p>
            </div>
          </div>
        </motion.div>

        {/* Assignment Info Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-xl shadow-sm p-6 mb-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">Assignment Details</h2>
          
          <div className="space-y-4">
            <div className="flex items-start">
              <FiCalendar className="text-gray-400 mr-3 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Due Date</p>
                <p className="font-medium text-gray-900">{formatDate(assignment.dueDate)}</p>
                <p className={`text-sm mt-1 ${isOverdue ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                  {getDaysRemaining(assignment.dueDate)}
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <FiFileText className="text-gray-400 mr-3 mt-1" />
              <div>
                <p className="text-sm text-gray-600">Points</p>
                <p className="font-medium text-gray-900">{assignment.points || 100} points</p>
              </div>
            </div>

            {course && (
              <div className="flex items-start">
                <FiFileText className="text-gray-400 mr-3 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Course</p>
                  <p className="font-medium text-gray-900">{course.title}</p>
                </div>
              </div>
            )}

            {mentor && (
              <div className="flex items-start">
                <FiUser className="text-gray-400 mr-3 mt-1" />
                <div>
                  <p className="text-sm text-gray-600">Instructor</p>
                  <p className="font-medium text-gray-900">{mentor.displayName || mentor.email}</p>
                </div>
              </div>
            )}
          </div>

          {isOverdue && !submission && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
              <FiAlertCircle className="text-red-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-red-900">This assignment is overdue</p>
                <p className="text-sm text-red-700 mt-1">
                  Submit as soon as possible to avoid further penalties.
                </p>
              </div>
            </div>
          )}
        </motion.div>

        {/* Submission Status / Grade */}
        {submission && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={`rounded-xl shadow-sm p-6 mb-6 ${
              submission.status === 'graded' ? 'bg-green-50 border border-green-200' : 'bg-yellow-50 border border-yellow-200'
            }`}
          >
            <div className="flex items-start">
              <FiCheckCircle className={`mr-3 mt-1 flex-shrink-0 ${
                submission.status === 'graded' ? 'text-green-600' : 'text-yellow-600'
              }`} />
              <div className="flex-1">
                <h3 className={`font-bold mb-2 ${
                  submission.status === 'graded' ? 'text-green-900' : 'text-yellow-900'
                }`}>
                  {submission.status === 'graded' ? 'Assignment Graded' : 'Assignment Submitted'}
                </h3>
                
                <p className={`text-sm mb-3 ${
                  submission.status === 'graded' ? 'text-green-700' : 'text-yellow-700'
                }`}>
                  Submitted on {formatDate(submission.submittedAt)}
                </p>

                {submission.status === 'graded' && (
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl font-bold text-green-900">
                        {submission.grade}/{assignment.points || 100}
                      </span>
                      <span className="text-sm text-green-700">
                        ({((submission.grade / (assignment.points || 100)) * 100).toFixed(1)}%)
                      </span>
                    </div>
                    
                    {submission.feedback && (
                      <div className="mt-3 p-3 bg-white rounded-lg">
                        <p className="text-sm font-medium text-gray-900 mb-1">Instructor Feedback:</p>
                        <p className="text-sm text-gray-700">{submission.feedback}</p>
                      </div>
                    )}
                  </div>
                )}

                {submission.status !== 'graded' && (
                  <p className={`text-sm ${
                    submission.status === 'graded' ? 'text-green-700' : 'text-yellow-700'
                  }`}>
                    Your submission is being reviewed by your instructor.
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Submission Form */}
        {canSubmit && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">
              {submission ? 'Update Your Submission' : 'Submit Your Work'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Your Response
                </label>
                <textarea
                  value={submissionContent}
                  onChange={(e) => setSubmissionContent(e.target.value)}
                  rows={6}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Write your response here..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  File URL (Optional)
                </label>
                <input
                  type="url"
                  value={fileUrl}
                  onChange={(e) => setFileUrl(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="https://example.com/your-file.pdf"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Upload your file to Google Drive, Dropbox, or another service and paste the link here
                </p>
              </div>

              {submission && submission.fileUrl && (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600 mb-2">Previously submitted file:</p>
                  <a
                    href={submission.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-sm text-blue-600 hover:text-blue-700"
                  >
                    <FiDownload className="mr-1" />
                    View Previous Submission
                  </a>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 inline-flex items-center justify-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <FiUpload className="mr-2" />
                      {submission ? 'Update Submission' : 'Submit Assignment'}
                    </>
                  )}
                </button>
                
                <button
                  type="button"
                  onClick={() => navigate('/student/assignments')}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-semibold"
                >
                  Cancel
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* View Previous Submission (When Graded) */}
        {submission && submission.status === 'graded' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-xl shadow-sm p-6 mt-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-4">Your Submission</h2>
            
            <div className="space-y-4">
              {submission.content && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Response:</p>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-gray-700 whitespace-pre-wrap">{submission.content}</p>
                  </div>
                </div>
              )}

              {submission.fileUrl && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Attached File:</p>
                  <a
                    href={submission.fileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-lg transition-colors"
                  >
                    <FiDownload className="mr-2" />
                    Download File
                  </a>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default AssignmentDetail;
