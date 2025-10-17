import React, { useState, useEffect } from 'react';
import { FiCalendar, FiChevronLeft, FiChevronRight, FiClock, FiPlus, FiTrash2, FiEdit, FiX, FiCheck, FiAlertCircle, FiBook, FiFileText, FiMessageCircle, FiCheckSquare, FiCalendar as FiCalendarIcon } from 'react-icons/fi/index.js';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext.js';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameDay, isSameMonth } from 'date-fns';
import { collection, query, where, getDocs, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase.js';

export default function LearnIQCalendar() {
  const { currentUser } = useAuth();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [currentEvent, setCurrentEvent] = useState({
    title: '',
    description: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: '09:00',
    endTime: '10:00',
    type: 'study',
    reminder: '15',
    color: '#4F46E5'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState(null);
  
  // Define event types
  const eventTypes = [
    { value: 'study', label: 'Study Session', icon: <FiBook size={16} /> },
    { value: 'assignment', label: 'Assignment', icon: <FiFileText size={16} /> },
    { value: 'meeting', label: 'Meeting', icon: <FiMessageCircle size={16} /> },
    { value: 'reminder', label: 'Reminder', icon: <FiClock size={16} /> }
  ];
  
  // Color options for events
  const colorOptions = [
    { value: '#4F46E5', label: 'Indigo' },
    { value: '#2563EB', label: 'Blue' },
    { value: '#DC2626', label: 'Red' },
    { value: '#16A34A', label: 'Green' },
    { value: '#CA8A04', label: 'Yellow' },
    { value: '#9333EA', label: 'Purple' },
    { value: '#EC4899', label: 'Pink' },
    { value: '#0D9488', label: 'Teal' }
  ];
  
  // Reminder options
  const reminderOptions = [
    { value: '0', label: 'No reminder' },
    { value: '15', label: '15 minutes before' },
    { value: '30', label: '30 minutes before' },
    { value: '60', label: '1 hour before' },
    { value: '1440', label: '1 day before' }
  ];
  
  useEffect(() => {
    fetchEvents();
  }, [currentUser, currentMonth]);
  
  const fetchEvents = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      
      // Calculate start and end dates for query
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      
      const eventsRef = collection(db, 'studentEvents');
      const eventsQuery = query(
        eventsRef,
        where('studentId', '==', currentUser.uid),
        where('date', '>=', monthStart),
        where('date', '<=', monthEnd)
      );
      
      const querySnapshot = await getDocs(eventsQuery);
      
      // Also fetch assignments with deadlines in this month
      const assignmentsRef = collection(db, 'assignments');
      const assignmentsQuery = query(
        assignmentsRef,
        where('assignedToStudentId', '==', currentUser.uid),
        where('dueDate', '>=', monthStart),
        where('dueDate', '<=', monthEnd)
      );
      
      const assignmentsSnapshot = await getDocs(assignmentsQuery);
      
      // Convert assignments to events
      const assignmentEvents = assignmentsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: data.title || 'Assignment',
          description: data.description || '',
          date: data.dueDate?.toDate() || new Date(),
          startTime: '23:59',
          endTime: '23:59',
          type: 'assignment',
          color: '#DC2626', // Red color for assignments
          isAssignment: true, // Flag to identify assignment events
          status: data.status || 'pending',
          courseId: data.courseId,
          courseName: data.courseName
        };
      });
      
      // Process regular events
      const userEvents = querySnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          date: data.date?.toDate() || new Date()
        };
      });
      
      // Combine both types of events
      setEvents([...userEvents, ...assignmentEvents]);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching events:", error);
      setLoading(false);
    }
  };
  
  const handlePreviousMonth = () => {
    setCurrentMonth(prevMonth => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(newMonth.getMonth() - 1);
      return newMonth;
    });
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(prevMonth => {
      const newMonth = new Date(prevMonth);
      newMonth.setMonth(newMonth.getMonth() + 1);
      return newMonth;
    });
  };
  
  const handleDateSelect = (date) => {
    setSelectedDate(date);
  };
  
  const handleAddEvent = () => {
    setIsEditing(false);
    setCurrentEvent({
      title: '',
      description: '',
      date: format(selectedDate, 'yyyy-MM-dd'),
      startTime: '09:00',
      endTime: '10:00',
      type: 'study',
      reminder: '15',
      color: '#4F46E5'
    });
    setShowModal(true);
  };
  
  const handleEditEvent = (event) => {
    // Don't allow editing of assignment events
    if (event.isAssignment) {
      return;
    }
    
    setIsEditing(true);
    setCurrentEvent({
      id: event.id,
      title: event.title || '',
      description: event.description || '',
      date: format(event.date, 'yyyy-MM-dd'),
      startTime: event.startTime || '09:00',
      endTime: event.endTime || '10:00',
      type: event.type || 'study',
      reminder: event.reminder || '15',
      color: event.color || '#4F46E5'
    });
    setShowModal(true);
  };
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setCurrentEvent(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      // Create event data object
      const eventData = {
        studentId: currentUser.uid,
        title: currentEvent.title,
        description: currentEvent.description,
        date: new Date(currentEvent.date),
        startTime: currentEvent.startTime,
        endTime: currentEvent.endTime,
        type: currentEvent.type,
        reminder: currentEvent.reminder,
        color: currentEvent.color,
        createdAt: new Date()
      };
      
      if (isEditing && currentEvent.id) {
        // Update existing event
        await updateDoc(doc(db, 'studentEvents', currentEvent.id), eventData);
        setNotification({
          type: 'success',
          message: 'Event updated successfully!'
        });
      } else {
        // Add new event
        await addDoc(collection(db, 'studentEvents'), eventData);
        setNotification({
          type: 'success',
          message: 'Event added successfully!'
        });
      }
      
      setShowModal(false);
      fetchEvents(); // Refresh events
      
      // Clear notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } catch (error) {
      console.error("Error saving event:", error);
      setNotification({
        type: 'error',
        message: 'Failed to save event. Please try again.'
      });
      
      // Clear notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    }
  };
  
  const confirmDeleteEvent = (event) => {
    // Don't allow deletion of assignment events
    if (event.isAssignment) {
      return;
    }
    
    setEventToDelete(event);
    setShowDeleteConfirmation(true);
  };
  
  const handleDeleteEvent = async () => {
    if (!eventToDelete || !eventToDelete.id) return;
    
    try {
      await deleteDoc(doc(db, 'studentEvents', eventToDelete.id));
      
      setNotification({
        type: 'success',
        message: 'Event deleted successfully!'
      });
      
      setShowDeleteConfirmation(false);
      fetchEvents(); // Refresh events
      
      // Clear notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    } catch (error) {
      console.error("Error deleting event:", error);
      setNotification({
        type: 'error',
        message: 'Failed to delete event. Please try again.'
      });
      
      // Clear notification after 3 seconds
      setTimeout(() => {
        setNotification(null);
      }, 3000);
    }
  };
  
  // Filter events for selected date
  const selectedDateEvents = events.filter(event => 
    isSameDay(event.date, selectedDate)
  );
  
  // Calculate days to display in calendar
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth)
  });
  
  // Get event icon by type
  const getEventIcon = (type) => {
    const eventType = eventTypes.find(et => et.value === type);
    return eventType ? eventType.icon : <FiCalendarIcon size={16} />;
  };
  
  // Format time to display (e.g., 09:00 -> 9:00 AM)
  const formatTimeDisplay = (timeString) => {
    if (!timeString) return '';
    
    try {
      const [hours, minutes] = timeString.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours % 12 || 12;
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    } catch {
      return timeString;
    }
  };
  
  return (
    <div className="max-w-7xl mx-auto py-6">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Calendar</h1>
          <p className="mt-1 text-sm text-gray-500">
            Manage your schedule, events, and deadlines
          </p>
        </div>
        <button
          onClick={handleAddEvent}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center"
        >
          <FiPlus size={18} className="mr-1" />
          Add Event
        </button>
      </div>
      
      {/* Notification */}
      <AnimatePresence>
        {notification && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 mb-4 rounded-md ${notification.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'} flex items-center justify-between`}
          >
            {notification.type === 'success' ? (
              <FiCheckSquare size={18} className="mr-2" />
            ) : (
              <FiAlertCircle size={18} className="mr-2" />
            )}
            <span>{notification.message}</span>
            <button 
              onClick={() => setNotification(null)}
              className="ml-auto p-1 rounded-full hover:bg-white/50"
            >
              <FiX size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      
      {loading ? (
        <div className="flex justify-center items-center p-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2 bg-white shadow rounded-xl overflow-hidden">
            <div className="p-4 bg-white border-b border-gray-200 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900">
                {format(currentMonth, 'MMMM yyyy')}
              </h2>
              <div className="flex items-center space-x-2">
                <button
                  onClick={handlePreviousMonth}
                  className="p-2 rounded-md hover:bg-gray-100"
                >
                  <FiChevronLeft size={20} />
                </button>
                <button
                  onClick={() => setCurrentMonth(new Date())}
                  className="px-3 py-1 text-sm rounded-md hover:bg-gray-100"
                >
                  Today
                </button>
                <button
                  onClick={handleNextMonth}
                  className="p-2 rounded-md hover:bg-gray-100"
                >
                  <FiChevronRight size={20} />
                </button>
              </div>
            </div>
            
            <div className="bg-white p-4">
              {/* Day names */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar grid */}
              <div className="grid grid-cols-7 gap-1">
                {/* Empty cells for days before the first of the month */}
                {Array.from({ length: new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay() }).map((_, index) => (
                  <div key={`empty-start-${index}`} className="aspect-square p-1 bg-gray-50"></div>
                ))}
                
                {/* Days of the month */}
                {daysInMonth.map((day) => {
                  // Check for events on this day
                  const dayEvents = events.filter(event => isSameDay(event.date, day));
                  
                  return (
                    <div
                      key={day.toISOString()}
                      className={`aspect-square p-1 ${
                        isSameDay(day, selectedDate)
                          ? 'bg-blue-100 rounded-md'
                          : isToday(day)
                          ? 'bg-blue-50 rounded-md'
                          : !isSameMonth(day, currentMonth)
                          ? 'bg-gray-50 text-gray-400'
                          : 'hover:bg-gray-100 cursor-pointer'
                      }`}
                      onClick={() => handleDateSelect(day)}
                    >
                      <div className="h-full flex flex-col">
                        <div className={`text-center text-sm font-medium mb-1 ${
                          isToday(day) ? 'text-blue-600' : ''
                        }`}>
                          {format(day, 'd')}
                        </div>
                        
                        {/* Event indicators */}
                        <div className="flex-grow overflow-hidden">
                          {dayEvents.slice(0, 3).map((event, index) => (
                            <div
                              key={event.id || `event-${index}`}
                              className="w-full h-1.5 rounded-full my-0.5"
                              style={{ backgroundColor: event.color || '#4F46E5' }}
                            ></div>
                          ))}
                          
                          {dayEvents.length > 3 && (
                            <div className="text-xs text-center text-gray-500">
                              +{dayEvents.length - 3} more
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                
                {/* Empty cells for days after the last of the month */}
                {Array.from({ length: (42 - daysInMonth.length - new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay()) % 7 }).map((_, index) => (
                  <div key={`empty-end-${index}`} className="aspect-square p-1 bg-gray-50"></div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Selected Day Events */}
          <div className="bg-white shadow rounded-xl overflow-hidden">
            <div className="p-4 bg-white border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">
                {format(selectedDate, 'EEEE, MMMM d, yyyy')}
                {isToday(selectedDate) && (
                  <span className="ml-2 text-sm bg-blue-100 text-blue-800 py-0.5 px-2 rounded-full">Today</span>
                )}
              </h2>
            </div>
            
            <div className="p-4">
              {selectedDateEvents.length === 0 ? (
                <div className="text-center py-8">
                  <FiCalendarIcon className="h-12 w-12 mx-auto text-gray-400" />
                  <p className="mt-2 text-gray-500">No events scheduled</p>
                  <button
                    onClick={handleAddEvent}
                    className="mt-4 px-4 py-2 text-sm text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50"
                  >
                    Add Event
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  {selectedDateEvents
                    .sort((a, b) => {
                      // First sort by start time
                      if (a.startTime < b.startTime) return -1;
                      if (a.startTime > b.startTime) return 1;
                      return 0;
                    })
                    .map(event => (
                      <div 
                        key={event.id}
                        className="p-3 rounded-lg border-l-4"
                        style={{ borderLeftColor: event.color || '#4F46E5', backgroundColor: `${event.color}10` }}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex items-start">
                            <span className="p-1.5 rounded-md mr-2" style={{ backgroundColor: `${event.color}30` }}>
                              {getEventIcon(event.type)}
                            </span>
                            <div>
                              <h4 className="font-medium text-gray-900">{event.title}</h4>
                              <div className="flex items-center mt-1 text-sm text-gray-600">
                                <FiClock size={14} className="mr-1" />
                                <span>{formatTimeDisplay(event.startTime)} - {formatTimeDisplay(event.endTime)}</span>
                              </div>
                            </div>
                          </div>
                          
                          {/* Actions */}
                          {!event.isAssignment && (
                            <div className="flex space-x-1">
                              <button
                                onClick={() => handleEditEvent(event)}
                                className="p-1 rounded hover:bg-gray-200"
                              >
                                <FiEdit size={16} className="text-gray-500" />
                              </button>
                              <button
                                onClick={() => confirmDeleteEvent(event)}
                                className="p-1 rounded hover:bg-gray-200"
                              >
                                <FiTrash2 size={16} className="text-gray-500" />
                              </button>
                            </div>
                          )}
                        </div>
                        
                        {event.description && (
                          <p className="mt-2 text-sm text-gray-600 pl-8">
                            {event.description}
                          </p>
                        )}
                        
                        {/* Assignment-specific info */}
                        {event.isAssignment && (
                          <div className="mt-2 pl-8">
                            <div className="flex items-center">
                              <span
                                className={`text-xs px-2 py-0.5 rounded-full ${
                                  event.status === 'completed'
                                    ? 'bg-green-100 text-green-800'
                                    : event.status === 'pending'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-red-100 text-red-800'
                                }`}
                              >
                                {event.status === 'completed'
                                  ? 'Completed'
                                  : event.status === 'pending'
                                  ? 'Pending'
                                  : 'Overdue'}
                              </span>
                              
                              {event.courseName && (
                                <span className="ml-2 text-xs text-gray-500">
                                  {event.courseName}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      {/* Add/Edit Event Modal */}
      {showModal && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowModal(false)}></div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10">
                      <FiCalendarIcon className="h-6 w-6 text-blue-600" />
                    </div>
                    <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        {isEditing ? 'Edit Event' : 'Add New Event'}
                      </h3>
                      
                      <div className="mt-4 space-y-4">
                        {/* Event Title */}
                        <div>
                          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                            Title
                          </label>
                          <input
                            type="text"
                            name="title"
                            id="title"
                            value={currentEvent.title}
                            onChange={handleInputChange}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Enter event title"
                          />
                        </div>
                        
                        {/* Event Description */}
                        <div>
                          <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                            Description (optional)
                          </label>
                          <textarea
                            name="description"
                            id="description"
                            value={currentEvent.description}
                            onChange={handleInputChange}
                            rows={3}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            placeholder="Enter event description"
                          />
                        </div>
                        
                        {/* Event Date */}
                        <div>
                          <label htmlFor="date" className="block text-sm font-medium text-gray-700">
                            Date
                          </label>
                          <input
                            type="date"
                            name="date"
                            id="date"
                            value={currentEvent.date}
                            onChange={handleInputChange}
                            required
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          />
                        </div>
                        
                        {/* Event Time */}
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="startTime" className="block text-sm font-medium text-gray-700">
                              Start Time
                            </label>
                            <input
                              type="time"
                              name="startTime"
                              id="startTime"
                              value={currentEvent.startTime}
                              onChange={handleInputChange}
                              required
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </div>
                          <div>
                            <label htmlFor="endTime" className="block text-sm font-medium text-gray-700">
                              End Time
                            </label>
                            <input
                              type="time"
                              name="endTime"
                              id="endTime"
                              value={currentEvent.endTime}
                              onChange={handleInputChange}
                              required
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                            />
                          </div>
                        </div>
                        
                        {/* Event Type */}
                        <div>
                          <label htmlFor="type" className="block text-sm font-medium text-gray-700">
                            Event Type
                          </label>
                          <select
                            name="type"
                            id="type"
                            value={currentEvent.type}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          >
                            {eventTypes.map(type => (
                              <option key={type.value} value={type.value}>
                                {type.label}
                              </option>
                            ))}
                          </select>
                        </div>
                        
                        {/* Event Color */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Color
                          </label>
                          <div className="flex flex-wrap gap-2">
                            {colorOptions.map(color => (
                              <div
                                key={color.value}
                                onClick={() => setCurrentEvent(prev => ({ ...prev, color: color.value }))}
                                className={`w-8 h-8 rounded-full cursor-pointer flex items-center justify-center ${
                                  currentEvent.color === color.value ? 'ring-2 ring-offset-2 ring-gray-500' : ''
                                }`}
                                style={{ backgroundColor: color.value }}
                              >
                                {currentEvent.color === color.value && (
                                  <FiCheckSquare size={16} className="text-white" />
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        {/* Reminder */}
                        <div>
                          <label htmlFor="reminder" className="block text-sm font-medium text-gray-700">
                            Reminder
                          </label>
                          <select
                            name="reminder"
                            id="reminder"
                            value={currentEvent.reminder}
                            onChange={handleInputChange}
                            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                          >
                            {reminderOptions.map(option => (
                              <option key={option.value} value={option.value}>
                                {option.label}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-blue-600 text-base font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    {isEditing ? 'Update Event' : 'Add Event'}
                  </button>
                  <button
                    type="button"
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                    onClick={() => setShowModal(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      
      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" onClick={() => setShowDeleteConfirmation(false)}></div>
            
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10">
                    <FiAlertCircle className="h-6 w-6 text-red-600" />
                  </div>
                  <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      Delete Event
                    </h3>
                    <div className="mt-2">
                      <p className="text-sm text-gray-500">
                        Are you sure you want to delete this event? This action cannot be undone.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={handleDeleteEvent}
                >
                  Delete
                </button>
                <button
                  type="button"
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  onClick={() => setShowDeleteConfirmation(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}