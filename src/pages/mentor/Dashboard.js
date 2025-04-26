import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/mentor/Navbar';

export default function Dashboard() {
  const { currentUser } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchAssignedStudents() {
      try {
        // Query mentor assignments for current mentor
        const assignmentsQuery = query(
          collection(db, "mentorAssignments"),
          where("mentorId", "==", currentUser.uid)
        );
        
        const assignmentDocs = await getDocs(assignmentsQuery);
        
        // Extract student IDs from assignments
        const studentIds = assignmentDocs.docs.map(doc => doc.data().studentId);
        
        // If no students assigned, return empty array
        if (studentIds.length === 0) {
          setStudents([]);
          setLoading(false);
          return;
        }
        
        // Fetch student data for each assigned student
        const studentsData = [];
        
        for (const studentId of studentIds) {
          // Get user data
          const userQuery = query(
            collection(db, "users"),
            where("uid", "==", studentId)
          );
          
          const userDocs = await getDocs(userQuery);
          
          if (!userDocs.empty) {
            const userData = userDocs.docs[0].data();
            
            // Get enrollment data to check progress
            const enrollmentsQuery = query(
              collection(db, "enrollments"),
              where("studentId", "==", studentId)
            );
            
            const enrollmentDocs = await getDocs(enrollmentsQuery);
            
            // Calculate average progress across all courses
            let totalProgress = 0;
            let courseCount = 0;
            
            enrollmentDocs.forEach(doc => {
              const enrollmentData = doc.data();
              if (enrollmentData.progress) {
                totalProgress += enrollmentData.progress;
                courseCount++;
              }
            });
            
            const averageProgress = courseCount > 0 ? totalProgress / courseCount : 0;
            
            // Add student with progress to the list
            studentsData.push({
              id: studentId,
              ...userData,
              averageProgress,
              courseCount
            });
          }
        }
        
        setStudents(studentsData);
      } catch (err) {
        console.error("Error fetching assigned students:", err);
        setError("Failed to load your assigned students. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchAssignedStudents();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
            <p className="text-center mt-4">Loading your dashboard...</p>
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
          
          <h1 className="text-3xl font-bold text-gray-900">Mentor Dashboard</h1>
          
          {/* Quick Stats */}
          <div className="mt-8 grid grid-cols-1 gap-5 sm:grid-cols-2">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Assigned Students</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">{students.length}</dd>
                </dl>
              </div>
            </div>
            
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">Weekly Reports</dt>
                  <dd className="mt-1 text-3xl font-semibold text-gray-900">
                    <Link to="/mentor/reports" className="text-indigo-600 hover:text-indigo-500">
                      Submit Reports
                    </Link>
                  </dd>
                </dl>
              </div>
            </div>
          </div>
          
          {/* Student List */}
          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-800">Your Students</h2>
            
            {students.length === 0 ? (
              <p className="mt-4 text-gray-600">You don't have any assigned students yet.</p>
            ) : (
              <div className="mt-4 flex flex-col">
                <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                  <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                    <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Student
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Courses
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Progress
                            </th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {students.map((student) => (
                            <tr key={student.id}>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  <div className="flex-shrink-0 h-10 w-10">
                                    <img 
                                      className="h-10 w-10 rounded-full" 
                                      src={student.photoURL || "https://via.placeholder.com/40"} 
                                      alt="" 
                                    />
                                  </div>
                                  <div className="ml-4">
                                    <div className="text-sm font-medium text-gray-900">
                                      {student.name}
                                    </div>
                                    <div className="text-sm text-gray-500">
                                      {student.email}
                                    </div>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900">{student.courseCount} courses</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="relative pt-1">
                                  <div className="overflow-hidden h-2 text-xs flex rounded bg-indigo-200">
                                    <div 
                                      style={{ width: `${student.averageProgress}%` }} 
                                      className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"
                                    ></div>
                                  </div>
                                  <div className="text-sm text-gray-600 mt-1">{Math.round(student.averageProgress)}% complete</div>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <Link to={`/mentor/student/${student.id}`} className="text-indigo-600 hover:text-indigo-900">
                                  View Details
                                </Link>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Submit Report Section */}
          <div className="mt-8">
            <div className="bg-white shadow rounded-lg overflow-hidden">
              <div className="px-4 py-5 sm:p-6">
                <h3 className="text-lg leading-6 font-medium text-gray-900">Weekly Reports</h3>
                <div className="mt-2 max-w-xl text-sm text-gray-500">
                  <p>Submit your weekly progress reports for your assigned students.</p>
                </div>
                <div className="mt-5">
                  <Link
                    to="/mentor/reports"
                    className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Create Report
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
