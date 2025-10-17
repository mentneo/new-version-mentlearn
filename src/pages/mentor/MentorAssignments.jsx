import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, where, getDocs, doc, getDoc, orderBy, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebase.js';
import { useAuth } from '../../contexts/AuthContext.js';
import { FiCalendar, FiClock, FiAlertCircle, FiCheckCircle, FiFileText, FiFilter, FiSearch, FiChevronRight, FiX, FiChevronDown, FiUpload, FiUsers, FiEdit, FiTrash2, FiPlus } from 'react-icons/fi/index.js';
import { motion, AnimatePresence } from 'framer-motion';

export default function MentorAssignments() {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [assignments, setAssignments] = useState([]);
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCourse, setFilterCourse] = useState('all');
  const [filterMenuOpen, setFilterMenuOpen] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  
  // Debug: Log current user
  useEffect(() => {
    if (currentUser) {
      console.log('👤 Current User:', currentUser.uid);
      console.log('📧 Email:', currentUser.email);
    } else {
      console.log('⚠️  No current user logged in');
    }
  }, [currentUser]);
  
  // Create assignment form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    points: 100,
    courseId: '',
    selectedStudents: []
  });
  const [courses, setCourses] = useState([]);
  const [mentorStudents, setMentorStudents] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  
  // Fetch mentor's students
  useEffect(() => {
    const fetchMentorStudents = async () => {
      if (!currentUser) return;
      
      try {
        // First, try to fetch from mentorStudents collection
        const studentsQuery = query(
          collection(db, "mentorStudents"),
          where("mentorId", "==", currentUser.uid)
        );
        
        const studentsSnapshot = await getDocs(studentsQuery);
        
        if (studentsSnapshot.docs.length > 0) {
          // If mentorStudents records exist, use them
          const studentsData = await Promise.all(
            studentsSnapshot.docs.map(async (docSnap) => {
              const data = docSnap.data();
              
              // Fetch student details
              const studentDoc = await getDoc(doc(db, "users", data.studentId));
              const studentData = studentDoc.data();
              
              return {
                id: data.studentId,
                name: studentData?.displayName || studentData?.email || 'Unknown',
                email: studentData?.email || '',
                ...data
              };
            })
          );
          
          setMentorStudents(studentsData);
        } else {
          // If no mentorStudents records, fetch all users with student role
          console.log("No mentorStudents records found, fetching all students as fallback");
          
          const usersQuery = query(
            collection(db, "users"),
            where("role", "==", "student")
          );
          
          const usersSnapshot = await getDocs(usersQuery);
          const studentsData = usersSnapshot.docs.map(docSnap => {
            const data = docSnap.data();
            return {
              id: docSnap.id,
              name: data.displayName || data.email || 'Unknown Student',
              email: data.email || '',
              role: data.role,
              createdAt: data.createdAt
            };
          });
          
          setMentorStudents(studentsData);
          console.log(`Found ${studentsData.length} students from users collection`);
        }
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };
    
    fetchMentorStudents();
  }, [currentUser]);
  
  // Fetch courses
  useEffect(() => {
    const fetchCourses = async () => {
      if (!currentUser) return;
      
      try {
        const coursesQuery = query(collection(db, "courses"));
        const coursesSnapshot = await getDocs(coursesQuery);
        const coursesData = coursesSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setCourses(coursesData);
      } catch (error) {
        console.error("Error fetching courses:", error);
      }
    };
    
    fetchCourses();
  }, [currentUser]);
  
  // Fetch assignments created by mentor
  useEffect(() => {
    const fetchAssignments = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        
        console.log('🔍 Fetching assignments for mentor:', currentUser.uid);
        
        // Fetch all assignments created by this mentor (without orderBy to avoid index issues)
        const assignmentsQuery = query(
          collection(db, "assignments"),
          where("mentorId", "==", currentUser.uid)
        );
        
        const assignmentsSnapshot = await getDocs(assignmentsQuery);
        
        console.log('📦 Raw assignments found:', assignmentsSnapshot.size);
        
        // Create a set of student IDs to fetch student details
        const studentIds = new Set();
        
        // Process assignment data
        const assignmentsData = await Promise.all(
          assignmentsSnapshot.docs.map(async (docSnap) => {
            const data = docSnap.data();
            
            console.log('📝 Processing assignment:', docSnap.id, data.title);
            
            // Fetch submissions for this assignment
            const submissionsQuery = query(
              collection(db, "submissions"),
              where("assignmentId", "==", docSnap.id)
            );
            
            const submissionsSnapshot = await getDocs(submissionsQuery);
            const submissions = submissionsSnapshot.docs.map(doc => ({
              id: doc.id,
              ...doc.data()
            }));
            
            // Count submission stats
            const totalStudents = data.studentIds?.length || 0;
            const submittedCount = submissions.length;
            const gradedCount = submissions.filter(s => s.grade !== undefined).length;
            
            return {
              id: docSnap.id,
              ...data,
              totalStudents,
              submittedCount,
              gradedCount,
              submissions,
              dueDate: data.dueDate?.toDate() || new Date()
            };
          })
        );
        
        // Sort assignments by due date (newest first) in JavaScript
        assignmentsData.sort((a, b) => b.dueDate - a.dueDate);
        
        setAssignments(assignmentsData);
        console.log('📝 Fetched assignments:', assignmentsData.length);
        console.log('Assignments data:', assignmentsData);
        setLoading(false);
      } catch (error) {
        console.error("❌ Error fetching assignments:", error);
        console.error("Error details:", error.message);
        console.error("Error code:", error.code);
        alert('Error loading assignments. Check console for details.');
        setLoading(false);
      }
    };
    
    fetchAssignments();
  }, [currentUser]);
  
  // Filter assignments
  const filteredAssignments = assignments.filter(assignment => {
    const matchesSearch = assignment.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         assignment.description?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const now = new Date();
    const dueDate = assignment.dueDate;
    
    let matchesStatus = true;
    if (filterStatus === 'active') {
      matchesStatus = dueDate >= now;
    } else if (filterStatus === 'overdue') {
      matchesStatus = dueDate < now;
    } else if (filterStatus === 'graded') {
      matchesStatus = assignment.gradedCount === assignment.totalStudents && assignment.totalStudents > 0;
    } else if (filterStatus === 'pending') {
      matchesStatus = assignment.gradedCount < assignment.totalStudents;
    }
    
    return matchesSearch && matchesStatus;
  });
  
  // Debug: Log filtering results
  useEffect(() => {
    console.log('📊 Total assignments:', assignments.length);
    console.log('🔍 Filtered assignments:', filteredAssignments.length);
    console.log('Filter status:', filterStatus);
    console.log('Search query:', searchQuery);
  }, [assignments, filteredAssignments.length, filterStatus, searchQuery]);
  
  // Get assignment status
  const getAssignmentStatus = (assignment) => {
    const now = new Date();
    const dueDate = assignment.dueDate;
    
    if (assignment.gradedCount === assignment.totalStudents && assignment.totalStudents > 0) {
      return { label: 'Completed', color: 'green', icon: <FiCheckCircle /> };
    } else if (dueDate < now) {
      return { label: 'Overdue', color: 'red', icon: <FiAlertCircle /> };
    } else {
      return { label: 'Active', color: 'blue', icon: <FiClock /> };
    }
  };
  
  // Format date
  const formatDate = (date) => {
    if (!date) return 'N/A';
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };
  
  // Get days remaining
  const getDaysRemaining = (dueDate) => {
    const now = new Date();
    const diff = dueDate - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days < 0) {
      return `${Math.abs(days)} days overdue`;
    } else if (days === 0) {
      return 'Due today';
    } else if (days === 1) {
      return '1 day remaining';
    } else {
      return `${days} days remaining`;
    }
  };
  
  // Handle form change
  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Toggle student selection
  const toggleStudentSelection = (studentId) => {
    setFormData(prev => ({
      ...prev,
      selectedStudents: prev.selectedStudents.includes(studentId)
        ? prev.selectedStudents.filter(id => id !== studentId)
        : [...prev.selectedStudents, studentId]
    }));
  };
  
  // Select all students
  const toggleAllStudents = () => {
    if (formData.selectedStudents.length === mentorStudents.length) {
      setFormData(prev => ({ ...prev, selectedStudents: [] }));
    } else {
      setFormData(prev => ({ 
        ...prev, 
        selectedStudents: mentorStudents.map(s => s.id) 
      }));
    }
  };
  
  // Handle create assignment
  const handleCreateAssignment = async (e) => {
    e.preventDefault();
    
    if (!formData.title || !formData.description || !formData.dueDate || formData.selectedStudents.length === 0) {
      alert('Please fill in all required fields and select at least one student');
      return;
    }
    
    try {
      setSubmitting(true);
      
      console.log('📝 Creating assignment with data:', {
        title: formData.title,
        studentIds: formData.selectedStudents,
        dueDate: formData.dueDate
      });
      
      // Create assignment
      const assignmentRef = await addDoc(collection(db, "assignments"), {
        title: formData.title,
        description: formData.description,
        dueDate: new Date(formData.dueDate),
        points: parseInt(formData.points) || 100,
        courseId: formData.courseId || null,
        mentorId: currentUser.uid,
        studentIds: formData.selectedStudents,
        status: 'active',
        createdAt: serverTimestamp()
      });
      
      console.log('✅ Assignment created with ID:', assignmentRef.id);
      
      // Create notifications for each selected student
      for (const studentId of formData.selectedStudents) {
        await addDoc(collection(db, "notifications"), {
          userId: studentId,
          type: "assignment",
          title: "New Assignment",
          message: `You have a new assignment: ${formData.title}`,
          read: false,
          timestamp: serverTimestamp(),
          link: "/student/assignments",
          fromUserId: currentUser.uid,
          assignmentId: assignmentRef.id
        });
      }
      
      console.log('✅ Notifications sent to', formData.selectedStudents.length, 'students');
      
      // Reset form
      setFormData({
        title: '',
        description: '',
        dueDate: '',
        points: 100,
        courseId: '',
        selectedStudents: []
      });
      
      setShowCreateModal(false);
      setSubmitting(false);
      
      // Refresh assignments list by re-fetching
      alert('Assignment created successfully!');
      window.location.reload();
    } catch (error) {
      console.error("❌ Error creating assignment:", error);
      alert("Failed to create assignment. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">Assignments</h1>
              <p className="text-gray-600 text-lg">
                Create, manage, and grade student assignments
              </p>
            </div>
            
            <div className="mt-4 md:mt-0">
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold shadow-lg"
              >
                <FiPlus className="mr-2" />
                Create Assignment
              </motion.button>
            </div>
          </div>
        </motion.div>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-indigo-100 rounded-lg">
                <FiFileText className="text-indigo-600 h-6 w-6" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">{assignments.length}</h3>
            <p className="text-sm text-gray-600 font-medium">Total Assignments</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <FiClock className="text-blue-600 h-6 w-6" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {assignments.filter(a => a.dueDate >= new Date()).length}
            </h3>
            <p className="text-sm text-gray-600 font-medium">Active</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <FiAlertCircle className="text-yellow-600 h-6 w-6" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {assignments.reduce((sum, a) => sum + (a.submittedCount - a.gradedCount), 0)}
            </h3>
            <p className="text-sm text-gray-600 font-medium">Pending Grading</p>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <FiCheckCircle className="text-green-600 h-6 w-6" />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-1">
              {assignments.filter(a => a.gradedCount === a.totalStudents && a.totalStudents > 0).length}
            </h3>
            <p className="text-sm text-gray-600 font-medium">Completed</p>
          </motion.div>
        </div>
        
        {/* Search and Filters */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-xl shadow-sm p-6 mb-6"
        >
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search assignments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>
            
            {/* Filter Dropdown */}
            <div className="relative">
              <button
                onClick={() => setFilterMenuOpen(!filterMenuOpen)}
                className="inline-flex items-center px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <FiFilter className="mr-2" />
                Filter: {filterStatus === 'all' ? 'All' : filterStatus.charAt(0).toUpperCase() + filterStatus.slice(1)}
                <FiChevronDown className="ml-2" />
              </button>
              
              <AnimatePresence>
                {filterMenuOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10"
                  >
                    {['all', 'active', 'overdue', 'pending', 'graded'].map((status) => (
                      <button
                        key={status}
                        onClick={() => {
                          setFilterStatus(status);
                          setFilterMenuOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 hover:bg-gray-50 transition-colors first:rounded-t-lg last:rounded-b-lg ${
                          filterStatus === status ? 'bg-indigo-50 text-indigo-600' : 'text-gray-700'
                        }`}
                      >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                      </button>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
        
        {/* Assignments List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading assignments...</p>
          </div>
        ) : filteredAssignments.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
            <FiFileText className="text-5xl text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No assignments found</h3>
            <p className="text-gray-600 mb-6">
              {searchQuery || filterStatus !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Create your first assignment to get started'}
            </p>
            {!searchQuery && filterStatus === 'all' && (
              <button
                onClick={() => setShowCreateModal(true)}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                <FiPlus className="mr-2" />
                Create Assignment
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredAssignments.map((assignment, index) => {
              const status = getAssignmentStatus(assignment);
              
              return (
                <motion.div
                  key={assignment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-lg font-semibold text-gray-900">{assignment.title}</h3>
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium bg-${status.color}-100 text-${status.color}-700`}>
                          {status.icon}
                          {status.label}
                        </span>
                      </div>
                      
                      <p className="text-gray-600 text-sm mb-4">{assignment.description}</p>
                      
                      <div className="flex flex-wrap items-center gap-6 text-sm">
                        <div className="flex items-center text-gray-600">
                          <FiCalendar className="mr-2" />
                          <span>Due: {formatDate(assignment.dueDate)}</span>
                        </div>
                        
                        <div className="flex items-center text-gray-600">
                          <FiClock className="mr-2" />
                          <span>{getDaysRemaining(assignment.dueDate)}</span>
                        </div>
                        
                        <div className="flex items-center text-gray-600">
                          <FiUsers className="mr-2" />
                          <span>{assignment.totalStudents} students assigned</span>
                        </div>
                      </div>
                      
                      {/* Submission Progress */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-600">Submission Progress</span>
                          <span className="font-medium text-gray-900">
                            {assignment.submittedCount}/{assignment.totalStudents} submitted
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full transition-all"
                            style={{ width: `${assignment.totalStudents > 0 ? (assignment.submittedCount / assignment.totalStudents) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </div>
                      
                      {/* Grading Progress */}
                      <div className="mt-3">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <span className="text-gray-600">Grading Progress</span>
                          <span className="font-medium text-gray-900">
                            {assignment.gradedCount}/{assignment.submittedCount} graded
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full transition-all"
                            style={{ width: `${assignment.submittedCount > 0 ? (assignment.gradedCount / assignment.submittedCount) * 100 : 0}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="ml-4 flex items-center gap-2">
                      <Link
                        to={`/mentor/assignments/${assignment.id}`}
                        className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                      >
                        <FiChevronRight className="text-xl" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
        
        {/* My Students Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-12"
        >
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">My Students</h2>
            <p className="text-gray-600">
              All students under your mentorship ({mentorStudents.length} total)
            </p>
          </div>
          
          {mentorStudents.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center shadow-sm border border-gray-100">
              <FiUsers className="text-5xl text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Loading students...</h3>
              <p className="text-gray-600 mb-4">
                If no students appear, you may need to create student-mentor relationships in Firestore.
              </p>
              <details className="text-left max-w-2xl mx-auto mt-4 bg-gray-50 rounded-lg p-4">
                <summary className="cursor-pointer text-sm font-medium text-gray-700 hover:text-gray-900">
                  How to add students (Developer Info)
                </summary>
                <div className="mt-3 text-xs text-gray-600 space-y-2">
                  <p><strong>Option 1:</strong> Create documents in the <code className="bg-gray-200 px-1 rounded">mentorStudents</code> collection:</p>
                  <pre className="bg-gray-800 text-gray-100 p-2 rounded overflow-x-auto">
{`{
  mentorId: "your-mentor-uid",
  studentId: "student-uid",
  createdAt: Timestamp,
  status: "active"
}`}
                  </pre>
                  <p className="mt-2"><strong>Option 2:</strong> The system will automatically show all users with <code className="bg-gray-200 px-1 rounded">role: "student"</code> as a fallback.</p>
                  <p className="mt-2"><strong>Check Console:</strong> Open browser console (F12) to see debug messages.</p>
                </div>
              </details>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mentorStudents.map((student, index) => (
                <motion.div
                  key={student.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-4">
                    {/* Avatar */}
                    <div className="flex-shrink-0">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-semibold text-lg">
                        {student.name?.charAt(0)?.toUpperCase() || 'S'}
                      </div>
                    </div>
                    
                    {/* Student Info */}
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-semibold text-gray-900 truncate mb-1">
                        {student.name || 'Unknown Student'}
                      </h3>
                      <p className="text-sm text-gray-600 truncate mb-3">
                        {student.email}
                      </p>
                      
                      {/* Quick Stats */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Assignments</span>
                          <span className="font-medium text-gray-900">
                            {assignments.filter(a => a.studentIds?.includes(student.id)).length}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Submissions</span>
                          <span className="font-medium text-gray-900">
                            {assignments.reduce((sum, a) => 
                              sum + (a.submissions?.filter(s => s.studentId === student.id).length || 0), 0
                            )}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">Status</span>
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700">
                            Active
                          </span>
                        </div>
                      </div>
                      
                      {/* Action Button */}
                      <Link
                        to={`/mentor/student/${student.id}`}
                        className="mt-4 w-full inline-flex items-center justify-center px-3 py-2 bg-indigo-50 text-indigo-600 rounded-lg hover:bg-indigo-100 transition-colors text-sm font-medium"
                      >
                        View Profile
                        <FiChevronRight className="ml-1" />
                      </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
      
      {/* Create Assignment Modal */}
      <AnimatePresence>
        {showCreateModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
            onClick={() => !submitting && setShowCreateModal(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            >
              {/* Modal Header */}
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Create New Assignment</h2>
                  <p className="text-sm text-gray-600 mt-1">Assign tasks to your students</p>
                </div>
                <button
                  onClick={() => !submitting && setShowCreateModal(false)}
                  disabled={submitting}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                >
                  <FiX className="text-xl text-gray-500" />
                </button>
              </div>
              
              {/* Modal Body */}
              <form onSubmit={handleCreateAssignment} className="p-6 space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Assignment Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleFormChange}
                    placeholder="e.g., Week 5 Project Submission"
                    required
                    disabled={submitting}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
                
                {/* Description */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleFormChange}
                    placeholder="Provide detailed instructions for the assignment..."
                    rows="4"
                    required
                    disabled={submitting}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none disabled:bg-gray-50 disabled:text-gray-500"
                  />
                </div>
                
                {/* Date and Points Row */}
                <div className="grid grid-cols-2 gap-4">
                  {/* Due Date */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Due Date *
                    </label>
                    <input
                      type="datetime-local"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleFormChange}
                      required
                      disabled={submitting}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                  
                  {/* Points */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Points
                    </label>
                    <input
                      type="number"
                      name="points"
                      value={formData.points}
                      onChange={handleFormChange}
                      min="0"
                      max="1000"
                      disabled={submitting}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                    />
                  </div>
                </div>
                
                {/* Course (Optional) */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Course (Optional)
                  </label>
                  <select
                    name="courseId"
                    value={formData.courseId}
                    onChange={handleFormChange}
                    disabled={submitting}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:bg-gray-50 disabled:text-gray-500"
                  >
                    <option value="">Select a course (optional)</option>
                    {courses.map(course => (
                      <option key={course.id} value={course.id}>
                        {course.title || course.name}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Student Selection */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-semibold text-gray-700">
                      Assign to Students * ({formData.selectedStudents.length} selected)
                    </label>
                    <button
                      type="button"
                      onClick={toggleAllStudents}
                      disabled={submitting}
                      className="text-sm text-indigo-600 hover:text-indigo-700 font-medium disabled:opacity-50"
                    >
                      {formData.selectedStudents.length === mentorStudents.length ? 'Deselect All' : 'Select All'}
                    </button>
                  </div>
                  
                  <div className="border border-gray-300 rounded-lg max-h-64 overflow-y-auto">
                    {mentorStudents.length === 0 ? (
                      <div className="p-8 text-center text-gray-500">
                        <FiUsers className="text-4xl mx-auto mb-2 text-gray-300" />
                        <p>No students found</p>
                        <p className="text-xs mt-1">Add students to your mentorship first</p>
                      </div>
                    ) : (
                      mentorStudents.map(student => (
                        <label
                          key={student.id}
                          className="flex items-center p-4 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 last:border-b-0"
                        >
                          <input
                            type="checkbox"
                            checked={formData.selectedStudents.includes(student.id)}
                            onChange={() => toggleStudentSelection(student.id)}
                            disabled={submitting}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded disabled:opacity-50"
                          />
                          <div className="ml-3 flex-1">
                            <p className="text-sm font-medium text-gray-900">{student.name}</p>
                            <p className="text-xs text-gray-500">{student.email}</p>
                          </div>
                        </label>
                      ))
                    )}
                  </div>
                </div>
                
                {/* Action Buttons */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    disabled={submitting}
                    className="px-6 py-3 text-gray-700 hover:bg-gray-100 rounded-lg transition-colors font-medium disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting || formData.selectedStudents.length === 0}
                    className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                  >
                    {submitting ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                        Creating...
                      </>
                    ) : (
                      <>
                        <FiPlus className="mr-2" />
                        Create Assignment
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
