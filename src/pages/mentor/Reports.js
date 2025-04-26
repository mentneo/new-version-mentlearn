import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/mentor/Navbar';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

export default function Reports() {
  const { currentUser } = useAuth();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  useEffect(() => {
    async function fetchAssignedStudents() {
      try {
        // Query mentor assignments for current mentor
        const assignmentsQuery = query(
          collection(db, "mentorAssignments"),
          where("mentorId", "==", currentUser.uid)
        );
        
        const assignmentDocs = await getDocs(assignmentsQuery);
        const studentIds = assignmentDocs.docs.map(doc => doc.data().studentId);
        
        if (studentIds.length === 0) {
          setStudents([]);
          setLoading(false);
          return;
        }
        
        // Fetch student data for each assigned student
        const studentsData = [];
        
        for (const studentId of studentIds) {
          const userQuery = query(
            collection(db, "users"),
            where("uid", "==", studentId)
          );
          
          const userDocs = await getDocs(userQuery);
          
          if (!userDocs.empty) {
            const userData = userDocs.docs[0].data();
            studentsData.push({
              id: studentId,
              name: userData.name,
              email: userData.email
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

  const reportSchema = Yup.object().shape({
    studentId: Yup.string().required('Please select a student'),
    weekNumber: Yup.number().required('Week number is required').min(1, 'Week number must be at least 1'),
    progressPercentage: Yup.number()
      .required('Progress percentage is required')
      .min(0, 'Progress must be at least 0%')
      .max(100, 'Progress cannot exceed 100%'),
    strengths: Yup.string().required('Please provide strengths'),
    areasForImprovement: Yup.string().required('Please provide areas for improvement'),
    recommendations: Yup.string().required('Please provide recommendations')
  });

  const handleSubmit = async (values, { resetForm }) => {
    try {
      setError(null);
      setSuccess(null);
      
      // Find student name for the report
      const student = students.find(s => s.id === values.studentId);
      
      // Add the report to Firestore
      await addDoc(collection(db, "mentorReports"), {
        mentorId: currentUser.uid,
        studentId: values.studentId,
        studentName: student ? student.name : "Unknown",
        weekNumber: values.weekNumber,
        progressPercentage: values.progressPercentage,
        strengths: values.strengths,
        areasForImprovement: values.areasForImprovement,
        recommendations: values.recommendations,
        timestamp: serverTimestamp()
      });
      
      setSuccess("Report submitted successfully!");
      resetForm();
    } catch (err) {
      console.error("Error submitting report:", err);
      setError("Failed to submit report. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
            </div>
            <p className="text-center mt-4">Loading student data...</p>
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
          <h1 className="text-3xl font-bold text-gray-900">Submit Weekly Report</h1>
          
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
          
          {students.length === 0 ? (
            <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <p className="text-gray-600">You don't have any assigned students to report on.</p>
              </div>
            </div>
          ) : (
            <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-lg">
              <div className="px-4 py-5 sm:p-6">
                <Formik
                  initialValues={{
                    studentId: '',
                    weekNumber: '',
                    progressPercentage: '',
                    strengths: '',
                    areasForImprovement: '',
                    recommendations: ''
                  }}
                  validationSchema={reportSchema}
                  onSubmit={handleSubmit}
                >
                  {({ isSubmitting }) => (
                    <Form className="space-y-6">
                      <div>
                        <label htmlFor="studentId" className="block text-sm font-medium text-gray-700">
                          Student
                        </label>
                        <Field
                          as="select"
                          name="studentId"
                          className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm rounded-md"
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
                      
                      <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                        <div>
                          <label htmlFor="weekNumber" className="block text-sm font-medium text-gray-700">
                            Week Number
                          </label>
                          <Field
                            type="number"
                            name="weekNumber"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                          />
                          <ErrorMessage name="weekNumber" component="div" className="mt-1 text-sm text-red-600" />
                        </div>
                        
                        <div>
                          <label htmlFor="progressPercentage" className="block text-sm font-medium text-gray-700">
                            Progress Percentage
                          </label>
                          <div className="mt-1 relative rounded-md shadow-sm">
                            <Field
                              type="number"
                              name="progressPercentage"
                              className="block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                            />
                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                              <span className="text-gray-500 sm:text-sm">%</span>
                            </div>
                          </div>
                          <ErrorMessage name="progressPercentage" component="div" className="mt-1 text-sm text-red-600" />
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="strengths" className="block text-sm font-medium text-gray-700">
                          Strengths
                        </label>
                        <Field
                          as="textarea"
                          name="strengths"
                          rows={3}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                          placeholder="Describe the student's strengths this week"
                        />
                        <ErrorMessage name="strengths" component="div" className="mt-1 text-sm text-red-600" />
                      </div>
                      
                      <div>
                        <label htmlFor="areasForImprovement" className="block text-sm font-medium text-gray-700">
                          Areas for Improvement
                        </label>
                        <Field
                          as="textarea"
                          name="areasForImprovement"
                          rows={3}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                          placeholder="Describe areas where the student can improve"
                        />
                        <ErrorMessage name="areasForImprovement" component="div" className="mt-1 text-sm text-red-600" />
                      </div>
                      
                      <div>
                        <label htmlFor="recommendations" className="block text-sm font-medium text-gray-700">
                          Recommendations
                        </label>
                        <Field
                          as="textarea"
                          name="recommendations"
                          rows={3}
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-green-500 focus:border-green-500 sm:text-sm"
                          placeholder="Provide recommendations for the student"
                        />
                        <ErrorMessage name="recommendations" component="div" className="mt-1 text-sm text-red-600" />
                      </div>
                      
                      <div>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          {isSubmitting ? 'Submitting...' : 'Submit Report'}
                        </button>
                      </div>
                    </Form>
                  )}
                </Formik>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
