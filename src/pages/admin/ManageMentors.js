import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { db, auth } from '../../firebase/firebase';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/admin/Navbar';
import { FaPlus, FaTrash, FaUsers } from 'react-icons/fa';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';

export default function ManageMentors() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    async function fetchMentors() {
      try {
        const mentorsQuery = query(
          collection(db, "users"),
          where("role", "==", "mentor")
        );
        
        const mentorDocs = await getDocs(mentorsQuery);
        const mentorsList = mentorDocs.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          assignedStudents: 0
        }));
        
        // Get assignment counts for each mentor
        for (let i = 0; i < mentorsList.length; i++) {
          const mentor = mentorsList[i];
          const assignmentsQuery = query(
            collection(db, "mentorAssignments"),
            where("mentorId", "==", mentor.id)
          );
          
          const assignmentDocs = await getDocs(assignmentsQuery);
          mentorsList[i].assignedStudents = assignmentDocs.size;
        }
        
        setMentors(mentorsList);
      } catch (err) {
        console.error("Error fetching mentors:", err);
        setError("Failed to load mentors. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchMentors();
  }, []);

  const handleDeleteMentor = async (mentorId) => {
    if (window.confirm("Are you sure you want to delete this mentor? This action cannot be undone.")) {
      try {
        setLoading(true);
        
        // Delete mentor document
        await deleteDoc(doc(db, "users", mentorId));
        
        // Update mentors list
        setMentors(mentors.filter(mentor => mentor.id !== mentorId));
        
        setSuccess("Mentor deleted successfully!");
      } catch (err) {
        console.error("Error deleting mentor:", err);
        setError("Failed to delete mentor. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const initialValues = {
    name: '',
    email: '',
    phone: '',
    specialization: '',
    experience: '',
    password: ''
  };

  const addMentorSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    email: Yup.string().email('Invalid email address').required('Email is required'),
    phone: Yup.string().matches(/^[0-9]{10}$/, 'Phone number must be 10 digits'),
    specialization: Yup.string().required('Specialization is required'),
    experience: Yup.string().required('Experience is required'),
    password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required')
  });

  const handleAddMentor = async (values, { resetForm, setSubmitting }) => {
    try {
      setError('');
      setSuccess('');
      
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      
      // Create mentor document in Firestore - Use setDoc instead of updateDoc
      await setDoc(doc(db, "users", userCredential.user.uid), {
        uid: userCredential.user.uid,
        name: values.name,
        email: values.email,
        phone: values.phone,
        specialization: values.specialization,
        experience: values.experience,
        role: 'mentor',
        createdAt: new Date().toISOString()
      });
      
      // Fetch updated mentors list
      const mentorsQuery = query(
        collection(db, "users"),
        where("role", "==", "mentor")
      );
      
      const mentorDocs = await getDocs(mentorsQuery);
      const mentorsList = mentorDocs.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        assignedStudents: 0
      }));
      
      setMentors(mentorsList);
      setSuccess("Mentor added successfully!");
      resetForm();
      setShowAddModal(false);
    } catch (err) {
      console.error("Error adding mentor:", err);
      setError("Failed to add mentor: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading && mentors.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
            <p className="text-center mt-4">Loading mentors...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Manage Mentors</h1>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <FaPlus className="mr-2" /> Add New Mentor
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
          
          {/* Mentors List */}
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
                          Specialization
                        </th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Students
                        </th>
                        <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {mentors.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                            No mentors found
                          </td>
                        </tr>
                      ) : (
                        mentors.map(mentor => (
                          <tr key={mentor.id}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10">
                                  <img className="h-10 w-10 rounded-full" src={mentor.photoURL || "https://via.placeholder.com/40"} alt="" />
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-gray-900">{mentor.name}</div>
                                  <div className="text-sm text-gray-500">{mentor.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{mentor.phone || 'N/A'}</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">{mentor.specialization}</div>
                              <div className="text-sm text-gray-500">{mentor.experience} experience</div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="text-sm text-gray-900">
                                <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                  {mentor.assignedStudents} students
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                              <button
                                onClick={() => handleDeleteMentor(mentor.id)}
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
      
      {/* Add Mentor Modal */}
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
                      Add New Mentor
                    </h3>
                    <div className="mt-4">
                      <Formik
                        initialValues={initialValues}
                        validationSchema={addMentorSchema}
                        onSubmit={handleAddMentor}
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
                              <label htmlFor="specialization" className="block text-sm font-medium text-gray-700">Specialization</label>
                              <Field
                                type="text"
                                name="specialization"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              />
                              <ErrorMessage name="specialization" component="div" className="mt-1 text-sm text-red-600" />
                            </div>
                            
                            <div>
                              <label htmlFor="experience" className="block text-sm font-medium text-gray-700">Experience</label>
                              <Field
                                type="text"
                                name="experience"
                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                placeholder="e.g. 5 years"
                              />
                              <ErrorMessage name="experience" component="div" className="mt-1 text-sm text-red-600" />
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
                                {isSubmitting ? 'Adding...' : 'Add Mentor'}
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
