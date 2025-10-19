import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebase.js';
import { useAuth } from '../../contexts/AuthContext.js';
import { FiBookOpen, FiCheckCircle, FiClock, FiTrendingUp, FiAward, FiRefreshCw } from 'react-icons/fi/index.js';

/**
 * UserProgressDashboard Component
 * 
 * Displays comprehensive user progress information:
 * - Enrollments
 * - Progress records
 * - Completed lessons
 * - Statistics
 * 
 * Add to LearnIQRoutes.js:
 * import UserProgressDashboard from './components/student/UserProgressDashboard';
 * <Route path="progress-dashboard" element={<UserProgressDashboard />} />
 */

export default function UserProgressDashboard() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState([]);
  const [progressRecords, setProgressRecords] = useState([]);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [courses, setCourses] = useState({});

  useEffect(() => {
    fetchProgressData();
  }, [currentUser]);

  const fetchProgressData = async () => {
    if (!currentUser) return;

    try {
      setLoading(true);

      // 1. Fetch enrollments (check both studentId and userId)
      const enrollmentsQuery1 = query(
        collection(db, "enrollments"),
        where("studentId", "==", currentUser.uid)
      );
      const enrollmentsSnapshot1 = await getDocs(enrollmentsQuery1);
      const enrollments1 = enrollmentsSnapshot1.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const enrollmentsQuery2 = query(
        collection(db, "enrollments"),
        where("userId", "==", currentUser.uid)
      );
      const enrollmentsSnapshot2 = await getDocs(enrollmentsQuery2);
      const enrollments2 = enrollmentsSnapshot2.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const allEnrollments = [...enrollments1, ...enrollments2];
      const uniqueEnrollments = Array.from(new Map(allEnrollments.map(e => [e.id, e])).values());
      setEnrollments(uniqueEnrollments);

      // 2. Fetch progress records
      const progressQuery1 = query(
        collection(db, "progress"),
        where("studentId", "==", currentUser.uid)
      );
      const progressSnapshot1 = await getDocs(progressQuery1);
      const progress1 = progressSnapshot1.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const progressQuery2 = query(
        collection(db, "progress"),
        where("userId", "==", currentUser.uid)
      );
      const progressSnapshot2 = await getDocs(progressQuery2);
      const progress2 = progressSnapshot2.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const allProgress = [...progress1, ...progress2];
      const uniqueProgress = Array.from(new Map(allProgress.map(p => [p.id, p])).values());
      setProgressRecords(uniqueProgress);

      // 3. Fetch completed lessons
      const completedQuery1 = query(
        collection(db, "completedLessons"),
        where("studentId", "==", currentUser.uid)
      );
      const completedSnapshot1 = await getDocs(completedQuery1);
      const completed1 = completedSnapshot1.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const completedQuery2 = query(
        collection(db, "completedLessons"),
        where("userId", "==", currentUser.uid)
      );
      const completedSnapshot2 = await getDocs(completedQuery2);
      const completed2 = completedSnapshot2.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      const allCompleted = [...completed1, ...completed2];
      const uniqueCompleted = Array.from(new Map(allCompleted.map(c => [c.id, c])).values());
      setCompletedLessons(uniqueCompleted);

      // 4. Fetch course details for enrolled courses
      const courseIds = uniqueEnrollments.map(e => e.courseId);
      const coursesData = {};
      
      for (const courseId of courseIds) {
        const coursesQuery = query(
          collection(db, "courses"),
          where("__name__", "==", courseId)
        );
        const coursesSnapshot = await getDocs(coursesQuery);
        
        if (!coursesSnapshot.empty) {
          const courseData = coursesSnapshot.docs[0].data();
          coursesData[courseId] = { id: courseId, ...courseData };
        }
      }
      
      setCourses(coursesData);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching progress data:', error);
      setLoading(false);
    }
  };

  // Calculate statistics
  const stats = {
    totalCourses: enrollments.length,
    totalCompleted: completedLessons.length,
    averageProgress: enrollments.length > 0 
      ? Math.round(enrollments.reduce((sum, e) => sum + (e.progress || 0), 0) / enrollments.length)
      : 0,
    coursesInProgress: enrollments.filter(e => e.progress > 0 && e.progress < 100).length,
    coursesCompleted: enrollments.filter(e => e.progress >= 100).length
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FiRefreshCw className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading your progress...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">My Learning Progress</h1>
        <p className="text-gray-600">Track your course progress and achievements</p>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Courses</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalCourses}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <FiBookOpen className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Lessons Completed</p>
              <p className="text-3xl font-bold text-gray-900">{stats.totalCompleted}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <FiCheckCircle className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Average Progress</p>
              <p className="text-3xl font-bold text-gray-900">{stats.averageProgress}%</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <FiTrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Completed Courses</p>
              <p className="text-3xl font-bold text-gray-900">{stats.coursesCompleted}</p>
            </div>
            <div className="bg-yellow-100 p-3 rounded-lg">
              <FiAward className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Course Progress Details */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 mb-8">
        <h2 className="text-xl font-bold text-gray-900 mb-6">Course Progress Details</h2>
        
        {enrollments.length === 0 ? (
          <div className="text-center py-12">
            <FiBookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600">No courses enrolled yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {enrollments.map((enrollment) => {
              const course = courses[enrollment.courseId] || {};
              const courseTitle = course.title || 'Unknown Course';
              const progress = enrollment.progress || 0;
              
              // Get completed lessons for this course
              const courseLessons = completedLessons.filter(l => l.courseId === enrollment.courseId);
              
              // Get progress record for this course
              const progressRecord = progressRecords.find(p => p.courseId === enrollment.courseId);
              
              return (
                <div key={enrollment.id} className="border border-gray-200 rounded-lg p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">{courseTitle}</h3>
                      <p className="text-sm text-gray-600">Enrolled: {
                        enrollment.enrolledAt 
                          ? new Date(enrollment.enrolledAt.toDate ? enrollment.enrolledAt.toDate() : enrollment.enrolledAt).toLocaleDateString()
                          : 'Unknown'
                      }</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      progress >= 100 
                        ? 'bg-green-100 text-green-800'
                        : progress > 0 
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {progress >= 100 ? 'Completed' : progress > 0 ? 'In Progress' : 'Not Started'}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">Progress</span>
                      <span className="text-sm font-medium text-gray-900">{progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Completed Lessons</p>
                      <p className="font-medium text-gray-900">
                        {progressRecord?.completedLessons || courseLessons.length}
                        {progressRecord?.totalLessons ? ` / ${progressRecord.totalLessons}` : ''}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Status</p>
                      <p className="font-medium text-gray-900">{enrollment.status || 'Active'}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Last Updated</p>
                      <p className="font-medium text-gray-900">
                        {progressRecord?.updatedAt 
                          ? new Date(progressRecord.updatedAt.toDate ? progressRecord.updatedAt.toDate() : progressRecord.updatedAt).toLocaleDateString()
                          : 'N/A'
                        }
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Refresh Button */}
      <div className="text-center">
        <button
          onClick={fetchProgressData}
          className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiRefreshCw className="w-5 h-5 mr-2" />
          Refresh Progress Data
        </button>
      </div>
    </div>
  );
}
