import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const CourseCard = ({ course }) => {
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  const handleEnrollClick = () => {
    if (!currentUser) {
      // Redirect to login if not authenticated
      navigate('/login', { state: { from: `/course/${course.id}` } });
      return;
    }
    
    // Navigate to enrollment page
    navigate(`/course/${course.id}/enroll`);
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      {/* Course Image */}
      <div className="relative h-48">
        <img
          src={course.thumbnail || '/default-course-image.jpg'}
          alt={course.name}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Course Info */}
      <div className="p-6">
        <h3 className="text-xl font-semibold mb-2">{course.name}</h3>
        <p className="text-gray-600 mb-4 line-clamp-2">{course.description}</p>
        
        <div className="flex justify-between items-center">
          <div className="text-indigo-600 font-bold">₹{course.price}</div>
          <button
            onClick={handleEnrollClick}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
          >
            Enroll Now
          </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;