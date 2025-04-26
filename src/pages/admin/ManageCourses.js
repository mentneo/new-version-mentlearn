import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, doc, deleteDoc, addDoc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { uploadImage as uploadToCloudinary } from '../../utils/cloudinary';
import { uploadImage as uploadToFirebase } from '../../utils/storage';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/admin/Navbar';
import { FaPlus, FaEdit, FaTrash, FaEye, FaUserPlus } from 'react-icons/fa';
import { Formik, Form, Field, ErrorMessage, FieldArray } from 'formik';
import * as Yup from 'yup';

export default function ManageCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingCourse, setEditingCourse] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);
  const [thumbnailPreview, setThumbnailPreview] = useState('');
  
  // Fetch courses from Firestore
  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const coursesCollection = collection(db, "courses");
      const coursesSnapshot = await getDocs(coursesCollection);
      const coursesList = coursesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setCourses(coursesList);
    } catch (err) {
      console.error("Error fetching courses:", err);
      setError("Failed to load courses. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  const handleThumbnailChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setThumbnailFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setThumbnailPreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const initialValues = {
    title: '',
    description: '',
    price: '',
    modules: [{ 
      title: '', 
      description: '', 
      topics: [{ 
        title: '', 
        type: 'text', 
        content: '', 
        videoUrl: '' 
      }] 
    }]
  };

  const validationSchema = Yup.object({
    title: Yup.string().required('Title is required'),
    description: Yup.string().required('Description is required'),
    price: Yup.number().required('Price is required').min(0, 'Price must be non-negative'),
    modules: Yup.array().of(
      Yup.object().shape({
        title: Yup.string().required('Module title is required'),
        description: Yup.string(),
        topics: Yup.array().of(
          Yup.object().shape({
            title: Yup.string().required('Topic title is required'),
            type: Yup.string().required('Type is required')
          })
        )
      })
    )
  });

  const handleCreateCourse = async (values, { resetForm }) => {
    try {
      setLoading(true);
      setError(''); // Clear any previous errors
      setSuccess('');
      
      console.log("Creating course with values:", values);
      
      let thumbnailUrl = '';
      
      // Upload thumbnail if available
      if (thumbnailFile) {
        try {
          console.log("Attempting to upload thumbnail to Cloudinary...");
          // Use Cloudinary only for uploads
          thumbnailUrl = await uploadToCloudinary(thumbnailFile, 'image');
          console.log("Thumbnail uploaded successfully to Cloudinary:", thumbnailUrl);
        } catch (uploadError) {
          console.error("Cloudinary upload failed:", uploadError);
          // Continue without thumbnail rather than failing completely
          thumbnailUrl = "https://via.placeholder.com/300?text=No+Image";
          console.log("Using placeholder image instead");
        }
      }
      
      // Create course document with simplified structure
      const newCourse = {
        title: values.title,
        description: values.description,
        price: parseFloat(values.price) || 0,
        thumbnailUrl,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        // Add modules with safer structure
        modules: values.modules.map((module, moduleIndex) => ({
          id: `module_${Date.now()}_${moduleIndex}`,
          title: module.title,
          description: module.description || '',
          topics: Array.isArray(module.topics) ? module.topics.map((topic, topicIndex) => ({
            id: `topic_${Date.now()}_${moduleIndex}_${topicIndex}`,
            title: topic.title || '',
            type: topic.type || 'text',
            content: topic.content || '',
            videoUrl: topic.videoUrl || ''
          })) : []
        }))
      };
      
      console.log("Saving course to Firestore:", newCourse);
      
      if (editingCourse) {
        // Update existing course
        await updateDoc(doc(db, "courses", editingCourse.id), newCourse);
        console.log("Course updated successfully");
        setSuccess("Course updated successfully!");
      } else {
        // Add new course
        const docRef = await addDoc(collection(db, "courses"), newCourse);
        console.log("Course added successfully with ID:", docRef.id);
        setSuccess("Course created successfully!");
      }
      
      // Refresh the course list
      fetchCourses();
      
      // Reset form and close modal
      resetForm();
      setThumbnailFile(null);
      setThumbnailPreview('');
      setShowAddModal(false);
      setEditingCourse(null);
      
    } catch (err) {
      console.error("Error creating/updating course:", err);
      setError("Failed to save course: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const handleEditCourse = (course) => {
    setEditingCourse(course);
    setThumbnailPreview(course.thumbnailUrl || '');
    setShowAddModal(true);
  };

  const handleDeleteCourse = async (courseId) => {
    if (window.confirm("Are you sure you want to delete this course? This action cannot be undone.")) {
      try {
        setLoading(true);
        
        // Delete course document
        await deleteDoc(doc(db, "courses", courseId));
        
        // Update courses list
        setCourses(courses.filter(course => course.id !== courseId));
        setSuccess("Course deleted successfully!");
        
      } catch (err) {
        console.error("Error deleting course:", err);
        setError("Failed to delete course. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  // Rest of the component remains the same
  
  if (loading && courses.length === 0) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
            <p className="text-center mt-4">Loading courses...</p>
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
            <h1 className="text-3xl font-bold text-gray-900">Manage Courses</h1>
            <button
              onClick={() => {
                setEditingCourse(null);
                setThumbnailFile(null);
                setThumbnailPreview('');
                setShowAddModal(true);
              }}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
            >
              <FaPlus className="mr-2" /> Add New Course
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
                  <li key={course.id} className="px-6 py-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-16 w-16">
                          <img 
                            className="h-16 w-16 rounded-md object-cover" 
                            src={course.thumbnailUrl || 'https://via.placeholder.com/150?text=No+Image'} 
                            alt={course.title} 
                          />
                        </div>
                        <div className="ml-4">
                          <h2 className="text-lg font-medium text-gray-900">{course.title}</h2>
                          <p className="text-sm text-gray-500 line-clamp-2">{course.description}</p>
                          <p className="text-sm text-gray-500 mt-1">
                            {course.modules?.length || 0} modules | Price: ₹{course.price}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEditCourse(course)}
                          className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                        >
                          <FaEdit className="mr-1" /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteCourse(course.id)}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700"
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
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-3xl sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {editingCourse ? 'Edit Course' : 'Create New Course'}
                    </h3>
                    <div className="mt-4">
                      <Formik
                        initialValues={editingCourse || initialValues}
                        validationSchema={validationSchema}
                        onSubmit={handleCreateCourse}
                      >
                        {({ values, isSubmitting }) => (
                          <Form className="space-y-6">
                            {/* Form fields remain the same */}
                            <div>
                              <label htmlFor="title" className="block text-sm font-medium text-gray-700">Course Title</label>
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
                              <div className="mt-1 flex items-center">
                                {thumbnailPreview && (
                                  <img src={thumbnailPreview} alt="Preview" className="h-24 w-24 object-cover rounded-md mr-4" />
                                )}
                                <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none">
                                  <span>Upload Image</span>
                                  <input type="file" className="sr-only" onChange={handleThumbnailChange} accept="image/*" />
                                </label>
                              </div>
                            </div>
                            
                            <div>
                              <label className="block text-sm font-medium text-gray-700 mb-3">Modules</label>
                              <FieldArray name="modules">
                                {({ remove, push }) => (
                                  <div className="space-y-4">
                                    {values.modules.map((module, moduleIndex) => (
                                      <div key={moduleIndex} className="border border-gray-300 rounded-md p-4">
                                        {/* Module fields */}
                                        <div className="flex justify-between items-center mb-2">
                                          <h4 className="text-sm font-medium text-gray-700">Module {moduleIndex + 1}</h4>
                                          <button
                                            type="button"
                                            onClick={() => remove(moduleIndex)}
                                            className="text-red-600 hover:text-red-900"
                                          >
                                            Remove Module
                                          </button>
                                        </div>
                                        
                                        <div className="mb-3">
                                          <label className="block text-sm font-medium text-gray-700">Title</label>
                                          <Field
                                            name={`modules.${moduleIndex}.title`}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                          />
                                          <ErrorMessage name={`modules.${moduleIndex}.title`} component="div" className="mt-1 text-sm text-red-600" />
                                        </div>
                                        
                                        <div className="mb-3">
                                          <label className="block text-sm font-medium text-gray-700">Description</label>
                                          <Field
                                            as="textarea"
                                            name={`modules.${moduleIndex}.description`}
                                            rows={2}
                                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                          />
                                        </div>
                                        
                                        <div>
                                          <label className="block text-sm font-medium text-gray-700 mb-2">Topics</label>
                                          <FieldArray name={`modules.${moduleIndex}.topics`}>
                                            {({ remove: removeTopic, push: pushTopic }) => (
                                              <div className="space-y-3">
                                                {module.topics.map((topic, topicIndex) => (
                                                  <div key={topicIndex} className="border border-gray-200 rounded-md p-3">
                                                    {/* Topic fields */}
                                                    <div className="flex justify-between items-center mb-2">
                                                      <h5 className="text-xs font-medium text-gray-700">Topic {topicIndex + 1}</h5>
                                                      <button
                                                        type="button"
                                                        onClick={() => removeTopic(topicIndex)}
                                                        className="text-red-600 hover:text-red-900 text-xs"
                                                      >
                                                        Remove Topic
                                                      </button>
                                                    </div>
                                                    
                                                    <div className="mb-2">
                                                      <label className="block text-xs font-medium text-gray-700">Title</label>
                                                      <Field
                                                        name={`modules.${moduleIndex}.topics.${topicIndex}.title`}
                                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-xs"
                                                      />
                                                    </div>
                                                    
                                                    <div className="mb-2">
                                                      <label className="block text-xs font-medium text-gray-700">Type</label>
                                                      <Field
                                                        as="select"
                                                        name={`modules.${moduleIndex}.topics.${topicIndex}.type`}
                                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-xs"
                                                      >
                                                        <option value="text">Text</option>
                                                        <option value="video">Video</option>
                                                        <option value="quiz">Quiz</option>
                                                      </Field>
                                                    </div>
                                                    
                                                    {topic.type === 'video' && (
                                                      <div className="mb-2">
                                                        <label className="block text-xs font-medium text-gray-700">Video URL</label>
                                                        <Field
                                                          name={`modules.${moduleIndex}.topics.${topicIndex}.videoUrl`}
                                                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-xs"
                                                          placeholder="YouTube embed URL"
                                                        />
                                                      </div>
                                                    )}
                                                    
                                                    {topic.type === 'text' && (
                                                      <div className="mb-2">
                                                        <label className="block text-xs font-medium text-gray-700">Content</label>
                                                        <Field
                                                          as="textarea"
                                                          name={`modules.${moduleIndex}.topics.${topicIndex}.content`}
                                                          rows={2}
                                                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-xs"
                                                        />
                                                      </div>
                                                    )}
                                                  </div>
                                                ))}
                                                <button
                                                  type="button"
                                                  onClick={() => pushTopic({ 
                                                    title: '', 
                                                    type: 'text', 
                                                    content: '', 
                                                    videoUrl: '' 
                                                  })}
                                                  className="inline-flex items-center px-2 py-1 border border-transparent text-xs font-medium rounded shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                                                >
                                                  Add Topic
                                                </button>
                                              </div>
                                            )}
                                          </FieldArray>
                                        </div>
                                      </div>
                                    ))}
                                    <button
                                      type="button"
                                      onClick={() => push({ 
                                        title: '', 
                                        description: '', 
                                        topics: [{ title: '', type: 'text', content: '', videoUrl: '' }] 
                                      })}
                                      className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                                    >
                                      Add Module
                                    </button>
                                  </div>
                                )}
                              </FieldArray>
                            </div>
                            
                            <div className="pt-5 border-t border-gray-200 flex justify-end space-x-3">
                              <button
                                type="button"
                                onClick={() => {
                                  setShowAddModal(false);
                                  setEditingCourse(null);
                                }}
                                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                Cancel
                              </button>
                              <button
                                type="submit"
                                disabled={isSubmitting}
                                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                              >
                                {isSubmitting ? 'Saving...' : (editingCourse ? 'Update Course' : 'Create Course')}
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
