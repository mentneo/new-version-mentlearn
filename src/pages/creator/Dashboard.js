import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, deleteDoc, getFirestore, onSnapshot } from 'firebase/firestore';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Legend, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { getAuth } from 'firebase/auth';
import { Link, useNavigate } from 'react-router-dom';
import { Formik, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { 
  FaPlus, FaEdit, FaTrash, FaUpload, FaBell, FaEye, FaChartLine, 
  FaBook, FaUsers, FaRupeeSign, FaStar, FaTrophy, FaCamera,
  FaUserGraduate, FaChalkboardTeacher, FaClipboardList, FaCog,
  FaArrowUp, FaArrowDown, FaBullhorn, FaExclamationCircle, FaCheckCircle, FaTimes
} from 'react-icons/fa/index.esm.js';
import { uploadCourseThumbnailWithFallback } from '../../utils/cloudinary.js';


const CourseSchema = Yup.object().shape({
  title: Yup.string().required('Required'),
  description: Yup.string().required('Required'),
  price: Yup.number().required('Required').min(0, 'Price must be positive'),
  modules: Yup.array().of(
    Yup.object().shape({
      title: Yup.string().required('Module title is required'),
      description: Yup.string().required('Module description is required'),
      topics: Yup.array().of(
        Yup.object().shape({
          title: Yup.string().required('Topic title is required'),
          type: Yup.string().required('Topic type is required'),
          content: Yup.string().when('type', (type, schema) => {
            return type === 'text' ? schema.required('Content is required for text topics') : schema;
          }),
          videoUrl: Yup.string().when('type', (type, schema) => {
            return type === 'video' ? schema.required('Video URL is required for video topics') : schema;
          }),
        })
      ),
    })
  ),
});

// Add custom CSS for animations
const styles = `
  @keyframes fadeInRight {
    from {
      opacity: 0;
      transform: translateX(20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }
  .animate-fade-in-right {
    animation: fadeInRight 0.5s ease-out;
  }
`;

// Add the style element to the document head
if (typeof document !== 'undefined' && !document.getElementById('dashboard-custom-styles')) {
  const styleElement = document.createElement('style');
  styleElement.id = 'dashboard-custom-styles';
  styleElement.innerHTML = styles;
  document.head.appendChild(styleElement);
}

export default function CreatorDashboard() {
  // States - Basic UI states
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [creatorProfile, setCreatorProfile] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [thumbnailFile, setThumbnailFile] = useState(null);
  
  // Dashboard Data States
  const [courses, setCourses] = useState([]);
  const [totalStudents, setTotalStudents] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [avgRating, setAvgRating] = useState(0);
  
  // Growth metrics
  const [studentGrowth, setStudentGrowth] = useState(0);
  const [revenueGrowth, setRevenueGrowth] = useState(0);
  const [coursesGrowth, setCoursesGrowth] = useState(0);
  const [ratingGrowth, setRatingGrowth] = useState(0);
  const [studentsGrowth, setStudentsGrowth] = useState(0);
  
  // Chart data
  const [revenueData, setRevenueData] = useState([]);
  const [engagementData, setEngagementData] = useState([]);
  const [courseCompletionData, setCourseCompletionData] = useState([]);
  const [coursePopularity, setCoursePopularity] = useState([]);
  const [priceDistribution, setPriceDistribution] = useState([]);
  
  // Student data
  const [topStudents, setTopStudents] = useState([]);
  const [activeStudents, setActiveStudents] = useState(0);
  const [inactiveStudents, setInactiveStudents] = useState(0);
  const [avgCompletion, setAvgCompletion] = useState(0);
  const [totalEnrollments, setTotalEnrollments] = useState(0);
  
  // Course financials
  const [avgCoursePrice, setAvgCoursePrice] = useState(0);
  const [bestPerformingPrice, setBestPerformingPrice] = useState(0);
  const [minCoursePrice, setMinCoursePrice] = useState(0);
  const [maxCoursePrice, setMaxCoursePrice] = useState(0);
  const [topRevenueCourses, setTopRevenueCourses] = useState([]);
  
  // Content & activities
  const [quizzes, setQuizzes] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [activityFeed, setActivityFeed] = useState([]);
  
  // Notification handling
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [notificationTitle, setNotificationTitle] = useState('');
  const [notificationMessage, setNotificationMessage] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  
  // Constants for charts
  const COLORS = ['#3B82F6', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B', '#EF4444'];

  const auth = getAuth();
  const db = getFirestore();
  const user = auth.currentUser;
  const navigate = useNavigate();
  
  // Colors for charts



  const fetchCreatorProfile = useCallback(async () => {
    try {
      const creatorsRef = collection(db, 'creators');
      const q = query(creatorsRef, where('uid', '==', user.uid));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        const creatorData = querySnapshot.docs[0].data();
        setCreatorProfile({
          id: querySnapshot.docs[0].id,
          ...creatorData
        });
      }
    } catch (err) {
      console.error('Error fetching creator profile:', err);
      setError('Failed to load creator profile');
    }
  }, [user, db]);
  
  // Fetch real analytics data from Firebase
  const fetchAnalyticsData = useCallback(async () => {
    try {
      if (!user) return;
      
      // Fetch enrollments
      const enrollmentsRef = collection(db, 'enrollments');
      const enrollmentsQuery = query(enrollmentsRef, where('creatorId', '==', user.uid));
      const enrollmentsSnapshot = await getDocs(enrollmentsQuery);
      
      const enrollmentsData = enrollmentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      // Calculate total students (unique student IDs)
      const uniqueStudents = new Set(enrollmentsData.map(enrollment => enrollment.studentId));
      setTotalStudents(uniqueStudents.size);
      
      // Calculate monthly revenue
      let currentMonthRevenue = 0;
      let previousMonthRevenue = 0;
      
      // Get current and previous month
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();
      const previousMonth = currentMonth === 0 ? 11 : currentMonth - 1;
      const previousYear = currentMonth === 0 ? currentYear - 1 : currentYear;
      
      // Process enrollments for revenue calculation
      enrollmentsData.forEach(enrollment => {
        if (!enrollment.createdAt) return;
        
        const enrollmentDate = new Date(enrollment.createdAt);
        const enrollmentMonth = enrollmentDate.getMonth();
        const enrollmentYear = enrollmentDate.getFullYear();
        const price = enrollment.price || 0;
        
        if (enrollmentMonth === currentMonth && enrollmentYear === currentYear) {
          currentMonthRevenue += price;
        } else if (enrollmentMonth === previousMonth && enrollmentYear === previousYear) {
          previousMonthRevenue += price;
        }
      });
      
      setMonthlyRevenue(currentMonthRevenue);
      
      // Calculate revenue growth
      const revGrowth = previousMonthRevenue === 0 
        ? 100 
        : Math.round(((currentMonthRevenue - previousMonthRevenue) / previousMonthRevenue) * 100);
      setRevenueGrowth(revGrowth);
      
      // Calculate student growth (compare enrollments from current month vs previous month)
      const currentMonthEnrollments = enrollmentsData.filter(enrollment => {
        if (!enrollment.createdAt) return false;
        const date = new Date(enrollment.createdAt);
        return date.getMonth() === currentMonth && date.getFullYear() === currentYear;
      }).length;
      
      const previousMonthEnrollments = enrollmentsData.filter(enrollment => {
        if (!enrollment.createdAt) return false;
        const date = new Date(enrollment.createdAt);
        return date.getMonth() === previousMonth && date.getFullYear() === previousYear;
      }).length;
      
      const stdGrowth = previousMonthEnrollments === 0 
        ? 100 
        : Math.round(((currentMonthEnrollments - previousMonthEnrollments) / previousMonthEnrollments) * 100);
      setStudentGrowth(stdGrowth);
      
      // Calculate active/inactive students
      // We'll consider active students as those who enrolled or had activity in the last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const activeStudentsCount = enrollmentsData.filter(enrollment => {
        if (!enrollment.createdAt) return false;
        const date = new Date(enrollment.createdAt);
        return date >= thirtyDaysAgo;
      }).length;
      
      setActiveStudents(activeStudentsCount);
      setInactiveStudents(Math.max(0, uniqueStudents.size - activeStudentsCount));
      
      // Generate revenue data for past 6 months
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const revenueByMonth = {};
      
      // Initialize all months for the past 6 months
      for (let i = 5; i >= 0; i--) {
        let monthIndex = currentMonth - i;
        let yearOffset = 0;
        
        if (monthIndex < 0) {
          monthIndex += 12;
          yearOffset = -1;
        }
        
        const monthName = monthNames[monthIndex];
        revenueByMonth[monthName] = 0;
      }
      
      // Fill in revenue data
      enrollmentsData.forEach(enrollment => {
        if (!enrollment.createdAt) return;
        
        const enrollmentDate = new Date(enrollment.createdAt);
        const enrollmentMonth = enrollmentDate.getMonth();
        const enrollmentYear = enrollmentDate.getFullYear();
        const monthName = monthNames[enrollmentMonth];
        const price = enrollment.price || 0;
        
        // Check if this enrollment is from the last 6 months
        const monthsDiff = (currentYear - enrollmentYear) * 12 + (currentMonth - enrollmentMonth);
        
        if (monthsDiff >= 0 && monthsDiff < 6) {
          revenueByMonth[monthName] = (revenueByMonth[monthName] || 0) + price;
        }
      });
      
      // Convert to array format for charts
      const revenueChartData = Object.keys(revenueByMonth).map(month => ({
        month,
        revenue: revenueByMonth[month]
      }));
      
      setRevenueData(revenueChartData);
      
      // Course engagement data
      const courseEnrollmentMap = {};
      enrollmentsData.forEach(enrollment => {
        const courseId = enrollment.courseId;
        if (courseId) {
          courseEnrollmentMap[courseId] = (courseEnrollmentMap[courseId] || 0) + 1;
        }
      });
      
      // Map course IDs to course names using the courses data
      const engagementDataArray = courses.map(course => ({
        name: course.title || 'Untitled Course',
        Enrollments: courseEnrollmentMap[course.id] || 0
      }));
      
      // Sort by enrollments and take top 5
      engagementDataArray.sort((a, b) => b.Enrollments - a.Enrollments);
      setEngagementData(engagementDataArray.slice(0, 5));
      
      // Course completion data (this would require progress tracking data)
      // For now, let's use a placeholder based on enrollments
      setCourseCompletionData([
        { name: 'Completed', value: Math.round(enrollmentsData.length * 0.4) },
        { name: 'In Progress', value: Math.round(enrollmentsData.length * 0.4) },
        { name: 'Not Started', value: Math.round(enrollmentsData.length * 0.2) }
      ]);
      
      // Fetch top students (based on number of enrollments and course completions)
      const studentsRef = collection(db, 'users');
      const studentsQuery = query(studentsRef, where('role', '==', 'student'));
      const studentsSnapshot = await getDocs(studentsQuery);
      
      const studentsData = studentsSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        enrollmentsCount: enrollmentsData.filter(e => e.studentId === doc.id).length
      }));
      
      // Sort by enrollments count and take top 3
      studentsData.sort((a, b) => b.enrollmentsCount - a.enrollmentsCount);
      const topStudentsData = studentsData.slice(0, 3).map(student => {
        // Find the most recent enrollment for this student to get the course
        const studentEnrollments = enrollmentsData
          .filter(e => e.studentId === student.id)
          .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        const mostRecentCourseId = studentEnrollments[0]?.courseId;
        const course = courses.find(c => c.id === mostRecentCourseId);
        
        return {
          id: student.id,
          name: student.displayName || 'Anonymous Student',
          avatar: student.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.displayName || 'Student')}&size=50&background=3B82F6&color=fff`,
          progress: Math.floor(Math.random() * 30) + 70, // Placeholder for actual progress
          course: course?.title || 'Unknown Course'
        };
      });
      
      setTopStudents(topStudentsData);
      
      // Course pricing data
      if (courses.length > 0) {
        const prices = courses.map(course => parseFloat(course.price) || 0).filter(price => price > 0);
        
        if (prices.length > 0) {
          const avgPrice = prices.reduce((a, b) => a + b, 0) / prices.length;
          const minPrice = Math.min(...prices);
          const maxPrice = Math.max(...prices);
          
          setAvgCoursePrice(avgPrice);
          setMinCoursePrice(minPrice);
          setMaxCoursePrice(maxPrice);
          setBestPerformingPrice(avgPrice); // Placeholder - would need more data for this
          
          // Price distribution
          const priceRanges = [
            { range: '₹0-2000', min: 0, max: 2000, count: 0 },
            { range: '₹2001-4000', min: 2001, max: 4000, count: 0 },
            { range: '₹4001-6000', min: 4001, max: 6000, count: 0 },
            { range: '₹6001-8000', min: 6001, max: 8000, count: 0 },
            { range: '₹8001+', min: 8001, max: Infinity, count: 0 }
          ];
          
          prices.forEach(price => {
            const range = priceRanges.find(r => price >= r.min && price <= r.max);
            if (range) range.count++;
          });
          
          setPriceDistribution(priceRanges);
        }
      }
      
      // Top revenue courses
      const coursesWithRevenue = courses.map(course => {
        const courseEnrollments = enrollmentsData.filter(e => e.courseId === course.id);
        const revenue = courseEnrollments.reduce((total, e) => total + (parseFloat(e.price) || 0), 0);
        
        return {
          id: course.id,
          title: course.title || 'Untitled Course',
          thumbnail: course.thumbnailUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(course.title || 'Course')}&size=150&background=3B82F6&color=fff`,
          enrollments: courseEnrollments.length,
          rating: course.rating || 0,
          revenue: revenue,
          trend: Math.floor(Math.random() * 20) - 5 // Placeholder for actual trend data
        };
      });
      
      // Sort by revenue and take top 3
      coursesWithRevenue.sort((a, b) => b.revenue - a.revenue);
      setTopRevenueCourses(coursesWithRevenue.slice(0, 3));
      
      // Fetch quizzes
      const quizzesRef = collection(db, 'quizzes');
      const quizzesQuery = query(quizzesRef, where('creatorId', '==', user.uid));
      const quizzesSnapshot = await getDocs(quizzesQuery);
      
      const quizzesData = await Promise.all(quizzesSnapshot.docs.map(async doc => {
        const quizData = doc.data();
        const courseId = quizData.courseId;
        let courseName = 'Unknown Course';
        
        if (courseId) {
          const course = courses.find(c => c.id === courseId);
          if (course) {
            courseName = course.title;
          }
        }
        
        // Count submissions (this would need an actual submissions collection)
        const submissions = Math.floor(Math.random() * 40); // Placeholder
        
        return {
          id: doc.id,
          title: quizData.title || 'Untitled Quiz',
          type: quizData.type || 'quiz',
          courseName,
          questions: quizData.questions?.length || 0,
          submissions
        };
      }));
      
      setQuizzes(quizzesData.slice(0, 3));
      
      // Fetch notifications
      const notificationsRef = collection(db, 'notifications');
      const notificationsQuery = query(
        notificationsRef, 
        where('creatorId', '==', user.uid),
        where('type', 'in', ['announcement', 'course', 'system'])
      );
      const notificationsSnapshot = await getDocs(notificationsQuery);
      
      const notificationsData = notificationsSnapshot.docs.map(doc => {
        const data = doc.data();
        const createdAt = data.createdAt ? new Date(data.createdAt) : new Date();
        
        // Calculate relative time
        const now = new Date();
        const diffMs = now - createdAt;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        
        let time;
        if (diffDays > 0) {
          time = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        } else if (diffHours > 0) {
          time = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        } else {
          const diffMinutes = Math.floor(diffMs / (1000 * 60));
          time = `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
        }
        
        return {
          id: doc.id,
          type: data.type || 'system',
          title: data.title || 'Notification',
          message: data.message || '',
          time,
          readCount: data.readCount || 0
        };
      });
      
      setNotifications(notificationsData.slice(0, 3));
      
      // Activity feed based on enrollments and other data
      const activities = [];
      
      // Add recent enrollments as activities
      const recentEnrollments = [...enrollmentsData]
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 2);
        
      for (const enrollment of recentEnrollments) {
        const student = studentsData.find(s => s.id === enrollment.studentId);
        const course = courses.find(c => c.id === enrollment.courseId);
        
        if (student && course) {
          const createdAt = enrollment.createdAt ? new Date(enrollment.createdAt) : new Date();
          const diffMs = now - createdAt;
          const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
          const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
          
          let time;
          if (diffDays > 0) {
            time = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
          } else if (diffHours > 0) {
            time = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
          } else {
            const diffMinutes = Math.floor(diffMs / (1000 * 60));
            time = `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
          }
          
          activities.push({
            id: activities.length + 1,
            type: 'student',
            title: 'New Student Joined',
            description: `${student.displayName || 'A student'} enrolled in ${course.title || 'your course'}`,
            time
          });
        }
      }
      
      // Add recent course creations
      const recentCourses = [...courses]
        .sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0))
        .slice(0, 1);
        
      for (const course of recentCourses) {
        const createdAt = course.createdAt ? new Date(course.createdAt) : new Date();
        const diffMs = now - createdAt;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        
        let time;
        if (diffDays > 0) {
          time = `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
        } else {
          const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
          time = `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
        }
        
        activities.push({
          id: activities.length + 1,
          type: 'course',
          title: 'Course Content Updated',
          description: `You created or updated "${course.title || 'your course'}"`,
          time
        });
      }
      
      // Add revenue milestone if applicable
      const totalRevenue = enrollmentsData.reduce((total, e) => total + (parseFloat(e.price) || 0), 0);
      
      if (totalRevenue > 0) {
        activities.push({
          id: activities.length + 1,
          type: 'payment',
          title: 'Revenue Update',
          description: `You've earned ₹${totalRevenue.toLocaleString()} from your courses!`,
          time: 'Recent'
        });
      }
      
      setActivityFeed(activities);
      
    } catch (err) {
      console.error('Error fetching analytics data:', err);
      setError('Failed to load analytics data. Please try again later.');
    }
  }, [user, db, courses]);

  // Real-time fetch for courses and enrollments
  const fetchCoursesRealtime = useCallback(() => {
    if (!user) return;
    setLoading(true);
    const coursesRef = collection(db, 'courses');
    const q = query(coursesRef, where('creatorId', '==', user.uid));
    const unsub = onSnapshot(q, async (querySnapshot) => {
      const coursesList = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // DEBUG: Log course published status
      console.log('🔍 CREATOR DASHBOARD - Fetched courses:');
      coursesList.forEach(course => {
        console.log(`  📚 ${course.title}: published=${course.published}, status=${course.status}`);
      });
      
      setCourses(coursesList);
      
      // Calculate average rating
      let totalRating = 0;
      let ratingCount = 0;
      coursesList.forEach(course => {
        if (course.rating) {
          totalRating += course.rating;
          ratingCount++;
        }
      });
      setAvgRating(ratingCount > 0 ? (totalRating / ratingCount).toFixed(1) : 0);
      setCoursesGrowth(Math.round(Math.random() * 20 - 5)); // Example data

      // For analytics: fetch enrollments for each course
      let total = 0;
      let popularity = [];
      let enrollmentsByDate = {};

      for (const course of coursesList) {
        const enrollRef = collection(db, 'enrollments');
        const eq = query(enrollRef, where('courseId', '==', course.id));
        const enrollSnap = await getDocs(eq);
        popularity.push({ name: course.title, Enrollments: enrollSnap.size });
        total += enrollSnap.size;
        enrollSnap.forEach(docSnap => {
          const data = docSnap.data();
          // Assume data.createdAt is ISO string
          const date = data.createdAt ? data.createdAt.slice(0, 10) : 'Unknown';
          enrollmentsByDate[date] = (enrollmentsByDate[date] || 0) + 1;
        });
      }
      setTotalEnrollments(total);
      setCoursePopularity(popularity);
      // Convert enrollmentsByDate to array sorted by date - we're not using this anymore
      Object.entries(enrollmentsByDate)
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));
      setLoading(false);
    });
    return unsub;
  }, [user, db]);

  // Handle sending notification for a specific course
  const handleSendNotification = (courseId, courseTitle) => {
    setSelectedCourseId(courseId);
    setNotificationTitle(`New update for ${courseTitle}`);
    setNotificationMessage(`We've added new content to ${courseTitle}. Check it out!`);
    setShowNotificationModal(true);
  };
  
  // Handle sending broadcast notification to all students
  const handleSendBroadcastNotification = () => {
    setSelectedCourseId(null);
    setNotificationTitle('Announcement from your mentor');
    setNotificationMessage('');
    setShowNotificationModal(true);
  };
  
  // Handle notification submission
  const handleNotificationSubmit = async () => {
    if (!notificationTitle || !notificationMessage) {
      setError('Please provide both title and message for your notification');
      return;
    }
    
    try {
      // In a real app, we would send this to the backend
      // For demo purposes, just add to our notifications array
      const newNotification = {
        id: Date.now(),
        type: selectedCourseId ? 'course' : 'announcement',
        title: notificationTitle,
        message: notificationMessage,
        time: 'Just now',
        readCount: 0
      };
      
      setNotifications([newNotification, ...notifications]);
      
      // Also add to activity feed
      const newActivity = {
        id: Date.now(),
        type: 'notification',
        title: 'Notification Sent',
        description: `You sent "${notificationTitle}" to ${selectedCourseId ? 'course students' : 'all students'}`,
        time: 'Just now'
      };
      
      setActivityFeed([newActivity, ...activityFeed]);
      
      // Show success message
      setSuccess(`Notification "${notificationTitle}" has been sent successfully!`);
      
      // Close modal and reset fields
      setShowNotificationModal(false);
      setNotificationTitle('');
      setNotificationMessage('');
      setSelectedCourseId(null);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess('');
      }, 3000);
    } catch (err) {
      console.error('Error sending notification:', err);
      setError('Failed to send notification. Please try again.');
      
      // Clear error message after 3 seconds
      setTimeout(() => {
        setError('');
      }, 3000);
    }
  };

  useEffect(() => {
    if (user) {
      fetchCreatorProfile();
      const unsub = fetchCoursesRealtime();
      
      // This will be called after courses are fetched
      setTimeout(() => {
        fetchAnalyticsData();
      }, 1000);
        
        // Generate activity feed instead of recent activity
        setActivityFeed([
          { id: 1, text: 'Rohit joined Data Analyst Pro', timestamp: '2 hours ago', icon: 'user' },
          { id: 2, text: '₹999 payment received', timestamp: '4 hours ago', icon: 'payment' },
          { id: 3, text: 'Quiz submitted by Priya', timestamp: '6 hours ago', icon: 'quiz' },
          { id: 4, text: 'Notification sent: New Assignment Uploaded', timestamp: '8 hours ago', icon: 'notification' },
          { id: 5, text: 'New review: 5⭐ from Amit Kumar', timestamp: '1 day ago', icon: 'review' }
        ]);
        
        // Set student analytics
        setStudentsGrowth(Math.round(Math.random() * 15));
        setRevenueGrowth(Math.round(Math.random() * 25 - 3));
        setRatingGrowth(Math.round(Math.random() * 10 - 2));
        
      return () => { if (unsub) unsub(); };
    }
  }, [user, fetchCreatorProfile, fetchCoursesRealtime, fetchAnalyticsData]);

  const handleThumbnailChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Save the file object for upload during course creation
      setThumbnailFile(file);
      
      // Create a preview for the UI
      const reader = new FileReader();
      reader.onload = (e) => setThumbnailPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAddCourse = async (values, { setSubmitting, resetForm }) => {
    if (!user) {
      setError('You must be logged in to create a course');
      setSubmitting(false);
      return;
    }

    try {
      // If there's a new thumbnail file, upload it to storage first
      let thumbnailUrl = '';
      
      if (thumbnailFile) {
        try {
          console.log('Uploading course thumbnail...');
          thumbnailUrl = await uploadCourseThumbnailWithFallback(thumbnailFile);
          console.log('Thumbnail uploaded successfully:', thumbnailUrl);
        } catch (uploadError) {
          console.error('Error uploading thumbnail:', uploadError);
          setError('Failed to upload thumbnail: ' + uploadError.message);
          setSubmitting(false);
          return;
        }
      } else if (editingCourse && editingCourse.thumbnailUrl) {
        // Keep existing thumbnail URL if editing a course
        thumbnailUrl = editingCourse.thumbnailUrl;
      }

      const courseData = {
        ...values,
        creatorId: user.uid,
        creatorName: creatorProfile.name,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        thumbnailUrl: thumbnailUrl, // Now using the URL from the uploaded image
        enrollments: 0,
        rating: 0,
        reviews: [],
        published: true, // Make course visible to students immediately
        status: 'active', // Course is active and available
      };

      // DEBUG: Log the course data before saving
      console.log('🔍 CREATOR DASHBOARD - Saving course with data:', {
        title: courseData.title,
        published: courseData.published,
        status: courseData.status,
        creatorId: courseData.creatorId,
        hasModules: !!courseData.modules,
        moduleCount: courseData.modules?.length || 0
      });

      if (editingCourse) {
        // Update existing course
        await updateDoc(doc(db, 'courses', editingCourse.id), courseData);
        console.log('✅ Course updated in Firestore, ID:', editingCourse.id);
        setSuccess('Course updated successfully!');
      } else {
        // Create new course
        const docRef = await addDoc(collection(db, 'courses'), courseData);
        console.log('✅ New course created in Firestore, ID:', docRef.id);
        setSuccess('Course created successfully!');
      }

      // Update creator's course count
      const creatorRef = doc(db, 'creators', creatorProfile.id);
      await updateDoc(creatorRef, {
        coursesCount: (creatorProfile.coursesCount || 0) + (editingCourse ? 0 : 1)
      });

  // No need to refresh course list, real-time updates will handle it
      
      // Reset form and close modal
      resetForm();
      setThumbnailPreview('');
      setThumbnailFile(null);
      setShowAddModal(false);
      setEditingCourse(null);
      
    } catch (err) {
      console.error('Error creating/updating course:', err);
      setError('Failed to save course: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setThumbnailPreview(course.thumbnailUrl || '');
    setThumbnailFile(null); // Reset thumbnail file when editing an existing course
    setShowAddModal(true);
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      try {
        setLoading(true);
        await deleteDoc(doc(db, 'courses', courseId));
        
        // Update creator's course count
        const creatorRef = doc(db, 'creators', creatorProfile.id);
        await updateDoc(creatorRef, {
          coursesCount: Math.max((creatorProfile.coursesCount || 0) - 1, 0)
        });
        
        setCourses(courses.filter(course => course.id !== courseId));
        setSuccess('Course deleted successfully!');
      } catch (err) {
        console.error('Error deleting course:', err);
        setError('Failed to delete course');
      } finally {
        setLoading(false);
      }
    }
  };

  if (loading && courses.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
            <p className="text-center mt-4">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!creatorProfile) {
    return (
      <div className="min-h-screen bg-gray-100">
        <div className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
              <h3 className="font-bold">Creator Profile Not Found</h3>
              <p>You must be registered as a creator to access this page.</p>
              {user && (
                <div className="mt-4 p-4 bg-white rounded shadow">
                  <h4 className="font-semibold">Debug Information:</h4>
                  <ul className="mt-2 text-sm">
                    <li><strong>User ID:</strong> {user.uid}</li>
                    <li><strong>Email:</strong> {user.email}</li>
                    <li><strong>Current Role:</strong> {user.role || 'Not set'}</li>
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <div className="py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Error and Success messages */}
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">{error}</span>
              <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
                <svg onClick={() => setError('')} className="fill-current h-6 w-6 text-red-500 cursor-pointer" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
                </svg>
              </span>
            </div>
          )}
          
          {success && (
            <div className="mb-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative">
              <span className="block sm:inline">{success}</span>
              <span className="absolute top-0 bottom-0 right-0 px-4 py-3">
                <svg onClick={() => setSuccess('')} className="fill-current h-6 w-6 text-green-500 cursor-pointer" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/>
                </svg>
              </span>
            </div>
          )}

          {/* Dashboard Header */}
          <div className="md:flex md:items-center md:justify-between mb-6">
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-bold leading-tight text-gray-900">Mentneo Creator Dashboard</h1>
              <p className="mt-1 text-sm text-gray-600">Create. Analyze. Grow.</p>
            </div>
            <div className="mt-4 flex md:mt-0 md:ml-4">
              <button 
                onClick={() => navigate('/creator/courses')}
                className="ml-3 inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                <FaPlus className="-ml-1 mr-2 h-5 w-5" />
                New Course
              </button>
            </div>
          </div>

          {/* Section 1: Overview Cards */}
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {/* Total Courses Card */}
            <div className="bg-gradient-to-r from-blue-500 to-indigo-600 overflow-hidden shadow rounded-2xl">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-white/30 rounded-full p-3">
                    <FaBook className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-white truncate">Total Courses</dt>
                      <dd>
                        <div className="text-3xl font-semibold text-white">{courses.length}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-4">
                  <div className={`flex items-center ${coursesGrowth >= 0 ? 'text-green-100' : 'text-red-100'}`}>
                    <span className="text-sm">{coursesGrowth >= 0 ? '+' : ''}{coursesGrowth}% from last month</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Total Students Card */}
            <div className="bg-gradient-to-r from-purple-500 to-pink-500 overflow-hidden shadow rounded-2xl">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-white/30 rounded-full p-3">
                    <FaUsers className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-white truncate">Total Students</dt>
                      <dd>
                        <div className="text-3xl font-semibold text-white">{totalStudents || totalEnrollments}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-4">
                  <div className={`flex items-center ${studentsGrowth >= 0 ? 'text-green-100' : 'text-red-100'}`}>
                    <span className="text-sm">{studentsGrowth >= 0 ? '+' : ''}{studentsGrowth}% from last month</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Monthly Revenue Card */}
            <div className="bg-gradient-to-r from-emerald-500 to-teal-500 overflow-hidden shadow rounded-2xl">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-white/30 rounded-full p-3">
                    <FaRupeeSign className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-white truncate">Monthly Revenue</dt>
                      <dd>
                        <div className="text-3xl font-semibold text-white">₹{monthlyRevenue.toLocaleString()}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-4">
                  <div className={`flex items-center ${revenueGrowth >= 0 ? 'text-green-100' : 'text-red-100'}`}>
                    <span className="text-sm">{revenueGrowth >= 0 ? '+' : ''}{revenueGrowth}% from last month</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Avg Course Rating Card */}
            <div className="bg-gradient-to-r from-amber-500 to-orange-500 overflow-hidden shadow rounded-2xl">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-white/30 rounded-full p-3">
                    <FaStar className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-white truncate">Avg Course Rating</dt>
                      <dd>
                        <div className="text-3xl font-semibold text-white">{avgRating}⭐</div>
                      </dd>
                    </dl>
                  </div>
                </div>
                <div className="mt-4">
                  <div className={`flex items-center ${ratingGrowth >= 0 ? 'text-green-100' : 'text-red-100'}`}>
                    <span className="text-sm">{ratingGrowth >= 0 ? '+' : ''}{ratingGrowth}% from last month</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Section 2: Analytics Charts */}
          <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* Revenue Trend Chart */}
            <div className="bg-white shadow rounded-2xl p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Revenue Trend</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={revenueData}
                    margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`₹${value}`, 'Revenue']} />
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="#3B82F6"
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Engagement Chart */}
            <div className="bg-white shadow rounded-2xl p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Student Engagement by Course</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={coursePopularity || engagementData}
                    margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                    layout="vertical"
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" tick={{ fontSize: 12 }} width={100} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Enrollments" name="Enrollments" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Course Completion Pie Chart */}
            <div className="bg-white shadow rounded-2xl p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Course Completion Status</h3>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={courseCompletionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      fill="#8884d8"
                      paddingAngle={5}
                      dataKey="value"
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    >
                      {courseCompletionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            {/* Student Progress Analytics */}
            <div className="bg-white shadow rounded-2xl p-6">
              <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Student Progress</h3>
              <div className="flex items-center mb-6">
                <div className="w-2/3 bg-gray-200 rounded-full h-4 mr-4">
                  <div className="bg-blue-600 h-4 rounded-full" style={{ width: `${avgCompletion}%` }}></div>
                </div>
                <span className="text-sm font-medium text-gray-700">{avgCompletion}% Avg. Completion</span>
              </div>
              
              <div className="flex mb-6">
                <div className="w-1/2 pr-2">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Active Students</h4>
                  <p className="text-2xl font-semibold text-green-600">{activeStudents}</p>
                </div>
                <div className="w-1/2 pl-2">
                  <h4 className="text-sm font-medium text-gray-500 mb-1">Inactive Students</h4>
                  <p className="text-2xl font-semibold text-red-600">{inactiveStudents}</p>
                </div>
              </div>
              
              <h4 className="font-medium text-gray-700 mb-3">Top Students</h4>
              <div className="space-y-3">
                {topStudents.map(student => (
                  <div key={student.id} className="flex items-center p-2 bg-gray-50 rounded-lg">
                    <img src={student.avatar} alt={student.name} className="w-10 h-10 rounded-full object-cover" />
                    <div className="ml-3">
                      <p className="text-sm font-medium text-gray-900">{student.name}</p>
                      <p className="text-xs text-gray-500">{student.course}</p>
                    </div>
                    <div className="ml-auto flex items-center">
                      <div className="w-24 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${student.progress}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-medium text-gray-500">{student.progress}%</span>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-4 text-center">
                <button className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                  View Student Details
                </button>
              </div>
            </div>
          </div>
          
          {/* Section 3: My Courses Table */}
          <div className="mt-8">
            <div className="bg-white shadow rounded-2xl overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">My Courses</h3>
                  <Link 
                    to="/creator/new-course" 
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <FaPlus className="mr-2" /> New Course
                  </Link>
                </div>
                
                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Course
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Students
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Rating
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Revenue
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {courses && courses.length > 0 ? (
                        courses.map((course) => (
                          <tr key={course.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <img 
                                    className="h-10 w-10 rounded-md object-cover" 
                                    src={course.thumbnail || `https://ui-avatars.com/api/?name=${encodeURIComponent(course.title || 'Course')}&size=150&background=3B82F6&color=fff`} 
                                    alt={course.title}
                                    onError={(e) => {
                                      e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(course.title || 'Course')}&size=150&background=3B82F6&color=fff`;
                                    }}
                                  />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">
                                    {course.title}
                                  </div>
                                  <div className="text-sm text-gray-500">
                                    {course.category || 'Uncategorized'}
                                  </div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {course.enrollmentCount || 0}
                              </div>
                              <div className="text-xs text-gray-500">
                                {course.enrollmentTrend > 0 ? (
                                  <span className="text-green-600 flex items-center">
                                    <FaArrowUp className="mr-1" /> {course.enrollmentTrend}%
                                  </span>
                                ) : course.enrollmentTrend < 0 ? (
                                  <span className="text-red-600 flex items-center">
                                    <FaArrowDown className="mr-1" /> {Math.abs(course.enrollmentTrend)}%
                                  </span>
                                ) : (
                                  <span>No change</span>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="text-sm font-medium text-gray-900 mr-1">
                                  {course.rating ? Number(course.rating).toFixed(1) : 'N/A'}
                                </div>
                                {course.rating && (
                                  <FaStar className="text-yellow-400" />
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              ₹{course.revenue || 0}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${course.published ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                {course.published ? 'Published' : 'Draft'}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-3">
                                <button
                                  onClick={() => handleEditCourse(course)} 
                                  className="text-blue-600 hover:text-blue-900 transition-colors"
                                  title="Edit Course"
                                >
                                  <FaEdit className="h-4 w-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteCourse(course.id)}
                                  className="text-red-600 hover:text-red-900 transition-colors"
                                  title="Delete Course"
                                >
                                  <FaTrash className="h-4 w-4" />
                                </button>
                                <Link 
                                  to={`/creator/courses`}
                                  className="text-green-600 hover:text-green-900 transition-colors"
                                  title="View All Courses"
                                >
                                  <FaEye className="h-4 w-4" />
                                </Link>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan="6" className="px-6 py-4 text-center text-sm text-gray-500">
                            No courses found. Create your first course!
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          
          {/* Section 4: Quizzes & Assignments */}
          <div className="mt-8">
            <div className="bg-white shadow rounded-2xl overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Quizzes & Assignments</h3>
                  <Link 
                    to="/creator/new-quiz" 
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
                  >
                    <FaPlus className="mr-2" /> New Quiz
                  </Link>
                </div>
                
                <div className="overflow-x-auto">
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {quizzes.length > 0 ? quizzes.map(quiz => (
                      <div key={quiz.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-medium text-gray-900">{quiz.title}</h4>
                            <p className="text-sm text-gray-500 mt-1">{quiz.courseName}</p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            quiz.type === 'quiz' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                          }`}>
                            {quiz.type === 'quiz' ? 'Quiz' : 'Assignment'}
                          </span>
                        </div>
                        
                        <div className="mt-4 flex justify-between text-sm">
                          <span className="text-gray-500">{quiz.questions} Questions</span>
                          <span className="text-gray-500">{quiz.submissions} Submissions</span>
                        </div>
                        
                        <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between">
                          <Link to={`/creator/quiz/${quiz.id}/edit`} className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                            Edit
                          </Link>
                          <Link to={`/creator/quiz/${quiz.id}/responses`} className="text-purple-600 hover:text-purple-800 text-sm font-medium">
                            View Responses
                          </Link>
                        </div>
                      </div>
                    )) : (
                      <div className="col-span-full text-center py-8 text-gray-500">
                        No quizzes or assignments found. Create your first quiz!
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Section 5: Revenue & Pricing */}
          <div className="mt-8">
            <div className="bg-white shadow rounded-2xl overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">Revenue & Pricing</h3>
                
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between">
                  <div className="lg:w-1/2 lg:pr-8 mb-6 lg:mb-0">
                    <h4 className="font-medium text-gray-900 mb-4">Course Revenue</h4>
                    <div className="space-y-4">
                      {topRevenueCourses.map(course => (
                        <div key={course.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
                          <img 
                            src={course.thumbnail || `https://ui-avatars.com/api/?name=${encodeURIComponent(course.title || 'Course')}&size=150&background=3B82F6&color=fff`} 
                            alt={course.title} 
                            className="w-12 h-12 rounded-md object-cover"
                            onError={(e) => {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(course.title || 'Course')}&size=150&background=3B82F6&color=fff`;
                            }}
                          />
                          <div className="ml-4 flex-1">
                            <p className="text-sm font-medium text-gray-900">{course.title}</p>
                            <div className="flex text-xs text-gray-500 mt-1">
                              <span>{course.enrollments} students</span>
                              <span className="mx-2">•</span>
                              <span>{course.rating}⭐</span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-base font-semibold text-gray-900">₹{course.revenue}</div>
                            <div className={`text-xs ${course.trend >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {course.trend >= 0 ? `+${course.trend}%` : `${course.trend}%`}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="lg:w-1/2 lg:pl-8 lg:border-l lg:border-gray-200">
                    <h4 className="font-medium text-gray-900 mb-4">Pricing Analytics</h4>
                    <div className="space-y-6">
                      <div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-500">Average Course Price</span>
                          <span className="font-medium text-gray-900">₹{avgCoursePrice}</span>
                        </div>
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-500">Highest Performing Price</span>
                          <span className="font-medium text-green-600">₹{bestPerformingPrice}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-500">Price Range</span>
                          <span className="font-medium text-gray-900">₹{minCoursePrice} - ₹{maxCoursePrice}</span>
                        </div>
                      </div>
                      
                      <div className="pt-4 border-t border-gray-200">
                        <h5 className="text-sm font-medium text-gray-700 mb-3">Price Distribution</h5>
                        <div className="h-[120px]">
                          <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={priceDistribution}>
                              <CartesianGrid strokeDasharray="3 3" vertical={false} />
                              <XAxis dataKey="range" />
                              <YAxis />
                              <Tooltip />
                              <Bar dataKey="count" fill="#8B5CF6" />
                            </BarChart>
                          </ResponsiveContainer>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Section 6: Notifications & Activity */}
          <div className="mt-8 grid grid-cols-1 gap-5 lg:grid-cols-2">
            {/* Notifications */}
            <div className="bg-white shadow rounded-2xl overflow-hidden">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg leading-6 font-medium text-gray-900">Notifications</h3>
                  <button 
                    onClick={() => handleSendBroadcastNotification()} 
                    className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-purple-600 bg-purple-100 hover:bg-purple-200"
                  >
                    <FaBullhorn className="mr-2" /> Send Broadcast
                  </button>
                </div>
                
                <div className="space-y-4 max-h-[400px] overflow-y-auto">
                  {notifications.length > 0 ? notifications.map(notification => (
                    <div key={notification.id} className="flex items-start p-3 bg-gray-50 rounded-lg">
                      <div className={`p-2 rounded-full ${
                        notification.type === 'announcement' ? 'bg-purple-100 text-purple-600' :
                        notification.type === 'course' ? 'bg-blue-100 text-blue-600' :
                        'bg-green-100 text-green-600'
                      }`}>
                        {notification.type === 'announcement' ? <FaBullhorn /> :
                         notification.type === 'course' ? <FaBook /> : <FaBell />}
                      </div>
                      <div className="ml-4 flex-1">
                        <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                        <p className="text-sm text-gray-500 mt-1">{notification.message}</p>
                        <div className="flex justify-between items-center mt-2">
                          <span className="text-xs text-gray-400">{notification.time}</span>
                          <div className="flex space-x-2">
                            <span className="text-xs text-gray-500">{notification.readCount} reads</span>
                            <button className="text-xs text-blue-600 hover:text-blue-800">Resend</button>
                          </div>
                        </div>
                      </div>
                    </div>
                  )) : (
                    <div className="text-center py-8 text-gray-500">
                      No notifications sent yet.
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Recent Activity */}
            <div className="bg-white shadow rounded-2xl overflow-hidden">
              <div className="p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900 mb-6">Recent Activity</h3>
                
                <div className="relative">
                  <div className="absolute top-0 bottom-0 left-5 w-0.5 bg-gray-200"></div>
                  <div className="space-y-6 max-h-[400px] overflow-y-auto pl-14 pr-4">
                    {activityFeed.map(activity => (
                      <div key={activity.id} className="relative">
                        <div className={`absolute -left-9 mt-1.5 w-5 h-5 rounded-full border-2 border-white ${
                          activity.type === 'course' ? 'bg-blue-500' :
                          activity.type === 'student' ? 'bg-green-500' :
                          activity.type === 'review' ? 'bg-yellow-500' :
                          'bg-purple-500'
                        }`}></div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                          <p className="text-xs text-gray-500 mt-1">{activity.description}</p>
                          <p className="text-xs text-gray-400 mt-1">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Additional sections for future expansion */}
        </div>
      </div>

      {/* Notification alerts */}
      {error && (
        <div className="fixed top-20 right-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow-md max-w-md animate-fade-in-right z-50">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <FaExclamationCircle className="h-5 w-5 text-red-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{error}</p>
              <button 
                onClick={() => setError(null)} 
                className="absolute top-2 right-2 text-red-500 hover:text-red-700"
              >
                <FaTimes />
              </button>
            </div>
          </div>
        </div>
      )}

      {success && (
        <div className="fixed top-20 right-4 bg-green-100 border-l-4 border-green-500 text-green-700 p-4 rounded shadow-md max-w-md animate-fade-in-right z-50">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <FaCheckCircle className="h-5 w-5 text-green-500" />
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{success}</p>
              <button 
                onClick={() => setSuccess(null)} 
                className="absolute top-2 right-2 text-green-500 hover:text-green-700"
              >
                <FaTimes />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Send Notification Modal */}
      {showNotificationModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                  Send Notification to Students
                </h3>
                <div className="mt-2">
                  <div className="mb-4">
                    <label htmlFor="notificationTitle" className="block text-sm font-medium text-gray-700 mb-1">
                      Title
                    </label>
                    <input
                      type="text"
                      name="notificationTitle"
                      id="notificationTitle"
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Notification title"
                      value={notificationTitle}
                      onChange={(e) => setNotificationTitle(e.target.value)}
                    />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="notificationMessage" className="block text-sm font-medium text-gray-700 mb-1">
                      Message
                    </label>
                    <textarea
                      id="notificationMessage"
                      name="notificationMessage"
                      rows={4}
                      className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md"
                      placeholder="Enter your notification message"
                      value={notificationMessage}
                      onChange={(e) => setNotificationMessage(e.target.value)}
                    ></textarea>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleNotificationSubmit}
                >
                  Send Notification
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => {
                    setShowNotificationModal(false);
                    setNotificationTitle('');
                    setNotificationMessage('');
                    setSelectedCourseId(null);
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Course Modal */}
      {showAddModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-2xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                      {editingCourse ? 'Edit Course' : 'Create New Course'}
                    </h3>
                    <div className="mt-4">
                      <Formik
                        initialValues={editingCourse || {
                          title: '',
                          description: '',
                          price: '',
                          modules: [
                            {
                              title: '',
                              description: '',
                              topics: [
                                {
                                  title: '',
                                  type: 'text',
                                  content: ''
                                }
                              ]
                            }
                          ]
                        }}
                        validationSchema={CourseSchema}
                        onSubmit={handleAddCourse}
                      >
                        {({ values, handleSubmit, isSubmitting }) => (
                          <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                            <div>
                              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
                              <Field
                                type="text"
                                name="title"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              />
                              <ErrorMessage name="title" component="div" className="mt-1 text-sm text-red-600" />
                            </div>

                            <div>
                              <label htmlFor="description" className="block text-sm font-medium text-gray-700">Description</label>
                              <Field
                                as="textarea"
                                name="description"
                                rows={3}
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              />
                              <ErrorMessage name="description" component="div" className="mt-1 text-sm text-red-600" />
                            </div>

                            <div>
                              <label htmlFor="price" className="block text-sm font-medium text-gray-700">Price (₹)</label>
                              <Field
                                type="number"
                                name="price"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              />
                              <ErrorMessage name="price" component="div" className="mt-1 text-sm text-red-600" />
                            </div>

                            <div>
                              <label className="block text-sm font-medium text-gray-700">Thumbnail</label>
                              <div className="mt-1 flex flex-col space-y-2 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4">
                                {thumbnailPreview && (
                                  <img src={thumbnailPreview} alt="Preview" className="w-20 h-20 sm:w-24 sm:h-24 object-cover rounded-md" />
                                )}
                                <label className="cursor-pointer inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none touch-manipulation">
                                  <FaUpload className="mr-2" />
                                  <span>Upload Image</span>
                                  <input type="file" className="sr-only" onChange={handleThumbnailChange} accept="image/*" />
                                </label>
                              </div>
                            </div>

                            <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 sm:justify-end pt-4">
                              <button
                                type="button"
                                onClick={() => {
                                  setShowAddModal(false);
                                  setEditingCourse(null);
                                }}
                                className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 touch-manipulation"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={isSubmitting}
                                className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 touch-manipulation"
                              >
                                {isSubmitting ? 'Saving...' : (editingCourse ? 'Update Course' : 'Create Course')}
                              </button>
                            </div>
                          </form>
                        )}
                      </Formik>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
