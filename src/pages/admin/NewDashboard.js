import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where, limit, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/firebase.js';
import { useAuth } from '../../contexts/AuthContext.js';
import { useTheme } from '../../contexts/ThemeContext.js';
import { Chart as ChartJS, ArcElement, CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend, Filler } from 'chart.js';
import { Pie, Bar, Line } from 'react-chartjs-2';
import { 
  FaUserGraduate, 
  FaChalkboardTeacher, 
  FaBook, 
  FaEye, 
  FaUserPlus, 
  FaPlus,
  FaArrowUp,
  FaArrowDown,
  FaRegCalendarAlt,
  FaChartPie,
  FaChartLine,
  FaTimes
} from 'react-icons/fa/index.esm.js';

// Register ChartJS components
ChartJS.register(
  ArcElement, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  PointElement, 
  LineElement, 
  Title, 
  Tooltip, 
  Legend,
  Filler
);

// Stat Card Component
const StatCard = ({ title, value, icon, change, changeType, linkTo, color }) => {
  const { darkMode } = useTheme();
  
  // Define gradient classes based on color
  const gradientMap = {
    blue: 'from-blue-400 to-blue-600',
    purple: 'from-purple-400 to-purple-600',
    green: 'from-green-400 to-green-600',
    orange: 'from-orange-400 to-orange-600',
  };
  
  const gradient = gradientMap[color] || 'from-indigo-400 to-indigo-600';
  
  return (
    <Link to={linkTo} className="block">
      <div className={`relative overflow-hidden rounded-xl shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'} transition-all duration-300 hover:shadow-xl transform hover:-translate-y-1`}>
        <div className="px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <p className={`text-sm font-medium ${darkMode ? 'text-gray-300' : 'text-gray-500'}`}>{title}</p>
              <h3 className="text-3xl font-bold mt-1">{value}</h3>
              {change && (
                <p className={`flex items-center text-sm mt-2 ${changeType === 'increase' ? 'text-green-500' : 'text-red-500'}`}>
                  {changeType === 'increase' ? <FaArrowUp className="mr-1" /> : <FaArrowDown className="mr-1" />}
                  {change}% from last week
                </p>
              )}
            </div>
            <div className={`rounded-full p-3 bg-gradient-to-r ${gradient} text-white`}>
              <span className="text-xl">{icon}</span>
            </div>
          </div>
        </div>
        <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient}`}></div>
      </div>
    </Link>
  );
};

// Action Card Component
const ActionCard = ({ title, icon, linkTo, color }) => {
  const { darkMode } = useTheme();
  
  return (
    <Link to={linkTo} className="block">
      <div className={`rounded-xl shadow-md ${darkMode ? 'bg-gray-800 hover:bg-gray-700' : 'bg-white hover:bg-gray-50'} transition-all duration-300 hover:shadow-xl p-5`}>
        <div className={`flex items-center justify-center mb-4 rounded-full p-4 w-16 h-16 mx-auto text-white bg-gradient-to-r ${color}`}>
          <span className="text-2xl">{icon}</span>
        </div>
        <h3 className="text-lg font-medium text-center">{title}</h3>
      </div>
    </Link>
  );
};

const NewDashboard = () => {
  // Only destructure what you actually use
  const { userRole, createDataAnalyst } = useAuth();
  const { darkMode } = useTheme();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalMentors: 0,
    totalCourses: 0,
    platformActivity: 0,
    recentPayments: [],
    recentStudents: [],
    recentMentors: []
  });
  
  // Separate loading states for different sections
  const [loadingCounts, setLoadingCounts] = useState(true);
  const [loadingPayments, setLoadingPayments] = useState(true);
  const [loadingStudents, setLoadingStudents] = useState(true);
  const [loadingMentors, setLoadingMentors] = useState(true);
  const [showAnalystModal, setShowAnalystModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    // Load the most critical data first - counts
    async function fetchCountData() {
      try {
        // Use Promise.all to fetch counts in parallel
        const [studentDocs, mentorDocs, courseDocs] = await Promise.all([
          getDocs(query(collection(db, "users"), where("role", "==", "student"))),
          getDocs(query(collection(db, "users"), where("role", "==", "mentor"))),
          getDocs(collection(db, "courses"))
        ]);
        
        setStats(prevStats => ({
          ...prevStats,
          totalStudents: studentDocs.size,
          totalMentors: mentorDocs.size,
          totalCourses: courseDocs.size,
          platformActivity: Math.floor(Math.random() * 1000) + 500, // Mock data for activity
        }));
      } catch (error) {
        console.error("Error fetching count data:", error);
      } finally {
        setLoadingCounts(false);
      }
    }

    // Load payments data
    async function fetchPaymentsData() {
      try {
        const paymentsQuery = query(
          collection(db, "payments"),
          orderBy("timestamp", "desc"),
          limit(5)
        );
        const paymentDocs = await getDocs(paymentsQuery);
        
        setStats(prevStats => ({
          ...prevStats,
          recentPayments: paymentDocs.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
        }));
      } catch (error) {
        console.error("Error fetching payments data:", error);
      } finally {
        setLoadingPayments(false);
      }
    }

    // Load students data
    async function fetchStudentsData() {
      try {
        // First check if we have the proper index
        let recentStudentsQuery;
        try {
          recentStudentsQuery = query(
            collection(db, "users"),
            where("role", "==", "student"),
            orderBy("createdAt", "desc"),
            limit(5)
          );
        } catch (error) {
          // Fallback if index doesn't exist - just get students without sorting
          console.warn("Falling back to non-sorted query for students - consider adding the index mentioned in docs/firebase-indexes.md");
          recentStudentsQuery = query(
            collection(db, "users"),
            where("role", "==", "student"),
            limit(5)
          );
        }
        
        const recentStudentDocs = await getDocs(recentStudentsQuery);
        
        setStats(prevStats => ({
          ...prevStats,
          recentStudents: recentStudentDocs.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
        }));
      } catch (error) {
        console.error("Error fetching students data:", error);
      } finally {
        setLoadingStudents(false);
      }
    }

    // Load mentors data
    async function fetchMentorsData() {
      try {
        // First check if we have the proper index
        let recentMentorsQuery;
        try {
          recentMentorsQuery = query(
            collection(db, "users"),
            where("role", "==", "mentor"),
            orderBy("createdAt", "desc"),
            limit(5)
          );
        } catch (error) {
          // Fallback if index doesn't exist - just get mentors without sorting
          console.warn("Falling back to non-sorted query for mentors - consider adding the index mentioned in docs/firebase-indexes.md");
          recentMentorsQuery = query(
            collection(db, "users"),
            where("role", "==", "mentor"),
            limit(5)
          );
        }
        
        const recentMentorDocs = await getDocs(recentMentorsQuery);
        
        setStats(prevStats => ({
          ...prevStats,
          recentMentors: recentMentorDocs.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
        }));
      } catch (error) {
        console.error("Error fetching mentors data:", error);
      } finally {
        setLoadingMentors(false);
      }
    }

    // Start all fetches
    fetchCountData();
    fetchPaymentsData();
    fetchStudentsData();
    fetchMentorsData();
  }, []);

  const pieData = {
    labels: ['Students', 'Mentors', 'Courses'],
    datasets: [
      {
        data: [stats.totalStudents, stats.totalMentors, stats.totalCourses],
        backgroundColor: [
          'rgba(59, 130, 246, 0.8)',   // Blue
          'rgba(139, 92, 246, 0.8)',   // Purple
          'rgba(16, 185, 129, 0.8)',   // Green
        ],
        borderColor: [
          'rgba(59, 130, 246, 1)',
          'rgba(139, 92, 246, 1)',
          'rgba(16, 185, 129, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };

  // Mock data for enrollment trends chart
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const currentMonth = new Date().getMonth();
  const lastSixMonths = months.slice(Math.max(0, currentMonth - 5), currentMonth + 1);
  
  const barData = {
    labels: lastSixMonths,
    datasets: [
      {
        label: 'New Enrollments',
        data: [12, 19, 15, 25, 22, 30],
        backgroundColor: 'rgba(59, 130, 246, 0.7)',
        borderColor: 'rgba(59, 130, 246, 1)',
        borderWidth: 1,
        borderRadius: 4,
      },
    ],
  };
  
  // Mock data for activity chart
  const lineData = {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Weekly Activity',
        data: [65, 59, 80, 81, 56, 55, 40],
        fill: true,
        backgroundColor: 'rgba(139, 92, 246, 0.2)',
        borderColor: 'rgba(139, 92, 246, 1)',
        tension: 0.4,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: darkMode ? 'white' : 'black',
          font: {
            size: 12
          }
        }
      },
      tooltip: {
        backgroundColor: darkMode ? 'rgba(26, 32, 44, 0.9)' : 'rgba(255, 255, 255, 0.9)',
        titleColor: darkMode ? 'white' : 'black',
        bodyColor: darkMode ? 'white' : 'black',
        borderColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        borderWidth: 1,
        padding: 12,
        cornerRadius: 8,
      }
    },
    scales: {
      x: {
        grid: {
          color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: darkMode ? 'white' : 'black',
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)',
        },
        ticks: {
          color: darkMode ? 'white' : 'black',
        }
      }
    }
  };

  // Loading Skeleton Components
  const LoadingSkeleton = ({ height = "h-8", width = "w-full" }) => (
    <div className={`animate-pulse ${height} ${width} bg-gray-300 dark:bg-gray-700 rounded`}></div>
  );

  const CardSkeleton = () => (
    <div className={`relative overflow-hidden rounded-xl shadow-lg ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
      <div className="px-6 py-6">
        <LoadingSkeleton height="h-4" width="w-1/2" />
        <LoadingSkeleton height="h-8" width="w-1/3" className="mt-2" />
        <LoadingSkeleton height="h-4" width="w-2/3" className="mt-2" />
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-gray-300 dark:bg-gray-700"></div>
    </div>
  );

  const TableRowSkeleton = ({ cols = 5 }) => (
    <tr>
      {Array(cols).fill(0).map((_, i) => (
        <td key={i} className="px-6 py-4 whitespace-nowrap">
          <LoadingSkeleton height="h-4" />
        </td>
      ))}
    </tr>
  );

  const ListItemSkeleton = () => (
    <li className="py-3 px-2 rounded-lg">
      <div className="flex items-center space-x-4">
        <div className="flex-shrink-0">
          <div className="h-10 w-10 rounded-full bg-gray-300 dark:bg-gray-700"></div>
        </div>
        <div className="flex-1 min-w-0">
          <LoadingSkeleton height="h-4" width="w-3/4" />
          <LoadingSkeleton height="h-3" width="w-2/3" className="mt-2" />
        </div>
        <LoadingSkeleton height="h-4" width="w-16" />
      </div>
    </li>
  );

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field when typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Handle form submission
  const handleCreateAnalyst = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      await createDataAnalyst(formData.email, formData.password, formData.name);
      
      setSubmitSuccess(true);
      
      // Reset form
      setTimeout(() => {
        setFormData({
          name: '',
          email: '',
          password: '',
          confirmPassword: ''
        });
        setSubmitSuccess(false);
        setShowAnalystModal(false);
      }, 2000);
      
    } catch (error) {
      console.error("Error creating data analyst:", error);
      setSubmitError(error.message || 'Failed to create data analyst');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center">
          <span className="flex items-center mr-4 text-sm">
            <FaRegCalendarAlt className="mr-2" />
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
        </div>
      </div>
      
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-2xl font-bold">Admin Dashboard</h2>
        <div className="flex space-x-3">
          <button
            onClick={() => setShowAnalystModal(true)}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <FaUserPlus className="mr-2" /> Create Data Analyst
          </button>
          <Link 
            to="/data-analyst/dashboard" 
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <FaChartLine className="mr-2" /> Data Analytics
          </Link>
        </div>
      </div>
      
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {loadingCounts ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            <StatCard 
              title="Total Students" 
              value={stats.totalStudents} 
              icon={<FaUserGraduate />} 
              change="8.2" 
              changeType="increase" 
              linkTo="/admin/students" 
              color="blue"
            />
            <StatCard 
              title="Total Mentors" 
              value={stats.totalMentors} 
              icon={<FaChalkboardTeacher />} 
              change="5.1" 
              changeType="increase" 
              linkTo="/admin/mentors" 
              color="purple"
            />
            <StatCard 
              title="Total Courses" 
              value={stats.totalCourses} 
              icon={<FaBook />} 
              change="3.4" 
              changeType="increase" 
              linkTo="/admin/courses" 
              color="green"
            />
            <StatCard 
              title="Platform Activity" 
              value={stats.platformActivity} 
              icon={<FaEye />} 
              change="2.3" 
              changeType="decrease" 
              linkTo="/admin/reports" 
              color="orange"
            />
          </>
        )}
      </div>
      
      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className={`rounded-xl shadow-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium">Enrollment Trends</h3>
          </div>
          <div className="p-6">
            <div className="h-80">
              {loadingCounts ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : (
                <Bar data={barData} options={chartOptions} />
              )}
            </div>
          </div>
        </div>
        
        <div className={`rounded-xl shadow-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium">Weekly Activity</h3>
          </div>
          <div className="p-6">
            <div className="h-80">
              {loadingCounts ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : (
                <Line data={lineData} options={chartOptions} />
              )}
            </div>
          </div>
        </div>
      </div>
      
      {/* Additional Chart and Recent Payments */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className={`rounded-xl shadow-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-medium">Platform Overview</h3>
          </div>
          <div className="p-6">
            <div className="h-64">
              {loadingCounts ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
                </div>
              ) : (
                <Pie data={pieData} options={{
                  ...chartOptions,
                  plugins: {
                    ...chartOptions.plugins,
                    legend: {
                      ...chartOptions.plugins.legend,
                      position: 'bottom'
                    }
                  }
                }} />
              )}
            </div>
          </div>
        </div>
        
        <div className={`rounded-xl shadow-lg overflow-hidden col-span-1 lg:col-span-2 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-medium">Recent Payments</h3>
            <Link to="/admin/payments" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
              View all
            </Link>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className={darkMode ? 'bg-gray-700' : 'bg-gray-50'}>
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    ID
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Student
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Amount
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-gray-200 dark:divide-gray-700 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                {loadingPayments ? (
                  // Loading skeleton for table rows
                  Array(5).fill(0).map((_, i) => <TableRowSkeleton key={i} />)
                ) : stats.recentPayments.length > 0 ? (
                  stats.recentPayments.map((payment) => (
                    <tr key={payment.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {payment.paymentId ? payment.paymentId.substring(0, 8) + '...' : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium">
                          {payment.name || 'Unknown'}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {payment.email || 'No email'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        ₹{payment.amount || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          payment.status === 'success' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                            : payment.status === 'pending'
                            ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {payment.status || 'unknown'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        {payment.timestamp ? new Date(payment.timestamp).toLocaleDateString() : 'N/A'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-4 whitespace-nowrap text-sm text-center">
                      No recent payments found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <ActionCard 
            title="Add Student" 
            icon={<FaUserPlus />} 
            linkTo="/admin/students/new" 
            color="from-blue-400 to-blue-600" 
          />
          <ActionCard 
            title="Add Mentor" 
            icon={<FaUserPlus />} 
            linkTo="/admin/mentors/new" 
            color="from-purple-400 to-purple-600" 
          />
          <ActionCard 
            title="Add Course" 
            icon={<FaPlus />} 
            linkTo="/admin/courses/new" 
            color="from-green-400 to-green-600" 
          />
          <ActionCard 
            title="Assign Mentors" 
            icon={<FaUserPlus />} 
            linkTo="/admin/assignments" 
            color="from-orange-400 to-orange-600" 
          />
          <ActionCard 
            title="View Reports" 
            icon={<FaChartPie/>} 
            linkTo="/admin/reports" 
            color="from-indigo-400 to-indigo-600" 
          />
        </div>
      </div>
      
      {/* Recent Records */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className={`rounded-xl shadow-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-medium">Recent Students</h3>
            <Link to="/admin/students" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
              View all
            </Link>
          </div>
          <div className="p-4">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {loadingStudents ? (
                // Loading skeleton for list items
                Array(5).fill(0).map((_, i) => <ListItemSkeleton key={i} />)
              ) : stats.recentStudents.length > 0 ? (
                stats.recentStudents.map((student) => (
                  <li key={student.id} className="py-3 px-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                          {student.name ? student.name.charAt(0).toUpperCase() : 'S'}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {student.name || 'Unknown Student'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {student.email || 'No email'}
                        </p>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {student.createdAt ? new Date(student.createdAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <li className="py-4 text-center">No recent students found</li>
              )}
            </ul>
          </div>
        </div>
        
        <div className={`rounded-xl shadow-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-medium">Recent Mentors</h3>
            <Link to="/admin/mentors" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
              View all
            </Link>
          </div>
          <div className="p-4">
            <ul className="divide-y divide-gray-200 dark:divide-gray-700">
              {loadingMentors ? (
                // Loading skeleton for list items
                Array(5).fill(0).map((_, i) => <ListItemSkeleton key={i} />)
              ) : stats.recentMentors.length > 0 ? (
                stats.recentMentors.map((mentor) => (
                  <li key={mentor.id} className="py-3 px-2 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <div className="h-10 w-10 rounded-full bg-purple-500 flex items-center justify-center text-white">
                          {mentor.name ? mentor.name.charAt(0).toUpperCase() : 'M'}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {mentor.name || 'Unknown Mentor'}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                          {mentor.specialization || mentor.email || 'No details'}
                        </p>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {mentor.createdAt ? new Date(mentor.createdAt).toLocaleDateString() : 'N/A'}
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <li className="py-4 text-center">No recent mentors found</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Add a link to the Data Analyst Dashboard in the admin navigation menu */}
      {userRole === 'admin' || userRole === 'data_analyst' ? (
        <div className={`rounded-xl shadow-lg overflow-hidden ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
            <h3 className="text-lg font-medium">Data Analytics</h3>
            <Link to="/data-analyst/dashboard" className="text-sm font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300">
              Go to Data Analyst Dashboard
            </Link>
          </div>
          <div className="p-6">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Access detailed analytics and reports on platform performance, user engagement, and more.
            </p>
          </div>
        </div>
      ) : null}

      {/* Data Analyst Creation Modal */}
      {showAnalystModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Create Data Analyst</h3>
              <button 
                onClick={() => setShowAnalystModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FaTimes />
              </button>
            </div>
            
            {submitSuccess ? (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                Data analyst created successfully!
              </div>
            ) : (
              <form onSubmit={handleCreateAnalyst}>
                {submitError && (
                  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {submitError}
                  </div>
                )}
                
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${
                      formErrors.name ? 'border-red-500' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.name}</p>
                  )}
                </div>
                
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${
                      formErrors.email ? 'border-red-500' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                  />
                  {formErrors.email && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.email}</p>
                  )}
                </div>
                
                <div className="mb-4">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${
                      formErrors.password ? 'border-red-500' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                  />
                  {formErrors.password && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.password}</p>
                  )}
                </div>
                
                <div className="mb-6">
                  <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Confirm Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    id="confirmPassword"
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full px-3 py-2 border ${
                      formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                    } rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500`}
                  />
                  {formErrors.confirmPassword && (
                    <p className="mt-1 text-sm text-red-500">{formErrors.confirmPassword}</p>
                  )}
                </div>
                
                <div className="flex justify-end space-x-3">
                  <button
                    type="button"
                    onClick={() => setShowAnalystModal(false)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Data Analyst'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default NewDashboard;
