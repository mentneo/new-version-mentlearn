import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, getDoc, addDoc, deleteDoc, where } from 'firebase/firestore';
import { db } from '../../firebase/firebase.js';
import Navbar from '../../components/admin/Navbar.js';
import { FaPlus, FaTrash, FaBookOpen } from 'react-icons/fa/index.esm.js';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

export default function ManageEnrollments() {
  const [students, setStudents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        
        // Fetch students
        const studentsQuery = query(collection(db, "users"), where("role", "==", "student"));
        const studentDocs = await getDocs(studentsQuery);
        const studentsList = studentDocs.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setStudents(studentsList);
        
        // Fetch courses
        const coursesCollection = collection(db, "courses");
        const coursesSnapshot = await getDocs(coursesCollection);
        const coursesList = coursesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCourses(coursesList);
        
        // Fetch enrollments
        const enrollmentsCollection = collection(db, "enrollments");
        const enrollmentsSnapshot = await getDocs(enrollmentsCollection);
        const enrollmentsList = enrollmentsSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setEnrollments(enrollmentsList);
        
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const getStudentById = (studentId) => {
    return students.find(student => student.id === studentId);
  };

  const getCourseById = (courseId) => {
    return courses.find(course => course.id === courseId);
  };

  const getStudentEnrollments = (studentId) => {
    return enrollments.filter(enrollment => enrollment.studentId === studentId);
  };

  const getCourseEnrollments = (courseId) => {
    return enrollments.filter(enrollment => enrollment.courseId === courseId);
  };

  const handleDeleteEnrollment = async (enrollmentId) => {
    if (window.confirm("Are you sure you want to remove this enrollment?")) {
      try {
        setLoading(true);
        
        // Delete enrollment document
        await deleteDoc(doc(db, "enrollments", enrollmentId));
        
        // Update enrollments list
        setEnrollments(enrollments.filter(enrollment => enrollment.id !== enrollmentId));
        
        setSuccess("Enrollment removed successfully!");
      } catch (err) {
        console.error("Error removing enrollment:", err);
        setError("Failed to remove enrollment. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const initialValues = {
    studentId: '',
    courseId: ''
  };

  const validationSchema = Yup.object({
    studentId: Yup.string().required('Student is required'),
    courseId: Yup.string().required('Course is required')
  });

  const handleSubmitEnrollment = async (values, { resetForm, setSubmitting }) => {
    try {
      setError('');
      setSuccess('');
      
      // Check if enrollment already exists
      const existingEnrollment = enrollments.find(
        enrollment => enrollment.studentId === values.studentId && enrollment.courseId === values.courseId
      );
      
      if (existingEnrollment) {
        setError("This student is already enrolled in this course.");
        setSubmitting(false);
        return;
      }
      
      // Create new enrollment
      const newEnrollment = {
        studentId: values.studentId,
        courseId: values.courseId,
        enrolledAt: new Date().toISOString(),
        progress: 0
      };
      
      const docRef = await addDoc(collection(db, "enrollments"), newEnrollment);
      
      // Add id to the new enrollment
      const enrollmentWithId = {
        id: docRef.id,
        ...newEnrollment
      };
      
      // Update state
      setEnrollments([...enrollments, enrollmentWithId]);
      
      setSuccess("Student enrolled in course successfully!");
      resetForm();
      setShowAddModal(false);
    } catch (err) {
      console.error("Error enrolling student:", err);
      setError("Failed to enroll student: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && students.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
            <p className="text-center mt-4">Loading enrollment data...</p>
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
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Manage Course Enrollments</h1>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <FaPlus className="mr-2" /> Enroll Student
            </button>
          </div>
          
          {error && (
            <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mt-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
              {success}
            </div>
          )}
          
          {/* Dashboard Summary */}
          <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0 bg-indigo-500 rounded-md p-3">
                    <FaBookOpen className="h-6 w-6 text-white" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Enrollments</dt>
                      <dd>
                        <div className="text-lg font-medium text-gray-900">{enrollments.length}</div>
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Enrollments Table */}
          <div className="mt-8">
            <div className="bg-white shadow overflow-hidden sm:rounded-md">
              <ul className="divide-y divide-gray-200">
                {enrollments.length === 0 ? (
                  <li className="px-6 py-4 text-center text-gray-500">
                    No enrollments found. Enroll students in courses to get started.
                  </li>
                ) : (
                  enrollments.map(enrollment => {
                    const student = getStudentById(enrollment.studentId);
                    const course = getCourseById(enrollment.courseId);
                    
                    if (!student || !course) return null;
                    
                    return (
                      <li key={enrollment.id} className="px-6 py-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              <img className="h-10 w-10 rounded-full" src={student.photoURL || "https://via.placeholder.com/40"} alt="" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{student.name}</div>
                              <div className="text-xs text-gray-500">{student.email}</div>
                            </div>
                          </div>
                          <div className="flex-1 px-4">
                            <div className="text-sm font-medium text-gray-900">{course.title}</div>
                            <div className="text-xs text-gray-500">
                              Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                            </div>
                          </div>
                          <div className="ml-4">
                            <div className="relative pt-1 w-32">
                              <div className="flex mb-2 items-center justify-between">
                                <div>
                                  <span className="text-xs font-semibold inline-block text-indigo-600">
                                    {enrollment.progress || 0}%
                                  </span>
                                </div>
                              </div>
                              <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-indigo-200">
                                <div style={{ width: `${enrollment.progress || 0}%` }} className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-indigo-500"></div>
                              </div>
                            </div>
                          </div>
                          <div>
                            <button
                              onClick={() => handleDeleteEnrollment(enrollment.id)}
                              className="inline-flex items-center justify-center p-2 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700"
                            >
                              <FaTrash className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </li>
                    );
                  })
                )}
              </ul>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add Enrollment Modal */}
      {showAddModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Enroll Student in Course
                    </h3>
                    <div className="mt-4">
                      <Formik
                        initialValues={initialValues}
                        validationSchema={validationSchema}
                        onSubmit={handleSubmitEnrollment}
                      >
                        {({ isSubmitting }) => (
                          <Form className="space-y-6">
                            <div>
                              <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">Student</label>
                              <Field
                                as="select"
                                name="studentId"
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                              >
                                <option value="">Select a student</option>
                                {students.map(student => (
                                  <option key={student.id} value={student.id}>
                                    {student.name} ({student.email})
                                  </option>
                                ))}
                              </Field>
                              <ErrorMessage name="studentId" component="div" className="mt-1 text-sm text-red-600" />
                            </div>
                            
                            <div>
                              <label htmlFor="courseId" className="block text-sm font-medium text-gray-700">Course</label>
                              <Field
                                as="select"
                                name="courseId"
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                              >
                                <option value="">Select a course</option>
                                {courses.map(course => (
                                  <option key={course.id} value={course.id}>
                                    {course.title}
                                  </option>
                                ))}
                              </Field>
                              <ErrorMessage name="courseId" component="div" className="mt-1 text-sm text-red-600" />
                            </div>
                            
                            <div className="pt-5 border-t border-gray-200 flex justify-end space-x-3">
                              <button
                                type="button"
                                onClick={() => setShowAddModal(false)}
                                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={isSubmitting}
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                {isSubmitting ? 'Enrolling...' : 'Enroll Student'}
                              </button>
                            </div>
                          </Form>
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
