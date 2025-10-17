import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc, orderBy, limit } from 'firebase/firestore';
import { db } from '../../firebase/firebase.js';
import { useAuth } from '../../contexts/AuthContext.js';
import { motion } from 'framer-motion';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line
} from 'recharts';
import { 
  FiUsers, FiFileText, FiCheckCircle, FiClock, FiBarChart2, 
  FiBell, FiCalendar, FiAward, FiBookOpen, FiTrendingUp,
  FiChevronRight, FiActivity, FiStar, FiTarget
} from 'react-icons/fi/index.js';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444'];

export default function MentorDashboard() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [mentorData, setMentorData] = useState(null);
  const [students, setStudents] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [statistics, setStatistics] = useState({
    totalStudents: 0,
    activeStudents: 0,
    totalAssignments: 0,
    pendingReviews: 0,
    completionRate: 0,
    averageGrade: 0,
    hoursThisWeek: 0,
    notificationsUnread: 0
  });

  // Fetch mentor data
  const fetchMentorData = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      const mentorDoc = await getDoc(doc(db, "users", currentUser.uid));
      if (mentorDoc.exists()) {
        setMentorData(mentorDoc.data());
      }
    } catch (err) {
      console.error("Error fetching mentor data:", err);
      setError("Failed to load your profile data");
    }
  }, [currentUser]);

  // Fetch mentor's students
  const fetchStudents = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      // Query mentorStudents collection to find students assigned to this mentor
      const studentsQuery = query(
        collection(db, "mentorStudents"),
        where("mentorId", "==", currentUser.uid)
      );
      
      const studentsSnapshot = await getDocs(studentsQuery);
      const studentIds = studentsSnapshot.docs.map(doc => doc.data().studentId);
      
      // Fetch student details
      const studentsData = [];
      for (const studentId of studentIds) {
        const studentDoc = await getDoc(doc(db, "users", studentId));
        if (studentDoc.exists()) {
          // Get student's progress
          const enrollmentsQuery = query(
            collection(db, "enrollments"),
            where("studentId", "==", studentId)
          );
          const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
          const coursesCount = enrollmentsSnapshot.docs.length;
          
          // Calculate average progress
          let totalProgress = 0;
          enrollmentsSnapshot.docs.forEach(doc => {
            totalProgress += doc.data().progress || 0;
          });
          const avgProgress = coursesCount > 0 ? totalProgress / coursesCount : 0;
          
          studentsData.push({
            id: studentId,
            ...studentDoc.data(),
            coursesEnrolled: coursesCount,
            progress: Math.round(avgProgress),
            lastActive: studentDoc.data().lastActive?.toDate() || new Date()
          });
        }
      }
      
      setStudents(studentsData);
      
      // Calculate active students (logged in within last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      const activeCount = studentsData.filter(s => s.lastActive > sevenDaysAgo).length;
      
      setStatistics(prev => ({
        ...prev,
        totalStudents: studentsData.length,
        activeStudents: activeCount
      }));
    } catch (err) {
      console.error("Error fetching students:", err);
      setError("Failed to load students data");
    }
  }, [currentUser]);

  // Fetch assignments
  const fetchAssignments = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      // Get assignments created by this mentor
      const assignmentsQuery = query(
        collection(db, "assignments"),
        where("createdBy", "==", currentUser.uid),
        orderBy("dueDate", "desc")
      );
      
      const assignmentsSnapshot = await getDocs(assignmentsQuery);
      const assignmentsData = assignmentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        dueDate: doc.data().dueDate?.toDate() || new Date()
      }));
      
      setAssignments(assignmentsData);
      
      // Count pending reviews (submitted but not graded)
      const submissionsQuery = query(
        collection(db, "submissions"),
        where("mentorId", "==", currentUser.uid),
        where("status", "==", "submitted")
      );
      
      const submissionsSnapshot = await getDocs(submissionsQuery);
      const pendingReviews = submissionsSnapshot.docs.length;
      
      // Calculate completion rate
      const completedQuery = query(
        collection(db, "submissions"),
        where("mentorId", "==", currentUser.uid),
        where("status", "==", "graded")
      );
      
      const completedSnapshot = await getDocs(completedQuery);
      const totalSubmissions = submissionsSnapshot.docs.length + completedSnapshot.docs.length;
      const completionRate = totalSubmissions > 0 
        ? Math.round((completedSnapshot.docs.length / totalSubmissions) * 100) 
        : 0;
      
      // Calculate average grade
      const gradedSubmissions = completedSnapshot.docs.map(doc => doc.data());
      const totalGrade = gradedSubmissions.reduce((sum, sub) => sum + (sub.grade || 0), 0);
      const averageGrade = gradedSubmissions.length > 0 
        ? Math.round(totalGrade / gradedSubmissions.length) 
        : 0;
      
      setStatistics(prev => ({
        ...prev,
        totalAssignments: assignmentsData.length,
        pendingReviews,
        completionRate,
        averageGrade
      }));
    } catch (err) {
      console.error("Error fetching assignments:", err);
      setError("Failed to load assignments data");
    }
  }, [currentUser]);

  // Fetch upcoming events
  const fetchUpcomingEvents = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      const today = new Date();
      const eventsQuery = query(
        collection(db, "mentorEvents"),
        where("mentorId", "==", currentUser.uid),
        where("date", ">=", today),
        orderBy("date", "asc"),
        limit(5)
      );
      
      const eventsSnapshot = await getDocs(eventsQuery);
      const eventsData = eventsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate() || new Date()
      }));
      
      setUpcomingEvents(eventsData);
    } catch (err) {
      console.error("Error fetching events:", err);
    }
  }, [currentUser]);

  // Fetch recent activity
  const fetchRecentActivity = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      // Get recent submissions
      const submissionsQuery = query(
        collection(db, "submissions"),
        where("mentorId", "==", currentUser.uid),
        orderBy("submittedAt", "desc"),
        limit(10)
      );
      
      const submissionsSnapshot = await getDocs(submissionsQuery);
      const activities = await Promise.all(
        submissionsSnapshot.docs.map(async (docSnap) => {
          const submission = docSnap.data();
          const studentDoc = await getDoc(doc(db, "users", submission.studentId));
          const assignmentDoc = await getDoc(doc(db, "assignments", submission.assignmentId));
          
          return {
            id: docSnap.id,
            type: 'submission',
            studentName: studentDoc.exists() ? studentDoc.data().name : 'Unknown Student',
            assignmentTitle: assignmentDoc.exists() ? assignmentDoc.data().title : 'Unknown Assignment',
            timestamp: submission.submittedAt?.toDate() || new Date(),
            status: submission.status
          };
        })
      );
      
      setRecentActivity(activities);
    } catch (err) {
      console.error("Error fetching recent activity:", err);
    }
  }, [currentUser]);

  // Fetch unread notifications count
  const fetchNotifications = useCallback(async () => {
    if (!currentUser) return;
    
    try {
      const notificationsQuery = query(
        collection(db, "notifications"),
        where("userId", "==", currentUser.uid),
        where("read", "==", false)
      );
      
      const notificationsSnapshot = await getDocs(notificationsQuery);
      setStatistics(prev => ({
        ...prev,
        notificationsUnread: notificationsSnapshot.docs.length
      }));
    } catch (err) {
      console.error("Error fetching notifications:", err);
    }
  }, [currentUser]);

  // Initialize dashboard data
  useEffect(() => {
    const initializeDashboard = async () => {
      setLoading(true);
      await Promise.all([
        fetchMentorData(),
        fetchStudents(),
        fetchAssignments(),
        fetchUpcomingEvents(),
        fetchRecentActivity(),
        fetchNotifications()
      ]);
      setLoading(false);
    };
    
    if (currentUser) {
      initializeDashboard();
    }
  }, [currentUser, fetchMentorData, fetchStudents, fetchAssignments, fetchUpcomingEvents, fetchRecentActivity, fetchNotifications]);

  // Format time ago
  const formatTimeAgo = (date) => {
    const seconds = Math.floor((new Date() - date) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + " years ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + " months ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + " days ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + " hours ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + " minutes ago";
    return Math.floor(seconds) + " seconds ago";
  };

  // Stat cards data
  const statCards = [
    {
      title: 'Total Students',
      value: statistics.totalStudents,
      icon: FiUsers,
      color: 'indigo',
      bgColor: 'bg-indigo-100',
      textColor: 'text-indigo-600',
      subtitle: `${statistics.activeStudents} active this week`
    },
    {
      title: 'Total Assignments',
      value: statistics.totalAssignments,
      icon: FiFileText,
      color: 'blue',
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-600',
      subtitle: `${statistics.pendingReviews} pending reviews`
    },
    {
      title: 'Completion Rate',
      value: `${statistics.completionRate}%`,
      icon: FiCheckCircle,
      color: 'green',
      bgColor: 'bg-green-100',
      textColor: 'text-green-600',
      subtitle: 'Average across all assignments'
    },
    {
      title: 'Average Grade',
      value: `${statistics.averageGrade}%`,
      icon: FiAward,
      color: 'yellow',
      bgColor: 'bg-yellow-100',
      textColor: 'text-yellow-600',
      subtitle: 'Student performance'
    }
  ];

  // Chart data for student progress
  const studentProgressData = students.slice(0, 5).map(student => ({
    name: student.name?.split(' ')[0] || 'Student',
    progress: student.progress || 0
  }));

  // Chart data for assignment status
  const assignmentStatusData = [
    { name: 'Pending', value: statistics.pendingReviews },
    { name: 'Graded', value: statistics.totalAssignments - statistics.pendingReviews }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900">Loading your dashboard...</h2>
          <p className="text-gray-600 mt-2">Please wait while we fetch your data</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-6 py-4 rounded-lg max-w-md">
            <p className="font-semibold">Error loading dashboard</p>
            <p className="text-sm mt-2">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {mentorData?.name || 'Mentor'}! 👋
          </h1>
          <p className="text-gray-600 text-lg">
            Here's what's happening with your students today
          </p>
        </motion.div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow duration-300 p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.textColor}`} />
                </div>
                <span className={`text-xs font-semibold px-2 py-1 rounded-full ${stat.bgColor} ${stat.textColor}`}>
                  {stat.color}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</h3>
              <p className="text-sm text-gray-600 font-medium mb-1">{stat.title}</p>
              <p className="text-xs text-gray-500">{stat.subtitle}</p>
            </motion.div>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Student Progress Chart */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 }}
            className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Student Progress</h2>
              <Link 
                to="/mentor/progress"
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1"
              >
                View All <FiChevronRight />
              </Link>
            </div>
            {studentProgressData.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={studentProgressData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff', 
                      border: '1px solid #e5e7eb',
                      borderRadius: '8px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Bar dataKey="progress" fill="#4F46E5" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <p>No student data available</p>
              </div>
            )}
          </motion.div>

          {/* Assignment Status */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <h2 className="text-xl font-bold text-gray-900 mb-6">Assignment Status</h2>
            {assignmentStatusData.some(d => d.value > 0) ? (
              <>
                <ResponsiveContainer width="100%" height={200}>
                  <PieChart>
                    <Pie
                      data={assignmentStatusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {assignmentStatusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="mt-4 space-y-2">
                  {assignmentStatusData.map((item, index) => (
                    <div key={item.name} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[index % COLORS.length] }}
                        />
                        <span className="text-sm text-gray-600">{item.name}</span>
                      </div>
                      <span className="text-sm font-semibold text-gray-900">{item.value}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <div className="h-64 flex items-center justify-center text-gray-500">
                <p>No assignments yet</p>
              </div>
            )}
          </motion.div>
        </div>

        {/* Recent Activity & Students */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Activity */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Recent Activity</h2>
              <FiActivity className="text-gray-400" />
            </div>
            <div className="space-y-4">
              {recentActivity.length > 0 ? (
                recentActivity.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex-shrink-0 w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center">
                      <FiFileText className="text-indigo-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {activity.studentName}
                      </p>
                      <p className="text-sm text-gray-600 truncate">
                        Submitted: {activity.assignmentTitle}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatTimeAgo(activity.timestamp)}
                      </p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      activity.status === 'graded' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-yellow-100 text-yellow-700'
                    }`}>
                      {activity.status}
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FiActivity className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </motion.div>

          {/* Students List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-xl shadow-sm p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Your Students</h2>
              <Link 
                to="/mentor/progress"
                className="text-indigo-600 hover:text-indigo-700 text-sm font-medium flex items-center gap-1"
              >
                View All <FiChevronRight />
              </Link>
            </div>
            <div className="space-y-3">
              {students.length > 0 ? (
                students.slice(0, 5).map((student) => (
                  <div key={student.id} className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
                        {student.name?.charAt(0) || 'S'}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-gray-900">{student.name}</p>
                        <p className="text-xs text-gray-500">{student.coursesEnrolled} courses</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-indigo-600">{student.progress}%</p>
                      <p className="text-xs text-gray-500">Progress</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <FiUsers className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                  <p>No students assigned yet</p>
                </div>
              )}
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4"
        >
          <Link
            to="/mentor/assignments"
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-300 group"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-indigo-100 rounded-lg group-hover:bg-indigo-200 transition-colors">
                <FiFileText className="h-6 w-6 text-indigo-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Assignments</p>
                <p className="text-xs text-gray-500">Manage & grade</p>
              </div>
            </div>
          </Link>

          <Link
            to="/mentor/calendar"
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-300 group"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                <FiCalendar className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Calendar</p>
                <p className="text-xs text-gray-500">Schedule events</p>
              </div>
            </div>
          </Link>

          <Link
            to="/mentor/notifications"
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-300 group relative"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-yellow-100 rounded-lg group-hover:bg-yellow-200 transition-colors">
                <FiBell className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Notifications</p>
                <p className="text-xs text-gray-500">View updates</p>
              </div>
            </div>
            {statistics.notificationsUnread > 0 && (
              <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold rounded-full h-6 w-6 flex items-center justify-center">
                {statistics.notificationsUnread}
              </span>
            )}
          </Link>

          <Link
            to="/mentor/progress"
            className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-300 group"
          >
            <div className="flex items-center gap-3">
              <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                <FiBarChart2 className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-900">Progress</p>
                <p className="text-xs text-gray-500">Track students</p>
              </div>
            </div>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
