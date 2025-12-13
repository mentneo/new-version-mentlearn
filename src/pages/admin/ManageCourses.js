import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, doc, deleteDoc, addDoc, updateDoc } from 'firebase/firestore';
import { db, cloudinaryConfig } from '../../firebase/firebase.js';
import { uploadCourseThumbnailWithFallback } from '../../utils/cloudinary.js';
import { uploadImage as uploadToFirebase } from '../../utils/storage.js';
import { useAuth } from '../../contexts/AuthContext.js';
import Navbar from '../../components/admin/Navbar.js';
import { FaPlus, FaEdit, FaTrash, FaEye, FaUserPlus, FaTasks, FaFileAlt, FaBook, FaUpload } from 'react-icons/fa/index.esm.js';
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
  const [curriculumFile, setCurriculumFile] = useState(null);
  const [curriculumPreview, setCurriculumPreview] = useState('');
  
  // Assignments and Resources states
  const [showResourcesModal, setShowResourcesModal] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [assignmentFile, setAssignmentFile] = useState(null);
  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentDescription, setAssignmentDescription] = useState('');
  const [resourceFile, setResourceFile] = useState(null);
  const [resourceTitle, setResourceTitle] = useState('');
  const [resourceDescription, setResourceDescription] = useState('');
  const [uploadingAssignment, setUploadingAssignment] = useState(false);
  const [uploadingResource, setUploadingResource] = useState(false);
  
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

  const handleCurriculumChange = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
      setCurriculumFile(file);
      setCurriculumPreview(file.name);
    } else if (file) {
      setError('Please upload a PDF file for curriculum');
    }
  };

  const uploadCurriculumToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);
    formData.append('resource_type', 'raw'); // For PDF files

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/raw/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Cloudinary curriculum upload error:', errorData);
        throw new Error(errorData.error?.message || 'Curriculum upload failed');
      }

      const data = await response.json();
      return data.secure_url;
    } catch (error) {
      console.error('Error uploading curriculum:', error);
      throw error;
    }
  };

  const uploadFileToCloudinary = async (file) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', cloudinaryConfig.uploadPreset);

    try {
      // Determine resource type based on file type
      const resourceType = file.type.startsWith('image/') ? 'image' : 'raw';
      
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloudName}/${resourceType}/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Cloudinary error:', errorData);
        throw new Error(errorData.error?.message || 'File upload failed');
      }

      const data = await response.json();
      console.log('File uploaded successfully:', data.secure_url);
      return data.secure_url;
    } catch (error) {
      console.error('Error uploading file:', error);
      throw error;
    }
  };

  const handleAddAssignment = async () => {
    if (!assignmentFile || !assignmentTitle || !selectedCourse) {
      setError('Please fill in all assignment fields and select a file');
      return;
    }

    try {
      setUploadingAssignment(true);
      setError('');

      const assignmentUrl = await uploadFileToCloudinary(assignmentFile);

      const assignment = {
        id: `assignment_${Date.now()}`,
        title: assignmentTitle,
        description: assignmentDescription,
        fileUrl: assignmentUrl,
        fileName: assignmentFile.name,
        createdAt: new Date().toISOString()
      };

      const courseRef = doc(db, 'courses', selectedCourse.id);
      const currentAssignments = selectedCourse.assignments || [];
      
      await updateDoc(courseRef, {
        assignments: [...currentAssignments, assignment],
        updatedAt: new Date().toISOString()
      });

      setCourses(courses.map(c => 
        c.id === selectedCourse.id 
          ? { ...c, assignments: [...currentAssignments, assignment] }
          : c
      ));

      setSuccess('Assignment added successfully!');
      setAssignmentFile(null);
      setAssignmentTitle('');
      setAssignmentDescription('');
      
    } catch (err) {
      console.error('Error adding assignment:', err);
      setError('Failed to add assignment: ' + err.message);
    } finally {
      setUploadingAssignment(false);
    }
  };

  const handleAddResource = async () => {
    if (!resourceFile || !resourceTitle || !selectedCourse) {
      setError('Please fill in all resource fields and select a file');
      return;
    }

    try {
      setUploadingResource(true);
      setError('');

      const resourceUrl = await uploadFileToCloudinary(resourceFile);

      const resource = {
        id: `resource_${Date.now()}`,
        title: resourceTitle,
        description: resourceDescription,
        fileUrl: resourceUrl,
        fileName: resourceFile.name,
        fileType: resourceFile.type,
        createdAt: new Date().toISOString()
      };

      const courseRef = doc(db, 'courses', selectedCourse.id);
      const currentResources = selectedCourse.resources || [];
      
      await updateDoc(courseRef, {
        resources: [...currentResources, resource],
        updatedAt: new Date().toISOString()
      });

      setCourses(courses.map(c => 
        c.id === selectedCourse.id 
          ? { ...c, resources: [...currentResources, resource] }
          : c
      ));

      setSuccess('Resource added successfully!');
      setResourceFile(null);
      setResourceTitle('');
      setResourceDescription('');
      
    } catch (err) {
      console.error('Error adding resource:', err);
      setError('Failed to add resource: ' + err.message);
    } finally {
      setUploadingResource(false);
    }
  };

  const handleDeleteAssignment = async (assignmentId) => {
    if (!window.confirm('Are you sure you want to delete this assignment?')) return;

    try {
      const courseRef = doc(db, 'courses', selectedCourse.id);
      const updatedAssignments = selectedCourse.assignments.filter(a => a.id !== assignmentId);
      
      await updateDoc(courseRef, {
        assignments: updatedAssignments,
        updatedAt: new Date().toISOString()
      });

      setCourses(courses.map(c => 
        c.id === selectedCourse.id 
          ? { ...c, assignments: updatedAssignments }
          : c
      ));

      setSelectedCourse({ ...selectedCourse, assignments: updatedAssignments });
      setSuccess('Assignment deleted successfully!');
    } catch (err) {
      console.error('Error deleting assignment:', err);
      setError('Failed to delete assignment');
    }
  };

  const handleDeleteResource = async (resourceId) => {
    if (!window.confirm('Are you sure you want to delete this resource?')) return;

    try {
      const courseRef = doc(db, 'courses', selectedCourse.id);
      const updatedResources = selectedCourse.resources.filter(r => r.id !== resourceId);
      
      await updateDoc(courseRef, {
        resources: updatedResources,
        updatedAt: new Date().toISOString()
      });

      setCourses(courses.map(c => 
        c.id === selectedCourse.id 
          ? { ...c, resources: updatedResources }
          : c
      ));

      setSelectedCourse({ ...selectedCourse, resources: updatedResources });
      setSuccess('Resource deleted successfully!');
    } catch (err) {
      console.error('Error deleting resource:', err);
      setError('Failed to delete resource');
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
          
          // Use Cloudinary with Firebase Storage fallback
          thumbnailUrl = await uploadCourseThumbnailWithFallback(thumbnailFile);
          console.log("Upload result:", thumbnailUrl);
          
          // If no URL was returned, use a placeholder
          if (!thumbnailUrl) {
            console.warn("No URL returned from Cloudinary");
            thumbnailUrl = "https://via.placeholder.com/300?text=No+Image";
          }
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
          thumbnailUrl = "https://via.placeholder.com/300?text=Upload+Failed";
        }
      } else {
        console.log("No thumbnail file selected");
        thumbnailUrl = "https://via.placeholder.com/300?text=No+Image";
      }
      
      console.log("Final thumbnail URL:", thumbnailUrl);
      
      // Upload curriculum if available
      let curriculumUrl = '';
      if (curriculumFile) {
        try {
          console.log("Uploading curriculum PDF...");
          curriculumUrl = await uploadCurriculumToCloudinary(curriculumFile);
          console.log("Curriculum uploaded:", curriculumUrl);
        } catch (uploadError) {
          console.error("Curriculum upload failed:", uploadError);
        }
      }
      
      // Create course document
      const newCourse = {
        title: values.title,
        description: values.description,
        price: parseFloat(values.price) || 0,
        thumbnailUrl: thumbnailUrl,  // Make sure we're using the thumbnailUrl
        curriculumUrl: curriculumUrl || '', // Add curriculum URL
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
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
      
      // Save to Firestore
      if (editingCourse) {
        await updateDoc(doc(db, "courses", editingCourse.id), newCourse);
        console.log("Course updated successfully");
        setSuccess("Course updated successfully!");
      } else {
        const docRef = await addDoc(collection(db, "courses"), newCourse);
        console.log("Course added successfully with ID:", docRef.id);
        setSuccess("Course created successfully!");
      }
      
      // Refresh course list
      fetchCourses();
      
      // Reset form and close modal
      resetForm();
      setThumbnailFile(null);
      setThumbnailPreview('');
      setCurriculumFile(null);
      setCurriculumPreview('');
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
                            onError={(e) => {
                              console.error("Image failed to load:", e.target.src);
                              e.target.src = 'https://via.placeholder.com/150?text=Error';
                            }}
                            style={{ minWidth: '64px', minHeight: '64px' }}
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
                          onClick={() => {
                            setSelectedCourse(course);
                            setShowResourcesModal(true);
                          }}
                          className="inline-flex items-center px-3 py-1.5 border border-indigo-300 text-xs font-medium rounded-md text-indigo-700 bg-indigo-50 hover:bg-indigo-100"
                        >
                          <FaTasks className="mr-1" /> Resources
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
                              <label className="block text-sm font-medium text-gray-700">Curriculum (PDF)</label>
                              <p className="text-xs text-gray-500 mt-1">Upload course curriculum that students can view after purchase</p>
                              <div className="mt-2 flex items-center">
                                {curriculumPreview && (
                                  <div className="mr-4 px-3 py-2 bg-green-50 border border-green-200 rounded-md">
                                    <p className="text-sm text-green-700">📄 {curriculumPreview}</p>
                                  </div>
                                )}
                                <label className="cursor-pointer bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none">
                                  <span>Upload PDF</span>
                                  <input type="file" className="sr-only" onChange={handleCurriculumChange} accept="application/pdf" />
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

      {/* Assignments & Resources Modal */}
      {showResourcesModal && selectedCourse && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full max-h-screen overflow-y-auto">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="text-2xl font-bold text-gray-900">
                    Assignments & Resources - {selectedCourse.title}
                  </h3>
                  <button
                    onClick={() => {
                      setShowResourcesModal(false);
                      setSelectedCourse(null);
                      setAssignmentFile(null);
                      setAssignmentTitle('');
                      setAssignmentDescription('');
                      setResourceFile(null);
                      setResourceTitle('');
                      setResourceDescription('');
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {error && (
                  <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md">
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                {success && (
                  <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md">
                    <p className="text-sm text-green-600">{success}</p>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-6">
                  {/* Assignments Section */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FaTasks className="mr-2 text-indigo-600" />
                      Assignments
                    </h4>
                    
                    {/* Add Assignment Form */}
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <h5 className="font-medium text-gray-700 mb-3">Add New Assignment</h5>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                          <input
                            type="text"
                            value={assignmentTitle}
                            onChange={(e) => setAssignmentTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="Assignment title"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <textarea
                            value={assignmentDescription}
                            onChange={(e) => setAssignmentDescription(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="Assignment description"
                            rows="2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
                          <input
                            type="file"
                            onChange={(e) => setAssignmentFile(e.target.files[0])}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            accept=".pdf,.doc,.docx,.txt"
                          />
                          {assignmentFile && (
                            <p className="text-xs text-gray-500 mt-1">{assignmentFile.name}</p>
                          )}
                        </div>
                        <button
                          onClick={handleAddAssignment}
                          disabled={uploadingAssignment}
                          className="w-full px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:bg-gray-400 flex items-center justify-center"
                        >
                          <FaUpload className="mr-2" />
                          {uploadingAssignment ? 'Uploading...' : 'Add Assignment'}
                        </button>
                      </div>
                    </div>

                    {/* Assignments List */}
                    <div className="space-y-2">
                      {selectedCourse.assignments && selectedCourse.assignments.length > 0 ? (
                        selectedCourse.assignments.map((assignment) => (
                          <div key={assignment.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h6 className="font-medium text-gray-900">{assignment.title}</h6>
                                {assignment.description && (
                                  <p className="text-sm text-gray-600 mt-1">{assignment.description}</p>
                                )}
                                <div className="flex items-center mt-2 text-xs text-gray-500">
                                  <FaFileAlt className="mr-1" />
                                  {assignment.fileName}
                                </div>
                                <a
                                  href={assignment.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-indigo-600 hover:text-indigo-800 mt-1 inline-block"
                                >
                                  View File →
                                </a>
                              </div>
                              <button
                                onClick={() => handleDeleteAssignment(assignment.id)}
                                className="text-red-600 hover:text-red-800 ml-2"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-4">No assignments yet</p>
                      )}
                    </div>
                  </div>

                  {/* Resources Section */}
                  <div>
                    <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                      <FaBook className="mr-2 text-green-600" />
                      Resources
                    </h4>
                    
                    {/* Add Resource Form */}
                    <div className="bg-gray-50 p-4 rounded-lg mb-4">
                      <h5 className="font-medium text-gray-700 mb-3">Add New Resource</h5>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                          <input
                            type="text"
                            value={resourceTitle}
                            onChange={(e) => setResourceTitle(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="Resource title"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                          <textarea
                            value={resourceDescription}
                            onChange={(e) => setResourceDescription(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            placeholder="Resource description"
                            rows="2"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">File</label>
                          <input
                            type="file"
                            onChange={(e) => setResourceFile(e.target.files[0])}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md"
                            accept=".pdf,.doc,.docx,.ppt,.pptx,.txt"
                          />
                          {resourceFile && (
                            <p className="text-xs text-gray-500 mt-1">{resourceFile.name}</p>
                          )}
                        </div>
                        <button
                          onClick={handleAddResource}
                          disabled={uploadingResource}
                          className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:bg-gray-400 flex items-center justify-center"
                        >
                          <FaUpload className="mr-2" />
                          {uploadingResource ? 'Uploading...' : 'Add Resource'}
                        </button>
                      </div>
                    </div>

                    {/* Resources List */}
                    <div className="space-y-2">
                      {selectedCourse.resources && selectedCourse.resources.length > 0 ? (
                        selectedCourse.resources.map((resource) => (
                          <div key={resource.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h6 className="font-medium text-gray-900">{resource.title}</h6>
                                {resource.description && (
                                  <p className="text-sm text-gray-600 mt-1">{resource.description}</p>
                                )}
                                <div className="flex items-center mt-2 text-xs text-gray-500">
                                  <FaFileAlt className="mr-1" />
                                  {resource.fileName}
                                </div>
                                <a
                                  href={resource.fileUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-green-600 hover:text-green-800 mt-1 inline-block"
                                >
                                  View File →
                                </a>
                              </div>
                              <button
                                onClick={() => handleDeleteResource(resource.id)}
                                className="text-red-600 hover:text-red-800 ml-2"
                              >
                                <FaTrash />
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <p className="text-sm text-gray-500 text-center py-4">No resources yet</p>
                      )}
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
