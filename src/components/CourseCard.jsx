import React, { useState } from 'react';
import './CourseCard.css';

const CourseCard = ({ course, onEdit, onDelete }) => {
  const [imageError, setImageError] = useState(false);
  
  // For debugging the image URL
  console.log("Course image URL:", course.imageUrl);
  
  const handleImageError = () => {
    console.log("Image failed to load:", course.imageUrl);
    setImageError(true);
  };

  return (
    <div className="bg-white shadow-md rounded-lg overflow-hidden mb-4">
      <div className="flex md:flex-row flex-col">
        <div className="md:w-1/4 w-full h-48 md:h-auto relative">
          {!imageError && course.imageUrl ? (
            <img 
              src={course.imageUrl} 
              alt={course.title || 'Course'} 
              className="w-full h-full object-cover"
              onError={handleImageError}
              crossOrigin="anonymous" // Try this if CORS is an issue
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-200">
              <span className="text-4xl text-gray-500">
                {course.title ? course.title.charAt(0).toUpperCase() : 'C'}
              </span>
            </div>
          )}
        </div>
        
        <div className="p-4 md:w-3/4 w-full">
          <h3 className="font-bold text-xl mb-2">{course.title}</h3>
          <p className="text-gray-700 text-sm mb-4">{course.description}</p>
          
          <div className="flex justify-between">
            <div className="text-sm text-gray-600">
              <span>{course.duration || 'N/A'} | {course.level || 'All Levels'}</span>
            </div>
            
            <div className="flex space-x-2">
              <button 
                onClick={() => onEdit(course)} 
                className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Edit
              </button>
              <button 
                onClick={() => onDelete(course.id)} 
                className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
