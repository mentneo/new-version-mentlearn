import React, { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, addDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebase.js';
import { useAuth } from '../../contexts/AuthContext.js';
import { FiCalendar, FiClock, FiAlertCircle, FiCheckCircle, FiFileText, FiUpload, FiArrowLeft, FiUser, FiBook, FiExternalLink, FiX } from 'react-icons/fi/index.js';
import { motion, AnimatePresence } from 'framer-motion';

export default function AssignmentDetail() {
  const { assignmentId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [assignment, setAssignment] = useState(null);
  const [course, setCourse] = useState(null);
  const [instructor, setInstructor] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [error, setError] = useState(null);
  
  // Submission modal states
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);
  const [googleDriveLink, setGoogleDriveLink] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(null);

  useEffect(() => {
    const fetchAssignmentDetails = async () => {
      if (!assignmentId || !currentUser) {
        console.log("Missing assignmentId or currentUser:", { assignmentId, currentUser: !!currentUser });
        return;
      }

      try {
        setLoading(true);
        console.log("Fetching assignment details for:", assignmentId);

        // Fetch assignment
        const assignmentDoc = await getDoc(doc(db, "assignments", assignmentId));
        console.log("Assignment doc exists:", assignmentDoc.exists());
        
        if (!assignmentDoc.exists()) {
          console.error("Assignment not found:", assignmentId);
          setError("Assignment not found");
          setLoading(false);
          return;
        }

        const assignmentData = { id: assignmentDoc.id, ...assignmentDoc.data() };
        console.log("Assignment data:", assignmentData);

        // Convert timestamp to Date - handle multiple formats
        if (assignmentData.dueDate) {
          if (assignmentData.dueDate.seconds) {
            assignmentData.dueDate = new Date(assignmentData.dueDate.seconds * 1000);
          } else if (assignmentData.dueDate instanceof Date) {
            // Already a date
          } else if (typeof assignmentData.dueDate === 'string') {
            assignmentData.dueDate = new Date(assignmentData.dueDate);
          } else {
            console.warn("Unknown dueDate format:", assignmentData.dueDate);
            assignmentData.dueDate = new Date(); // Fallback
          }
        } else {
          assignmentData.dueDate = new Date(); // Fallback
        }

        setAssignment(assignmentData);

        // Fetch course details
        if (assignmentData.courseId) {
          try {
            const courseDoc = await getDoc(doc(db, "courses", assignmentData.courseId));
            if (courseDoc.exists()) {
              const courseData = { id: courseDoc.id, ...courseDoc.data() };
              console.log("Course data:", courseData);
              setCourse(courseData);

              // Fetch instructor details
              if (courseData.instructorId || courseData.creatorId) {
                const instructorId = courseData.instructorId || courseData.creatorId;
                try {
                  const instructorDoc = await getDoc(doc(db, "users", instructorId));
                  if (instructorDoc.exists()) {
                    console.log("Instructor data:", instructorDoc.data());
                    setInstructor(instructorDoc.data());
                  }
                } catch (instructorError) {
                  console.error("Error fetching instructor:", instructorError);
                }
              }
            }
          } catch (courseError) {
            console.error("Error fetching course:", courseError);
          }
        }

        // Check if assignment is submitted
        try {
          const submissionsQuery = query(
            collection(db, "submissions"),
            where("assignmentId", "==", assignmentId),
            where("studentId", "==", currentUser.uid)
          );

          const submissionsSnapshot = await getDocs(submissionsQuery);
          if (!submissionsSnapshot.empty) {
            console.log("Submission found:", submissionsSnapshot.docs[0].data());
            setSubmission(submissionsSnapshot.docs[0].data());
          }
        } catch (submissionError) {
          console.error("Error fetching submission:", submissionError);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching assignment details:", error);
        setError("Failed to load assignment details: " + error.message);
        setLoading(false);
      }
    };

    fetchAssignmentDetails();
  }, [assignmentId, currentUser]);

  // Handle submission
  const handleSubmitAssignment = async () => {
    if (!googleDriveLink.trim()) {
      setError('Please provide a Google Drive link to your assignment');
      return;
    }

    // Basic validation for Google Drive links
    if (!googleDriveLink.includes('drive.google.com')) {
      setError('Please provide a valid Google Drive link');
      return;
    }

    try {
      setSubmitting(true);
      setError(null);

      const submissionData = {
        assignmentId: assignmentId,
        studentId: currentUser.uid,
        studentName: currentUser.displayName || currentUser.email,
        studentEmail: currentUser.email,
        googleDriveUrl: googleDriveLink.trim(),
        notes: submissionNotes.trim(),
        submittedAt: Timestamp.now(),
        status: 'submitted'
      };

      // Check if submission already exists
      const submissionsQuery = query(
        collection(db, 'submissions'),
        where('assignmentId', '==', assignmentId),
        where('studentId', '==', currentUser.uid)
      );

      const existingSubmissions = await getDocs(submissionsQuery);

      if (!existingSubmissions.empty) {
        // Update existing submission
        const submissionDoc = existingSubmissions.docs[0];
        await updateDoc(doc(db, 'submissions', submissionDoc.id), {
          googleDriveUrl: googleDriveLink.trim(),
          notes: submissionNotes.trim(),
          submittedAt: Timestamp.now(),
          status: 'submitted'
        });
        console.log('Updated existing submission');
      } else {
        // Create new submission
        await addDoc(collection(db, 'submissions'), submissionData);
        console.log('Created new submission');
      }

      setSubmitSuccess('Assignment submitted successfully! Your instructor will review it soon.');
      setSubmission({
        ...submissionData,
        submittedAt: new Date()
      });

      // Close modal after 2 seconds
      setTimeout(() => {
        setShowSubmissionModal(false);
        setSubmitSuccess(null);
        setGoogleDriveLink('');
        setSubmissionNotes('');
      }, 2000);

    } catch (err) {
      console.error('Error submitting assignment:', err);
      setError('Failed to submit assignment. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // Format date
  const formatDate = (date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  // Calculate status
  const getStatus = () => {
    if (submission) {
      if (submission.grade !== undefined) {
        return 'graded';
      }
      return 'submitted';
    }

    const now = new Date();
    if (assignment.dueDate < now) {
      return 'overdue';
    }

    return 'pending';
  };

  // Calculate days remaining or overdue
  const getDaysRemaining = () => {
    if (!assignment || !assignment.dueDate) {
      return { text: "No due date", color: 'text-gray-600', bgColor: 'bg-gray-50', borderColor: 'border-gray-200' };
    }

    const now = new Date();
    const diffTime = assignment.dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) {
      return { text: `${Math.abs(diffDays)} days overdue`, color: 'text-red-600', bgColor: 'bg-red-50', borderColor: 'border-red-200' };
    } else if (diffDays === 0) {
      return { text: "Due today", color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' };
    } else if (diffDays === 1) {
      return { text: "Due tomorrow", color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' };
    } else if (diffDays <= 3) {
      return { text: `${diffDays} days left`, color: 'text-yellow-600', bgColor: 'bg-yellow-50', borderColor: 'border-yellow-200' };
    } else {
      return { text: `${diffDays} days left`, color: 'text-blue-600', bgColor: 'bg-blue-50', borderColor: 'border-blue-200' };
    }
  };

  // Get status badge
  const getStatusBadge = () => {
    const status = getStatus();
    
    const badges = {
      submitted: { text: 'Submitted', color: 'bg-yellow-100 text-yellow-800', icon: FiUpload },
      graded: { text: 'Graded', color: 'bg-green-100 text-green-800', icon: FiCheckCircle },
      overdue: { text: 'Overdue', color: 'bg-red-100 text-red-800', icon: FiAlertCircle },
      pending: { text: 'Pending', color: 'bg-blue-100 text-blue-800', icon: FiClock }
    };

    return badges[status] || badges.pending;
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (error || !assignment) {
    console.log("Showing error or no assignment:", { error, hasAssignment: !!assignment });
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6">
          <div className="flex">
            <FiAlertCircle className="h-6 w-6 text-red-400" />
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error || "Assignment not found"}</h3>
              <div className="mt-4">
                <Link
                  to="/student/student-dashboard/assignments"
                  className="text-sm font-medium text-red-600 hover:text-red-500"
                >
                  ← Back to Assignments
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  console.log("Rendering assignment detail:", assignment);
  const statusBadge = getStatusBadge();
  const StatusIconComponent = statusBadge.icon;
  const daysInfo = getDaysRemaining();
  console.log("Status badge:", statusBadge, "Days info:", daysInfo);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8">
      {/* Back button */}
      <div className="mb-6">
        <button
          onClick={() => navigate('/student/student-dashboard/assignments')}
          className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900"
        >
          <FiArrowLeft className="mr-2" size={16} />
          Back to Assignments
        </button>
      </div>

      {/* Assignment Header */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-6">
        <div className="px-6 py-5 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <h1 className="text-2xl font-bold text-gray-900 mb-2">{assignment.title}</h1>
              {course && (
                <div className="flex items-center text-sm text-gray-600">
                  <FiBook className="mr-2" size={16} />
                  <span>{course.title}</span>
                </div>
              )}
            </div>
            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${statusBadge.color}`}>
              <StatusIconComponent className="mr-1.5" size={16} />
              {statusBadge.text}
            </span>
          </div>
        </div>

        {/* Due Date & Time Info */}
        <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiCalendar className="h-5 w-5 text-gray-400" />
              </div>
              <div className="ml-3">
                <p className="text-xs text-gray-500">Due Date</p>
                <p className="text-sm font-medium text-gray-900">
                  {formatDate(assignment.dueDate)}
                </p>
              </div>
            </div>

            <div className="flex items-center">
              <div className="flex-shrink-0">
                <FiClock className="h-5 w-5 text-gray-400" />
              </div>
              <div className="ml-3">
                <p className="text-xs text-gray-500">Time Remaining</p>
                <p className={`text-sm font-medium ${daysInfo.color}`}>
                  {daysInfo.text}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Instructor Info */}
        {instructor && (
          <div className="px-6 py-4 bg-white border-b border-gray-200">
            <div className="flex items-center">
              <img
                src={instructor.photoURL || "https://via.placeholder.com/40"}
                alt={instructor.displayName || "Instructor"}
                className="h-10 w-10 rounded-full object-cover"
              />
              <div className="ml-3">
                <div className="flex items-center">
                  <p className="text-sm font-medium text-gray-900">{instructor.displayName || "Instructor"}</p>
                  <span className="ml-2 text-xs text-gray-500">• Instructor</span>
                </div>
                {instructor.email && (
                  <p className="text-xs text-gray-500">{instructor.email}</p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Assignment Description */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-6"
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Assignment Description</h2>
        <div className="prose prose-sm max-w-none text-gray-700">
          <p className="whitespace-pre-wrap">{assignment.description || "No description provided."}</p>
        </div>

        {/* Assignment Instructions */}
        {assignment.instructions && (
          <div className="mt-6">
            <h3 className="text-md font-semibold text-gray-900 mb-3">Instructions</h3>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-gray-700 whitespace-pre-wrap">{assignment.instructions}</p>
            </div>
          </div>
        )}

        {/* Requirements or Resources */}
        {assignment.requirements && Array.isArray(assignment.requirements) && assignment.requirements.length > 0 && (
          <div className="mt-6">
            <h3 className="text-md font-semibold text-gray-900 mb-3">Requirements</h3>
            <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
              {assignment.requirements.map((req, index) => (
                <li key={index}>{req}</li>
              ))}
            </ul>
          </div>
        )}
      </motion.div>

      {/* Submission Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className={`bg-gradient-to-r ${daysInfo.bgColor} border-2 ${daysInfo.borderColor} rounded-xl shadow-sm p-6 mb-6`}
      >
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          {submission ? 'Your Submission' : 'Submit Your Work'}
        </h2>

        {submission ? (
          // Show submission details
          <div className="space-y-4">
            <div className="flex items-center">
              <FiCheckCircle className="text-green-500 mr-2" size={20} />
              <span className="text-sm text-gray-700">
                Submitted on {submission.submittedAt && new Date(submission.submittedAt.seconds * 1000).toLocaleString()}
              </span>
            </div>

            {submission.grade !== undefined && (
              <div className="bg-white rounded-lg p-4 border border-green-200">
                <h3 className="text-sm font-semibold text-gray-900 mb-2">Grade</h3>
                <p className="text-2xl font-bold text-green-600">{submission.grade}%</p>
                {submission.feedback && (
                  <div className="mt-3">
                    <h4 className="text-xs font-semibold text-gray-700 mb-1">Instructor Feedback</h4>
                    <p className="text-sm text-gray-600">{submission.feedback}</p>
                  </div>
                )}
              </div>
            )}

            <div className="pt-4 border-t border-gray-200">
              <p className="text-xs text-gray-600 mb-3">
                Need to resubmit? Upload your updated file to Google Drive with the same naming convention.
              </p>
              <a
                href="https://drive.google.com/drive/folders/1HSJata1zk7DVCefLGJYKaWei-CEriZd4?usp=share_link"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors"
              >
                <FiExternalLink className="mr-2" size={16} />
                View Submissions Folder
              </a>
            </div>
          </div>
        ) : (
          // Show submission instructions
          <div className="space-y-4">
            <div className="flex items-start">
              <FiUpload className={`${daysInfo.color} mt-1 mr-3 flex-shrink-0`} size={24} />
              <div className="flex-1">
                <h3 className="text-md font-semibold text-gray-900 mb-2">Submit Your Assignment</h3>
                <p className="text-sm text-gray-700 mb-4">
                  Upload your completed assignment to Google Drive, then submit the link below for grading.
                </p>

                <div className="bg-white rounded-lg p-4 border border-gray-200 mb-4">
                  <h4 className="text-xs font-semibold text-gray-900 mb-2">File Naming Convention</h4>
                  <code className="text-sm bg-gray-100 px-2 py-1 rounded text-gray-800">
                    YourName_AssignmentTitle_Date
                  </code>
                  <p className="text-xs text-gray-600 mt-2">
                    Example: <code className="bg-gray-100 px-1 py-0.5 rounded">JohnDoe_{assignment.title.replace(/\s+/g, '')}_2025-10-19</code>
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <a
                    href="https://drive.google.com/drive/folders/1HSJata1zk7DVCefLGJYKaWei-CEriZd4?usp=share_link"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center px-4 py-2 border border-blue-600 text-sm font-medium rounded-lg text-blue-600 bg-white hover:bg-blue-50 transition-colors"
                  >
                    <FiExternalLink className="mr-2" size={16} />
                    Open Google Drive
                  </a>
                  <button
                    onClick={() => setShowSubmissionModal(true)}
                    className="inline-flex items-center justify-center px-6 py-2 border border-transparent text-sm font-medium rounded-lg text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors"
                  >
                    <FiCheckCircle className="mr-2" size={16} />
                    Submit Assignment
                  </button>
                </div>

                <p className="text-xs text-gray-500 mt-3">
                  First upload your file to Google Drive, then click "Submit Assignment" to provide the link.
                </p>
              </div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Submission Modal */}
      <AnimatePresence>
        {showSubmissionModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-xl shadow-xl max-w-lg w-full"
            >
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">Submit Assignment</h2>
                  <button
                    onClick={() => {
                      setShowSubmissionModal(false);
                      setError(null);
                      setSubmitSuccess(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <FiX size={24} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {submitSuccess && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 flex items-start">
                    <FiCheckCircle className="text-green-500 mt-0.5 mr-3 flex-shrink-0" size={20} />
                    <p className="text-sm text-green-800">{submitSuccess}</p>
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
                    <FiAlertCircle className="text-red-500 mt-0.5 mr-3 flex-shrink-0" size={20} />
                    <p className="text-sm text-red-800">{error}</p>
                  </div>
                )}

                <div>
                  <label htmlFor="googleDriveLink" className="block text-sm font-medium text-gray-700 mb-2">
                    Google Drive Link <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    id="googleDriveLink"
                    value={googleDriveLink}
                    onChange={(e) => setGoogleDriveLink(e.target.value)}
                    placeholder="https://drive.google.com/file/d/..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={submitting}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Make sure the file sharing is set to "Anyone with the link can view"
                  </p>
                </div>

                <div>
                  <label htmlFor="submissionNotes" className="block text-sm font-medium text-gray-700 mb-2">
                    Notes (Optional)
                  </label>
                  <textarea
                    id="submissionNotes"
                    rows={3}
                    value={submissionNotes}
                    onChange={(e) => setSubmissionNotes(e.target.value)}
                    placeholder="Add any notes for your instructor..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={submitting}
                  />
                </div>
              </div>

              <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowSubmissionModal(false);
                    setError(null);
                    setSubmitSuccess(null);
                  }}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50"
                  disabled={submitting}
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitAssignment}
                  disabled={submitting}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Submitting...' : submission ? 'Update Submission' : 'Submit'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Additional Information */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Assignment Details</h2>
        <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {assignment.type && (
            <div>
              <dt className="text-xs text-gray-500">Assignment Type</dt>
              <dd className="text-sm font-medium text-gray-900 mt-1">
                {assignment.type.charAt(0).toUpperCase() + assignment.type.slice(1)}
              </dd>
            </div>
          )}
          {assignment.points && (
            <div>
              <dt className="text-xs text-gray-500">Total Points</dt>
              <dd className="text-sm font-medium text-gray-900 mt-1">{assignment.points}</dd>
            </div>
          )}
          {assignment.createdAt && (
            <div>
              <dt className="text-xs text-gray-500">Assigned Date</dt>
              <dd className="text-sm font-medium text-gray-900 mt-1">
                {new Date(assignment.createdAt.seconds * 1000).toLocaleDateString()}
              </dd>
            </div>
          )}
          <div>
            <dt className="text-xs text-gray-500">Status</dt>
            <dd className="text-sm font-medium text-gray-900 mt-1">
              {statusBadge.text}
            </dd>
          </div>
        </dl>
      </div>
    </div>
  );
}
