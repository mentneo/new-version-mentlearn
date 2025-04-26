import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/mentor/Navbar';
import { FaArrowLeft, FaCalendarAlt, FaChartLine, FaBookOpen, FaFileAlt } from 'react-icons/fa';

export default function StudentView() {
  const { studentId } = useParams();
  const { currentUser } = useAuth();
  const [student, setStudent] = useState(null);
  const [courses, setCourses] = useState([]);
  const [quizAttempts, setQuizAttempts] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchStudentData() {
      try {
        // Verify mentor is assigned to this student
        const assignmentQuery = query(
          collection(db, "mentorAssignments"),
          where("mentorId", "==", currentUser.uid),
          where("studentId", "==", studentId)
        );
        
        const assignmentDocs = await getDocs(assignmentQuery);
        
        if (assignmentDocs.empty) {
          setError("You are not assigned to this student.");
          setLoading(false);
          return;
        }
        
        // Fetch student data
        const studentRef = doc(db, "users", studentId);
        const studentDoc = await getDoc(studentRef);
        
        if (!studentDoc.exists()) {
          setError("Student not found.");
          setLoading(false);
          return;
        }
        
        setStudent({ id: studentDoc.id, ...studentDoc.data() });
        
        // Fetch enrolled courses and progress
        const enrollmentsQuery = query(
          collection(db, "enrollments"),
          where("studentId", "==", studentId)
        );
        
        const enrollmentDocs = await getDocs(enrollmentsQuery);
        
        // Get course details for each enrollment
        const coursePromises = enrollmentDocs.docs.map(async (enrollDoc) => {
          const enrollData = enrollDoc.data();
          const courseRef = doc(db, "courses", enrollData.courseId);
          const courseDoc = await getDoc(courseRef);
          
          if (courseDoc.exists()) {
            return {
              id: enrollData.courseId,
              ...courseDoc.data(),
              progress: enrollData.progress || 0
            };
          }
          return null;
        });
        
        const coursesData = (await Promise.all(coursePromises)).filter(Boolean);
        setCourses(coursesData);
        
        // Fetch quiz attempts
        const quizAttemptsQuery = query(
          collection(db, "quizAttempts"),
          where("studentId", "==", studentId),
          orderBy("timestamp", "desc")
        );
        
        const quizAttemptDocs = await getDocs(quizAttemptsQuery);
        const attemptsList = quizAttemptDocs.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date()
        }));
        
        setQuizAttempts(attemptsList);
        
        // Fetch previous reports for this student
        const reportsQuery = query(
          collection(db, "mentorReports"),
          where("studentId", "==", studentId),
          where("mentorId", "==", currentUser.uid),
          orderBy("timestamp", "desc")
        );
        
        const reportDocs = await getDocs(reportsQuery);
        const reportsList = reportDocs.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date()
        }));
        
        setReports(reportsList);
      } catch (err) {
        console.error("Error fetching student data:", err);
        setError("Failed to load student data. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchStudentData();
  }, [currentUser, studentId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
            <p className="text-center mt-4">Loading student data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
            <Link
              to="/mentor/dashboard"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
            >
              <FaArrowLeft className="mr-2" /> Back to Dashboard
            </Link>
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
          <div className="mb-6">
            <Link
              to="/mentor/dashboard"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
            >
              <FaArrowLeft className="mr-2" /> Back to Dashboard
            </Link>
          </div>
          
          {/* Student Profile */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-6">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Student Profile</h2>
                <p className="mt-1 max-w-2xl text-sm text-gray-500">
                  Personal details and course progress
                </p>
              </div>
              <Link
                to="/mentor/reports"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
              >
                <FaFileAlt className="mr-2" /> Submit Report
              </Link>
            </div>
            <div className="border-t border-gray-200">
              <div className="px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <div className="sm:col-span-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500">Full name</dt>
                    <dd className="mt-1 text-sm text-gray-900">{student.name}</dd>
                  </dl>
                </div>
                <div className="sm:col-span-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500">Email address</dt>
                    <dd className="mt-1 text-sm text-gray-900">{student.email}</dd>
                  </dl>
                </div>
                <div className="sm:col-span-1">
                  <dl>
                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
                    <dd className="mt-1 text-sm text-gray-900">{student.phone || 'Not provided'}</dd>
                  </dl>
                </div>
              </div>
              <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Enrolled since</dt>
                <dd className="mt-1 text-sm text-gray-900">
                  {student.enrolledAt ? new Date(student.enrolledAt).toLocaleDateString() : 'Unknown'}
                </dd>
              </div>
            </div>
          </div>
          
          {/* Course Progress */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-800">Course Progress</h2>
            
            {courses.length === 0 ? (
              <p className="mt-4 text-gray-600">This student is not enrolled in any courses yet.</p>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {courses.map(course => (
                  <div key={course.id} className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <img className="h-12 w-12 rounded-md" src={course.thumbnailUrl || 'https://via.placeholder.com/150'} alt={course.title} />
                        </div>
                        <div className="ml-5">
                          <h3 className="text-lg font-medium text-gray-900">{course.title}</h3>
                        </div>
                      </div>
                      <div className="mt-4">
                        <div className="relative pt-1">
                          <div className="flex mb-2 items-center justify-between">
                            <div>
                              <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
                                Progress
                              </span>
                            </div>
                            <div className="text-right">
                              <span className="text-xs font-semibold inline-block text-green-600">
                                {course.progress}%
                              </span>
                            </div>
                          </div>
                          <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-green-200">
                            <div style={{ width: `${course.progress}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-green-500"></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Quiz Attempts */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-800">Recent Quiz Attempts</h2>
            
            {quizAttempts.length === 0 ? (
              <p className="mt-4 text-gray-600">This student has not attempted any quizzes yet.</p>
            ) : (
              <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Quiz Performance</h3>
                </div>
                <div className="border-t border-gray-200">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Quiz
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Score
                          </th>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Correct/Total
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {quizAttempts.map((attempt) => (
                          <tr key={attempt.id}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {attempt.quizTitle}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {attempt.timestamp.toLocaleDateString()}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                attempt.score >= 70
                                  ? 'bg-green-100 text-green-800'
                                  : attempt.score >= 50
                                  ? 'bg-yellow-100 text-yellow-800'
                                  : 'bg-red-100 text-red-800'
                              }`}>
                                {attempt.score}%
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {attempt.correctAnswers}/{attempt.totalQuestions}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Previous Mentor Reports */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-800">Previous Reports</h2>
            
            {reports.length === 0 ? (
              <p className="mt-4 text-gray-600">You haven't submitted any reports for this student yet.</p>
            ) : (
              <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-lg">
                <ul className="divide-y divide-gray-200">
                  {reports.map(report => (
                    <li key={report.id} className="px-4 py-5 sm:px-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-medium text-gray-900">Week {report.weekNumber} Report</h3>
                        <div className="flex items-center text-sm text-gray-500">
                          <FaCalendarAlt className="mr-1" />
                          {report.timestamp.toLocaleDateString()}
                        </div>
                      </div>
                      <div className="mt-2 max-w-xl text-sm text-gray-500">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                          <div className="border border-gray-200 rounded-md p-3">
                            <h4 className="font-medium text-gray-700 mb-1">Strengths</h4>
                            <p className="text-gray-500 text-sm">{report.strengths}</p>
                          </div>
                          <div className="border border-gray-200 rounded-md p-3">
                            <h4 className="font-medium text-gray-700 mb-1">Areas for Improvement</h4>
                            <p className="text-gray-500 text-sm">{report.areasForImprovement}</p>
                          </div>
                          <div className="border border-gray-200 rounded-md p-3">
                            <h4 className="font-medium text-gray-700 mb-1">Recommendations</h4>
                            <p className="text-gray-500 text-sm">{report.recommendations}</p>
                          </div>
                        </div>
                        <div className="flex items-center mt-4">
                          <span className="text-sm font-medium text-gray-700 mr-2">Progress:</span>
                          <div className="w-full max-w-xs bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-green-600 h-2.5 rounded-full" 
                              style={{ width: `${report.progressPercentage}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 text-sm text-gray-500">{report.progressPercentage}%</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
