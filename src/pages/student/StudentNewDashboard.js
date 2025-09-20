import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import StudentLayout from '../../components/layouts/StudentLayout';
import '../../styles/StudentDashboard.css';
import { 
  FaBook, 
  FaChartLine, 
  FaLaptopCode, 
  FaUserGraduate, 
  FaClipboardList, 
  FaUsers, 
  FaQuestionCircle, 
  FaGraduationCap,
  FaUser,
  FaCode,
  FaBriefcase,
  FaEdit,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaLinkedin,
  FaGithub,
  FaTwitter,
  FaGlobe
} from 'react-icons/fa';

export default function StudentNewDashboard() {
  const { currentUser } = useAuth();
  const { darkMode } = useTheme();
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [mentorReports, setMentorReports] = useState([]);
  const [assignedQuizzes, setAssignedQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);

  useEffect(() => {
    async function fetchStudentData() {
      try {
        if (!currentUser) return;

        // Fetch user profile
        const userDoc = await getDoc(doc(db, "users", currentUser.uid));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data());
        }

        // Regular user - fetch enrollments
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
        
        // Fetch all published available courses
        const coursesCollection = collection(db, "courses");
        const coursesQuery = query(coursesCollection, where('status', '==', 'published'));
        const coursesSnapshot = await getDocs(coursesQuery);
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
      <StudentLayout>
        <div className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center">
              <div className={`animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 ${darkMode ? 'border-indigo-400' : 'border-indigo-500'}`}></div>
            </div>
            <p className={`text-center mt-4 ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>Loading your dashboard...</p>
          </div>
        </div>
      </StudentLayout>
    );
  }

  return (
    <StudentLayout>
      <div className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col space-y-4 md:flex-row md:items-center md:justify-between md:space-y-0 mb-6 dashboard-header">
            <h1 className={`text-2xl sm:text-3xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Student Dashboard</h1>
            <div className="flex flex-col space-y-2 sm:flex-row sm:flex-wrap sm:gap-2 sm:space-y-0 dashboard-actions">
              <Link 
                to="/student/progress" 
                className={`inline-flex items-center justify-center px-3 py-2 sm:px-4 border border-transparent text-sm font-medium rounded-md ${darkMode ? 'text-indigo-200 bg-indigo-800 hover:bg-indigo-700' : 'text-indigo-700 bg-indigo-100 hover:bg-indigo-200'} touch-manipulation`}
              >
                <FaChartLine className="mr-1 sm:mr-2" /> View Progress
              </Link>
              <Link 
                to="/student/refer-and-earn" 
                className={`inline-flex items-center justify-center px-3 py-2 sm:px-4 border border-transparent text-sm font-medium rounded-md ${darkMode ? 'text-green-200 bg-green-800 hover:bg-green-700' : 'text-green-700 bg-green-100 hover:bg-green-200'} touch-manipulation`}
              >
                <FaUsers className="mr-1 sm:mr-2" /> Refer & Earn
              </Link>
              <Link 
                to="/student/quizzes" 
                className={`inline-flex items-center justify-center px-3 py-2 sm:px-4 border border-transparent text-sm font-medium rounded-md ${darkMode ? 'text-purple-200 bg-purple-800 hover:bg-purple-700' : 'text-purple-700 bg-purple-100 hover:bg-purple-200'} touch-manipulation`}
              >
                <FaQuestionCircle className="mr-1 sm:mr-2" /> Quizzes
              </Link>
              <Link 
                to="/student/interview-prep" 
                className="inline-flex items-center justify-center px-3 py-2 sm:px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 touch-manipulation"
              >
                <FaLaptopCode className="mr-1 sm:mr-2" /> Interview Prep
              </Link>
            </div>
          </div>
          
          {error && (
            <div className={`mt-4 ${darkMode ? 'bg-red-900 border-red-800 text-red-200' : 'bg-red-100 border-red-400 text-red-700'} border px-4 py-3 rounded`}>
              {error}
            </div>
          )}

          {/* Profile Section */}
          <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-6 dashboard-grid">
            <div className={`col-span-1 ${darkMode ? 'bg-gray-900' : 'bg-white'} rounded-lg shadow profile-card hover-card`}>
              <div className="px-4 py-5">
                <div className="flex items-center justify-between mb-3">
                  <h2 className={`text-lg font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    <FaUser className="inline mr-2" /> Profile
                  </h2>
                  <Link 
                    to="/student/profile" 
                    className={`text-sm font-medium ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}
                  >
                    <FaEdit className="inline mr-1" /> Edit Profile
                  </Link>
                </div>
                
                <div className="flex flex-col items-center pb-3 border-b border-gray-700">
                  <div className="relative mb-2">
                    {userProfile?.profileImageUrl ? (
                      <img 
                        src={userProfile.profileImageUrl} 
                        alt="Profile" 
                        className="h-24 w-24 rounded-full object-cover border-2 border-blue-500"
                      />
                    ) : (
                      <div className={`h-24 w-24 rounded-full flex items-center justify-center text-3xl font-bold ${darkMode ? 'bg-gray-800 text-blue-400 border border-gray-700' : 'bg-blue-100 text-blue-600'}`}>
                        {currentUser?.displayName?.charAt(0) || currentUser?.email?.charAt(0) || 'U'}
                      </div>
                    )}
                  </div>
                  
                  <h3 className={`mt-2 text-xl font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {userProfile?.firstName && userProfile?.lastName 
                      ? `${userProfile.firstName} ${userProfile.lastName}`
                      : currentUser?.displayName || currentUser?.email?.split('@')[0] || 'Student'}
                  </h3>
                  <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-600'}`}>Student</p>
                  
                  {userProfile?.bio && (
                    <p className={`mt-2 text-sm text-center ${darkMode ? 'text-gray-400' : 'text-gray-600'} line-clamp-2`}>
                      {userProfile.bio}
                    </p>
                  )}
                </div>
                
                <div className="mt-4">
                  <h3 className={`text-lg font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
                    Contact Information
                  </h3>
                  <div className="space-y-3">
                    {currentUser?.email && (
                      <div className="flex items-center">
                        <FaEnvelope className={`mr-3 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {currentUser.email}
                        </span>
                      </div>
                    )}
                    
                    {userProfile?.phone && (
                      <div className="flex items-center">
                        <FaPhone className={`mr-3 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {userProfile.phone}
                        </span>
                      </div>
                    )}
                    
                    {userProfile?.location && (
                      <div className="flex items-center">
                        <FaMapMarkerAlt className={`mr-3 ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                        <span className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>
                          {userProfile.location}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Skills */}
                {userProfile?.skills && userProfile.skills.length > 0 && (
                  <div className="mt-5 border-t border-gray-700 pt-4">
                    <h3 className={`flex items-center text-lg font-medium ${darkMode ? 'text-gray-200' : 'text-gray-700'} mb-2`}>
                      <FaCode className="mr-2" /> Skills
                    </h3>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {userProfile.skills.slice(0, 3).map((skill, index) => (
                        <span 
                          key={index}
                          className={`text-xs px-3 py-1 rounded-full ${darkMode ? 'bg-gray-800 text-blue-300 border border-gray-700' : 'bg-blue-50 text-blue-700'}`}
                        >
                          {skill}
                        </span>
                      ))}
                      {userProfile.skills.length > 3 && (
                        <Link 
                          to="/student/profile"
                          className={`text-xs px-3 py-1 rounded-full ${darkMode ? 'bg-blue-900 text-blue-300' : 'bg-blue-100 text-blue-700'}`}
                        >
                          +{userProfile.skills.length - 3} more
                        </Link>
                      )}
                    </div>
                  </div>
                )}
                
                {/* Social Links */}
                {userProfile?.socialLinks && Object.values(userProfile.socialLinks).some(link => link) && (
                  <div className="mt-5 flex items-center justify-center space-x-4">
                    {userProfile.socialLinks?.linkedin && (
                      <a href={userProfile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="hover:opacity-75 transition-opacity">
                        <FaLinkedin className={`text-xl ${darkMode ? 'text-blue-400' : 'text-blue-600'}`} />
                      </a>
                    )}
                    {userProfile.socialLinks?.github && (
                      <a href={userProfile.socialLinks.github} target="_blank" rel="noopener noreferrer" className="hover:opacity-75 transition-opacity">
                        <FaGithub className={`text-xl ${darkMode ? 'text-gray-300' : 'text-gray-800'}`} />
                      </a>
                    )}
                    {userProfile.socialLinks?.twitter && (
                      <a href={userProfile.socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="hover:opacity-75 transition-opacity">
                        <FaTwitter className={`text-xl ${darkMode ? 'text-blue-400' : 'text-blue-500'}`} />
                      </a>
                    )}
                    {userProfile.socialLinks?.website && (
                      <a href={userProfile.socialLinks.website} target="_blank" rel="noopener noreferrer" className="hover:opacity-75 transition-opacity">
                        <FaGlobe className={`text-xl ${darkMode ? 'text-green-400' : 'text-green-500'}`} />
                      </a>
                    )}
                  </div>
                )}
                
                <Link 
                  to="/student/profile" 
                  className={`mt-6 block w-full text-center px-4 py-3 border border-transparent rounded-md shadow-sm text-sm font-medium ${darkMode ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white'} transition-colors`}
                >
                  View Full Profile
                </Link>
              </div>
            </div>
            
            {/* Enrolled Courses and Other Dashboard Content */}
            <div className="col-span-1 lg:col-span-2 content-column">
              {/* Enrolled Courses Section */}
              <div className={`${darkMode ? 'bg-gray-900' : 'bg-white'} shadow rounded-lg p-5 mb-6 hover-card`}>
                <div className="flex items-center justify-between mb-4">
                  <h2 className={`text-lg font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                    <FaGraduationCap className="inline mr-2" /> My Courses
                  </h2>
                  <Link 
                    to="/student/courses" 
                    className={`text-sm font-medium ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}
                  >
                    View All
                  </Link>
                </div>
                
                {enrolledCourses.length > 0 ? (
                  <div className="space-y-4">
                    {enrolledCourses.slice(0, 2).map((course) => (
                      <Link
                        key={course.id}
                        to={`/student/course/${course.id}`}
                        className={`block ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'} p-4 rounded-lg border ${darkMode ? 'border-gray-800' : 'border-gray-200'} transition-colors`}
                      >
                        <div className="flex flex-col sm:flex-row">
                          <div className="flex-shrink-0">
                            <img 
                              src={course.thumbnailUrl || '/logo.png'} 
                              alt={course.title} 
                              className="h-16 w-16 object-cover rounded border border-gray-700"
                            />
                          </div>
                          <div className="mt-4 sm:mt-0 sm:ml-4 flex-1">
                            <h3 className={`text-base font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{course.title}</h3>
                            <div className="mt-2 flex items-center">
                              <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-blue-600 rounded-full" 
                                  style={{ width: `${course.progress || 0}%` }}
                                ></div>
                              </div>
                              <span className={`ml-2 text-xs font-medium ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                                {course.progress || 0}%
                              </span>
                            </div>
                            <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                              {course.modulesCount || 0} modules • {course.lessonsCount || 0} lessons
                            </p>
                          </div>
                        </div>
                      </Link>
                    ))}
                    
                    {enrolledCourses.length > 2 && (
                      <Link 
                        to="/student/courses"
                        className={`block text-center py-2 ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'} transition-colors`}
                      >
                        +{enrolledCourses.length - 2} more courses
                      </Link>
                    )}
                  </div>
                ) : (
                  <div className={`text-center py-8 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    <FaBook className="mx-auto h-10 w-10 mb-2 opacity-40" />
                    <p>You are not enrolled in any courses yet.</p>
                    <Link 
                      to="/student/courses" 
                      className={`mt-2 inline-block font-medium ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}
                    >
                      Browse available courses
                    </Link>
                  </div>
                )}
              </div>
              
              {/* Assigned Quizzes Section */}
              {assignedQuizzes.length > 0 && (
                <div className={`${darkMode ? 'bg-gray-900' : 'bg-white'} shadow rounded-lg p-5 mb-6 hover-card`}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className={`text-lg font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      <FaClipboardList className="inline mr-2" /> Assigned Quizzes
                    </h2>
                    <Link 
                      to="/student/quizzes" 
                      className={`text-sm font-medium ${darkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-500'}`}
                    >
                      View All
                    </Link>
                  </div>
                  
                  <div className="space-y-3">
                    {assignedQuizzes.slice(0, 3).map(quiz => (
                      <Link
                        key={quiz.id}
                        to={`/student/quiz/${quiz.id}`}
                        className={`block ${darkMode ? 'hover:bg-gray-800' : 'hover:bg-gray-50'} p-4 rounded-lg border ${darkMode ? 'border-gray-800' : 'border-gray-200'} transition-colors`}
                      >
                        <h3 className={`text-base font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>{quiz.title}</h3>
                        <p className={`mt-1 text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'} line-clamp-1`}>
                          {quiz.description || 'No description provided'}
                        </p>
                        <div className={`mt-2 flex items-center justify-end text-xs font-medium ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                          <FaClipboardList className="mr-1" /> Take quiz
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Mentor Reports Section */}
              {mentorReports.length > 0 && (
                <div className={`${darkMode ? 'bg-gray-900' : 'bg-white'} shadow rounded-lg p-5 hover-card`}>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className={`text-lg font-semibold ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                      <FaUserGraduate className="inline mr-2" /> Mentor Feedback
                    </h2>
                  </div>
                  
                  <div className="space-y-4">
                    {mentorReports.map(report => (
                      <div 
                        key={report.id}
                        className={`p-4 rounded-lg border ${darkMode ? 'border-gray-800 bg-gray-800' : 'border-gray-200 bg-gray-50'} hover:border-blue-500 transition-colors`}
                      >
                        <div className="flex items-start">
                          <div className="flex-1">
                            <h3 className={`text-base font-medium ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                              {report.title || 'Feedback Report'}
                            </h3>
                            <p className={`mt-1 text-sm ${darkMode ? 'text-blue-400' : 'text-blue-600'}`}>
                              {new Date(report.timestamp).toLocaleDateString()} - {report.mentorName || 'Mentor'}
                            </p>
                            <div className={`mt-2 text-sm ${darkMode ? 'text-gray-300' : 'text-gray-700'} line-clamp-3`}>
                              {report.content}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </StudentLayout>
  );
}