import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const DataAnalystAccess = () => {
  const { currentUser, userRole } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    if (userRole === 'admin' || userRole === 'data_analyst') {
      navigate('/data-analyst/dashboard');
    } else {
      navigate('/unauthorized');
    }
  }, [currentUser, userRole, navigate]);

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500 mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to Data Analytics Dashboard...</p>
      </div>
    </div>
  );
};

export default DataAnalystAccess;
