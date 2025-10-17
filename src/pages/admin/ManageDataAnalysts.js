import React, { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext.js';
import { collection, query, where, getDocs, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../firebase/firebase.js';
import { FaUserPlus, FaTrash, FaEnvelope } from 'react-icons/fa/index.esm.js';

const ManageDataAnalysts = () => {
  const { createDataAnalyst, userRole } = useAuth();
  const [analysts, setAnalysts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [formVisible, setFormVisible] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [actionStatus, setActionStatus] = useState({ type: '', message: '' });

  // Check if user is admin
  useEffect(() => {
    if (userRole !== 'admin') {
      setActionStatus({
        type: 'error',
        message: 'You do not have permission to access this page.'
      });
      return;
    }

    // Load existing data analysts
    loadAnalysts();
  }, [userRole]);

  const loadAnalysts = async () => {
    setLoading(true);
    try {
      // Query users with data_analyst role
      const analystQuery = query(
        collection(db, "users"),
        where("role", "==", "data_analyst")
      );
      
      const querySnapshot = await getDocs(analystQuery);
      const analyststList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      
      setAnalysts(analyststList);
    } catch (error) {
      console.error("Error loading data analysts:", error);
      setActionStatus({
        type: 'error',
        message: 'Failed to load data analysts.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error for this field when typing
    if (formErrors[name]) {
      setFormErrors({
        ...formErrors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const errors = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setActionStatus({ type: 'loading', message: 'Creating data analyst...' });
    
    try {
      await createDataAnalyst(formData.email, formData.password, formData.name);
      
      setActionStatus({
        type: 'success',
        message: 'Data analyst created successfully!'
      });
      
      // Reset form
      setFormData({
        name: '',
        email: '',
        password: '',
        confirmPassword: ''
      });
      
      // Hide form
      setFormVisible(false);
      
      // Reload analysts list
      loadAnalysts();
      
    } catch (error) {
      console.error("Error creating data analyst:", error);
      setActionStatus({
        type: 'error',
        message: error.message || 'Failed to create data analyst.'
      });
    }
  };

  const handleDeleteAnalyst = async (analystId) => {
    if (!window.confirm('Are you sure you want to delete this data analyst?')) {
      return;
    }
    
    setActionStatus({ type: 'loading', message: 'Deleting data analyst...' });
    
    try {
      // Delete user document
      await deleteDoc(doc(db, "users", analystId));
      
      setActionStatus({
        type: 'success',
        message: 'Data analyst deleted successfully!'
      });
      
      // Reload analysts list
      loadAnalysts();
      
    } catch (error) {
      console.error("Error deleting data analyst:", error);
      setActionStatus({
        type: 'error',
        message: 'Failed to delete data analyst. Note: Firebase Auth user record requires additional steps to delete completely.'
      });
    }
  };

  // Note: In a real app, you should also delete the Firebase Auth user,
  // but this requires Firebase Admin SDK or Cloud Functions

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold">Manage Data Analysts</h1>
          <p className="text-gray-600 mt-1">Create and manage data analyst accounts</p>
        </div>
        <button
          onClick={() => setFormVisible(!formVisible)}
          className={`px-4 py-2 rounded-md flex items-center ${formVisible ? 'bg-gray-300' : 'bg-blue-600 text-white'}`}
        >
          <FaUserPlus className="mr-2" />
          {formVisible ? 'Cancel' : 'Add Data Analyst'}
        </button>
      </div>
      
      {/* Status messages */}
      {actionStatus.message && (
        <div className={`mb-6 p-4 rounded-md ${
          actionStatus.type === 'error' ? 'bg-red-100 text-red-700' :
          actionStatus.type === 'success' ? 'bg-green-100 text-green-700' :
          'bg-blue-100 text-blue-700'
        }`}>
          {actionStatus.message}
        </div>
      )}
      
      {/* Create Data Analyst Form */}
      {formVisible && (
        <div className="mb-8 bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Add New Data Analyst</h2>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-md ${formErrors.name ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter full name"
                />
                {formErrors.name && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-md ${formErrors.email ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter email address"
                />
                {formErrors.email && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.email}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Password
                </label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-md ${formErrors.password ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Enter password"
                />
                {formErrors.password && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.password}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Confirm Password
                </label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className={`w-full p-2 border rounded-md ${formErrors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                  placeholder="Confirm password"
                />
                {formErrors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-600">{formErrors.confirmPassword}</p>
                )}
              </div>
            </div>
            
            <div className="mt-6 flex justify-end">
              <button
                type="button"
                onClick={() => setFormVisible(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md mr-2"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                Create Data Analyst
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Data Analysts List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Data Analysts</h2>
          <p className="text-gray-600 text-sm mt-1">Manage your data analysis team members</p>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            {analysts.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                No data analysts found. Create one to get started.
              </div>
            ) : (
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {analysts.map((analyst) => (
                    <tr key={analyst.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                            {analyst.name?.charAt(0).toUpperCase() || analyst.email?.charAt(0).toUpperCase() || '?'}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {analyst.name}
                            </div>
                            <div className="text-sm text-gray-500">
                              Data Analyst
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{analyst.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {analyst.createdAt ? new Date(analyst.createdAt).toLocaleDateString() : 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex space-x-3">
                          <button 
                            onClick={() => window.location.href = `mailto:${analyst.email}`}
                            className="text-blue-600 hover:text-blue-900"
                            title="Send Email"
                          >
                            <FaEnvelope />
                          </button>
                          <button 
                            onClick={() => handleDeleteAnalyst(analyst.id)}
                            className="text-red-600 hover:text-red-900"
                            title="Delete Analyst"
                          >
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ManageDataAnalysts;
