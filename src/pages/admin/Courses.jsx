import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import CourseCard from '../../components/CourseCard';

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      // Replace with your actual API endpoint
      const response = await fetch('/api/courses');
      
      // Log the raw response for debugging
      console.log("API Response status:", response.status);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log("Courses data:", data); // Debug the actual data
      
      // Ensure image URLs are absolute
      const coursesWithFixedImages = data.map(course => ({
        ...course,
        imageUrl: ensureAbsoluteUrl(course.imageUrl)
      }));
      
      setCourses(coursesWithFixedImages);
    } catch (error) {
      console.error("Failed to fetch courses:", error);
      setError("Failed to load courses. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to ensure image URLs are absolute
  const ensureAbsoluteUrl = (url) => {
    if (!url) return null;
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    // If it's a relative URL, make it absolute
    return `${window.location.origin}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  const handleEdit = (course) => {
    // Navigate to edit page or open edit modal
    console.log("Edit course:", course);
  };

  const handleDelete = async (courseId) => {
    if (window.confirm("Are you sure you want to delete this course?")) {
      try {
        // Replace with your actual API endpoint
        const response = await fetch(`/api/courses/${courseId}`, {
          method: 'DELETE',
        });
        
        if (!response.ok) {
          throw new Error(`Error ${response.status}: ${response.statusText}`);
        }
        
        // Remove the deleted course from state
        setCourses(courses.filter(course => course.id !== courseId));
      } catch (error) {
        console.error("Failed to delete course:", error);
        alert("Failed to delete course. Please try again.");
      }
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading courses...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-500">{error}</div>;
  }

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Courses</h1>
        <Link 
          to="/admin/courses/new" 
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded"
        >
          Add New Course
        </Link>
      </div>
      
      {courses.length === 0 ? (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No courses found. Add your first course!</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {courses.map(course => (
            <CourseCard
              key={course.id}
              course={course}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Courses;
