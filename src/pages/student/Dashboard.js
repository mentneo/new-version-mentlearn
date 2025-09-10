import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/student/Navbar';
import { FaBook, FaChartLine, FaLaptopCode, FaUserGraduate, FaClipboardList, FaUsers, FaQuestionCircle, FaGraduationCap } from 'react-icons/fa';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [mentorReports, setMentorReports] = useState([]);
  const [assignedQuizzes, setAssignedQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStudentData() {
      try {
        if (!currentUser) return;

        // Fetch enrollments
        const enrollmentsQuery = query(
          collection(db, "enrollments"),
          where("studentId", "==", currentUser.uid)
        );
        
        const enrollmentDocs = await getDocs(enrollmentsQuery);
        
        let enrolledCourseIds = [];
        
        if (!enrollmentDocs.empty) {
          // Fetch course details for each enrollment
          const coursePromises = enrollmentDocs.docs.map(async (enrollDoc) => {
            const enrollData = enrollDoc.data();
            enrolledCourseIds.push(enrollData.courseId);
            const courseRef = doc(db, "courses", enrollData.courseId);
            const courseDoc = await getDoc(courseRef);
            
            if (courseDoc.exists()) {
              return {
                id: enrollData.courseId,
                enrollmentId: enrollDoc.id,
                progress: enrollData.progress || 0,
                enrolledAt: enrollData.enrolledAt,
                ...courseDoc.data()
              };
            }
            return null;
          });
          
          const coursesData = (await Promise.all(coursePromises)).filter(Boolean);
          setEnrolledCourses(coursesData);
        } else {
          setEnrolledCourses([]);
        }
        
        // Fetch all available courses
        const coursesCollection = collection(db, "courses");
        const coursesSnapshot = await getDocs(coursesCollection);
        const allCoursesData = coursesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          isEnrolled: enrolledCourseIds.includes(doc.id)
        }));
        
        // Filter out courses the student is already enrolled in for the "Available Courses" section
        const availableCourses = allCoursesData.filter(course => !enrolledCourseIds.includes(course.id));
        setAllCourses(availableCourses);
        
        // Fetch mentor reports
        const reportsQuery = query(
          collection(db, "mentorReports"),
          where("studentId", "==", currentUser.uid)
        );
        
        const reportDocs = await getDocs(reportsQuery);
        const reportsList = reportDocs.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp?.toDate() || new Date()
        }));
        
        // Sort reports by timestamp (descending)
        reportsList.sort((a, b) => b.timestamp - a.timestamp);
        
        setMentorReports(reportsList.slice(0, 3)); // Get latest 3 reports
        
        // Fetch quizzes assigned to this student
        const quizzesQuery = query(
          collection(db, "quizzes"),
          where("assignedStudentIds", "array-contains", currentUser.uid)
        );
        
        const quizDocs = await getDocs(quizzesQuery);
        const quizzesList = quizDocs.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date()
        }));
        
        // Sort quizzes by creation date (newest first)
        quizzesList.sort((a, b) => b.createdAt - a.createdAt);
        
        // Get mentor names for each quiz
        for (let i = 0; i < quizzesList.length; i++) {
          if (quizzesList[i].mentorId) {
            const mentorDoc = await getDoc(doc(db, "users", quizzesList[i].mentorId));
            if (mentorDoc.exists()) {
              quizzesList[i].mentorName = mentorDoc.data().name;
            }
          }
        }
        
        setAssignedQuizzes(quizzesList);
        
        setLoading(false);
      } catch (err) {
        console.error("Error fetching student data:", err);
        setError("Failed to load your dashboard data. Please try again later.");
        setLoading(false);
      }
    }

    fetchStudentData();
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
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
            <h1 className="text-3xl font-bold text-gray-900 mb-4 md:mb-0">Student Dashboard</h1>
            <div className="flex flex-wrap gap-2">
              <Link 
                to="/student/progress" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
              >
                <FaChartLine className="mr-2" /> View Progress
              </Link>
              <Link 
                to="/student/refer-and-earn" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-green-700 bg-green-100 hover:bg-green-200"
              >
                <FaUsers className="mr-2" /> Refer & Earn
              </Link>
              <Link 
                to="/student/quizzes" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-purple-700 bg-purple-100 hover:bg-purple-200"
              >
                <FaQuestionCircle className="mr-2" /> Quizzes
              </Link>
              <Link 
                to="/student/interview-prep" 
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700"
              >
                <FaLaptopCode className="mr-2" /> Interview Prep
              </Link>
            </div>
          </div>
          
          {error && (
            <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Assigned Quizzes Section */}
          {assignedQuizzes.length > 0 ? (
            <div className="mt-8">
              <h2 className="text-2xl font-semibold text-gray-900">Assigned Quizzes</h2>
              <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-lg">
                <ul className="divide-y divide-gray-200">
                  {assignedQuizzes.map(quiz => (
                    <li key={quiz.id} className="px-4 sm:px-6 py-4">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                        <div className="mb-4 sm:mb-0 sm:pr-4">
                          <h3 className="text-lg font-medium text-gray-900">{quiz.title}</h3>
                          <p className="mt-1 text-sm text-gray-500">{quiz.description}</p>
                          <div className="mt-2 flex flex-col sm:flex-row sm:items-center text-sm text-gray-500">
                            <div className="flex items-center mb-1 sm:mb-0">
                              <FaUserGraduate className="flex-shrink-0 mr-1.5 h-4 w-4 text-gray-400" />
                              <p>Assigned by: {quiz.mentorName || 'Your mentor'}</p>
                            </div>
                            <span className="hidden sm:inline mx-2">•</span>
                            <div className="flex items-center mb-1 sm:mb-0">
                              <p>Time limit: {quiz.timeLimit} minutes</p>
                            </div>
                            <span className="hidden sm:inline mx-2">•</span>
                            <div className="flex items-center">
                              <p>Passing score: {quiz.passingScore}%</p>
                            </div>
                          </div>
                        </div>
                        <div>
                          <Link
                            to={`/student/quiz/${quiz.id}`}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                          >
                            <FaClipboardList className="mr-2" /> Start Quiz
                          </Link>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="bg-gray-50 px-6 py-3">
                  <Link
                    to="/student/quizzes"
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500 flex items-center"
                  >
                    <FaQuestionCircle className="mr-2" /> View all quizzes
                  </Link>
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-8">
              <h2 className="text-2xl font-semibold text-gray-900">Quizzes</h2>
              <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-lg p-6">
                <div className="flex flex-col items-center justify-center py-6">
                  <FaQuestionCircle className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No assigned quizzes</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    You don't have any assigned quizzes yet. Explore all available quizzes.
                  </p>
                  <Link
                    to="/student/quizzes"
                    className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                  >
                    <FaQuestionCircle className="mr-2" /> Browse All Quizzes
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Enrolled Courses */}
          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-gray-900">Your Courses</h2>
            {enrolledCourses.length === 0 ? (
              <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-lg p-6">
                <div className="flex flex-col items-center justify-center py-6">
                  <FaBook className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No courses yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    You're not enrolled in any courses yet. Courses assigned by your admin will appear here.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {enrolledCourses.map(course => (
                  <div key={course.id} className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex-shrink-0">
                        <img 
                          className="h-48 w-full object-cover rounded-md" 
                          src={course.thumbnailUrl || 'https://via.placeholder.com/600x400?text=Course'} 
                          alt={course.title} 
                        />
                      </div>
                      <div className="mt-4">
                        <h3 className="text-lg font-medium text-gray-900">{course.title}</h3>
                        <p className="mt-2 text-sm text-gray-500 line-clamp-2">{course.description}</p>
                        
                        <div className="mt-4">
                          <div className="flex items-center justify-between text-sm">
                            <div className="text-gray-500">Progress</div>
                            <div className="font-medium text-indigo-600">{course.progress}%</div>
                          </div>
                          <div className="mt-1 w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-indigo-600 h-2.5 rounded-full" 
                              style={{ width: `${course.progress}%` }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex">
                          <Link
                            to={`/student/course/${course.id}`}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                          >
                            {course.progress > 0 ? 'Continue Course' : 'Start Course'}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Available Courses */}
          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-gray-900">Available Courses</h2>
            {allCourses.length === 0 ? (
              <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-lg p-6">
                <div className="flex flex-col items-center justify-center py-6">
                  <FaGraduationCap className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No additional courses available</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    There are no additional courses available at the moment. Please check back later.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {allCourses.map(course => (
                  <div key={course.id} className="bg-white overflow-hidden shadow rounded-lg">
                    <div className="p-5">
                      <div className="flex-shrink-0">
                        <img 
                          className="h-48 w-full object-cover rounded-md" 
                          src={course.thumbnailUrl || 'https://via.placeholder.com/600x400?text=Course'} 
                          alt={course.title} 
                        />
                      </div>
                      <div className="mt-4">
                        <h3 className="text-lg font-medium text-gray-900">{course.title}</h3>
                        <p className="mt-2 text-sm text-gray-500 line-clamp-2">{course.description}</p>
                        
                        <div className="mt-2">
                          {course.duration && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-2">
                              Duration: {course.duration}
                            </span>
                          )}
                          {course.level && (
                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              Level: {course.level}
                            </span>
                          )}
                        </div>
                        
                        <div className="mt-4 flex justify-between items-center">
                          <Link
                            to={`/student/course-details/${course.id}`}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                          >
                            View Details
                          </Link>
                          <Link
                            to={`/student/enroll/${course.id}`}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                          >
                            Enroll Now
                          </Link>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {/* Latest Mentor Feedback */}
          <div className="mt-8">
            <h2 className="text-2xl font-semibold text-gray-900">Latest Mentor Feedback</h2>
            {mentorReports.length === 0 ? (
              <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-lg p-6">
                <div className="flex flex-col items-center justify-center py-6">
                  <FaUserGraduate className="h-12 w-12 text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900">No mentor feedback yet</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Your mentor will provide feedback on your progress. Check back later.
                  </p>
                </div>
              </div>
            ) : (
              <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-lg">
                <ul className="divide-y divide-gray-200">
                  {mentorReports.map(report => (
                    <li key={report.id} className="px-4 sm:px-6 py-4">
                      <div>
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2">
                          <h3 className="text-lg font-medium text-gray-900">Week {report.weekNumber} Report</h3>
                          <p className="text-sm text-gray-500 mt-1 sm:mt-0">
                            {report.timestamp.toLocaleDateString()}
                          </p>
                        </div>
                        <div className="mt-2 max-w-xl text-sm text-gray-500">
                          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                            <div className="sm:col-span-1 mb-3 sm:mb-0">
                              <dt className="font-medium text-gray-500">Strengths</dt>
                              <dd className="mt-1 text-gray-900">{report.strengths}</dd>
                            </div>
                            <div className="sm:col-span-1 mb-3 sm:mb-0">
                              <dt className="font-medium text-gray-500">Areas for Improvement</dt>
                              <dd className="mt-1 text-gray-900">{report.areasForImprovement}</dd>
                            </div>
                            <div className="sm:col-span-1">
                              <dt className="font-medium text-gray-500">Recommendations</dt>
                              <dd className="mt-1 text-gray-900">{report.recommendations}</dd>
                            </div>
                          </div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="bg-gray-50 px-6 py-3">
                  <Link
                    to="/student/progress"
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    View all feedback
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
