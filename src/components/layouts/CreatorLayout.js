import React from 'react';
import { Outlet } from 'react-router-dom';
import CreatorSideNav from '../creator/SideNav';
import { useTheme } from '../../contexts/ThemeContext';

export default function CreatorLayout() {
  const { darkMode } = useTheme();

  return (
    <div className={`min-h-screen flex ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <CreatorSideNav />
      <div className="flex-1">
        <div className="p-8">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
