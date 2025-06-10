import React from 'react';
import { Link } from 'react-router-dom';
import logoImage from '../../assets/mentneo-logo.png';

const Logo = ({ size = 'md', variant = 'default', linkTo = '/' }) => {
  // Size classes
  const sizeClasses = {
    xs: 'h-6',
    sm: 'h-8',
    md: 'h-10',
    lg: 'h-12',
    xl: 'h-16',
  };
  
  // Variant styles
  const variantStyles = {
    default: 'flex items-center',
    light: 'flex items-center text-white',
    dark: 'flex items-center text-gray-900',
  };
  
  const containerClass = variantStyles[variant] || variantStyles.default;
  const logoClass = sizeClasses[size] || sizeClasses.md;
  
  return (
    <Link to={linkTo} className={containerClass}>
      <img 
        src={logoImage}
        alt="Mentneo - Learn. Build. Dominate." 
        className={`${logoClass} w-auto`}
      />
    </Link>
  );
};

export default Logo;
