import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, deleteDoc, getFirestore } from 'firebase/firestore';
import { useAuth } from '../../contexts/AuthContext';
import { Formik, Field, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';
import { FaPlus, FaEdit, FaTrash, FaUpload } from 'react-icons/fa';

const CourseSchema = Yup.object().shape({
  title: Yup.string().required('Title is required'),
  description: Yup.string().required('Description is required'),
  price: Yup.number().required('Price is required').min(0, 'Price must be positive'),
  duration: Yup.string().required('Duration is required'),
  skillLevel: Yup.string().required('Skill level is required'),
  status: Yup.string().required('Status is required').oneOf(['draft', 'published'], 'Invalid status'),
  // Temporarily simplify modules validation
  modules: Yup.array().of(
    Yup.object().shape({
      title: Yup.string().required('Module title is required'),
      description: Yup.string().required('Module description is required'),
      topics: Yup.array().min(1, 'At least one topic is required')
    })
  ).min(1, 'At least one module is required')
});

export default function CreatorCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);

  const [thumbnailPreview, setThumbnailPreview] = useState('');

  const { currentUser } = useAuth();
  const db = getFirestore();

  // Debug current user
  useEffect(() => {
    console.log('🔍 CreatorCourses - Current user:', currentUser);
    if (currentUser) {
      console.log('User ID:', currentUser.uid);
      console.log('User email:', currentUser.email);
      console.log('User role:', currentUser.role);
    } else {
      console.log('❌ No current user found');
    }
  }, [currentUser]);

  const fetchCourses = useCallback(async () => {
    if (!currentUser) {
      console.log('❌ Cannot fetch courses - no current user');
      setLoading(false);
      return;
    }

    try {
      console.log('📚 Fetching courses for creator:', currentUser.uid);
      const coursesRef = collection(db, 'courses');
      const q = query(coursesRef, where('creatorId', '==', currentUser.uid));
      const querySnapshot = await getDocs(q);

      const coursesList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));

      console.log('📋 Found courses:', coursesList.length);
      setCourses(coursesList);
    } catch (err) {
      console.error('❌ Error fetching courses:', err);
      setError('Failed to load courses');
    } finally {
      setLoading(false);
    }
  }, [currentUser, db]);

  useEffect(() => {
    if (currentUser) {
      fetchCourses();
    }
  }, [fetchCourses, currentUser]);

  const handleThumbnailChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setThumbnailPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleAddCourse = async (values, { setSubmitting, resetForm }) => {
    console.log('🚀 Course creation started');
    console.log('Current user:', currentUser);
    console.log('Form values:', values);
    console.log('Form values type:', typeof values);
    console.log('Form values keys:', Object.keys(values));

    if (!currentUser) {
      console.error('❌ No current user');
      setError('You must be logged in to create a course');
      setSubmitting(false);
      return;
    }

    try {
      console.log('📝 Preparing course data...');
      const courseData = {
        ...values,
        creatorId: currentUser.uid,
        thumbnailUrl: thumbnailPreview, // In production, upload to storage and use the URL
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        enrollments: 0,
        rating: 0,
        reviews: []
      };

      console.log('📊 Course data to save:', courseData);
      console.log('Course data type:', typeof courseData);
      console.log('Course data keys:', Object.keys(courseData));

      if (editingCourse) {
        // Update existing course
        console.log('✏️ Updating existing course...');
        console.log('Editing course ID:', editingCourse.id);
        await updateDoc(doc(db, 'courses', editingCourse.id), courseData);
        setSuccess('Course updated successfully!');
        console.log('✅ Course updated successfully');
      } else {
        // Create new course
        console.log('🆕 Creating new course...');
        console.log('Collection reference:', collection(db, 'courses'));
        const docRef = await addDoc(collection(db, 'courses'), courseData);
        setSuccess('Course created successfully!');
        console.log('✅ Course created successfully with ID:', docRef.id);
      }

      // Refresh courses list
      console.log('🔄 Refreshing courses list...');
      fetchCourses();

      // Reset form and close modal
      resetForm();
      setThumbnailPreview('');
      setShowAddModal(false);
      setEditingCourse(null);

    } catch (err) {
      console.error('❌ Error saving course:', err);
      console.error('Error details:', err.message);
      console.error('Error code:', err.code);
      console.error('Error stack:', err.stack);
      setError('Failed to save course: ' + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublishCourse = async (course) => {
    try {
      const newStatus = course.status === 'published' ? 'draft' : 'published';
      await updateDoc(doc(db, 'courses', course.id), {
        status: newStatus,
        updatedAt: new Date().toISOString()
      });
      
      // Update local state
      setCourses(courses.map(c => 
        c.id === course.id 
          ? { ...c, status: newStatus }
          : c
      ));
      
      setSuccess(`Course ${newStatus === 'published' ? 'published' : 'unpublished'} successfully!`);
    } catch (err) {
      console.error('Error updating course status:', err);
      setError('Failed to update course status');
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
        await deleteDoc(doc(db, 'courses', courseId));
        setCourses(courses.filter(course => course.id !== courseId));
        setSuccess('Course deleted successfully!');
      } catch (err) {
        console.error('Error deleting course:', err);
        setError('Failed to delete course');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Debug Info */}
        <div className="mb-6 p-4 bg-yellow-100 border border-yellow-400 rounded-md">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">Debug Information</h3>
          <div className="text-xs text-yellow-700">
            <p>Current User: {currentUser ? 'Yes' : 'No'}</p>
            {currentUser && (
              <>
                <p>User ID: {currentUser.uid}</p>
                <p>User Email: {currentUser.email}</p>
                <p>User Role: {currentUser.role}</p>
              </>
            )}
            <p>Loading: {loading ? 'Yes' : 'No'}</p>
          </div>
        </div>

        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 mb-6">
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

        {/* Course List */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map(course => (
            <div key={course.id} className="bg-white rounded-lg shadow overflow-hidden">
              {course.thumbnailUrl && (
                <div className="aspect-w-16 aspect-h-9">
                  <img
                    src={course.thumbnailUrl}
                    alt={course.title}
                    className="w-full h-32 sm:h-40 lg:h-48 object-cover"
                  />
                </div>
              )}
              <div className="p-4 sm:p-5">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 line-clamp-2">{course.title}</h3>
                <p className="mt-2 text-sm text-gray-600 line-clamp-3">{course.description}</p>
                <div className="mt-4 flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
                  <div className="flex flex-col space-y-1 sm:flex-row sm:items-center sm:space-y-0 sm:space-x-4 text-sm">
                    <div className="flex items-center">
                      <span className="font-medium text-gray-900">₹{course.price}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-gray-500">{course.enrollments || 0} enrolled</span>
                    </div>
                  </div>
                  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-semibold self-start ${
                    course.status === 'published' 
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {course.status}
                  </span>
                </div>
                <div className="mt-4 flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
                  <button
                    onClick={() => handlePublishCourse(course)}
                    className={`inline-flex items-center justify-center w-full sm:w-auto px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white ${
                      course.status === 'published'
                        ? 'bg-gray-500 hover:bg-gray-600'
                        : 'bg-green-600 hover:bg-green-700'
                    } touch-manipulation`}
                  >
                    {course.status === 'published' ? 'Unpublish' : 'Publish'}
                  </button>
                  <button
                    onClick={() => handleEditCourse(course)}
                    className="inline-flex items-center justify-center w-full sm:w-auto px-3 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 touch-manipulation"
                  >
                    <FaEdit className="mr-1" /> Edit
                  </button>
                  <button
                    onClick={() => handleDeleteCourse(course.id)}
                    className="inline-flex items-center justify-center w-full sm:w-auto px-3 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 touch-manipulation"
                  >
                    <FaTrash className="mr-1" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Add/Edit Course Modal */}
        {showAddModal && (
          <div className="fixed inset-0 overflow-y-auto z-50">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>
              <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-4xl sm:w-full">
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4 max-h-screen overflow-y-auto">
                  <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">
                    {editingCourse ? 'Edit Course' : 'Create New Course'}
                  </h3>
                  <Formik
                    initialValues={editingCourse || {
                      title: '',
                      description: '',
                      price: '',
                      duration: '',
                      skillLevel: 'beginner',
                      status: 'draft',
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
                    validationSchema={null}
                    onSubmit={(values, actions) => {
                      console.log('📝 Form submitted with values:', values);
                      console.log('Form actions:', actions);
                      console.log('Current user:', currentUser);
                      alert('Form submitted! Check console for details.');
                      handleAddCourse(values, actions);
                    }}
                  >
                    {({ values, handleSubmit, isSubmitting, errors, touched }) => {
                      console.log('Form state - Values:', values);
                      console.log('Form state - Errors:', errors);
                      console.log('Form state - Touched:', touched);
                      console.log('Form state - IsSubmitting:', isSubmitting);
                      return (
                      <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Title</label>
                            <Field
                              type="text"
                              name="title"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                            <ErrorMessage name="title" component="div" className="mt-1 text-sm text-red-600" />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">Price (₹)</label>
                            <Field
                              type="number"
                              name="price"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                            <ErrorMessage name="price" component="div" className="mt-1 text-sm text-red-600" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Description</label>
                          <Field
                            as="textarea"
                            name="description"
                            rows={3}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          />
                          <ErrorMessage name="description" component="div" className="mt-1 text-sm text-red-600" />
                        </div>

                        <div className="grid grid-cols-1 gap-4 sm:gap-6 sm:grid-cols-2">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Duration</label>
                            <Field
                              type="text"
                              name="duration"
                              placeholder="e.g. 8 weeks"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            />
                            <ErrorMessage name="duration" component="div" className="mt-1 text-sm text-red-600" />
                          </div>

                          <div>
                            <label className="block text-sm font-medium text-gray-700">Skill Level</label>
                            <Field
                              as="select"
                              name="skillLevel"
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            >
                              <option value="beginner">Beginner</option>
                              <option value="intermediate">Intermediate</option>
                              <option value="advanced">Advanced</option>
                            </Field>
                            <ErrorMessage name="skillLevel" component="div" className="mt-1 text-sm text-red-600" />
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700">Status</label>
                          <Field
                            as="select"
                            name="status"
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                          >
                            <option value="draft">Draft (Not visible to students)</option>
                            <option value="published">Published (Visible to students)</option>
                          </Field>
                          <ErrorMessage name="status" component="div" className="mt-1 text-sm text-red-600" />
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

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-3">Modules</label>
                          <FieldArray name="modules">
                            {({ push, remove }) => (
                              <div className="space-y-4">
                                {values.modules.map((module, moduleIndex) => (
                                  <div key={moduleIndex} className="border border-gray-200 rounded-md p-4">
                                    <div className="flex justify-between items-center mb-4">
                                      <h4 className="text-sm font-medium text-gray-900">Module {moduleIndex + 1}</h4>
                                      {moduleIndex > 0 && (
                                        <button
                                          type="button"
                                          onClick={() => remove(moduleIndex)}
                                          className="text-red-600 hover:text-red-800"
                                        >
                                          <FaTrash />
                                        </button>
                                      )}
                                    </div>

                                    <div className="space-y-4">
                                      <div>
                                        <label className="block text-xs font-medium text-gray-700">Title</label>
                                        <Field
                                          name={`modules.${moduleIndex}.title`}
                                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-xs"
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-xs font-medium text-gray-700">Description</label>
                                        <Field
                                          as="textarea"
                                          name={`modules.${moduleIndex}.description`}
                                          rows={2}
                                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-xs"
                                        />
                                      </div>

                                      <div>
                                        <label className="block text-xs font-medium text-gray-700 mb-2">Topics</label>
                                        <FieldArray name={`modules.${moduleIndex}.topics`}>
                                          {({ push: pushTopic, remove: removeTopic }) => (
                                            <div className="space-y-3">
                                              {module.topics.map((topic, topicIndex) => (
                                                <div key={topicIndex} className="border border-gray-200 rounded-md p-3">
                                                  <div className="flex justify-between items-center mb-3">
                                                    <h5 className="text-xs font-medium text-gray-900">Topic {topicIndex + 1}</h5>
                                                    {topicIndex > 0 && (
                                                      <button
                                                        type="button"
                                                        onClick={() => removeTopic(topicIndex)}
                                                        className="text-red-600 hover:text-red-800"
                                                      >
                                                        <FaTrash />
                                                      </button>
                                                    )}
                                                  </div>

                                                  <div className="space-y-3">
                                                    <div>
                                                      <label className="block text-xs font-medium text-gray-700">Title</label>
                                                      <Field
                                                        name={`modules.${moduleIndex}.topics.${topicIndex}.title`}
                                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-xs"
                                                      />
                                                    </div>

                                                    <div>
                                                      <label className="block text-xs font-medium text-gray-700">Type</label>
                                                      <Field
                                                        as="select"
                                                        name={`modules.${moduleIndex}.topics.${topicIndex}.type`}
                                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-xs"
                                                      >
                                                        <option value="text">Text</option>
                                                        <option value="video">Video</option>
                                                      </Field>
                                                    </div>

                                                    {topic.type === 'text' ? (
                                                      <div>
                                                        <label className="block text-xs font-medium text-gray-700">Content</label>
                                                        <Field
                                                          as="textarea"
                                                          name={`modules.${moduleIndex}.topics.${topicIndex}.content`}
                                                          rows={3}
                                                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-xs"
                                                        />
                                                      </div>
                                                    ) : (
                                                      <div>
                                                        <label className="block text-xs font-medium text-gray-700">Video URL</label>
                                                        <Field
                                                          name={`modules.${moduleIndex}.topics.${topicIndex}.videoUrl`}
                                                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-xs"
                                                          placeholder="YouTube embed URL"
                                                        />
                                                      </div>
                                                    )}
                                                  </div>
                                                </div>
                                              ))}
                                              <button
                                                type="button"
                                                onClick={() => pushTopic({ title: '', type: 'text', content: '' })}
                                                className="mt-2 inline-flex items-center px-2.5 py-1.5 border border-transparent text-xs font-medium rounded text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                                              >
                                                <FaPlus className="mr-1" /> Add Topic
                                              </button>
                                            </div>
                                          )}
                                        </FieldArray>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                                <button
                                  type="button"
                                  onClick={() => push({
                                    title: '',
                                    description: '',
                                    topics: [{ title: '', type: 'text', content: '' }]
                                  })}
                                  className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
                                >
                                  <FaPlus className="mr-2" /> Add Module
                                </button>
                              </div>
                            )}
                          </FieldArray>
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
                            onClick={() => console.log('Submit button clicked')}
                          >
                            {isSubmitting ? 'Saving...' : (editingCourse ? 'Update Course' : 'Create Course')}
                          </button>
                        </div>
                      </form>
                      );
                    }}
                  </Formik>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
