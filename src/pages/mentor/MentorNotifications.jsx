import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase.js';
import { useAuth } from '../../contexts/AuthContext.js';
import { FiBell, FiBookOpen, FiCalendar, FiCheckCircle, FiClock, FiMessageCircle, FiTrash2, FiFilter, FiX, FiAlertCircle, FiBook, FiUsers, FiFileText } from 'react-icons/fi/index.js';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import Navbar from '../../components/mentor/Navbar.js';

export default function MentorNotifications() {
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
        collection(db, 'mentorNotifications'),
        where('mentorId', '==', currentUser.uid),
        orderBy('timestamp', 'desc')
      );
      
      if (filter === 'unread') {
        notificationsQuery = query(
          collection(db, 'mentorNotifications'),
          where('mentorId', '==', currentUser.uid),
          where('read', '==', false),
          orderBy('timestamp', 'desc')
        );
      } else if (filter === 'read') {
        notificationsQuery = query(
          collection(db, 'mentorNotifications'),
          where('mentorId', '==', currentUser.uid),
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
      await updateDoc(doc(db, 'mentorNotifications', notificationId), {
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
        updateDoc(doc(db, 'mentorNotifications', notification.id), { read: true })
      );
      
      await Promise.all(updatePromises);
      
      // Refresh notifications
      await fetchNotifications();
    } catch (error) {
      console.error("Error marking all as read:", error);
      setLoading(false);
    }
  };
  
  const deleteNotification = async (notificationId) => {
    try {
      // In a real app, you might want to soft delete or archive
      // For now, we'll just remove from local state
      setNotifications(prevNotifications => 
        prevNotifications.filter(notification => notification.id !== notificationId)
      );
    } catch (error) {
      console.error("Error deleting notification:", error);
    }
  };
  
  const deleteSelected = async () => {
    try {
      setDeleteLoading(true);
      
      // Remove selected notifications from local state
      setNotifications(prevNotifications => 
        prevNotifications.filter(notification => !selectedNotifications.includes(notification.id))
      );
      
      setSelectedNotifications([]);
      setSelectMode(false);
      setDeleteLoading(false);
    } catch (error) {
      console.error("Error deleting notifications:", error);
      setDeleteLoading(false);
    }
  };
  
  const toggleSelectNotification = (notificationId) => {
    setSelectedNotifications(prev => {
      if (prev.includes(notificationId)) {
        return prev.filter(id => id !== notificationId);
      } else {
        return [...prev, notificationId];
      }
    });
  };
  
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'assignment':
        return <FiFileText className="text-blue-600" />;
      case 'submission':
        return <FiCheckCircle className="text-green-600" />;
      case 'question':
        return <FiMessageCircle className="text-purple-600" />;
      case 'student':
        return <FiUsers className="text-indigo-600" />;
      case 'course':
        return <FiBook className="text-orange-600" />;
      case 'deadline':
        return <FiAlertCircle className="text-red-600" />;
      default:
        return <FiBell className="text-gray-600" />;
    }
  };
  
  const formatTimestamp = (timestamp) => {
    const now = new Date();
    const diff = now - timestamp;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    if (days < 7) return `${days}d ago`;
    
    return timestamp.toLocaleDateString();
  };
  
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Notifications</h1>
              <p className="mt-1 text-sm text-gray-500">
                {unreadCount > 0 ? `${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}` : 'All caught up!'}
              </p>
            </div>
            
            <div className="flex items-center gap-2">
              {selectMode ? (
                <>
                  <button
                    onClick={deleteSelected}
                    disabled={selectedNotifications.length === 0 || deleteLoading}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <FiTrash2 className="inline mr-2" />
                    Delete ({selectedNotifications.length})
                  </button>
                  <button
                    onClick={() => {
                      setSelectMode(false);
                      setSelectedNotifications([]);
                    }}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  {unreadCount > 0 && (
                    <button
                      onClick={markAllAsRead}
                      className="px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                    >
                      Mark all as read
                    </button>
                  )}
                  <button
                    onClick={() => setSelectMode(true)}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Select
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Filter Tabs */}
        <div className="bg-white rounded-xl p-2 shadow-sm border border-gray-100 mb-6 inline-flex">
          {['all', 'unread', 'read'].map((filterOption) => (
            <button
              key={filterOption}
              onClick={() => setFilter(filterOption)}
              className={`px-6 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === filterOption
                  ? 'bg-indigo-600 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
              {filterOption === 'unread' && unreadCount > 0 && (
                <span className="ml-2 px-2 py-0.5 bg-indigo-500 text-white text-xs rounded-full">
                  {unreadCount}
                </span>
              )}
            </button>
          ))}
        </div>
        
        {/* Notifications List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading notifications...</p>
          </div>
        ) : notifications.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
            <FiBell className="text-5xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No notifications</h3>
            <p className="text-gray-600">
              {filter === 'all' 
                ? "You're all caught up! No notifications at the moment." 
                : `No ${filter} notifications.`}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            <AnimatePresence>
              {notifications.map((notification, index) => (
                <motion.div
                  key={notification.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ delay: index * 0.05 }}
                  onClick={() => !selectMode && !notification.read && markAsRead(notification.id)}
                  className={`bg-white rounded-xl p-4 shadow-sm border transition-all cursor-pointer ${
                    notification.read 
                      ? 'border-gray-100' 
                      : 'border-indigo-200 bg-indigo-50/50'
                  } ${
                    selectMode && selectedNotifications.includes(notification.id)
                      ? 'ring-2 ring-indigo-500'
                      : 'hover:shadow-md'
                  }`}
                >
                  <div className="flex items-start gap-4">
                    {selectMode && (
                      <input
                        type="checkbox"
                        checked={selectedNotifications.includes(notification.id)}
                        onChange={() => toggleSelectNotification(notification.id)}
                        className="mt-1 h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500"
                      />
                    )}
                    
                    <div className={`p-3 rounded-lg ${
                      notification.read ? 'bg-gray-100' : 'bg-white'
                    }`}>
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <h3 className={`text-sm font-semibold ${
                            notification.read ? 'text-gray-700' : 'text-gray-900'
                          }`}>
                            {notification.title}
                          </h3>
                          <p className={`text-sm mt-1 ${
                            notification.read ? 'text-gray-500' : 'text-gray-600'
                          }`}>
                            {notification.message}
                          </p>
                          <p className="text-xs text-gray-400 mt-2">
                            {formatTimestamp(notification.timestamp)}
                          </p>
                        </div>
                        
                        {!selectMode && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notification.id);
                            }}
                            className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          >
                            <FiX />
                          </button>
                        )}
                      </div>
                      
                      {notification.actionUrl && (
                        <Link
                          to={notification.actionUrl}
                          onClick={(e) => e.stopPropagation()}
                          className="inline-flex items-center mt-3 text-sm text-indigo-600 hover:text-indigo-700 font-medium"
                        >
                          View Details
                          <FiCheckCircle className="ml-1" />
                        </Link>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}
