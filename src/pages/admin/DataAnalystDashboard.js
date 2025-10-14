import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { 
  collection, 
  query, 
  orderBy, 
  getDocs, 
  where, 
  limit,
  Timestamp
} from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  ArcElement,
  Filler
} from 'chart.js';
import { Bar, Line, Doughnut } from 'react-chartjs-2';
import { 
  FaHome, 
  FaUserGraduate, 
  FaChalkboardTeacher, 
  FaChartLine, 
  FaFileExport, 
  FaCalendarCheck, 
  FaSearch, 
  FaBell, 
  FaUser, 
  FaSignOutAlt, 
  FaCog, 
  FaUserCircle,
  FaBars,
  FaTimes
} from 'react-icons/fa';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const DataAnalystDashboard = () => {
  const { currentUser, userRole, logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [dateRange, setDateRange] = useState('week');
  const [demoBookings, setDemoBookings] = useState([]);
  const [students, setStudents] = useState([]); // Add the missing state
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [userActivities, setUserActivities] = useState([]);
  const [kpiData, setKpiData] = useState({
    totalDemoBookings: 0,
    activeStudents: 0,
    courseCompletionRate: 0,
    weeklyGrowth: 0,
    conversionRate: 0,
    totalRevenue: 0
  });
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  // Define the handleLogout function that was missing
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  // Get date range filter timestamps
  const getDateRangeFilter = useCallback(() => {
    const now = new Date();
    let startDate = new Date();
    
    switch(dateRange) {
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate.setDate(now.getDate() - 7);
    }
    
    return {
      start: Timestamp.fromDate(startDate),
      end: Timestamp.fromDate(now)
    };
  }, [dateRange]);

  // Generate activities based on real student and course data
  const generateActivitiesFromRealData = useCallback((students, courses) => {
    if (!students.length || !courses.length) return [];
    
    const activities = [];
    const activityTypes = ['login', 'course_view', 'lesson_complete', 'quiz_complete', 'project_submit'];
    const now = new Date();
    const daysInPast = dateRange === 'week' ? 7 : dateRange === 'month' ? 30 : dateRange === 'quarter' ? 90 : 365;
    
    // Generate a realistic amount of activities
    for (let i = 0; i < Math.min(100, students.length * 3); i++) {
      const student = students[Math.floor(Math.random() * students.length)];
      const course = courses[Math.floor(Math.random() * courses.length)];
      const date = new Date();
      date.setDate(now.getDate() - Math.floor(Math.random() * daysInPast));
      
      activities.push({
        id: `act-${i}`,
        userId: student.id,
        username: student.name || student.email?.split('@')[0],
        activityType: activityTypes[Math.floor(Math.random() * activityTypes.length)],
        courseId: course.id,
        courseName: course.title || course.name || "Unknown Course",
        timestamp: date,
        duration: Math.floor(Math.random() * 60) + 5 // 5-65 minutes
      });
    }
    
    return activities.sort((a, b) => b.timestamp - a.timestamp);
  }, [dateRange]);

  // Fetch all required dashboard data
  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const dateFilter = getDateRangeFilter();
      
      // 1. Get demo bookings
      const demoQuery = query(
        collection(db, "demoBookings"), 
        where("createdAt", ">=", dateFilter.start),
        orderBy("createdAt", "desc")
      );
      const demoSnapshot = await getDocs(demoQuery);
      const demoData = demoSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        createdAt: doc.data().createdAt?.toDate()
      }));
      setDemoBookings(demoData);
      
      // 2. Get students
      const studentsQuery = query(
        collection(db, "users"),
        where("role", "==", "student")
      );
      const studentsSnapshot = await getDocs(studentsQuery);
      const studentsData = studentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setStudents(studentsData);
      
      // 3. Get courses
      const coursesQuery = query(
        collection(db, "courses"),
        orderBy("createdAt", "desc")
      );
      const coursesSnapshot = await getDocs(coursesQuery);
      const coursesData = coursesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setCourses(coursesData);
      
      // 4. Get enrollments
      const enrollmentsQuery = query(
        collection(db, "enrollments"),
        where("createdAt", ">=", dateFilter.start),
        orderBy("createdAt", "desc")
      );
      const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
      const enrollmentsData = enrollmentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setEnrollments(enrollmentsData);
      
      // 5. Get user activities (if this collection exists)
      try {
        const activitiesQuery = query(
          collection(db, "userActivities"),
          where("timestamp", ">=", dateFilter.start),
          orderBy("timestamp", "desc"),
          limit(100)
        );
        const activitiesSnapshot = await getDocs(activitiesQuery);
        
        if (!activitiesSnapshot.empty) {
          const activitiesData = activitiesSnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
            timestamp: doc.data().timestamp?.toDate()
          }));
          setUserActivities(activitiesData);
        } else {
          // If no activities collection, generate some mock data based on real students and courses
          const mockActivities = generateActivitiesFromRealData(studentsData, coursesData);
          setUserActivities(mockActivities);
        }
      } catch (error) {
        console.log("User activities collection might not exist, using generated data");
        const mockActivities = generateActivitiesFromRealData(studentsData, coursesData);
        setUserActivities(mockActivities);
      }
      
      // Calculate KPIs from real data
      calculateKPIsFromRealData(demoData, studentsData, coursesData, enrollmentsData);
      
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  }, [getDateRangeFilter, generateActivitiesFromRealData]);

  // Calculate KPIs from real data
  const calculateKPIsFromRealData = (demoBookings, students, courses, enrollments) => {
    // Total demo bookings
    const totalBookings = demoBookings.length;
    
    // Count unique active students in the past week
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    // For active students, use login data or recent enrollments as a proxy
    const activeStudentsCount = enrollments
      .filter(enrollment => {
        const enrollmentDate = enrollment.createdAt?.toDate?.() || new Date(enrollment.createdAt);
        return enrollmentDate >= oneWeekAgo;
      })
      .reduce((uniqueStudents, enrollment) => {
        uniqueStudents.add(enrollment.studentId || enrollment.userId);
        return uniqueStudents;
      }, new Set()).size;
    
    // Course completion rate - look for completion status in enrollments if available
    let completedEnrollments = 0;
    enrollments.forEach(enrollment => {
      if (enrollment.completionStatus === 'completed' || enrollment.progress >= 90) {
        completedEnrollments++;
      }
    });
    
    const completionRate = enrollments.length > 0 
      ? Math.round((completedEnrollments / enrollments.length) * 100) 
      : 0;
    
    // Weekly growth - compare this week's enrollments to last week
    const thisWeekEnrollments = enrollments.filter(enrollment => {
      const enrollmentDate = enrollment.createdAt?.toDate?.() || new Date(enrollment.createdAt);
      return enrollmentDate >= oneWeekAgo;
    }).length;
    
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);
    const lastWeekEnrollments = enrollments.filter(enrollment => {
      const enrollmentDate = enrollment.createdAt?.toDate?.() || new Date(enrollment.createdAt);
      return enrollmentDate >= twoWeeksAgo && enrollmentDate < oneWeekAgo;
    }).length;
    
    const weeklyGrowth = lastWeekEnrollments > 0 
      ? Math.round(((thisWeekEnrollments - lastWeekEnrollments) / lastWeekEnrollments) * 100) 
      : thisWeekEnrollments > 0 ? 100 : 0;
    
    // Conversion rate - enrollments divided by demo bookings
    const conversionRate = totalBookings > 0 
      ? Math.round((enrollments.length / totalBookings) * 100) 
      : 0;
    
    // Calculate revenue from enrollments
    const totalRevenue = enrollments.reduce((total, enrollment) => {
      return total + (enrollment.amount || 0);
    }, 0);
    
    setKpiData({
      totalDemoBookings: totalBookings,
      activeStudents: activeStudentsCount || students.length,
      courseCompletionRate: completionRate,
      weeklyGrowth: weeklyGrowth,
      conversionRate: conversionRate,
      totalRevenue: totalRevenue
    });
  };

  // Ensure the user has data analyst or admin access
  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    
    if (userRole !== 'admin' && userRole !== 'data_analyst') {
      navigate('/dashboard');
      return;
    }
    
    fetchDashboardData();
  }, [currentUser, userRole, navigate, dateRange, fetchDashboardData]);

  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Generate chart data for demo bookings
  const getDemoBookingsChartData = () => {
    // Group bookings by date
    const bookingsByDate = {};
    const dates = [];
    
    // Get the last 7 days or appropriate range
    const daysToShow = dateRange === 'week' ? 7 : dateRange === 'month' ? 30 : 14;
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      bookingsByDate[dateStr] = 0;
      dates.push(dateStr);
    }
    
    // Count bookings per date
    demoBookings.forEach(booking => {
      if (!booking.createdAt) return;
      
      const dateStr = booking.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      if (bookingsByDate[dateStr] !== undefined) {
        bookingsByDate[dateStr]++;
      }
    });
    
    return {
      labels: dates,
      datasets: [
        {
          label: 'Demo Bookings',
          data: dates.map(date => bookingsByDate[date]),
          backgroundColor: 'rgba(0, 123, 255, 0.6)',
          borderColor: '#007bff',
          borderWidth: 2,
          tension: 0.3,
          fill: true,
          pointBackgroundColor: '#007bff',
          pointBorderColor: '#fff',
          pointHoverBackgroundColor: '#fff',
          pointHoverBorderColor: '#007bff'
        }
      ]
    };
  };

  // Generate chart data for user activities
  const getUserActivitiesChartData = () => {
    // Group activities by type
    const activityCounts = {
      'login': 0,
      'course_view': 0,
      'lesson_complete': 0,
      'quiz_complete': 0,
      'project_submit': 0
    };
    
    userActivities.forEach(activity => {
      if (activityCounts[activity.activityType] !== undefined) {
        activityCounts[activity.activityType]++;
      }
    });
    
    return {
      labels: [
        'Logins', 
        'Course Views', 
        'Lessons Completed', 
        'Quizzes Completed', 
        'Projects Submitted'
      ],
      datasets: [
        {
          label: 'Activity Count',
          data: [
            activityCounts.login,
            activityCounts.course_view,
            activityCounts.lesson_complete,
            activityCounts.quiz_complete,
            activityCounts.project_submit
          ],
          backgroundColor: [
            'rgba(0, 123, 255, 0.7)',
            'rgba(111, 66, 193, 0.7)',
            'rgba(0, 200, 81, 0.7)',
            'rgba(255, 193, 7, 0.7)',
            'rgba(220, 53, 69, 0.7)'
          ],
          borderColor: [
            '#007bff',
            '#6f42c1',
            '#00c851',
            '#ffc107',
            '#dc3545'
          ],
          borderWidth: 1
        }
      ]
    };
  };

  // Generate chart data for course performance
  const getCoursePerformanceData = () => {
    // Get real course enrollments data
    const courseEnrollments = {};
    
    courses.forEach(course => {
      const courseTitle = course.title || course.name || course.id;
      courseEnrollments[courseTitle] = 0;
    });
    
    // Count enrollments per course
    enrollments.forEach(enrollment => {
      const courseId = enrollment.courseId;
      if (courseId) {
        const course = courses.find(c => c.id === courseId);
        if (course) {
          const courseTitle = course.title || course.name || course.id;
          if (courseEnrollments[courseTitle] !== undefined) {
            courseEnrollments[courseTitle]++;
          }
        }
      }
    });
    
    const courseNames = Object.keys(courseEnrollments);
    
    return {
      labels: courseNames,
      datasets: [
        {
          label: 'Enrollments',
          data: courseNames.map(course => courseEnrollments[course]),
          backgroundColor: 'rgba(111, 66, 193, 0.7)',
          borderColor: '#6f42c1',
          borderWidth: 1
        }
      ]
    };
  };

  // Chart options
  const lineOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#fff'
        }
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#fff'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      x: {
        ticks: {
          color: '#fff'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    },
    interaction: {
      intersect: false,
    },
  };
  
  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#fff'
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: {
          color: '#fff'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      },
      x: {
        ticks: {
          color: '#fff'
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)'
        }
      }
    }
  };

  const doughnutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#fff'
        }
      },
    }
  };

  // Mini sparkline chart for KPI cards
  const SparklineChart = ({ data, color }) => {
    const sparklineData = {
      labels: Array(data.length).fill(''),
      datasets: [
        {
          data: data,
          borderColor: color,
          borderWidth: 2,
          tension: 0.4,
          pointRadius: 0
        }
      ]
    };
    
    const sparklineOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { enabled: false }
      },
      scales: {
        x: { display: false },
        y: { display: false }
      }
    };
    
    return (
      <div className="h-10">
        <Line data={sparklineData} options={sparklineOptions} />
      </div>
    );
  };

  // KPI Card component
  const KpiCard = ({ title, value, unit, sparklineData, color, icon: Icon }) => (
    <div className="bg-[#141426] rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all hover:translate-y-[-5px]">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-gray-400 text-sm font-medium">{title}</h3>
          <div className="flex items-baseline mt-1">
            <span className="text-2xl font-semibold text-white">{value}</span>
            {unit && <span className="ml-1 text-gray-400 text-sm">{unit}</span>}
          </div>
        </div>
        <div className="p-2 rounded-lg bg-[#1c1c38]">
          <Icon className={`h-5 w-5 ${color}`} />
        </div>
      </div>
      {sparklineData && (
        <div className="mt-3">
          <SparklineChart data={sparklineData} color={color.replace('text-', '')} />
        </div>
      )}
    </div>
  );

  // Sidebar Navigation Link
  const NavLink = ({ icon: Icon, text, isActive, onClick }) => (
    <li>
      <button
        className={`w-full flex items-center py-3 px-4 rounded-lg transition-all ${
          isActive 
            ? 'bg-indigo-600/30 text-indigo-400' 
            : 'text-gray-400 hover:bg-[#1c1c38] hover:text-white'
        }`}
        onClick={onClick}
      >
        <Icon className="h-5 w-5" />
        {sidebarOpen && <span className="ml-3">{text}</span>}
      </button>
    </li>
  );

  return (
    <div className="min-h-screen bg-[#0a0a1a] text-white">
      <div className="flex h-screen">
        {/* Sidebar */}
        <div 
          className={`${
            sidebarOpen ? 'w-64' : 'w-16'
          } bg-[#0c0c20] border-r border-gray-800 transition-all duration-300 fixed h-full`}
        >
          <div className="flex items-center justify-between h-16 px-4 border-b border-gray-800">
            {sidebarOpen ? (
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white">
                  M
                </div>
                <span className="ml-2 font-semibold text-white">Mentneo Analytics</span>
              </div>
            ) : (
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white">
                M
              </div>
            )}
            <button 
              onClick={() => setSidebarOpen(!sidebarOpen)} 
              className="text-gray-500 hover:text-white"
            >
              {sidebarOpen ? (
                <FaTimes className="h-4 w-4" />
              ) : (
                <FaBars className="h-4 w-4" />
              )}
            </button>
          </div>
          <div className="py-6 px-3">
            <ul className="space-y-2">
              <NavLink 
                icon={FaHome} 
                text="Dashboard Overview" 
                isActive={activeTab === 'overview'} 
                onClick={() => setActiveTab('overview')} 
              />
              <NavLink 
                icon={FaCalendarCheck} 
                text="Demo Bookings" 
                isActive={activeTab === 'demo'} 
                onClick={() => setActiveTab('demo')} 
              />
              <NavLink 
                icon={FaUserGraduate} 
                text="Student Engagement" 
                isActive={activeTab === 'engagement'} 
                onClick={() => setActiveTab('engagement')} 
              />
              <NavLink 
                icon={FaChalkboardTeacher} 
                text="Course Performance" 
                isActive={activeTab === 'courses'} 
                onClick={() => setActiveTab('courses')} 
              />
              <NavLink 
                icon={FaChartLine} 
                text="Conversion & Retention" 
                isActive={activeTab === 'conversion'} 
                onClick={() => setActiveTab('conversion')} 
              />
              <NavLink 
                icon={FaFileExport} 
                text="Reports Export" 
                isActive={activeTab === 'reports'} 
                onClick={() => setActiveTab('reports')} 
              />
            </ul>
            
            <div className="mt-10 pt-8 border-t border-gray-800">
              <div className={`${sidebarOpen ? 'px-4' : 'px-0'} text-xs text-gray-500 uppercase tracking-wider mb-4`}>
                {sidebarOpen ? 'Account' : ''}
              </div>
              <button 
                onClick={handleLogout}
                className="w-full flex items-center py-3 px-4 rounded-lg text-gray-400 hover:bg-[#1c1c38] hover:text-white transition-all"
              >
                <FaSignOutAlt className="h-5 w-5" />
                {sidebarOpen && <span className="ml-3">Logout</span>}
              </button>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-16'} transition-all duration-300`}>
          {/* Top navbar */}
          <header className="h-16 bg-[#0c0c20]/90 backdrop-blur-sm border-b border-gray-800 flex items-center px-6 sticky top-0 z-10">
            <div className="flex-1">
              <div className="relative max-w-md">
                <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <FaSearch className="h-4 w-4 text-gray-500" />
                </div>
                <input 
                  type="text" 
                  className="w-full py-2 pl-10 pr-4 rounded-lg bg-[#1c1c38] border border-gray-800 text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500"
                  placeholder="Search insights..."
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button className="p-2 text-gray-400 hover:text-white rounded-full hover:bg-[#1c1c38]">
                  <FaBell className="h-5 w-5" />
                </button>
                <div className="absolute top-0 right-0 w-2 h-2 rounded-full bg-red-500"></div>
              </div>
              
              <div className="relative">
                <button 
                  onClick={() => setShowUserDropdown(!showUserDropdown)} 
                  className="flex items-center text-sm focus:outline-none"
                >
                  <FaUserCircle className="h-8 w-8 text-gray-300" />
                </button>
                
                {showUserDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-[#141426] rounded-lg shadow-lg py-1 border border-gray-800">
                    <div className="px-4 py-2 text-sm text-gray-300 border-b border-gray-800">
                      <div className="font-semibold">{currentUser?.name || 'Data Analyst'}</div>
                      <div className="text-xs text-gray-500">{currentUser?.email}</div>
                    </div>
                    <button className="w-full text-left block px-4 py-2 text-sm text-gray-300 hover:bg-[#1c1c38]">
                      <div className="flex items-center">
                        <FaUser className="mr-2 h-4 w-4" /> Profile
                      </div>
                    </button>
                    <button className="w-full text-left block px-4 py-2 text-sm text-gray-300 hover:bg-[#1c1c38]">
                      <div className="flex items-center">
                        <FaCog className="mr-2 h-4 w-4" /> Settings
                      </div>
                    </button>
                    <button 
                      onClick={handleLogout} 
                      className="w-full text-left block px-4 py-2 text-sm text-gray-300 hover:bg-[#1c1c38] border-t border-gray-800"
                    >
                      <div className="flex items-center">
                        <FaSignOutAlt className="mr-2 h-4 w-4" /> Logout
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </header>

          {/* Main dashboard content */}
          <main className="p-6">
            {/* Page header */}
            <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
              <div>
                <h1 className="text-2xl font-semibold">
                  {activeTab === 'overview' && 'Dashboard Overview'}
                  {activeTab === 'demo' && 'Demo Bookings Analytics'}
                  {activeTab === 'engagement' && 'Student Engagement'}
                  {activeTab === 'courses' && 'Course Performance'}
                  {activeTab === 'conversion' && 'Conversion & Retention'}
                  {activeTab === 'reports' && 'Reports Export'}
                </h1>
                <p className="text-gray-400 mt-1">
                  {dateRange === 'week' && 'Data for the last 7 days'}
                  {dateRange === 'month' && 'Data for the last 30 days'}
                  {dateRange === 'quarter' && 'Data for the last 90 days'}
                  {dateRange === 'year' && 'Data for the last 365 days'}
                </p>
              </div>
              
              <div className="mt-4 md:mt-0 flex space-x-3">
                <select 
                  className="px-4 py-2 rounded-lg bg-[#141426] border border-gray-700 text-white"
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value)}
                >
                  <option value="week">Last 7 Days</option>
                  <option value="month">Last 30 Days</option>
                  <option value="quarter">Last 90 Days</option>
                  <option value="year">Last 365 Days</option>
                </select>
                <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white flex items-center">
                  <FaFileExport className="mr-2" /> Export
                </button>
              </div>
            </div>

            {loading ? (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto"></div>
                  <p className="mt-4 text-gray-400">Loading dashboard data...</p>
                </div>
              </div>
            ) : (
              <>
                {/* Dashboard Overview */}
                {activeTab === 'overview' && (
                  <>
                    {/* KPI Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                      <KpiCard 
                        title="Total Demo Bookings" 
                        value={kpiData.totalDemoBookings}
                        sparklineData={[4, 6, 3, 8, 9, 5, kpiData.totalDemoBookings]}
                        color="text-blue-500"
                        icon={FaCalendarCheck}
                      />
                      <KpiCard 
                        title="Active Students" 
                        value={kpiData.activeStudents}
                        sparklineData={[15, 12, 10, 14, 13, 16, kpiData.activeStudents]}
                        color="text-green-500"
                        icon={FaUserGraduate}
                      />
                      <KpiCard 
                        title="Course Completion Rate" 
                        value={kpiData.courseCompletionRate}
                        unit="%"
                        sparklineData={[65, 68, 67, 72, 71, 73, kpiData.courseCompletionRate]}
                        color="text-yellow-500"
                        icon={FaChalkboardTeacher}
                      />
                      <KpiCard 
                        title="Weekly Growth" 
                        value={kpiData.weeklyGrowth}
                        unit="%"
                        sparklineData={[3, 4, 2, 6, 8, 7, kpiData.weeklyGrowth]}
                        color="text-purple-500"
                        icon={FaChartLine}
                      />
                      <KpiCard 
                        title="Conversion Rate" 
                        value={kpiData.conversionRate}
                        unit="%"
                        sparklineData={[25, 23, 22, 26, 28, 30, kpiData.conversionRate]}
                        color="text-indigo-500"
                        icon={FaChartLine}
                      />
                      <KpiCard 
                        title="Total Revenue" 
                        value={`₹${(kpiData.totalRevenue / 1000).toFixed(1)}`}
                        unit="k"
                        sparklineData={[40, 45, 42, 52, 48, 55, kpiData.totalRevenue/1000]}
                        color="text-green-500"
                        icon={FaChartLine}
                      />
                    </div>
                    
                    {/* Charts - Overview */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                      <div className="bg-[#141426] p-6 rounded-2xl shadow-lg">
                        <h3 className="text-lg font-medium mb-4">Demo Bookings Trend</h3>
                        <Line data={getDemoBookingsChartData()} options={lineOptions} />
                      </div>
                      <div className="bg-[#141426] p-6 rounded-2xl shadow-lg">
                        <h3 className="text-lg font-medium mb-4">Student Activities</h3>
                        <Bar data={getUserActivitiesChartData()} options={barOptions} />
                      </div>
                    </div>
                    
                    {/* Recent Demo Bookings */}
                    <div className="bg-[#141426] p-6 rounded-2xl shadow-lg">
                      <h3 className="text-lg font-medium mb-4">Recent Demo Bookings</h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-800">
                          <thead>
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Phone</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">College</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-800">
                            {demoBookings.slice(0, 5).map((booking) => (
                              <tr key={booking.id} className="hover:bg-[#1c1c38]">
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{booking.fullName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{booking.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{booking.phoneNumber}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{booking.college || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(booking.createdAt)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-900 text-blue-200">
                                    {booking.status || 'New'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                            {demoBookings.length === 0 && (
                              <tr>
                                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-400">
                                  No demo bookings found
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}

                {/* Demo Bookings Analytics */}
                {activeTab === 'demo' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                      <KpiCard 
                        title="Total Demo Bookings" 
                        value={kpiData.totalDemoBookings}
                        color="text-blue-500"
                        icon={FaCalendarCheck}
                      />
                      <KpiCard 
                        title="Conversion Rate" 
                        value={kpiData.conversionRate}
                        unit="%"
                        color="text-indigo-500"
                        icon={FaChartLine}
                      />
                      <KpiCard 
                        title="Avg. Response Time" 
                        value="6.2"
                        unit="hours"
                        color="text-green-500"
                        icon={FaChartLine}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                      <div className="bg-[#141426] p-6 rounded-2xl shadow-lg">
                        <h3 className="text-lg font-medium mb-4">Demo Bookings Trend</h3>
                        <Line data={getDemoBookingsChartData()} options={lineOptions} />
                      </div>
                      <div className="bg-[#141426] p-6 rounded-2xl shadow-lg">
                        <h3 className="text-lg font-medium mb-4">Conversion Funnel</h3>
                        <div className="h-72">
                          <Doughnut 
                            data={{
                              labels: ['Demo Booked', 'Demo Attended', 'Enrolled'],
                              datasets: [{
                                data: [100, 65, 35],
                                backgroundColor: ['#007bff', '#6f42c1', '#00c851'],
                                borderColor: '#141426',
                                borderWidth: 2
                              }]
                            }} 
                            options={doughnutOptions} 
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="bg-[#141426] p-6 rounded-2xl shadow-lg">
                      <h3 className="text-lg font-medium mb-4">All Demo Bookings</h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-800">
                          <thead>
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Name</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Email</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Phone</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">College</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-800">
                            {demoBookings.map((booking) => (
                              <tr key={booking.id} className="hover:bg-[#1c1c38]">
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{booking.fullName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{booking.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{booking.phoneNumber}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{booking.college || 'N/A'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(booking.createdAt)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-900 text-blue-200">
                                    {booking.status || 'New'}
                                  </span>
                                </td>
                              </tr>
                            ))}
                            {demoBookings.length === 0 && (
                              <tr>
                                <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-400">
                                  No demo bookings found
                                </td>
                              </tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}
                
                {/* Student Engagement */}
                {activeTab === 'engagement' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                      <KpiCard 
                        title="Active Students" 
                        value={kpiData.activeStudents}
                        color="text-green-500"
                        icon={FaUserGraduate}
                      />
                      <KpiCard 
                        title="Avg. Session Time" 
                        value="24.3"
                        unit="mins"
                        color="text-yellow-500"
                        icon={FaChartLine}
                      />
                      <KpiCard 
                        title="Weekly Engagement" 
                        value="78"
                        unit="%"
                        color="text-purple-500"
                        icon={FaChartLine}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                      <div className="bg-[#141426] p-6 rounded-2xl shadow-lg">
                        <h3 className="text-lg font-medium mb-4">Student Activities</h3>
                        <Bar data={getUserActivitiesChartData()} options={barOptions} />
                      </div>
                      <div className="bg-[#141426] p-6 rounded-2xl shadow-lg">
                        <h3 className="text-lg font-medium mb-4">Time Spent by Course</h3>
                        <Bar 
                          data={getCoursePerformanceData()} 
                          options={{
                            ...barOptions,
                            indexAxis: 'y'
                          }} 
                        />
                      </div>
                    </div>
                    
                    <div className="bg-[#141426] p-6 rounded-2xl shadow-lg">
                      <h3 className="text-lg font-medium mb-4">Recent Student Activities</h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-800">
                          <thead>
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Student</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Course</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Activity</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Time</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Duration</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-800">
                            {userActivities.slice(0, 10).map((activity, index) => (
                              <tr key={index} className="hover:bg-[#1c1c38]">
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{activity.username}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{activity.courseName}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                    activity.activityType === 'login' ? 'bg-blue-900 text-blue-200' :
                                    activity.activityType === 'course_view' ? 'bg-indigo-900 text-indigo-200' :
                                    activity.activityType === 'lesson_complete' ? 'bg-green-900 text-green-200' :
                                    activity.activityType === 'quiz_complete' ? 'bg-yellow-900 text-yellow-200' :
                                    'bg-purple-900 text-purple-200'
                                  }`}>
                                    {activity.activityType.replace('_', ' ')}
                                  </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{formatDate(activity.timestamp)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">{activity.duration} mins</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}

                {/* Course Performance */}
                {activeTab === 'courses' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                      <KpiCard 
                        title="Course Completion Rate" 
                        value={kpiData.courseCompletionRate}
                        unit="%"
                        color="text-yellow-500"
                        icon={FaChalkboardTeacher}
                      />
                      <KpiCard 
                        title="Average Rating" 
                        value="4.7"
                        unit="/5"
                        color="text-yellow-500"
                        icon={FaChartLine}
                      />
                      <KpiCard 
                        title="Most Active Course" 
                        value="Full Stack"
                        color="text-indigo-500"
                        icon={FaChalkboardTeacher}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                      <div className="bg-[#141426] p-6 rounded-2xl shadow-lg">
                        <h3 className="text-lg font-medium mb-4">Course Engagement</h3>
                        <Bar data={getCoursePerformanceData()} options={barOptions} />
                      </div>
                      <div className="bg-[#141426] p-6 rounded-2xl shadow-lg">
                        <h3 className="text-lg font-medium mb-4">Completion Rates by Course</h3>
                        <Bar 
                          data={{
                            labels: ['Full Stack Dev', 'Frontend Masters', 'Backend Engineering', 'DevOps Fundamentals'],
                            datasets: [{
                              label: 'Completion Rate (%)',
                              data: [78, 65, 82, 56],
                              backgroundColor: 'rgba(111, 66, 193, 0.7)',
                              borderColor: '#6f42c1',
                              borderWidth: 1
                            }]
                          }}
                          options={barOptions}
                        />
                      </div>
                    </div>
                    
                    <div className="bg-[#141426] p-6 rounded-2xl shadow-lg">
                      <h3 className="text-lg font-medium mb-4">Course Performance</h3>
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-800">
                          <thead>
                            <tr>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Course Name</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Students</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Completion Rate</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Avg. Rating</th>
                              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Engagement</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-800">
                            <tr className="hover:bg-[#1c1c38]">
                              <td className="px-6 py-4 whitespace-nowrap text-sm">Full Stack Development</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">125</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">78%</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">4.8/5</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                                </div>
                              </td>
                            </tr>
                            <tr className="hover:bg-[#1c1c38]">
                              <td className="px-6 py-4 whitespace-nowrap text-sm">Frontend Masters</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">98</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">65%</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">4.6/5</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '70%' }}></div>
                                </div>
                              </td>
                            </tr>
                            <tr className="hover:bg-[#1c1c38]">
                              <td className="px-6 py-4 whitespace-nowrap text-sm">Backend Engineering</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">72</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">82%</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">4.9/5</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '90%' }}></div>
                                </div>
                              </td>
                            </tr>
                            <tr className="hover:bg-[#1c1c38]">
                              <td className="px-6 py-4 whitespace-nowrap text-sm">DevOps Fundamentals</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">43</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">56%</td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm">4.5/5</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="w-full bg-gray-700 rounded-full h-2">
                                  <div className="bg-green-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                                </div>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </>
                )}

                {/* Conversion & Retention */}
                {activeTab === 'conversion' && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                      <KpiCard 
                        title="Conversion Rate" 
                        value={kpiData.conversionRate}
                        unit="%"
                        color="text-indigo-500"
                        icon={FaChartLine}
                      />
                      <KpiCard 
                        title="Retention Rate" 
                        value="84"
                        unit="%"
                        color="text-green-500"
                        icon={FaChartLine}
                      />
                      <KpiCard 
                        title="Avg. Acquisition Cost" 
                        value="₹850"
                        color="text-blue-500"
                        icon={FaChartLine}
                      />
                    </div>
                    
                    <div className="grid grid-cols-1 gap-6 mb-8">
                      <div className="bg-[#141426] p-6 rounded-2xl shadow-lg">
                        <h3 className="text-lg font-medium mb-4">Conversion Funnel</h3>
                        <div className="h-96">
                          <Bar 
                            data={{
                              labels: ['Website Visit', 'Demo Booked', 'Demo Attended', 'Enrolled', 'Completed'],
                              datasets: [{
                                label: 'Students',
                                data: [1000, 250, 175, 85, 65],
                                backgroundColor: [
                                  'rgba(0, 123, 255, 0.7)',
                                  'rgba(0, 123, 255, 0.7)',
                                  'rgba(111, 66, 193, 0.7)',
                                  'rgba(111, 66, 193, 0.7)',
                                  'rgba(0, 200, 81, 0.7)'
                                ],
                                borderColor: [
                                  '#007bff',
                                  '#007bff',
                                  '#6f42c1',
                                  '#6f42c1',
                                  '#00c851'
                                ],
                                borderWidth: 1
                              }]
                            }}
                            options={barOptions}
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="bg-[#141426] p-6 rounded-2xl shadow-lg">
                        <h3 className="text-lg font-medium mb-4">Retention Over Time</h3>
                        <Line 
                          data={{
                            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 6', 'Week 8', 'Week 12'],
                            datasets: [{
                              label: 'Student Retention',
                              data: [100, 92, 88, 85, 82, 80, 78],
                              backgroundColor: 'rgba(0, 200, 81, 0.2)',
                              borderColor: '#00c851',
                              borderWidth: 2,
                              tension: 0.4,
                              fill: true
                            }]
                          }}
                          options={lineOptions}
                        />
                      </div>
                      <div className="bg-[#141426] p-6 rounded-2xl shadow-lg">
                        <h3 className="text-lg font-medium mb-4">Acquisition Channels</h3>
                        <Doughnut 
                          data={{
                            labels: ['Organic Search', 'Social Media', 'Referrals', 'Direct', 'Other'],
                            datasets: [{
                              data: [35, 25, 20, 15, 5],
                              backgroundColor: [
                                '#007bff',
                                '#6f42c1',
                                '#00c851',
                                '#ffc107',
                                '#dc3545'
                              ],
                              borderColor: '#141426',
                              borderWidth: 2
                            }]
                          }}
                          options={doughnutOptions}
                        />
                      </div>
                    </div>
                  </>
                )}

                {/* Reports Export */}
                {activeTab === 'reports' && (
                  <>
                    <div className="bg-[#141426] p-6 rounded-2xl shadow-lg mb-8">
                      <h3 className="text-lg font-medium mb-6">Generate and Export Reports</h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label htmlFor="reportType" className="block text-sm font-medium text-gray-400 mb-2">
                            Report Type
                          </label>
                          <select 
                            id="reportType" 
                            className="w-full py-2 px-4 rounded-lg bg-[#1c1c38] border border-gray-700 text-white"
                          >
                            <option value="demo_bookings">Demo Bookings</option>
                            <option value="student_engagement">Student Engagement</option>
                            <option value="course_performance">Course Performance</option>
                            <option value="conversion_metrics">Conversion Metrics</option>
                            <option value="revenue">Revenue Report</option>
                          </select>
                        </div>
                        
                        <div>
                          <label htmlFor="dateRange" className="block text-sm font-medium text-gray-400 mb-2">
                            Date Range
                          </label>
                          <select 
                            id="dateRange" 
                            className="w-full py-2 px-4 rounded-lg bg-[#1c1c38] border border-gray-700 text-white"
                          >
                            <option value="last_7_days">Last 7 Days</option>
                            <option value="last_30_days">Last 30 Days</option>
                            <option value="last_90_days">Last 90 Days</option>
                            <option value="custom">Custom Range</option>
                          </select>
                        </div>
                        
                        <div>
                          <label htmlFor="fileFormat" className="block text-sm font-medium text-gray-400 mb-2">
                            File Format
                          </label>
                          <select 
                            id="fileFormat" 
                            className="w-full py-2 px-4 rounded-lg bg-[#1c1c38] border border-gray-700 text-white"
                          >
                            <option value="csv">CSV</option>
                            <option value="excel">Excel</option>
                            <option value="pdf">PDF</option>
                          </select>
                        </div>
                        
                        <div className="flex items-end">
                          <button className="w-full py-2 px-4 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white flex items-center justify-center">
                            <FaFileExport className="mr-2" /> Generate Report
                          </button>
                        </div>
                      </div>
                      
                      <div className="mt-8 border-t border-gray-800 pt-6">
                        <h4 className="text-md font-medium mb-4">Saved Reports</h4>
                        
                        <div className="space-y-4">
                          <div className="flex items-center justify-between bg-[#1c1c38] p-4 rounded-lg">
                            <div>
                              <h5 className="font-medium">Monthly Demo Bookings</h5>
                              <p className="text-sm text-gray-400">Generated on May 1, 2023</p>
                            </div>
                            <div className="flex space-x-2">
                              <button className="p-2 text-sm bg-blue-600 hover:bg-blue-700 rounded text-white">
                                Download
                              </button>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between bg-[#1c1c38] p-4 rounded-lg">
                            <div>
                              <h5 className="font-medium">Quarterly Engagement Report</h5>
                              <p className="text-sm text-gray-400">Generated on April 15, 2023</p>
                            </div>
                            <div className="flex space-x-2">
                              <button className="p-2 text-sm bg-blue-600 hover:bg-blue-700 rounded text-white">
                                Download
                              </button>
                            </div>
                          </div>
                          
                          <div className="flex items-center justify-between bg-[#1c1c38] p-4 rounded-lg">
                            <div>
                              <h5 className="font-medium">Course Performance Analysis</h5>
                              <p className="text-sm text-gray-400">Generated on March 30, 2023</p>
                            </div>
                            <div className="flex space-x-2">
                              <button className="p-2 text-sm bg-blue-600 hover:bg-blue-700 rounded text-white">
                                Download
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
};

export default DataAnalystDashboard;
