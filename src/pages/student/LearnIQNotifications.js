import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase.js';
import { useAuth } from '../../contexts/AuthContext.js';
import { FiBell, FiBookOpen, FiCalendar, FiCheckCircle, FiClock, FiMessageCircle, FiTrash2, FiFilter, FiX, FiAlertCircle, FiBook } from 'react-icons/fi/index.js';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

export default function LearnIQNotifications() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [filter, setFilter] = useState('all'); // 'all', 'unread', 'read'
  const [selectMode, setSelectMode] = useState(false);
  const [selectedNotifications, setSelectedNotifications] = useState([]);
  const [deleteLoading, setDeleteLoading] = useState(false);
  
  useEffect(() => {
    fetchNotifications();
  }, [currentUser, filter]);
  
  const fetchNotifications = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      
      // Build query based on filter
      let notificationsQuery = query(
        collection(db, 'notifications'),
        where('userId', '==', currentUser.uid),
        orderBy('timestamp', 'desc')
      );
      
      if (filter === 'unread') {
        notificationsQuery = query(
          collection(db, 'notifications'),
          where('userId', '==', currentUser.uid),
          where('read', '==', false),
          orderBy('timestamp', 'desc')
        );
      } else if (filter === 'read') {
        notificationsQuery = query(
          collection(db, 'notifications'),
          where('userId', '==', currentUser.uid),
          where('read', '==', true),
          orderBy('timestamp', 'desc')
        );
      }
      
      const querySnapshot = await getDocs(notificationsQuery);
      
      const notificationsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      }));
      
      setNotifications(notificationsData);
      setLoading(false);
      setSelectMode(false);
      setSelectedNotifications([]);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      setLoading(false);
    }
  };
  
  const markAsRead = async (notificationId) => {
    try {
      await updateDoc(doc(db, 'notifications', notificationId), {
        read: true
      });
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === notificationId ? { ...notification, read: true } : notification
        )
      );
    } catch (error) {
      console.error("Error marking notification as read:", error);
    }
  };
  
  const markAllAsRead = async () => {
    try {
      setLoading(true);
      
      // Get all unread notifications
      const unreadNotifications = notifications.filter(notification => !notification.read);
      
      // Update each notification
      const updatePromises = unreadNotifications.map(notification => 
        updateDoc(doc(db, 'notifications', notification.id), { read: true })
      );
      
      await Promise.all(updatePromises);
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, read: true }))
      );
      
      setLoading(false);
    } catch (error) {
      console.error("Error marking all notifications as read:", error);
      setLoading(false);
    }
  };
  
  const toggleSelectMode = () => {
    setSelectMode(!selectMode);
    setSelectedNotifications([]);
  };
  
  const toggleSelectNotification = (notificationId) => {
    setSelectedNotifications(prevSelected => {
      if (prevSelected.includes(notificationId)) {
        return prevSelected.filter(id => id !== notificationId);
      } else {
        return [...prevSelected, notificationId];
      }
    });
  };
  
  const selectAll = () => {
    setSelectedNotifications(notifications.map(notification => notification.id));
  };
  
  const deselectAll = () => {
    setSelectedNotifications([]);
  };
  
  const deleteSelected = async () => {
    if (selectedNotifications.length === 0) return;
    
    try {
      setDeleteLoading(true);
      
      // Delete each selected notification
      const deletePromises = selectedNotifications.map(id => 
        updateDoc(doc(db, 'notifications', id), { deleted: true })
      );
      
      await Promise.all(deletePromises);
      
      // Update local state
      setNotifications(prevNotifications => 
        prevNotifications.filter(notification => !selectedNotifications.includes(notification.id))
      );
      
      setSelectedNotifications([]);
      setDeleteLoading(false);
      setSelectMode(false);
    } catch (error) {
      console.error("Error deleting notifications:", error);
      setDeleteLoading(false);
    }
  };
  
  // Format relative time (e.g., "2 hours ago")
  const getRelativeTime = (timestamp) => {
    const now = new Date();
    const diffMs = now - timestamp;
    const diffSec = Math.floor(diffMs / 1000);
    const diffMin = Math.floor(diffSec / 60);
    const diffHour = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHour / 24);
    
    if (diffSec < 60) {
      return 'Just now';
    } else if (diffMin < 60) {
      return `${diffMin} ${diffMin === 1 ? 'minute' : 'minutes'} ago`;
    } else if (diffHour < 24) {
      return `${diffHour} ${diffHour === 1 ? 'hour' : 'hours'} ago`;
    } else if (diffDay < 7) {
      return `${diffDay} ${diffDay === 1 ? 'day' : 'days'} ago`;
    } else {
      return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric'
      }).format(timestamp);
    }
  };
  
  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'course':
        return <FiBook size={20} className="text-blue-500" />;
      case 'assignment':
        return <FiCheckCircle size={20} className="text-green-500" />;
      case 'reminder':
        return <FiClock size={20} className="text-yellow-500" />;
      case 'event':
        return <FiCalendar size={20} className="text-purple-500" />;
      case 'message':
        return <FiMessageCircle size={20} className="text-pink-500" />;
      default:
        return <FiBell size={20} className="text-gray-500" />;
    }
  };
  
  // Count unread notifications
  const unreadCount = notifications.filter(notification => !notification.read).length;
  
  return (
    <div className="max-w-7xl mx-auto py-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Notifications</h1>
          <p className="mt-1 text-sm text-gray-500">
            Stay updated with your course activities and announcements
          </p>
        </div>
        
        <div className="flex space-x-2">
          {!selectMode ? (
            <>
              <div className="relative">
                <button
                  onClick={() => setFilter(filter === 'all' ? 'unread' : 'all')}
                  className="px-4 py-2 text-sm flex items-center border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  <FiFilter size={16} className="mr-2" />
                  {filter === 'all' ? 'All' : filter === 'unread' ? 'Unread' : 'Read'}
                </button>
              </div>
              
              <button
                onClick={toggleSelectMode}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Select
              </button>
              
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="px-4 py-2 text-sm text-blue-700 border border-blue-700 rounded-md hover:bg-blue-50"
                >
                  Mark all as read
                </button>
              )}
            </>
          ) : (
            <>
              <button
                onClick={selectAll}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Select All
              </button>
              
              <button
                onClick={deselectAll}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Deselect All
              </button>
              
              <button
                onClick={deleteSelected}
                disabled={selectedNotifications.length === 0 || deleteLoading}
                className={`px-4 py-2 text-sm text-white rounded-md ${
                  selectedNotifications.length === 0 || deleteLoading
                    ? 'bg-red-300 cursor-not-allowed'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {deleteLoading ? 'Deleting...' : 'Delete Selected'}
              </button>
              
              <button
                onClick={toggleSelectMode}
                className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
      
      {loading ? (
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white shadow rounded-xl p-8 text-center">
          <div className="mx-auto h-16 w-16 flex items-center justify-center rounded-full bg-blue-100">
            <FiBell size={32} className="text-blue-600" />
          </div>
          <h3 className="mt-4 text-lg font-medium text-gray-900">No Notifications</h3>
          <p className="mt-2 text-sm text-gray-500">
            {filter === 'all' 
              ? "You don't have any notifications yet" 
              : filter === 'unread' 
              ? "You don't have any unread notifications" 
              : "You don't have any read notifications"}
          </p>
          {filter !== 'all' && (
            <div className="mt-6">
              <button
                onClick={() => setFilter('all')}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                View All Notifications
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="bg-white shadow rounded-xl overflow-hidden">
          <div className="divide-y divide-gray-200">
            <AnimatePresence>
              {notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`p-4 hover:bg-gray-50 ${notification.read ? '' : 'bg-blue-50'}`}
                >
                  <div className="flex items-start">
                    {/* Checkbox for select mode */}
                    {selectMode && (
                      <div className="mr-3 pt-1">
                        <input
                          type="checkbox"
                          checked={selectedNotifications.includes(notification.id)}
                          onChange={() => toggleSelectNotification(notification.id)}
                          className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                        />
                      </div>
                    )}
                    
                    {/* Notification Icon */}
                    <div className="mr-4 mt-1">
                      <div className={`p-2 rounded-full ${notification.read ? 'bg-gray-100' : 'bg-blue-100'}`}>
                        {getNotificationIcon(notification.type)}
                      </div>
                    </div>
                    
                    {/* Notification Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <p className={`text-sm font-medium ${notification.read ? 'text-gray-900' : 'text-blue-800'}`}>
                          {notification.title}
                        </p>
                        <div className="flex items-center space-x-2 ml-2">
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {getRelativeTime(notification.timestamp)}
                          </span>
                          
                          {!selectMode && !notification.read && (
                            <button
                              onClick={() => markAsRead(notification.id)}
                              className="p-1 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100"
                              title="Mark as read"
                            >
                              <FiCheckCircle size={16} />
                            </button>
                          )}
                        </div>
                      </div>
                      
                      <p className="mt-1 text-sm text-gray-600">
                        {notification.message}
                      </p>
                      
                      {notification.actionUrl && (
                        <div className="mt-2">
                          <Link
                            to={notification.actionUrl}
                            className="inline-flex items-center text-xs font-medium text-blue-600 hover:text-blue-800"
                          >
                            {notification.actionText || "View Details"} →
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
          
          {/* Demo Note - This is just for demonstration */}
          <div className="p-4 bg-yellow-50 border-t border-yellow-100">
            <div className="flex items-start">
              <FiAlertCircle size={20} className="text-yellow-500 mr-2 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-yellow-700">
                <strong>Demo Note:</strong> In a production environment, these notifications would be populated from your backend. 
                Connect this component to your notification system for real-time updates.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}