import React, { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc, limit, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/firebase.js';
import { useAuth } from '../../contexts/AuthContext.js';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
// // import Calendar from 'react-calendar';
// // import 'react-calendar/dist/Calendar.css';
import { FiBookOpen, FiAward, FiClock, FiCalendar, FiBarChart2, FiUser, FiSettings, FiBell, FiFileText, FiGrid, FiList, FiChevronRight, FiStar, FiArrowRight, FiCheck, FiPlay, FiAlertTriangle, FiActivity, FiDownload, FiShare2, FiPlusCircle, FiBook } from 'react-icons/fi/index.js';
import MenteoLogo from '../../components/MenteoLogo.js';

const COLORS = ['#E4E0FF', '#CDE8E5', '#F9D6D6', '#FFE8C8'];

export default function LearnIQDashboard() {
  const { currentUser } = useAuth();
  const [userData, setUserData] = useState(null);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [progressStats, setProgressStats] = useState({
    completedLessons: 0,
    totalHours: 0,
    activeCourses: 0,
    avgProgress: 0,
  });
  const [quizResults, setQuizResults] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [viewMode, setViewMode] = useState('grid');
  const [showAppNotif, setShowAppNotif] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [value, onChange] = useState(new Date());

  // Fetch user data
  const fetchUserData = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      const userDoc = await getDoc(doc(db, "users", currentUser.uid));
      if (userDoc.exists()) {
        setUserData(userDoc.data());
      }
    } catch (err) {
      console.error("Error fetching user data:", err);
      setError("Failed to load your profile data");
    }
  }, [currentUser]);

  // Fetch enrolled courses
  const fetchEnrolledCourses = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      // Query for both userId and studentId to support old and new enrollments
      const enrollmentsQuery1 = query(
        collection(db, "enrollments"),
        where("studentId", "==", currentUser.uid)
      );
      const enrollmentsQuery2 = query(
        collection(db, "enrollments"),
        where("userId", "==", currentUser.uid)
      );
      
      const [snapshot1, snapshot2] = await Promise.all([
        getDocs(enrollmentsQuery1),
        getDocs(enrollmentsQuery2)
      ]);
      
      // Combine results and remove duplicates, filter by status
      const enrollmentsMap = new Map();
      [...snapshot1.docs, ...snapshot2.docs].forEach(doc => {
        const data = doc.data();
        // Include if status is 'active', 'completed', or no status field (default to active)
        if (!data.status || data.status === 'active' || data.status === 'completed') {
          enrollmentsMap.set(doc.id, { id: doc.id, ...data });
        }
      });
      const enrollments = Array.from(enrollmentsMap.values());
      
      console.log('📚 Dashboard: Found enrollments:', enrollments.length);
      
      // For each enrollment, fetch the course details
      const coursesWithProgress = await Promise.all(
        enrollments.map(async (enrollment) => {
          const courseDoc = await getDoc(doc(db, "courses", enrollment.courseId));
          if (courseDoc.exists()) {
            // Fetch progress if available
            const progressQuery = query(
              collection(db, "progress"),
              where("studentId", "==", currentUser.uid),
              where("courseId", "==", enrollment.courseId),
              limit(1)
            );
            const progressSnapshot = await getDocs(progressQuery);
            let progress = enrollment.progress || 0;
            
            if (!progressSnapshot.empty) {
              const progressData = progressSnapshot.docs[0].data();
              progress = progressData.percentComplete || 0;
            }
            
            return {
              id: courseDoc.id,
              ...courseDoc.data(),
              progress,
              enrolledAt: enrollment.createdAt || enrollment.enrolledAt
            };
          }
          return null;
        })
      );
      
      const validCourses = coursesWithProgress.filter(course => course !== null);
      setEnrolledCourses(validCourses);
      
      // Calculate progress stats
      const activeCoursesCount = validCourses.length;
      const totalCompletedLessons = validCourses.reduce((total, course) => {
        return total + (course.completedLessons || 0);
      }, 0);
      
      const totalLearningHours = validCourses.reduce((total, course) => {
        return total + (course.timeSpent || 0);
      }, 0);
      
      const averageProgress = validCourses.length > 0 
        ? validCourses.reduce((total, course) => total + course.progress, 0) / validCourses.length 
        : 0;
      
      setProgressStats({
        completedLessons: totalCompletedLessons,
        totalHours: Math.round(totalLearningHours / 60), // Convert minutes to hours
        activeCourses: activeCoursesCount,
        avgProgress: averageProgress,
      });
    } catch (err) {
      console.error("Error fetching enrolled courses:", err);
      setError("Failed to load your enrolled courses");
    }
  }, [currentUser]);

  // Fetch upcoming deadlines
  const fetchUpcomingDeadlines = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      const today = new Date();
      const thirtyDaysLater = new Date();
      thirtyDaysLater.setDate(today.getDate() + 30);
      
      const assignmentsQuery = query(
        collection(db, "assignments"),
        where("studentIds", "array-contains", currentUser.uid),
        where("dueDate", ">=", today.toISOString()),
        where("dueDate", "<=", thirtyDaysLater.toISOString()),
        orderBy("dueDate", "asc")
      );
      
      const deadlinesSnapshot = await getDocs(assignmentsQuery);
      const deadlines = await Promise.all(
        deadlinesSnapshot.docs.map(async (doc) => {
          const assignmentData = doc.data();
          const courseDoc = await getDoc(doc(db, "courses", assignmentData.courseId));
          const courseName = courseDoc.exists() ? courseDoc.data().title : "Unknown Course";
          
          return {
            id: doc.id,
            title: assignmentData.title,
            description: assignmentData.description,
            dueDate: assignmentData.dueDate,
            courseName,
            courseId: assignmentData.courseId,
            type: assignmentData.type || "assignment"
          };
        })
      );
      
      setUpcomingDeadlines(deadlines);
    } catch (err) {
      console.error("Error fetching upcoming deadlines:", err);
      setError("Failed to load your upcoming deadlines");
    }
  }, [currentUser]);

  // Fetch recent activity
  const fetchRecentActivity = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      const activityQuery = query(
        collection(db, "activity"),
        where("userId", "==", currentUser.uid),
        orderBy("timestamp", "desc"),
        limit(5)
      );
      
      const activitySnapshot = await getDocs(activityQuery);
      const activities = await Promise.all(
        activitySnapshot.docs.map(async (doc) => {
          const activityData = doc.data();
          let courseTitle = "";
          
          if (activityData.courseId) {
            const courseDoc = await getDoc(doc(db, "courses", activityData.courseId));
            courseTitle = courseDoc.exists() ? courseDoc.data().title : "Unknown Course";
          }
          
          return {
            id: doc.id,
            ...activityData,
            courseTitle
          };
        })
      );
      
      setRecentActivity(activities);
    } catch (err) {
      console.error("Error fetching recent activity:", err);
      setError("Failed to load your recent activity");
    }
  }, [currentUser]);

  // Fetch quiz results
  const fetchQuizResults = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      const quizResultsQuery = query(
        collection(db, "quizResults"),
        where("studentId", "==", currentUser.uid),
        orderBy("completedAt", "desc"),
        limit(5)
      );
      
      const quizResultsSnapshot = await getDocs(quizResultsQuery);
      const results = await Promise.all(
        quizResultsSnapshot.docs.map(async (doc) => {
          const resultData = doc.data();
          
          // Fetch quiz details
          const quizDoc = await getDoc(doc(db, "quizzes", resultData.quizId));
          const quizTitle = quizDoc.exists() ? quizDoc.data().title : "Unknown Quiz";
          
          // Fetch course details
          let courseTitle = "Unknown Course";
          if (resultData.courseId) {
            const courseDoc = await getDoc(doc(db, "courses", resultData.courseId));
            courseTitle = courseDoc.exists() ? courseDoc.data().title : "Unknown Course";
          }
          
          return {
            id: doc.id,
            ...resultData,
            quizTitle,
            courseTitle
          };
        })
      );
      
      setQuizResults(results);
    } catch (err) {
      console.error("Error fetching quiz results:", err);
      setError("Failed to load your quiz results");
    }
  }, [currentUser]);

  // Fetch certificates
  const fetchCertificates = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      const certificatesQuery = query(
        collection(db, "certificates"),
        where("studentId", "==", currentUser.uid)
      );
      
      const certificatesSnapshot = await getDocs(certificatesQuery);
      const certificates = await Promise.all(
        certificatesSnapshot.docs.map(async (doc) => {
          const certificateData = doc.data();
          
          // Fetch course details
          let courseTitle = "Unknown Course";
          if (certificateData.courseId) {
            const courseDoc = await getDoc(doc(db, "courses", certificateData.courseId));
            courseTitle = courseDoc.exists() ? courseDoc.data().title : "Unknown Course";
          }
          
          return {
            id: doc.id,
            ...certificateData,
            courseTitle
          };
        })
      );
      
      setCertificates(certificates);
    } catch (err) {
      console.error("Error fetching certificates:", err);
      setError("Failed to load your certificates");
    }
  }, [currentUser]);

  // Load all data when component mounts
  useEffect(() => {
    const fetchAllData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchUserData(),
          fetchEnrolledCourses(),
          fetchUpcomingDeadlines(),
          fetchRecentActivity(),
          fetchQuizResults(),
          fetchCertificates()
        ]);
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setError("Failed to load your dashboard data");
      } finally {
        setLoading(false);
      }
    };
    
    fetchAllData();
    // Show app download notification unless user dismissed it before
    try {
      const dismissed = localStorage.getItem('dash_app_download_dismissed');
      if (!dismissed) setShowAppNotif(true);
    } catch (e) {
      // ignore localStorage errors
      setShowAppNotif(true);
    }
  }, [
    fetchUserData,
    fetchEnrolledCourses,
    fetchUpcomingDeadlines,
    fetchRecentActivity,
    fetchQuizResults,
    fetchCertificates
  ]);
  
  // Format time to readable string
  const formatTime = (minutes) => {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (hours === 0) {
      return `${remainingMinutes} min`;
    } else if (remainingMinutes === 0) {
      return `${hours} hr`;
    } else {
      return `${hours} hr ${remainingMinutes} min`;
    }
  };
  
  // Format date to readable string
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(date);
  };
  
  // Calculate days remaining
  const getDaysRemaining = (dateString) => {
    const dueDate = new Date(dateString);
    const today = new Date();
    const diffTime = dueDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-[#F6F8FC]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F8FC] font-['Inter']">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">My Learning Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Track your progress, manage your courses, and stay on top of your learning journey.
          </p>
        </div>
        
        {/* Statistics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {/* Active Courses */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-[#CDE8E5] rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Courses</p>
                <p className="mt-2 text-3xl font-bold">{progressStats.activeCourses}</p>
              </div>
              <div className="p-3 bg-white bg-opacity-60 rounded-lg">
                <FiBook size={24} className="text-teal-600" />
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-600">
              {progressStats.activeCourses > 0 ? (
                <p>Keep learning to maintain your streak!</p>
              ) : (
                <p>Enroll in courses to start learning</p>
              )}
            </div>
          </motion.div>
          
          {/* Completed Lessons */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-[#F9D6D6] rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed Lessons</p>
                <p className="mt-2 text-3xl font-bold">{progressStats.completedLessons}</p>
              </div>
              <div className="p-3 bg-white bg-opacity-60 rounded-lg">
                <FiCheck size={24} className="text-red-500" />
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-600">
              <p>Great progress on your learning journey!</p>
            </div>
          </motion.div>
          
          {/* Learning Hours */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-[#E4E0FF] rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Learning Hours</p>
                <p className="mt-2 text-3xl font-bold">{progressStats.totalHours}</p>
              </div>
              <div className="p-3 bg-white bg-opacity-60 rounded-lg">
                <FiClock size={24} className="text-indigo-600" />
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-600">
              <p>Total time invested in your education</p>
            </div>
          </motion.div>
          
          {/* Average Progress */}
          <motion.div 
            whileHover={{ y: -5 }}
            className="bg-white rounded-2xl shadow-lg p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Average Progress</p>
                <p className="mt-2 text-3xl font-bold">{Math.round(progressStats.avgProgress)}%</p>
              </div>
              <div className="p-3 bg-[#FFE8C8] bg-opacity-60 rounded-lg">
                <FiBarChart2 size={24} className="text-orange-500" />
              </div>
            </div>
            <div className="mt-4 text-xs text-gray-600">
              <p>Keep pushing to reach 100%!</p>
            </div>
          </motion.div>
        </div>
        
        {/* Main Dashboard Content - 2 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-8">
            {/* Enrolled Courses Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">My Enrolled Courses</h2>
                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded ${viewMode === 'grid' ? 'bg-gray-100 text-gray-900' : 'text-gray-500'}`}
                  >
                    <FiGrid size={18} />
                  </button>
                  <button 
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded ${viewMode === 'list' ? 'bg-gray-100 text-gray-900' : 'text-gray-500'}`}
                  >
                    <FiList size={18} />
                  </button>
                </div>
              </div>
              
              {enrolledCourses.length === 0 ? (
                <div className="text-center py-10">
                  <div className="mx-auto h-12 w-12 text-gray-400">
                    <FiBook size={48} className="h-12 w-12" />
                  </div>
                  <h3 className="mt-2 text-sm font-medium text-gray-900">No courses</h3>
                  <p className="mt-1 text-sm text-gray-500">
                    Get started by enrolling in a course.
                  </p>
                  <div className="mt-6">
                    <Link
                      to="/courses"
                      className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      <FiPlusCircle size={16} className="-ml-1 mr-2 h-4 w-4" />
                      Browse Courses
                    </Link>
                  </div>
                </div>
              ) : viewMode === 'grid' ? (
                // Grid View
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {enrolledCourses.map((course, index) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="h-40 bg-gray-200 relative">
                        {course.thumbnailUrl ? (
                          <img 
                            src={course.thumbnailUrl} 
                            alt={course.title} 
                            className="h-full w-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = "https://via.placeholder.com/300x150?text=Course+Image";
                            }}
                          />
                        ) : (
                          <div className="h-full w-full flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50">
                            <FiBook size={40} className="text-blue-400" />
                          </div>
                        )}
                        <div className="absolute top-2 right-2 bg-white bg-opacity-90 px-2 py-1 rounded-full text-xs font-medium">
                          {course.progress}% Complete
                        </div>
                      </div>
                      
                      <div className="p-4">
                        <h3 className="font-semibold text-gray-900 mb-1 truncate">{course.title}</h3>
                        <p className="text-sm text-gray-600 truncate mb-3">{course.creatorName || "Unknown Instructor"}</p>
                        
                        {/* Progress Bar */}
                        <div className="w-full h-2 bg-gray-200 rounded-full">
                          <div 
                            className="h-full bg-blue-500 rounded-full"
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                        
                        <div className="mt-4 flex items-center justify-between">
                          <Link
                            to={`/student/student-dashboard/course/${course.id}`}
                            className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center"
                          >
                            Continue Learning
                            <FiChevronRight size={16} className="ml-1" />
                          </Link>
                          <div className="flex items-center">
                            <FiClock size={14} className="text-gray-400 mr-1" />
                            <span className="text-xs text-gray-500">
                              {formatTime(course.timeSpent || 0)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                // List View
                <div className="space-y-4">
                  {enrolledCourses.map((course, index) => (
                    <motion.div
                      key={course.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                    >
                      <div className="flex items-center p-4">
                        <div className="flex-shrink-0 h-16 w-16 bg-gray-200 rounded-lg overflow-hidden">
                          {course.thumbnailUrl ? (
                            <img 
                              src={course.thumbnailUrl} 
                              alt={course.title} 
                              className="h-full w-full object-cover"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "https://via.placeholder.com/64?text=Course";
                              }}
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50">
                              <FiBook size={24} className="text-blue-400" />
                            </div>
                          )}
                        </div>
                        
                        <div className="ml-4 flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900">{course.title}</h3>
                            <span className="text-xs font-medium bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                              {course.progress}% Complete
                            </span>
                          </div>
                          
                          <p className="text-sm text-gray-600 mt-1">{course.creatorName || "Unknown Instructor"}</p>
                          
                          {/* Progress Bar */}
                          <div className="w-full h-2 bg-gray-200 rounded-full mt-2">
                            <div 
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${course.progress}%` }}
                            />
                          </div>
                          
                          <div className="mt-2 flex items-center justify-between">
                            <Link
                              to={`/student/student-dashboard/course/${course.id}`}
                              className="text-sm font-medium text-blue-600 hover:text-blue-700 flex items-center"
                            >
                              Continue Learning
                              <FiChevronRight size={16} className="ml-1" />
                            </Link>
                            <div className="flex items-center">
                              <FiClock size={14} className="text-gray-400 mr-1" />
                              <span className="text-xs text-gray-500">
                                {formatTime(course.timeSpent || 0)}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
              
              {enrolledCourses.length > 0 && (
                <div className="mt-6 text-center">
                  <Link
                    to="/student/courses"
                    className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700"
                  >
                    View All Courses
                    <FiArrowRight size={16} className="ml-1" />
                  </Link>
                </div>
              )}
            </div>
            
            {/* Recent Activity Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
              
              {recentActivity.length === 0 ? (
                <div className="text-center py-6">
                  <FiActivity size={32} className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">No recent activity</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {recentActivity.map((activity, index) => (
                    <motion.div
                      key={activity.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="flex items-start"
                    >
                      <div className="flex-shrink-0">
                        <div className={`p-2 rounded-full ${
                          activity.type === 'lesson_completed' ? 'bg-green-100' :
                          activity.type === 'quiz_completed' ? 'bg-blue-100' :
                          activity.type === 'course_enrolled' ? 'bg-purple-100' :
                          'bg-gray-100'
                        }`}>
                          {activity.type === 'lesson_completed' ? <FiCheck size={16} className="text-green-600" /> :
                           activity.type === 'quiz_completed' ? <FiFileText size={16} className="text-blue-600" /> :
                           activity.type === 'course_enrolled' ? <FiBook size={16} className="text-purple-600" /> :
                           <FiActivity size={16} className="text-gray-600" />}
                        </div>
                      </div>
                      <div className="ml-4 flex-1">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{activity.description}</p>
                            <p className="text-xs text-gray-500">{activity.courseTitle}</p>
                          </div>
                          <span className="text-xs text-gray-500">
                            {formatDate(activity.timestamp)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Performance Analytics Section */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Learning Progress</h2>
              
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={enrolledCourses.map(course => ({
                      name: course.title,
                      progress: course.progress
                    }))}
                    margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
                    <YAxis domain={[0, 100]} />
                    <Tooltip />
                    <Bar dataKey="progress" fill="#8884d8" name="Progress (%)" radius={[4, 4, 0, 0]}>
                      {enrolledCourses.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          {/* Right Column - 1/3 width */}
          <div className="space-y-8">
            {/* App download notification (dismissible) */}
            {showAppNotif && (
              <div className="bg-white rounded-2xl shadow-lg p-4 border border-blue-50">
                <div className="flex items-center">
                  <div className="mr-3">
                    <MenteoLogo size="large" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-gray-900">Get the Mentneo Mobile App</p>
                    <p className="text-xs text-gray-600 mt-1">
                      Download the app now and enjoy the feature. If any drawbacks occur, inform us at <a href="mailto:official@mentlearn.in" className="text-blue-600">official@mentlearn.in</a>.
                    </p>

                    <div className="mt-3 flex items-center space-x-2">
                      <a
                        href="https://expo.dev/artifacts/eas/nNw7m5dHuiGsbHMoozH3Xj.apk"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700"
                      >
                        <FiDownload className="mr-2" /> Download APK
                      </a>

                      <button
                        onClick={() => { localStorage.setItem('dash_app_download_dismissed','1'); setShowAppNotif(false); }}
                        className="px-3 py-2 text-sm rounded-md border border-gray-200 bg-white hover:bg-gray-50"
                      >
                        Dismiss
                      </button>

                      <label className="ml-2 text-xs text-gray-500 flex items-center">
                        <input
                          type="checkbox"
                          className="mr-1"
                          onChange={(e) => {
                            if (e.target.checked) localStorage.setItem('dash_app_download_dismissed','1');
                            else localStorage.removeItem('dash_app_download_dismissed');
                          }}
                        />
                        Don't show again
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* Profile Summary */}
            <motion.div 
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden"
            >
              <div className="p-6">
                <div className="flex items-center space-x-4">
                  <img
                    src={userData?.photoURL || "https://via.placeholder.com/64"}
                    alt="Profile"
                    className="h-16 w-16 rounded-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = "https://via.placeholder.com/64?text=Profile";
                    }}
                  />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {userData?.displayName || "Student"}
                    </h3>
                    <p className="text-sm text-gray-600">
                      {userData?.email || ""}
                    </p>
                    <div className="mt-1 flex items-center">
                      <span className="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                        {userData?.role || "Student"}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="mt-6 grid grid-cols-3 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{enrolledCourses.length}</p>
                    <p className="text-xs text-gray-600">Courses</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{certificates.length}</p>
                    <p className="text-xs text-gray-600">Certificates</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{quizResults.length}</p>
                    <p className="text-xs text-gray-600">Quizzes</p>
                  </div>
                </div>
                <div className="mt-6">
                  <Link
                    to="/student/profile"
                    className="block w-full text-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100"
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            </motion.div>
            
            {/* Upcoming Deadlines */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Upcoming Deadlines</h2>
              
              {upcomingDeadlines.length === 0 ? (
                <div className="text-center py-6">
                  <FiCalendar size={32} className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">No upcoming deadlines</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {upcomingDeadlines.map((deadline) => (
                    <div key={deadline.id} className="bg-white border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <h3 className="font-medium text-gray-900">{deadline.title}</h3>
                          <p className="text-sm text-gray-600 mt-1">{deadline.courseName}</p>
                          
                          <div className="flex items-center mt-2">
                            <FiCalendar size={14} className="text-gray-400" />
                            <span className="text-xs text-gray-500 ml-1">
                              Due {formatDate(deadline.dueDate)}
                            </span>
                          </div>
                        </div>
                        
                        <div className="flex-shrink-0 ml-4">
                          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                            ${getDaysRemaining(deadline.dueDate) <= 3 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}
                          `}>
                            {getDaysRemaining(deadline.dueDate)} days left
                          </span>
                        </div>
                      </div>
                      
                      {deadline.description && (
                        <p className="mt-2 text-xs text-gray-500 line-clamp-2">{deadline.description}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Calendar */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Calendar</h2>
              <div className="calendar-container">
                <FiCalendar
                  onChange={onChange}
                  value={value}
                  className="w-full border-0 shadow-none"
                  tileClassName="rounded-full"
                />
              </div>
            </div>
            
            {/* Certificates */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">My Certificates</h2>
              
              {certificates.length === 0 ? (
                <div className="text-center py-6">
                  <FiAward size={32} className="mx-auto h-8 w-8 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-500">Complete courses to earn certificates</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {certificates.map((certificate) => (
                    <div key={certificate.id} className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-4 border border-blue-100">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center">
                            <FiAward size={16} className="text-yellow-500" />
                            <h3 className="ml-2 font-medium text-gray-900">
                              {certificate.title || certificate.courseTitle}
                            </h3>
                          </div>
                          <p className="text-xs text-gray-600 mt-1">
                            Issued on {formatDate(certificate.issuedDate)}
                          </p>
                        </div>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => window.open(certificate.certificateUrl, '_blank')}
                            className="p-1.5 rounded-full bg-white text-blue-600 hover:bg-blue-50"
                          >
                            <FiDownload size={14} />
                          </button>
                          <button
                            onClick={() => navigator.clipboard.writeText(certificate.certificateUrl)}
                            className="p-1.5 rounded-full bg-white text-blue-600 hover:bg-blue-50"
                          >
                            <FiShare2 size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            {/* Recent Quiz Results */}
            {quizResults.length > 0 && (
              <div className="bg-white rounded-2xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Recent Quiz Results</h2>
                
                <div className="space-y-4">
                  {quizResults.map((result) => (
                    <div key={result.id} className="bg-white border border-gray-100 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium text-gray-900">{result.quizTitle}</h3>
                        <div className={`text-sm font-medium px-2 py-1 rounded-full ${
                          result.score >= 80 ? 'bg-green-100 text-green-800' :
                          result.score >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {result.score}%
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-600 mt-1">{result.courseTitle}</p>
                      
                      <div className="mt-2 flex items-center justify-between">
                        <div className="flex items-center">
                          <FiFileText size={14} className="text-gray-400" />
                          <span className="text-xs text-gray-500 ml-1">
                            {result.correctAnswers} of {result.totalQuestions} correct
                          </span>
                        </div>
                        <span className="text-xs text-gray-500">
                          {formatDate(result.completedAt)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Custom CSS for Calendar */}
      <style jsx>{`
        .react-calendar {
          width: 100%;
          border: none;
          font-family: 'Inter', sans-serif;
        }
        .react-calendar button {
          border-radius: 50%;
          margin: 2px;
          height: 36px;
        }
        .react-calendar__tile--active {
          background: #3b82f6 !important;
          color: white;
        }
        .react-calendar__tile--now {
          background: #dbeafe;
        }
        .react-calendar__navigation button {
          border-radius: 8px;
        }
      `}</style>
    </div>
  );
}