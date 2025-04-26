import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc, addDoc, getDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../../firebase/firebase';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/admin/Navbar';
import { FaPlus, FaEdit, FaTrash, FaUserCheck } from 'react-icons/fa';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

export default function ManageStudents() {
  const [students, setStudents] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [currentAssignments, setCurrentAssignments] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch students
        const studentsQuery = query(
          collection(db, "users"),
          where("role", "==", "student")
        );
        
        const studentDocs = await getDocs(studentsQuery);
        const studentsList = studentDocs.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        // For each student, fetch their enrollments
        for (const student of studentsList) {
          const enrollmentsQuery = query(
            collection(db, "enrollments"),
            where("studentId", "==", student.id)
          );
          
          const enrollmentDocs = await getDocs(enrollmentsQuery);
          const enrollments = [];
          
          for (const enrollDoc of enrollmentDocs.docs) {
            const enrollData = enrollDoc.data();
            // Get course info
            const courseRef = doc(db, "courses", enrollData.courseId);
            const courseDoc = await getDoc(courseRef);
            
            if (courseDoc.exists()) {
              enrollments.push({
                id: enrollDoc.id,
                ...enrollData,
                courseName: courseDoc.data().title
              });
            }
          }
          
          student.enrollments = enrollments;
        }
        
        setStudents(studentsList);
        
        // Fetch mentors for assignment
        const mentorsQuery = query(
          collection(db, "users"),
          where("role", "==", "mentor")
        );
        
        const mentorDocs = await getDocs(mentorsQuery);
        const mentorsList = mentorDocs.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setMentors(mentorsList);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load student data. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const fetchAssignments = async (studentId) => {
    try {
      const assignmentsQuery = query(
        collection(db, "mentorAssignments"),
        where("studentId", "==", studentId)
      );
      
      const assignmentDocs = await getDocs(assignmentsQuery);
      const assignments = assignmentDocs.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      return assignments;
    } catch (err) {
      console.error("Error fetching assignments:", err);
      return [];
    }
  };

  const handleOpenAssignModal = async (student) => {
    setCurrentStudent(student);
    const assignments = await fetchAssignments(student.id);
    setCurrentAssignments(assignments);
    setShowAssignModal(true);
  };

  const handleAssignMentor = async (values, { setSubmitting, resetForm }) => {
    try {
      setError('');
      setSuccess('');
      
      // Check if assignment already exists
      const existingAssignment = currentAssignments.find(
        assignment => assignment.mentorId === values.mentorId
      );
      
      if (existingAssignment) {
        setError("This mentor is already assigned to the student.");
        setSubmitting(false);
        return;
      }
      
      // Create new assignment
      await addDoc(collection(db, "mentorAssignments"), {
        studentId: currentStudent.id,
        mentorId: values.mentorId,
        assignedAt: new Date().toISOString()
      });
      
      setSuccess("Mentor assigned successfully!");
      resetForm();
      setShowAssignModal(false);
    } catch (err) {
      console.error("Error assigning mentor:", err);
      setError("Failed to assign mentor. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteStudent = async (studentId) => {
    if (window.confirm("Are you sure you want to delete this student? This action cannot be undone.")) {
      try {
        setLoading(true);
        
        // Delete student document
        await deleteDoc(doc(db, "users", studentId));
        
        // Update student list
        setStudents(students.filter(student => student.id !== studentId));
        
        setSuccess("Student deleted successfully!");
      } catch (err) {
        console.error("Error deleting student:", err);
        setError("Failed to delete student. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const initialValues = {
    name: '',
    email: '',
    phone: '',
    password: ''
  };

  const addStudentSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    phone: Yup.string().matches(/^[0-9]{10}$/, 'Phone number must be 10 digits'),
    password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required')
  });

  const assignMentorSchema = Yup.object({
    mentorId: Yup.string().required('Please select a mentor')
  });

  const handleAddStudent = async (values, { resetForm, setSubmitting }) => {
    try {
      setError('');
      setSuccess('');
      
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      
      // Create user document in Firestore - Use setDoc instead of updateDoc
      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        name: values.name,
        email: values.email,
        phone: values.phone,
        role: 'student',
        enrolledAt: new Date().toISOString()
      });
      
      // Fetch updated students list
      const studentsQuery = query(
        collection(db, "users"),
        where("role", "==", "student")
      );
      
      const studentDocs = await getDocs(studentsQuery);
      const studentsList = studentDocs.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setStudents(studentsList);
      setSuccess("Student added successfully!");
      resetForm();
      setShowAddModal(false);
    } catch (err) {
      console.error("Error adding student:", err);
      setError("Failed to add student: " + err.message);
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
            <p className="text-center mt-4">Loading students...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Manage Students</h1>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <FaPlus className="mr-2" /> Add New Student
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
          
          {/* Students List */}
          <div className="mt-8 flex flex-col">
            <div className="-my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
              <div className="py-2 align-middle inline-block min-w-full sm:px-6 lg:px-8">
                <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Name
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Contact
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Enrolled On
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Enrollments
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {students.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                            No students found
                          </td>
                        </tr>
                      ) : (
                        students.map(student => (
                          <tr key={student.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <img className="h-10 w-10 rounded-full" src={student.photoURL || "https://via.placeholder.com/40"} alt="" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{student.name}</div>
                                  <div className="text-sm text-gray-500">{student.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{student.phone || 'N/A'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {student.enrolledAt ? new Date(student.enrolledAt).toLocaleDateString() : 'N/A'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                {student.enrollments?.length > 0 ? (
                                  <div className="space-y-1">
                                    {student.enrollments.map(enrollment => (
                                      <span key={enrollment.id} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 mr-1">
                                        {enrollment.courseName}
                                      </span>
                                    ))}
                                  </div>
                                ) : (
                                  "Not enrolled in any courses"
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                Active
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => handleOpenAssignModal(student)}
                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                              >
                                <FaUserCheck className="inline-block mr-1" /> Assign Mentor
                              </button>
                              <button
                                onClick={() => handleDeleteStudent(student.id)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <FaTrash className="inline-block mr-1" /> Delete
                              </button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Add Student Modal */}
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
                      Add New Student
                    </h3>
                    <div className="mt-4">
                      <Formik
                        initialValues={initialValues}
                        validationSchema={addStudentSchema}
                        onSubmit={handleAddStudent}
                      >
                        {({ isSubmitting }) => (
                          <Form className="space-y-6">
                            <div>
                              <label htmlFor="name" className="block text-sm font-medium text-gray-700">Name</label>
                              <Field
                                type="text"
                                name="name"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              />
                              <ErrorMessage name="name" component="div" className="mt-1 text-sm text-red-600" />
                            </div>
                            
                            <div>
                              <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                              <Field
                                type="email"
                                name="email"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              />
                              <ErrorMessage name="email" component="div" className="mt-1 text-sm text-red-600" />
                            </div>
                            
                            <div>
                              <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone</label>
                              <Field
                                type="text"
                                name="phone"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              />
                              <ErrorMessage name="phone" component="div" className="mt-1 text-sm text-red-600" />
                            </div>
                            
                            <div>
                              <label htmlFor="password" className="block text-sm font-medium text-gray-700">Password</label>
                              <Field
                                type="password"
                                name="password"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              />
                              <ErrorMessage name="password" component="div" className="mt-1 text-sm text-red-600" />
                            </div>
                            
                            <div className="flex justify-end space-x-3">
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
                                {isSubmitting ? 'Adding...' : 'Add Student'}
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
      
      {/* Assign Mentor Modal */}
      {showAssignModal && currentStudent && (
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
                      Assign Mentor to {currentStudent.name}
                    </h3>
                    
                    {currentAssignments.length > 0 && (
                      <div className="mt-4">
                        <h4 className="text-sm font-medium text-gray-700">Current Assignments</h4>
                        <ul className="mt-2 space-y-2">
                          {currentAssignments.map(assignment => {
                            const mentor = mentors.find(m => m.id === assignment.mentorId);
                            return (
                              <li key={assignment.id} className="text-sm text-gray-600">
                                {mentor ? mentor.name : 'Unknown mentor'} (assigned on {new Date(assignment.assignedAt).toLocaleDateString()})
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    )}
                    
                    <div className="mt-4">
                      <Formik
                        initialValues={{ mentorId: '' }}
                        validationSchema={assignMentorSchema}
                        onSubmit={handleAssignMentor}
                      >
                        {({ isSubmitting }) => (
                          <Form className="space-y-6">
                            <div>
                              <label htmlFor="mentorId" className="block text-sm font-medium text-gray-700">Select Mentor</label>
                              <Field
                                as="select"
                                name="mentorId"
                                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                              >
                                <option value="">Select a mentor</option>
                                {mentors.map(mentor => (
                                  <option key={mentor.id} value={mentor.id}>
                                    {mentor.name} ({mentor.email})
                                  </option>
                                ))}
                              </Field>
                              <ErrorMessage name="mentorId" component="div" className="mt-1 text-sm text-red-600" />
                            </div>
                            
                            <div className="flex justify-end space-x-3">
                              <button
                                type="button"
                                onClick={() => setShowAssignModal(false)}
                                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={isSubmitting}
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                {isSubmitting ? 'Assigning...' : 'Assign Mentor'}
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
