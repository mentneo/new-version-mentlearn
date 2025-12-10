import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/firebase.js';
import { useAuth } from '../../contexts/AuthContext.js';
import { FiBarChart2, FiCheckCircle, FiClock, FiAward, FiBookOpen, FiAward as FiGraduationCap, FiCalendar, FiTrendingUp, FiCircle, FiAward as FiTrophy, FiTarget, FiClock as FiClock3, FiBook, FiCalendar as FiCalendarDays } from 'react-icons/fi/index.js';
import { motion } from 'framer-motion';

export default function LearnIQProgress() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statistics, setStatistics] = useState({
    totalCourses: 0,
    completedCourses: 0,
    inProgressCourses: 0,
    totalLessons: 0,
    completedLessons: 0,
    certificatesEarned: 0,
    assignmentsCompleted: 0,
    assignmentsPending: 0,
    totalStudyTime: 0,
    weeklyStudyTime: [],
    averageScore: 0,
    quizzesTaken: 0,
    recentActivity: []
  });
  
  const [timeframe, setTimeframe] = useState('week'); // 'week', 'month', 'year'
  const [progressTab, setProgressTab] = useState('overview'); // 'overview', 'courses', 'time', 'activities'
  
  useEffect(() => {
    if (!currentUser) return;
    
    const fetchStudentProgress = async () => {
      try {
        setLoading(true);
        console.log('📊 Fetching progress for user:', currentUser.uid);
        
        // Fetch enrolled courses - check both userId and studentId
        const coursesQuery1 = query(
          collection(db, 'enrollments'),
          where('studentId', '==', currentUser.uid)
        );
        const coursesQuery2 = query(
          collection(db, 'enrollments'),
          where('userId', '==', currentUser.uid)
        );
        
        const [snapshot1, snapshot2] = await Promise.all([
          getDocs(coursesQuery1),
          getDocs(coursesQuery2)
        ]);
        
        // Combine and deduplicate enrollments
        const enrollmentsMap = new Map();
        [...snapshot1.docs, ...snapshot2.docs].forEach(doc => {
          const data = doc.data();
          if (!data.status || data.status === 'active' || data.status === 'completed') {
            enrollmentsMap.set(doc.id, data);
          }
        });
        const enrollments = Array.from(enrollmentsMap.values());
        
        console.log('📚 Found enrollments:', enrollments.length);
        
        // Extract course IDs and create map for quick lookup
        const courseIds = enrollments.map(enrollment => enrollment.courseId);
        const courseStatusMap = enrollments.reduce((map, enrollment) => {
          map[enrollment.courseId] = enrollment.status || 'in-progress';
          return map;
        }, {});
        
        // Count completed and in-progress courses
        const completedCourses = enrollments.filter(e => e.status === 'completed').length;
        const inProgressCourses = enrollments.filter(e => e.status === 'in-progress').length;
        
        // Fetch progress data (lessons completed) - check both userId and studentId
        let lessonProgress = [];
        try {
          const progressQuery1 = query(
            collection(db, 'completedLessons'),
            where('studentId', '==', currentUser.uid)
          );
          const progressQuery2 = query(
            collection(db, 'completedLessons'),
            where('userId', '==', currentUser.uid)
          );
          
          const [progSnapshot1, progSnapshot2] = await Promise.all([
            getDocs(progressQuery1).catch(() => ({ docs: [] })),
            getDocs(progressQuery2).catch(() => ({ docs: [] }))
          ]);
          
          const progressMap = new Map();
          [...progSnapshot1.docs, ...progSnapshot2.docs].forEach(doc => {
            progressMap.set(doc.id, doc.data());
          });
          lessonProgress = Array.from(progressMap.values());
          console.log('📖 Found lesson progress:', lessonProgress.length);
        } catch (err) {
          console.warn('⚠️ No completedLessons collection or error:', err.message);
        }
        
        // Count total and completed lessons
        const totalLessons = lessonProgress.length;
        const completedLessons = lessonProgress.filter(p => p.completed || p.isCompleted).length;
        
        // Fetch certificates - check both userId and studentId
        let certificatesCount = 0;
        try {
          const certificatesQuery1 = query(
            collection(db, 'certificates'),
            where('studentId', '==', currentUser.uid)
          );
          const certificatesQuery2 = query(
            collection(db, 'certificates'),
            where('userId', '==', currentUser.uid)
          );
          
          const [certSnapshot1, certSnapshot2] = await Promise.all([
            getDocs(certificatesQuery1).catch(() => ({ docs: [] })),
            getDocs(certificatesQuery2).catch(() => ({ docs: [] }))
          ]);
          
          const certsSet = new Set([...certSnapshot1.docs.map(d => d.id), ...certSnapshot2.docs.map(d => d.id)]);
          certificatesCount = certsSet.size;
          console.log('🏆 Found certificates:', certificatesCount);
        } catch (err) {
          console.warn('⚠️ No certificates collection or error:', err.message);
        }
        
        // Fetch assignments - check multiple field names
        let assignments = [];
        try {
          const assignmentsQuery1 = query(
            collection(db, 'studentAssignments'),
            where('studentId', '==', currentUser.uid)
          );
          const assignmentsQuery2 = query(
            collection(db, 'assignments'),
            where('studentIds', 'array-contains', currentUser.uid)
          );
          
          const [assignSnapshot1, assignSnapshot2] = await Promise.all([
            getDocs(assignmentsQuery1).catch(() => ({ docs: [] })),
            getDocs(assignmentsQuery2).catch(() => ({ docs: [] }))
          ]);
          
          const assignmentsMap = new Map();
          [...assignSnapshot1.docs, ...assignSnapshot2.docs].forEach(doc => {
            assignmentsMap.set(doc.id, doc.data());
          });
          assignments = Array.from(assignmentsMap.values());
          console.log('📝 Found assignments:', assignments.length);
        } catch (err) {
          console.warn('⚠️ No assignments collection or error:', err.message);
        }
        
        const completedAssignments = assignments.filter(a => a.status === 'completed' || a.status === 'submitted').length;
        const pendingAssignments = assignments.filter(a => a.status === 'pending' || a.status === 'assigned' || !a.status).length;
        
        // Fetch study time logs
        const timeframeDate = new Date();
        if (timeframe === 'week') {
          timeframeDate.setDate(timeframeDate.getDate() - 7);
        } else if (timeframe === 'month') {
          timeframeDate.setMonth(timeframeDate.getMonth() - 1);
        } else if (timeframe === 'year') {
          timeframeDate.setFullYear(timeframeDate.getFullYear() - 1);
        }
        
        // Fetch study time logs - handle gracefully if collection doesn't exist
        let studyTimeLogs = [];
        try {
          const studyTimeQuery1 = query(
            collection(db, 'studyTime'),
            where('studentId', '==', currentUser.uid),
            where('timestamp', '>=', timeframeDate),
            orderBy('timestamp', 'desc')
          );
          const studyTimeQuery2 = query(
            collection(db, 'studyTime'),
            where('userId', '==', currentUser.uid),
            where('timestamp', '>=', timeframeDate),
            orderBy('timestamp', 'desc')
          );
          
          const [timeSnapshot1, timeSnapshot2] = await Promise.all([
            getDocs(studyTimeQuery1).catch(() => ({ docs: [] })),
            getDocs(studyTimeQuery2).catch(() => ({ docs: [] }))
          ]);
          
          const timeMap = new Map();
          [...timeSnapshot1.docs, ...timeSnapshot2.docs].forEach(doc => {
            timeMap.set(doc.id, doc.data());
          });
          studyTimeLogs = Array.from(timeMap.values());
          console.log('⏱️ Found study time logs:', studyTimeLogs.length);
        } catch (err) {
          console.warn('⚠️ No studyTime collection or error:', err.message);
        }
        
        // Calculate total study time
        const totalStudyTime = studyTimeLogs.reduce((total, log) => total + (log.duration || 0), 0);
        
        // Prepare weekly study time data for chart
        const weeklyData = [];
        const today = new Date();
        for (let i = 6; i >= 0; i--) {
          const date = new Date();
          date.setDate(today.getDate() - i);
          
          // Format date as YYYY-MM-DD for comparison
          const dateString = date.toISOString().split('T')[0];
          
          // Filter logs for this day
          const dayLogs = studyTimeLogs.filter(log => {
            const logDate = log.timestamp?.toDate?.() || log.timestamp;
            return logDate.toISOString().split('T')[0] === dateString;
          });
          
          // Calculate total time for this day (in minutes)
          const dayTotal = dayLogs.reduce((total, log) => total + (log.duration || 0), 0);
          
          weeklyData.push({
            day: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()],
            minutes: dayTotal
          });
        }
        
        // Fetch quiz results - check both userId and studentId
        let quizResults = [];
        try {
          const quizResultsQuery1 = query(
            collection(db, 'quizResults'),
            where('studentId', '==', currentUser.uid)
          );
          const quizResultsQuery2 = query(
            collection(db, 'quizResults'),
            where('userId', '==', currentUser.uid)
          );
          
          const [quizSnapshot1, quizSnapshot2] = await Promise.all([
            getDocs(quizResultsQuery1).catch(() => ({ docs: [] })),
            getDocs(quizResultsQuery2).catch(() => ({ docs: [] }))
          ]);
          
          const quizMap = new Map();
          [...quizSnapshot1.docs, ...quizSnapshot2.docs].forEach(doc => {
            quizMap.set(doc.id, doc.data());
          });
          quizResults = Array.from(quizMap.values());
          console.log('📝 Found quiz results:', quizResults.length);
        } catch (err) {
          console.warn('⚠️ No quizResults collection or error:', err.message);
        }
        
        // Calculate average score
        const totalScore = quizResults.reduce((total, result) => total + (result.score || 0), 0);
        const averageScore = quizResults.length > 0 ? Math.round(totalScore / quizResults.length) : 0;
        
        // Collect recent activity (from various collections)
        const recentActivity = [
          ...studyTimeLogs.map(log => ({
            type: 'study',
            timestamp: log.timestamp?.toDate?.() || log.timestamp,
            title: log.courseName || 'Course study session',
            duration: log.duration || 0,
            courseId: log.courseId
          })),
          ...quizResults.map(result => ({
            type: 'quiz',
            timestamp: result.timestamp?.toDate?.() || result.timestamp,
            title: result.quizTitle || 'Quiz completed',
            score: result.score || 0,
            courseId: result.courseId
          })),
          ...lessonProgress.filter(p => p.completed).map(progress => ({
            type: 'lesson',
            timestamp: progress.lastAccessed?.toDate?.() || progress.lastAccessed,
            title: progress.lessonTitle || 'Lesson completed',
            courseId: progress.courseId
          }))
        ]
        .sort((a, b) => b.timestamp - a.timestamp)
        .slice(0, 10);
        
        // Update state with all statistics
        setStatistics({
          totalCourses: courseIds.length,
          completedCourses,
          inProgressCourses,
          totalLessons,
          completedLessons,
          certificatesEarned: certificatesCount,
          assignmentsCompleted: completedAssignments,
          assignmentsPending: pendingAssignments,
          totalStudyTime,
          weeklyStudyTime: weeklyData,
          averageScore,
          quizzesTaken: quizResults.length,
          recentActivity
        });
        
        setLoading(false);
      } catch (error) {
        console.error("❌ Error fetching progress data:", error);
        console.error("Error details:", error.message, error.code);
        setError(`Failed to load progress data: ${error.message}`);
        setLoading(false);
      }
    };
    
    fetchStudentProgress();
  }, [currentUser, timeframe]);
  
  // Format time (minutes to hours and minutes)
  const formatTime = (minutes) => {
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };
  
  // Format date
  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    
    const date = timestamp instanceof Date ? timestamp : timestamp.toDate();
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: 'numeric'
    }).format(date);
  };
  
  // Calculate course completion percentage
  const courseCompletion = statistics.totalCourses > 0
    ? Math.round((statistics.completedCourses / statistics.totalCourses) * 100)
    : 0;
  
  // Calculate lesson completion percentage
  const lessonCompletion = statistics.totalLessons > 0
    ? Math.round((statistics.completedLessons / statistics.totalLessons) * 100)
    : 0;
  
  // Find max study time in a day (for chart scaling)
  const maxStudyTime = Math.max(...statistics.weeklyStudyTime.map(day => day.minutes));
  
  return (
    <div className="max-w-7xl mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">My Learning Progress</h1>
        <p className="mt-1 text-sm text-gray-500">
          Track your achievements and learning journey
        </p>
      </div>
      
      {/* Tabs */}
      <div className="bg-white shadow rounded-xl mb-6 overflow-hidden">
        <div className="flex border-b border-gray-200">
          <button
            onClick={() => setProgressTab('overview')}
            className={`px-4 py-3 text-sm font-medium flex items-center ${
              progressTab === 'overview'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
            }`}
          >
            <FiBarChart2 size={16} className="mr-2" />
            Overview
          </button>
          <button
            onClick={() => setProgressTab('courses')}
            className={`px-4 py-3 text-sm font-medium flex items-center ${
              progressTab === 'courses'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
            }`}
          >
            <FiBook size={16} className="mr-2" />
            Courses
          </button>
          <button
            onClick={() => setProgressTab('time')}
            className={`px-4 py-3 text-sm font-medium flex items-center ${
              progressTab === 'time'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
            }`}
          >
            <FiClock size={16} className="mr-2" />
            Study Time
          </button>
          <button
            onClick={() => setProgressTab('activities')}
            className={`px-4 py-3 text-sm font-medium flex items-center ${
              progressTab === 'activities'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
            }`}
          >
            <FiCalendarDays size={16} className="mr-2" />
            Activities
          </button>
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : error ? (
        <div className="bg-red-50 text-red-800 p-4 rounded-md">
          <p>{error}</p>
        </div>
      ) : (
        <>
          {/* Overview Tab */}
          {progressTab === 'overview' && (
            <div>
              {/* Key Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                {/* Course Stats */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white shadow rounded-xl p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Course Progress</p>
                      <h3 className="text-2xl font-bold text-gray-900 mt-1">{courseCompletion}%</h3>
                    </div>
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <FiBook size={20} className="text-blue-600" />
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${courseCompletion}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{statistics.completedCourses} completed</span>
                    <span>{statistics.inProgressCourses} in progress</span>
                    <span>{statistics.totalCourses} total</span>
                  </div>
                </motion.div>
                
                {/* Lesson Stats */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="bg-white shadow rounded-xl p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Lessons Completed</p>
                      <h3 className="text-2xl font-bold text-gray-900 mt-1">{lessonCompletion}%</h3>
                    </div>
                    <div className="p-2 bg-green-100 rounded-lg">
                      <FiCheckCircle size={20} className="text-green-600" />
                    </div>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mb-2">
                    <div 
                      className="bg-green-500 h-2.5 rounded-full"
                      style={{ width: `${lessonCompletion}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>{statistics.completedLessons} completed</span>
                    <span>{statistics.totalLessons - statistics.completedLessons} remaining</span>
                    <span>{statistics.totalLessons} total</span>
                  </div>
                </motion.div>
                
                {/* Study Time */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  className="bg-white shadow rounded-xl p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Study Time</p>
                      <h3 className="text-2xl font-bold text-gray-900 mt-1">{formatTime(statistics.totalStudyTime)}</h3>
                    </div>
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <FiClock size={20} className="text-purple-600" />
                    </div>
                  </div>
                  
                  <div className="space-y-1.5 mb-2">
                    {statistics.weeklyStudyTime.map((day, index) => (
                      <div key={day.day} className="flex items-center">
                        <span className="text-xs text-gray-500 w-8">{day.day}</span>
                        <div className="flex-grow h-2 ml-2 bg-gray-200 rounded-full">
                          <div 
                            className="bg-purple-500 h-2 rounded-full"
                            style={{ 
                              width: maxStudyTime > 0 ? `${(day.minutes / maxStudyTime) * 100}%` : '0%'
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="text-xs text-gray-500 text-right">
                    Last 7 days
                  </div>
                </motion.div>
                
                {/* Achievements */}
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.3 }}
                  className="bg-white shadow rounded-xl p-6"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <p className="text-sm font-medium text-gray-500">Achievements</p>
                      <h3 className="text-2xl font-bold text-gray-900 mt-1">
                        {statistics.certificatesEarned + statistics.assignmentsCompleted}
                      </h3>
                    </div>
                    <div className="p-2 bg-yellow-100 rounded-lg">
                      <FiAward size={20} className="text-yellow-600" />
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <FiAward size={16} className="text-yellow-500 mr-2" />
                        <span className="text-sm text-gray-700">Certificates</span>
                      </div>
                      <span className="text-sm font-medium">{statistics.certificatesEarned}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <FiCheckCircle size={16} className="text-green-500 mr-2" />
                        <span className="text-sm text-gray-700">Assignments</span>
                      </div>
                      <span className="text-sm font-medium">{statistics.assignmentsCompleted}</span>
                    </div>
                    
                    <div className="flex justify-between items-center">
                      <div className="flex items-center">
                        <FiTarget size={16} className="text-blue-500 mr-2" />
                        <span className="text-sm text-gray-700">Quizzes</span>
                      </div>
                      <span className="text-sm font-medium">{statistics.quizzesTaken}</span>
                    </div>
                  </div>
                </motion.div>
              </div>
              
              {/* Recent Activity & Learning Summary */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Learning Summary */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.4 }}
                  className="bg-white shadow rounded-xl p-6 lg:col-span-1"
                >
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Learning Summary</h3>
                  
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <div className="p-2 bg-blue-100 rounded-lg mr-3">
                        <FiTrendingUp size={18} className="text-blue-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Average Quiz Score</p>
                        <p className="text-lg font-medium text-gray-900">{statistics.averageScore}%</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="p-2 bg-green-100 rounded-lg mr-3">
                        <FiAward size={18} className="text-green-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Courses Completed</p>
                        <p className="text-lg font-medium text-gray-900">{statistics.completedCourses}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="p-2 bg-yellow-100 rounded-lg mr-3">
                        <FiCircle size={18} className="text-yellow-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Courses In Progress</p>
                        <p className="text-lg font-medium text-gray-900">{statistics.inProgressCourses}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="p-2 bg-purple-100 rounded-lg mr-3">
                        <FiClock3 size={18} className="text-purple-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Average Study Time</p>
                        <p className="text-lg font-medium text-gray-900">
                          {statistics.weeklyStudyTime.length > 0 
                            ? formatTime(Math.round(statistics.totalStudyTime / 7))
                            : '0 min'
                          } / day
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      <div className="p-2 bg-red-100 rounded-lg mr-3">
                        <FiCalendar size={18} className="text-red-600" />
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Pending Assignments</p>
                        <p className="text-lg font-medium text-gray-900">{statistics.assignmentsPending}</p>
                      </div>
                    </div>
                  </div>
                </motion.div>
                
                {/* Recent Activity */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: 0.5 }}
                  className="bg-white shadow rounded-xl p-6 lg:col-span-2"
                >
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Recent Activity</h3>
                  
                  {statistics.recentActivity.length === 0 ? (
                    <div className="text-center py-8">
                      <FiCalendarDays className="h-12 w-12 mx-auto text-gray-400" />
                      <p className="mt-2 text-gray-500">No recent learning activity</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {statistics.recentActivity.map((activity, index) => (
                        <div key={index} className="flex">
                          <div className="flex-shrink-0 mt-1">
                            {activity.type === 'study' && (
                              <div className="p-2 bg-blue-100 rounded-full">
                                <FiClock size={14} className="text-blue-600" />
                              </div>
                            )}
                            {activity.type === 'quiz' && (
                              <div className="p-2 bg-purple-100 rounded-full">
                                <FiTarget size={14} className="text-purple-600" />
                              </div>
                            )}
                            {activity.type === 'lesson' && (
                              <div className="p-2 bg-green-100 rounded-full">
                                <FiBook size={14} className="text-green-600" />
                              </div>
                            )}
                          </div>
                          
                          <div className="ml-3 flex-1">
                            <div className="flex justify-between">
                              <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                              <p className="text-xs text-gray-500">{formatDate(activity.timestamp)}</p>
                            </div>
                            
                            <div className="mt-0.5 text-sm text-gray-500">
                              {activity.type === 'study' && (
                                <span>Studied for {formatTime(activity.duration)}</span>
                              )}
                              {activity.type === 'quiz' && (
                                <span>Scored {activity.score}%</span>
                              )}
                              {activity.type === 'lesson' && (
                                <span>Completed lesson</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          )}
          
          {/* Courses Tab */}
          {progressTab === 'courses' && (
            <div className="bg-white shadow rounded-xl overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex justify-between items-center">
                  <h3 className="text-lg font-medium text-gray-900">Course Progress</h3>
                  <div className="text-sm text-gray-500">
                    {statistics.completedCourses} of {statistics.totalCourses} courses completed
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2.5 mt-4">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full"
                    style={{ width: `${courseCompletion}%` }}
                  ></div>
                </div>
              </div>
              
              <div className="p-6">
                {statistics.totalCourses === 0 ? (
                  <div className="text-center py-8">
                    <FiBook className="h-12 w-12 mx-auto text-gray-400" />
                    <p className="mt-2 text-gray-500">You haven't enrolled in any courses yet</p>
                  </div>
                ) : (
                  <p className="text-center text-gray-600 py-12">
                    Course details will be displayed here. Currently showing course completion summary.
                  </p>
                )}
              </div>
            </div>
          )}
          
          {/* Study Time Tab */}
          {progressTab === 'time' && (
            <div>
              <div className="bg-white shadow rounded-xl p-6 mb-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-lg font-medium text-gray-900">Study Time Overview</h3>
                  
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setTimeframe('week')}
                      className={`px-3 py-1 text-sm rounded-md ${
                        timeframe === 'week'
                          ? 'bg-blue-100 text-blue-700'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      Week
                    </button>
                    <button
                      onClick={() => setTimeframe('month')}
                      className={`px-3 py-1 text-sm rounded-md ${
                        timeframe === 'month'
                          ? 'bg-blue-100 text-blue-700'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      Month
                    </button>
                    <button
                      onClick={() => setTimeframe('year')}
                      className={`px-3 py-1 text-sm rounded-md ${
                        timeframe === 'year'
                          ? 'bg-blue-100 text-blue-700'
                          : 'hover:bg-gray-100'
                      }`}
                    >
                      Year
                    </button>
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="col-span-1 md:col-span-2">
                    <h4 className="text-sm font-medium text-gray-500 mb-3">Daily Study Time</h4>
                    <div className="h-64 flex items-end space-x-2">
                      {statistics.weeklyStudyTime.map((day, index) => (
                        <div key={day.day} className="flex-1 flex flex-col items-center">
                          <div className="w-full bg-blue-100 rounded-t-md relative" 
                            style={{ 
                              height: maxStudyTime > 0 ? `${(day.minutes / maxStudyTime) * 100}%` : '0%',
                              minHeight: day.minutes > 0 ? '10%' : '0%'
                            }}
                          >
                            {day.minutes > 0 && (
                              <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 text-xs font-medium text-blue-700">
                                {formatTime(day.minutes)}
                              </div>
                            )}
                          </div>
                          <div className="text-xs text-gray-500 mt-2">{day.day}</div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h4 className="text-sm font-medium text-gray-500 mb-3">Summary</h4>
                    
                    <div className="space-y-4">
                      <div>
                        <p className="text-sm text-gray-500">Total study time</p>
                        <p className="text-xl font-bold text-gray-900">{formatTime(statistics.totalStudyTime)}</p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Average daily</p>
                        <p className="text-xl font-bold text-gray-900">
                          {statistics.weeklyStudyTime.length > 0 
                            ? formatTime(Math.round(statistics.totalStudyTime / 7))
                            : '0 min'
                          }
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Most productive day</p>
                        <p className="text-xl font-bold text-gray-900">
                          {statistics.weeklyStudyTime.length > 0 
                            ? (() => {
                                const mostProductiveDay = [...statistics.weeklyStudyTime].sort((a, b) => b.minutes - a.minutes)[0];
                                return mostProductiveDay.minutes > 0 ? `${mostProductiveDay.day} (${formatTime(mostProductiveDay.minutes)})` : 'None';
                              })()
                            : 'None'
                          }
                        </p>
                      </div>
                      
                      <div>
                        <p className="text-sm text-gray-500">Courses studied</p>
                        <p className="text-xl font-bold text-gray-900">{statistics.totalCourses}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Time Improvement Suggestions */}
              <div className="bg-white shadow rounded-xl p-6">
                <h3 className="text-lg font-medium text-gray-900 mb-4">Time Management Tips</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="p-2 bg-blue-100 rounded-full mr-2">
                        <FiTarget size={16} className="text-blue-600" />
                      </div>
                      <h4 className="font-medium text-blue-900">Set Clear Goals</h4>
                    </div>
                    <p className="text-sm text-blue-700">
                      Define specific, achievable learning objectives for each study session.
                    </p>
                  </div>
                  
                  <div className="bg-green-50 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="p-2 bg-green-100 rounded-full mr-2">
                        <FiClock size={16} className="text-green-600" />
                      </div>
                      <h4 className="font-medium text-green-900">Consistent Schedule</h4>
                    </div>
                    <p className="text-sm text-green-700">
                      Study at the same time each day to build a productive routine.
                    </p>
                  </div>
                  
                  <div className="bg-purple-50 rounded-lg p-4">
                    <div className="flex items-center mb-3">
                      <div className="p-2 bg-purple-100 rounded-full mr-2">
                        <FiBook size={16} className="text-purple-600" />
                      </div>
                      <h4 className="font-medium text-purple-900">Focused Sessions</h4>
                    </div>
                    <p className="text-sm text-purple-700">
                      Use the Pomodoro technique: 25 minutes of focused study followed by a 5-minute break.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Activities Tab */}
          {progressTab === 'activities' && (
            <div className="bg-white shadow rounded-xl overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-lg font-medium text-gray-900">Learning Activities</h3>
              </div>
              
              <div className="p-6">
                {statistics.recentActivity.length === 0 ? (
                  <div className="text-center py-8">
                    <FiCalendarDays className="h-12 w-12 mx-auto text-gray-400" />
                    <p className="mt-2 text-gray-500">No learning activities recorded yet</p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {statistics.recentActivity.map((activity, index) => (
                      <div key={index} className="flex">
                        <div className="flex-shrink-0">
                          {activity.type === 'study' && (
                            <div className="p-3 bg-blue-100 rounded-full">
                              <FiClock size={18} className="text-blue-600" />
                            </div>
                          )}
                          {activity.type === 'quiz' && (
                            <div className="p-3 bg-purple-100 rounded-full">
                              <FiTarget size={18} className="text-purple-600" />
                            </div>
                          )}
                          {activity.type === 'lesson' && (
                            <div className="p-3 bg-green-100 rounded-full">
                              <FiBook size={18} className="text-green-600" />
                            </div>
                          )}
                        </div>
                        
                        <div className="ml-4 flex-1">
                          <div className="flex justify-between items-start">
                            <div>
                              <p className="text-base font-medium text-gray-900">{activity.title}</p>
                              <p className="mt-1 text-sm text-gray-500">
                                {activity.type === 'study' && (
                                  <>Study session · {formatTime(activity.duration)}</>
                                )}
                                {activity.type === 'quiz' && (
                                  <>Quiz completed · Score: {activity.score}%</>
                                )}
                                {activity.type === 'lesson' && (
                                  <>Lesson completed</>
                                )}
                              </p>
                            </div>
                            <p className="text-sm text-gray-500">{formatDate(activity.timestamp)}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}