import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/student/Navbar';
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import { Radar, Bar } from 'react-chartjs-2';

// Register ChartJS components
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement
);

export default function Progress() {
  const { currentUser } = useAuth();
  const [courseProgress, setCourseProgress] = useState([]);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProgressData() {
      try {
        // Fetch course enrollments and progress
        const enrollmentsQuery = query(
          collection(db, "enrollments"),
          where("studentId", "==", currentUser.uid)
        );
        
        const enrollmentDocs = await getDocs(enrollmentsQuery);
        
        // Prepare data structure for course progress
        const courseIds = [];
        const progressData = [];
        
        for (const doc of enrollmentDocs.docs) {
          const enrollmentData = doc.data();
          courseIds.push(enrollmentData.courseId);
          progressData.push({
            courseId: enrollmentData.courseId,
            progress: enrollmentData.progress || 0
          });
        }
        
        // Fetch course details
        if (courseIds.length > 0) {
          const coursesWithProgress = [];
          
          for (const courseId of courseIds) {
            const courseQuery = query(
              collection(db, "courses"),
              where("id", "==", courseId)
            );
            
            const courseDocs = await getDocs(courseQuery);
            
            if (!courseDocs.empty) {
              const courseData = courseDocs.docs[0].data();
              const progress = progressData.find(p => p.courseId === courseId)?.progress || 0;
              
              coursesWithProgress.push({
                id: courseId,
                title: courseData.title,
                progress
              });
            }
          }
          
          setCourseProgress(coursesWithProgress);
        }
        
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
        
        // Sort reports by week number (descending)
        reportsList.sort((a, b) => b.weekNumber - a.weekNumber);
        
        setReports(reportsList);
      } catch (err) {
        console.error("Error fetching progress data:", err);
        setError("Failed to load your progress data. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchProgressData();
  }, [currentUser]);

  // Prepare chart data for radar chart (skill areas)
  const skillAreas = {
    'Technical Skills': 70,
    'Problem Solving': 85,
    'Communication': 65,
    'Project Management': 60,
    'Team Collaboration': 75
  };

  const radarData = {
    labels: Object.keys(skillAreas),
    datasets: [
      {
        label: 'Your Skills',
        data: Object.values(skillAreas),
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        borderColor: 'rgba(99, 102, 241, 1)',
        borderWidth: 2,
      },
    ],
  };

  // Prepare chart data for bar chart (course progress)
  const barData = {
    labels: courseProgress.map(course => course.title),
    datasets: [
      {
        label: 'Course Progress (%)',
        data: courseProgress.map(course => course.progress),
        backgroundColor: 'rgba(99, 102, 241, 0.6)',
      },
    ],
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
            <p className="text-center mt-4">Loading your progress data...</p>
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
          {error && (
            <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <h1 className="text-3xl font-bold text-gray-900">Your Learning Progress</h1>
          
          {/* Course Progress */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-800">Course Progress</h2>
            
            {courseProgress.length === 0 ? (
              <p className="mt-4 text-gray-600">You are not enrolled in any courses yet.</p>
            ) : (
              <div className="mt-4 grid grid-cols-1 gap-5 sm:grid-cols-2">
                {/* Course Progress Cards */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <ul className="divide-y divide-gray-200">
                      {courseProgress.map(course => (
                        <li key={course.id} className="py-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {course.title}
                              </p>
                            </div>
                            <div className="ml-4 flex-shrink-0">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                {course.progress}%
                              </span>
                            </div>
                          </div>
                          <div className="mt-2 w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${course.progress}%` }}></div>
                          </div>
                          <div className="mt-2">
                            <Link 
                              to={`/student/course/${course.id}`}
                              className="text-sm text-indigo-600 hover:text-indigo-900"
                            >
                              Continue Course
                            </Link>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
                
                {/* Bar Chart */}
                <div className="bg-white overflow-hidden shadow rounded-lg">
                  <div className="px-4 py-5 sm:p-6">
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Course Completion</h3>
                    <div className="h-64">
                      <Bar 
                        data={barData} 
                        options={{
                          maintainAspectRatio: false,
                          scales: {
                            y: {
                              beginAtZero: true,
                              max: 100
                            }
                          }
                        }} 
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Skill Areas */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-800">Skill Assessment</h2>
            <div className="mt-4 bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Your Skill Areas</h3>
                    <div className="h-64">
                      <Radar 
                        data={radarData} 
                        options={{
                          maintainAspectRatio: false,
                          scales: {
                            r: {
                              min: 0,
                              max: 100,
                              ticks: {
                                stepSize: 20
                              }
                            }
                          }
                        }} 
                      />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-gray-900 mb-4">Skill Breakdown</h3>
                    <ul className="space-y-4">
                      {Object.entries(skillAreas).map(([skill, value]) => (
                        <li key={skill}>
                          <div className="flex items-center justify-between">
                            <div className="flex-1 min-w-0">
                              <p className="text-sm font-medium text-gray-900 truncate">
                                {skill}
                              </p>
                            </div>
                            <div className="ml-4 flex-shrink-0">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                {value}%
                              </span>
                            </div>
                          </div>
                          <div className="mt-1 w-full bg-gray-200 rounded-full h-2.5">
                            <div className="bg-indigo-600 h-2.5 rounded-full" style={{ width: `${value}%` }}></div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Mentor Reports */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-800">Mentor Feedback</h2>
            
            {reports.length === 0 ? (
              <p className="mt-4 text-gray-600">No mentor feedback available yet.</p>
            ) : (
              <div className="mt-4 bg-white shadow overflow-hidden sm:rounded-lg">
                <ul className="divide-y divide-gray-200">
                  {reports.map(report => (
                    <li key={report.id} className="px-4 py-5 sm:px-6">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-medium text-gray-900">Week {report.weekNumber} Report</h3>
                        <p className="text-sm text-gray-500">
                          {report.timestamp.toLocaleDateString()}
                        </p>
                      </div>
                      <div className="mt-2 max-w-xl text-sm text-gray-500">
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                          <div className="border border-gray-200 rounded-md p-3">
                            <h4 className="font-medium text-gray-700 mb-1">Strengths</h4>
                            <p className="text-gray-500 text-sm">{report.strengths}</p>
                          </div>
                          <div className="border border-gray-200 rounded-md p-3">
                            <h4 className="font-medium text-gray-700 mb-1">Areas for Improvement</h4>
                            <p className="text-gray-500 text-sm">{report.areasForImprovement}</p>
                          </div>
                          <div className="border border-gray-200 rounded-md p-3">
                            <h4 className="font-medium text-gray-700 mb-1">Recommendations</h4>
                            <p className="text-gray-500 text-sm">{report.recommendations}</p>
                          </div>
                        </div>
                        <div className="flex items-center mt-4">
                          <span className="text-sm font-medium text-gray-700 mr-2">Progress:</span>
                          <div className="w-full max-w-xs bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-indigo-600 h-2.5 rounded-full" 
                              style={{ width: `${report.progressPercentage}%` }}
                            ></div>
                          </div>
                          <span className="ml-2 text-sm text-gray-500">{report.progressPercentage}%</span>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
