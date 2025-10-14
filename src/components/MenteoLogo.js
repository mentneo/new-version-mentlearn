import React from 'react';
import menteoLogo from '../assets/mentneo_logo.png'; // Import the logo

const MenteoLogo = ({ size = 'medium', showText = false, className = '' }) => {
  const sizes = {
    small: 'h-8 w-8',
    medium: 'h-10 w-10', 
    large: 'h-16 w-16'
  };

  return (
    <div className={`flex items-center ${className}`}>
      <img 
        src={menteoLogo} 
        alt="Mentneo Logo" 
        className={`${sizes[size]} object-contain`}
        onError={(e) => {
          // Fallback to a placeholder if image fails to load
          e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'%3E%3Ctext y='50' font-size='50' fill='%23007bff'%3EM%3C/text%3E%3C/svg%3E";
        }}
      />
    </div>
  );
};

export default MenteoLogo;
