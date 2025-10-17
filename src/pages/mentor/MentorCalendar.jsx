import React, { useState, useEffect } from 'react';
import { FiCalendar, FiChevronLeft, FiChevronRight, FiClock, FiPlus, FiTrash2, FiEdit, FiX, FiCheck, FiAlertCircle, FiBook, FiFileText, FiMessageCircle, FiUsers, FiVideo } from 'react-icons/fi/index.js';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext.js';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isToday, isSameDay, isSameMonth, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import { collection, query, where, getDocs, doc, updateDoc, addDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase.js';
import Navbar from '../../components/mentor/Navbar.js';

export default function MentorCalendar() {
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
    type: 'meeting',
    students: [],
    reminder: '15',
    color: '#4F46E5'
  });
  const [isEditing, setIsEditing] = useState(false);
  const [notification, setNotification] = useState(null);
  const [viewMode, setViewMode] = useState('month'); // 'month', 'week', 'day'
  
  // Define event types
  const eventTypes = [
    { value: 'meeting', label: 'Student Meeting', icon: <FiUsers size={16} /> },
    { value: 'session', label: 'Teaching Session', icon: <FiBook size={16} /> },
    { value: 'deadline', label: 'Assignment Deadline', icon: <FiFileText size={16} /> },
    { value: 'review', label: 'Review Session', icon: <FiMessageCircle size={16} /> },
    { value: 'webinar', label: 'Webinar', icon: <FiVideo size={16} /> }
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
      
      const eventsRef = collection(db, 'mentorEvents');
      const eventsQuery = query(
        eventsRef,
        where('mentorId', '==', currentUser.uid),
        where('date', '>=', monthStart),
        where('date', '<=', monthEnd)
      );
      
      const querySnapshot = await getDocs(eventsQuery);
      
      // Also fetch assignment deadlines
      const assignmentsRef = collection(db, 'assignments');
      const assignmentsQuery = query(
        assignmentsRef,
        where('mentorId', '==', currentUser.uid),
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
          description: `Assignment deadline for ${data.title}`,
          date: data.dueDate?.toDate() || new Date(),
          type: 'deadline',
          color: '#DC2626',
          isAssignment: true
        };
      });
      
      const calendarEvents = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        date: doc.data().date?.toDate() || new Date()
      }));
      
      setEvents([...calendarEvents, ...assignmentEvents]);
      setLoading(false);
    } catch (error) {
      console.error("Error fetching events:", error);
      setLoading(false);
    }
  };
  
  const getDaysInMonth = () => {
    const start = startOfWeek(startOfMonth(currentMonth));
    const end = endOfWeek(endOfMonth(currentMonth));
    return eachDayOfInterval({ start, end });
  };
  
  const getEventsForDate = (date) => {
    return events.filter(event => isSameDay(new Date(event.date), date));
  };
  
  const handlePreviousMonth = () => {
    setCurrentMonth(subMonths(currentMonth, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentMonth(addMonths(currentMonth, 1));
  };
  
  const handleDateClick = (date) => {
    setSelectedDate(date);
  };
  
  const handleAddEvent = () => {
    setCurrentEvent({
      title: '',
      description: '',
      date: format(selectedDate, 'yyyy-MM-dd'),
      startTime: '09:00',
      endTime: '10:00',
      type: 'meeting',
      students: [],
      reminder: '15',
      color: '#4F46E5'
    });
    setIsEditing(false);
    setShowModal(true);
  };
  
  const handleEditEvent = (event) => {
    setCurrentEvent({
      ...event,
      date: format(new Date(event.date), 'yyyy-MM-dd')
    });
    setIsEditing(true);
    setShowModal(true);
  };
  
  const handleDeleteEvent = (event) => {
    setEventToDelete(event);
    setShowDeleteConfirmation(true);
  };
  
  const confirmDelete = async () => {
    if (!eventToDelete) return;
    
    try {
      await deleteDoc(doc(db, 'mentorEvents', eventToDelete.id));
      setEvents(events.filter(e => e.id !== eventToDelete.id));
      setShowDeleteConfirmation(false);
      setEventToDelete(null);
      showNotification('Event deleted successfully', 'success');
    } catch (error) {
      console.error("Error deleting event:", error);
      showNotification('Failed to delete event', 'error');
    }
  };
  
  const handleSaveEvent = async () => {
    if (!currentEvent.title.trim()) {
      showNotification('Please enter an event title', 'error');
      return;
    }
    
    try {
      const eventData = {
        ...currentEvent,
        mentorId: currentUser.uid,
        date: new Date(currentEvent.date),
        updatedAt: new Date()
      };
      
      if (isEditing && currentEvent.id) {
        await updateDoc(doc(db, 'mentorEvents', currentEvent.id), eventData);
        setEvents(events.map(e => e.id === currentEvent.id ? { ...eventData, id: currentEvent.id } : e));
        showNotification('Event updated successfully', 'success');
      } else {
        const docRef = await addDoc(collection(db, 'mentorEvents'), {
          ...eventData,
          createdAt: new Date()
        });
        setEvents([...events, { ...eventData, id: docRef.id }]);
        showNotification('Event created successfully', 'success');
      }
      
      setShowModal(false);
      setCurrentEvent({
        title: '',
        description: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        startTime: '09:00',
        endTime: '10:00',
        type: 'meeting',
        students: [],
        reminder: '15',
        color: '#4F46E5'
      });
    } catch (error) {
      console.error("Error saving event:", error);
      showNotification('Failed to save event', 'error');
    }
  };
  
  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };
  
  const getEventIcon = (type) => {
    const eventType = eventTypes.find(t => t.value === type);
    return eventType ? eventType.icon : <FiCalendar />;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <Navbar />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
              <p className="mt-1 text-sm text-gray-500">
                Manage your schedule and student sessions
              </p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <button
                onClick={handleAddEvent}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <FiPlus className="mr-2" />
                Add Event
              </button>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              {/* Calendar Header */}
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">
                  {format(currentMonth, 'MMMM yyyy')}
                </h2>
                
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePreviousMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FiChevronLeft className="text-gray-600" />
                  </button>
                  <button
                    onClick={() => setCurrentMonth(new Date())}
                    className="px-4 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                  >
                    Today
                  </button>
                  <button
                    onClick={handleNextMonth}
                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FiChevronRight className="text-gray-600" />
                  </button>
                </div>
              </div>
              
              {/* Days of week */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>
              
              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-2">
                {getDaysInMonth().map((date, index) => {
                  const dayEvents = getEventsForDate(date);
                  const isCurrentMonth = isSameMonth(date, currentMonth);
                  const isSelected = isSameDay(date, selectedDate);
                  const isCurrentDay = isToday(date);
                  
                  return (
                    <motion.button
                      key={index}
                      onClick={() => handleDateClick(date)}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      className={`
                        relative min-h-[80px] p-2 rounded-lg border transition-all
                        ${isCurrentMonth ? 'bg-white' : 'bg-gray-50'}
                        ${isSelected ? 'ring-2 ring-indigo-500 border-indigo-500' : 'border-gray-200'}
                        ${isCurrentDay ? 'bg-indigo-50' : ''}
                        hover:border-indigo-300
                      `}
                    >
                      <div className={`
                        text-sm font-medium mb-1
                        ${isCurrentDay ? 'text-indigo-600' : isCurrentMonth ? 'text-gray-900' : 'text-gray-400'}
                      `}>
                        {format(date, 'd')}
                      </div>
                      
                      <div className="space-y-1">
                        {dayEvents.slice(0, 2).map(event => (
                          <div
                            key={event.id}
                            className="text-xs px-1 py-0.5 rounded truncate"
                            style={{ backgroundColor: event.color + '20', color: event.color }}
                          >
                            {event.title}
                          </div>
                        ))}
                        {dayEvents.length > 2 && (
                          <div className="text-xs text-gray-500">
                            +{dayEvents.length - 2} more
                          </div>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          </div>
          
          {/* Events Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Events for {format(selectedDate, 'MMM d, yyyy')}
              </h3>
              
              <div className="space-y-3">
                {getEventsForDate(selectedDate).length === 0 ? (
                  <div className="text-center py-8">
                    <FiCalendar className="text-4xl text-gray-300 mx-auto mb-2" />
                    <p className="text-gray-500 text-sm">No events scheduled</p>
                    <button
                      onClick={handleAddEvent}
                      className="mt-3 text-sm text-indigo-600 hover:text-indigo-700"
                    >
                      Add an event
                    </button>
                  </div>
                ) : (
                  getEventsForDate(selectedDate).map(event => (
                    <motion.div
                      key={event.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-all"
                      style={{ borderLeftColor: event.color, borderLeftWidth: '4px' }}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            {getEventIcon(event.type)}
                            <h4 className="font-medium text-gray-900 text-sm">{event.title}</h4>
                          </div>
                          
                          {event.description && (
                            <p className="text-xs text-gray-600 mb-2">{event.description}</p>
                          )}
                          
                          {event.startTime && event.endTime && (
                            <div className="flex items-center text-xs text-gray-500">
                              <FiClock className="mr-1" />
                              {event.startTime} - {event.endTime}
                            </div>
                          )}
                        </div>
                        
                        {!event.isAssignment && (
                          <div className="flex items-center gap-1 ml-2">
                            <button
                              onClick={() => handleEditEvent(event)}
                              className="p-1 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded transition-colors"
                            >
                              <FiEdit size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteEvent(event)}
                              className="p-1 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                            >
                              <FiTrash2 size={14} />
                            </button>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  ))
                )}
              </div>
            </div>
            
            {/* Upcoming Events */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mt-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Events</h3>
              
              <div className="space-y-3">
                {events
                  .filter(e => new Date(e.date) >= new Date())
                  .sort((a, b) => new Date(a.date) - new Date(b.date))
                  .slice(0, 5)
                  .map(event => (
                    <div
                      key={event.id}
                      className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: event.color }}
                      ></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">{event.title}</p>
                        <p className="text-xs text-gray-500">
                          {format(new Date(event.date), 'MMM d')}
                          {event.startTime && ` • ${event.startTime}`}
                        </p>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
        
        {/* Event Modal */}
        <AnimatePresence>
          {showModal && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowModal(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
              >
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-semibold text-gray-900">
                    {isEditing ? 'Edit Event' : 'Create Event'}
                  </h3>
                  <button
                    onClick={() => setShowModal(false)}
                    className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                  >
                    <FiX />
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Title *
                    </label>
                    <input
                      type="text"
                      value={currentEvent.title}
                      onChange={(e) => setCurrentEvent({ ...currentEvent, title: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter event title"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      value={currentEvent.description}
                      onChange={(e) => setCurrentEvent({ ...currentEvent, description: e.target.value })}
                      rows={3}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Enter event description"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Event Type
                    </label>
                    <select
                      value={currentEvent.type}
                      onChange={(e) => setCurrentEvent({ ...currentEvent, type: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {eventTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date
                    </label>
                    <input
                      type="date"
                      value={currentEvent.date}
                      onChange={(e) => setCurrentEvent({ ...currentEvent, date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Start Time
                      </label>
                      <input
                        type="time"
                        value={currentEvent.startTime}
                        onChange={(e) => setCurrentEvent({ ...currentEvent, startTime: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        End Time
                      </label>
                      <input
                        type="time"
                        value={currentEvent.endTime}
                        onChange={(e) => setCurrentEvent({ ...currentEvent, endTime: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Color
                    </label>
                    <div className="flex gap-2">
                      {colorOptions.map(color => (
                        <button
                          key={color.value}
                          onClick={() => setCurrentEvent({ ...currentEvent, color: color.value })}
                          className={`w-8 h-8 rounded-full transition-all ${
                            currentEvent.color === color.value ? 'ring-2 ring-offset-2 ring-indigo-500' : ''
                          }`}
                          style={{ backgroundColor: color.value }}
                        />
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reminder
                    </label>
                    <select
                      value={currentEvent.reminder}
                      onChange={(e) => setCurrentEvent({ ...currentEvent, reminder: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      {reminderOptions.map(option => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                      ))}
                    </select>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSaveEvent}
                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    {isEditing ? 'Update' : 'Create'} Event
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Delete Confirmation Modal */}
        <AnimatePresence>
          {showDeleteConfirmation && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              onClick={() => setShowDeleteConfirmation(false)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="bg-white rounded-xl shadow-xl max-w-md w-full p-6"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-red-100 rounded-full">
                    <FiAlertCircle className="text-red-600 text-xl" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">Delete Event</h3>
                    <p className="text-sm text-gray-600 mt-1">
                      Are you sure you want to delete this event? This action cannot be undone.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowDeleteConfirmation(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={confirmDelete}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  >
                    Delete
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Notification */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -50 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -50 }}
              className={`fixed top-4 right-4 px-6 py-3 rounded-lg shadow-lg ${
                notification.type === 'success' ? 'bg-green-500' : 'bg-red-500'
              } text-white z-50`}
            >
              <div className="flex items-center gap-2">
                {notification.type === 'success' ? <FiCheck /> : <FiX />}
                {notification.message}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
