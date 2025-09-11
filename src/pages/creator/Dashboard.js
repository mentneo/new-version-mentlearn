import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, deleteDoc, getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { Formik, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { FaPlus, FaEdit, FaTrash, FaUpload } from 'react-icons/fa';

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

export default function CreatorDashboard() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  const [creatorProfile, setCreatorProfile] = useState(null);

  const auth = getAuth();
  const db = getFirestore();
  const user = auth.currentUser;

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

  const fetchCourses = useCallback(async () => {
    try {
      const coursesRef = collection(db, 'courses');
      const q = query(coursesRef, where('creatorId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      
      const coursesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setCourses(coursesList);
    } catch (err) {
      console.error('Error fetching courses:', err);
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, [user, db]);

  useEffect(() => {
    if (user) {
      fetchCreatorProfile();
      fetchCourses();
    }
  }, [user, fetchCreatorProfile, fetchCourses]);

  const handleThumbnailChange = (event) => {
    const file = event.target.files[0];
    if (file) {
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
      const courseData = {
        ...values,
        creatorId: user.uid,
        creatorName: creatorProfile.name,
        createdAt: new Date().toISOString(),
        thumbnailUrl: thumbnailPreview, // In a real app, upload to storage and use the URL
        enrollments: 0,
        rating: 0,
        reviews: [],
      };

      if (editingCourse) {
        // Update existing course
        await updateDoc(doc(db, 'courses', editingCourse.id), courseData);
        setSuccess('Course updated successfully!');
      } else {
        // Create new course
        await addDoc(collection(db, 'courses'), courseData);
        setSuccess('Course created successfully!');
      }

      // Update creator's course count
      const creatorRef = doc(db, 'creators', creatorProfile.id);
      await updateDoc(creatorRef, {
        coursesCount: (creatorProfile.coursesCount || 0) + (editingCourse ? 0 : 1)
      });

      // Refresh course list
      fetchCourses();
      
      // Reset form and close modal
      resetForm();
      setThumbnailPreview('');
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
              You must be registered as a creator to access this page.
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Creator Profile Section */}
          <div className="bg-white shadow overflow-hidden sm:rounded-lg mb-8">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-2xl font-bold text-gray-900">Creator Profile</h2>
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
              <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
                <div>
                  <dt className="text-sm font-medium text-gray-500">Name</dt>
                  <dd className="mt-1 text-sm text-gray-900">{creatorProfile.name}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Email</dt>
                  <dd className="mt-1 text-sm text-gray-900">{creatorProfile.email}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Specialization</dt>
                  <dd className="mt-1 text-sm text-gray-900">{creatorProfile.specialization}</dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-gray-500">Experience</dt>
                  <dd className="mt-1 text-sm text-gray-900">{creatorProfile.experience}</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Courses Section */}
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">My Courses</h1>
            <button
              onClick={() => {
                setEditingCourse(null);
                setThumbnailPreview('');
                setShowAddModal(true);
              }}
              className="inline-flex items-center justify-center w-full sm:w-auto px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 touch-manipulation"
            >
              <FaPlus className="mr-2" /> Create New Course
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

          {/* Course List */}
          <div className="mt-8 bg-white shadow overflow-hidden sm:rounded-md">
            <ul className="divide-y divide-gray-200">
              {courses.length === 0 ? (
                <li className="px-6 py-4 text-center text-gray-500">
                  No courses available. Create your first course to get started.
                </li>
              ) : (
                courses.map(course => (
                  <li key={course.id} className="px-4 py-4 sm:px-6">
                    <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                      <div className="flex-1 flex items-center space-x-4">
                        {course.thumbnailUrl && (
                          <div className="flex-shrink-0 w-16 h-16 sm:w-20 sm:h-20">
                            <img
                              className="w-full h-full rounded-md object-cover"
                              src={course.thumbnailUrl}
                              alt={course.title}
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-base sm:text-lg font-medium text-indigo-600 truncate">{course.title}</div>
                          <div className="mt-1 text-sm text-gray-500 line-clamp-2">{course.description}</div>
                          <div className="mt-2 flex flex-col space-y-1 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4 text-sm">
                            <div className="flex items-center">
                              <span className="text-gray-500">Price:</span>
                              <span className="ml-1 font-medium text-gray-900">₹{course.price}</span>
                            </div>
                            <div className="flex items-center">
                              <span className="text-gray-500">Enrollments:</span>
                              <span className="ml-1 font-medium text-gray-900">{course.enrollments || 0}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                        <button
                          onClick={() => handleEditCourse(course)}
                          className="inline-flex items-center justify-center px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 touch-manipulation"
                        >
                          <FaEdit className="mr-1" /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(course.id)}
                          className="inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 touch-manipulation"
                        >
                          <FaTrash className="mr-1" /> Delete
                        </button>
                      </div>
                    </div>
                  </li>
                ))
              )}
            </ul>
          </div>
        </div>
      </div>

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
