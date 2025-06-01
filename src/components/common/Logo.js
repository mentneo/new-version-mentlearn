import React from 'react';
import { Link } from 'react-router-dom';

const Logo = ({ size = 'md', linkTo = '/' }) => {
  const sizes = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
    xl: 'h-12 w-12',
  };
  
  const sizeClass = sizes[size] || sizes.md;
  
  return (
    <Link to={linkTo} className="flex items-center">
      <img 
        src="/mentneo-logo.png" 
        alt="Mentneo Logo" 
        className={`${sizeClass} mr-2`} 
      />
      <span className="text-xl font-bold text-indigo-600">Mentneo</span>
    </Link>
  );
};

export default Logo;
