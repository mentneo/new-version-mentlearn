import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/firebase.js';
import { useAuth } from '../../contexts/AuthContext.js';
import { FiBarChart2, FiCheckCircle, FiClock, FiAward, FiUsers, FiTrendingUp, FiTarget, FiBook, FiCalendar, FiActivity } from 'react-icons/fi/index.js';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import Navbar from '../../components/mentor/Navbar.js';

const COLORS = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899'];

export default function MentorProgress() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [statistics, setStatistics] = useState({
    totalStudents: 0,
    activeStudents: 0,
    totalAssignments: 0,
    gradedAssignments: 0,
    pendingGrading: 0,
    certificatesIssued: 0,
    averageStudentProgress: 0,
    studentsProgress: [],
    assignmentStats: [],
    studentEngagement: [],
    recentActivity: []
  });
  
  const [timeframe, setTimeframe] = useState('month'); // 'week', 'month', 'year'
  const [progressTab, setProgressTab] = useState('overview'); // 'overview', 'students', 'assignments', 'engagement'
  
  useEffect(() => {
    if (!currentUser) return;
    
    const fetchMentorProgress = async () => {
      try {
        setLoading(true);
        
        // Fetch students assigned to this mentor
        const studentsQuery = query(
          collection(db, 'mentorStudents'),
          where('mentorId', '==', currentUser.uid)
        );
        
        const studentsSnapshot = await getDocs(studentsQuery);
        const students = studentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        const totalStudents = students.length;
        const activeStudents = students.filter(s => s.status === 'active').length;
        
        // Fetch assignments created by mentor
        const assignmentsQuery = query(
          collection(db, 'assignments'),
          where('mentorId', '==', currentUser.uid)
        );
        
        const assignmentsSnapshot = await getDocs(assignmentsQuery);
        const assignments = assignmentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // Fetch all submissions for these assignments
        const assignmentIds = assignments.map(a => a.id);
        let totalSubmissions = 0;
        let gradedSubmissions = 0;
        
        if (assignmentIds.length > 0) {
          const submissionsQuery = query(
            collection(db, 'submissions'),
            where('assignmentId', 'in', assignmentIds.slice(0, 10)) // Firestore limit
          );
          
          const submissionsSnapshot = await getDocs(submissionsQuery);
          const submissions = submissionsSnapshot.docs.map(doc => doc.data());
          
          totalSubmissions = submissions.length;
          gradedSubmissions = submissions.filter(s => s.grade !== undefined).length;
        }
        
        // Fetch certificates issued by this mentor
        const certificatesQuery = query(
          collection(db, 'certificates'),
          where('issuedBy', '==', currentUser.uid)
        );
        
        const certificatesSnapshot = await getDocs(certificatesQuery);
        const certificatesIssued = certificatesSnapshot.docs.length;
        
        // Calculate average student progress
        let totalProgress = 0;
        const studentsProgress = [];
        
        for (const student of students.slice(0, 20)) {
          const progressQuery = query(
            collection(db, 'lessonProgress'),
            where('studentId', '==', student.studentId)
          );
          
          const progressSnapshot = await getDocs(progressQuery);
          const lessons = progressSnapshot.docs.map(doc => doc.data());
          const completed = lessons.filter(l => l.completed).length;
          const progress = lessons.length > 0 ? (completed / lessons.length) * 100 : 0;
          
          totalProgress += progress;
          studentsProgress.push({
            name: student.studentName || 'Student',
            progress: Math.round(progress),
            completed: completed,
            total: lessons.length
          });
        }
        
        const averageProgress = students.length > 0 ? totalProgress / students.length : 0;
        
        // Calculate assignment statistics
        const assignmentStats = assignments.slice(0, 10).map(assignment => {
          const dueDate = assignment.dueDate?.toDate();
          const submissions = totalSubmissions; // Simplified for demo
          const studentCount = assignment.studentIds?.length || 0;
          
          return {
            name: assignment.title?.substring(0, 20) || 'Assignment',
            submitted: Math.min(submissions, studentCount),
            total: studentCount,
            percentage: studentCount > 0 ? (submissions / studentCount) * 100 : 0
          };
        });
        
        // Student engagement data (simplified)
        const studentEngagement = [
          { name: 'Active', value: activeStudents, color: '#10B981' },
          { name: 'Inactive', value: totalStudents - activeStudents, color: '#EF4444' }
        ];
        
        setStatistics({
          totalStudents,
          activeStudents,
          totalAssignments: assignments.length,
          gradedAssignments: gradedSubmissions,
          pendingGrading: totalSubmissions - gradedSubmissions,
          certificatesIssued,
          averageStudentProgress: Math.round(averageProgress),
          studentsProgress: studentsProgress.slice(0, 10),
          assignmentStats: assignmentStats.slice(0, 8),
          studentEngagement,
          recentActivity: []
        });
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching mentor progress:", error);
        setError("Failed to load progress data");
        setLoading(false);
      }
    };
    
    fetchMentorProgress();
  }, [currentUser, timeframe]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <Navbar />
        <div className="flex items-center justify-center h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading progress data...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Progress & Analytics</h1>
              <p className="mt-1 text-sm text-gray-500">
                Track your students' progress and performance
              </p>
            </div>
            
            <div className="mt-4 md:mt-0 flex items-center gap-2">
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="year">This Year</option>
              </select>
            </div>
          </div>
        </div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Students</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{statistics.totalStudents}</p>
                <p className="text-sm text-green-600 mt-1">
                  <FiTrendingUp className="inline mr-1" />
                  {statistics.activeStudents} active
                </p>
              </div>
              <div className="p-4 bg-indigo-100 rounded-lg">
                <FiUsers className="text-indigo-600 text-2xl" />
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Avg Progress</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{statistics.averageStudentProgress}%</p>
                <p className="text-sm text-gray-500 mt-1">Student completion</p>
              </div>
              <div className="p-4 bg-green-100 rounded-lg">
                <FiTarget className="text-green-600 text-2xl" />
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Pending Grading</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{statistics.pendingGrading}</p>
                <p className="text-sm text-orange-600 mt-1">
                  Requires attention
                </p>
              </div>
              <div className="p-4 bg-orange-100 rounded-lg">
                <FiClock className="text-orange-600 text-2xl" />
              </div>
            </div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Certificates Issued</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{statistics.certificatesIssued}</p>
                <p className="text-sm text-purple-600 mt-1">
                  <FiAward className="inline mr-1" />
                  Achievements
                </p>
              </div>
              <div className="p-4 bg-purple-100 rounded-lg">
                <FiAward className="text-purple-600 text-2xl" />
              </div>
            </div>
          </motion.div>
        </div>
        
        {/* Tabs */}
        <div className="bg-white rounded-xl p-2 shadow-sm border border-gray-100 mb-6 inline-flex">
          {[
            { value: 'overview', label: 'Overview', icon: <FiBarChart2 /> },
            { value: 'students', label: 'Students', icon: <FiUsers /> },
            { value: 'assignments', label: 'Assignments', icon: <FiBook /> },
            { value: 'engagement', label: 'Engagement', icon: <FiActivity /> }
          ].map((tab) => (
            <button
              key={tab.value}
              onClick={() => setProgressTab(tab.value)}
              className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                progressTab === tab.value
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Content */}
        {progressTab === 'overview' && (
          <div className="space-y-6">
            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Student Progress Chart */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Progress</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={statistics.studentsProgress}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="progress" fill="#4F46E5" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              
              {/* Student Engagement Pie Chart */}
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Student Engagement</h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={statistics.studentEngagement}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {statistics.studentEngagement.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Assignment Stats */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignment Completion</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={statistics.assignmentStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="submitted" fill="#10B981" name="Submitted" />
                  <Bar dataKey="total" fill="#E5E7EB" name="Total" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
        
        {progressTab === 'students' && (
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Student
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Progress
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Completed
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {statistics.studentsProgress.map((student, index) => (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                            <span className="text-indigo-600 font-medium">
                              {student.name.charAt(0)}
                            </span>
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{student.name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-1 mr-2">
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-indigo-600 h-2 rounded-full"
                                style={{ width: `${student.progress}%` }}
                              ></div>
                            </div>
                          </div>
                          <span className="text-sm text-gray-600">{student.progress}%</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.completed}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {student.total}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          student.progress >= 75
                            ? 'bg-green-100 text-green-800'
                            : student.progress >= 50
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {student.progress >= 75 ? 'On Track' : student.progress >= 50 ? 'Fair' : 'Behind'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
        
        {progressTab === 'assignments' && (
          <div className="space-y-4">
            {statistics.assignmentStats.map((assignment, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100"
              >
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900">{assignment.name}</h4>
                  <span className="text-sm text-gray-500">
                    {assignment.submitted}/{assignment.total} submitted
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-indigo-600 h-3 rounded-full transition-all"
                    style={{ width: `${assignment.percentage}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-2">
                  {Math.round(assignment.percentage)}% completion rate
                </p>
              </motion.div>
            ))}
          </div>
        )}
        
        {progressTab === 'engagement' && (
          <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-center py-12">
              <FiActivity className="text-5xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Engagement Analytics</h3>
              <p className="text-gray-600">
                Detailed engagement metrics coming soon
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
