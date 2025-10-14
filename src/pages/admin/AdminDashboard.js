import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import ManageDataAnalysts from './ManageDataAnalysts';
import {
  FaUsers,
  FaUserGraduate,
  FaChartLine,
  FaUsersCog,
  FaCog,
  FaBars,
  FaTimes
} from 'react-icons/fa';

const AdminDashboard = () => {
  const { userRole } = useAuth(); // Remove unused currentUser
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('users');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  useEffect(() => {
    // Redirect if not admin
    if (userRole !== 'admin') {
      navigate('/dashboard');
    }
  }, [userRole, navigate]);

  // Sidebar navigation items
  const navItems = [
    { id: 'users', label: 'Users', icon: FaUsers },
    { id: 'students', label: 'Students', icon: FaUserGraduate },
    { id: 'data_analysts', label: 'Data Analysts', icon: FaChartLine },
    { id: 'admins', label: 'Admins', icon: FaUsersCog },
    { id: 'settings', label: 'Settings', icon: FaCog }
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div 
        className={`${
          sidebarOpen ? 'w-64' : 'w-20'
        } bg-white shadow-md transition-all duration-300 fixed h-full z-10`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <div className={`font-bold text-xl text-blue-600 ${!sidebarOpen && 'hidden'}`}>
            Mentneo Admin
          </div>
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="text-gray-500 hover:text-gray-700"
          >
            {sidebarOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>
        
        <nav className="mt-6">
          <ul>
            {navItems.map((item) => (
              <li key={item.id}>
                <button
                  className={`flex items-center w-full px-4 py-3 ${
                    activeTab === item.id
                      ? 'bg-blue-50 text-blue-600 border-r-4 border-blue-600'
                      : 'text-gray-600 hover:bg-gray-100'
                  } transition-colors duration-200`}
                  onClick={() => setActiveTab(item.id)}
                >
                  <item.icon className={`h-5 w-5 ${activeTab === item.id ? 'text-blue-600' : 'text-gray-400'}`} />
                  {sidebarOpen && (
                    <span className="ml-4 font-medium">{item.label}</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </nav>
      </div>

      {/* Main content */}
      <div className={`flex-1 ${sidebarOpen ? 'ml-64' : 'ml-20'} transition-all duration-300`}>
        {/* Header */}
        <header className="bg-white shadow-sm h-16 flex items-center px-6">
          <h1 className="text-2xl font-semibold text-gray-800">
            {navItems.find(item => item.id === activeTab)?.label || 'Dashboard'}
          </h1>
        </header>

        {/* Content area */}
        <main className="p-6">
          {activeTab === 'data_analysts' && <ManageDataAnalysts />}
          
          {activeTab !== 'data_analysts' && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">
                {activeTab === 'users' && 'Manage Users'}
                {activeTab === 'students' && 'Manage Students'}
                {activeTab === 'admins' && 'Manage Admins'}
                {activeTab === 'settings' && 'System Settings'}
              </h2>
              <p className="text-gray-600">
                This section is under development. Please use the Data Analysts tab to manage data analyst users.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;