import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/firebase.js';
import { useAuth } from '../../contexts/AuthContext.js';
import { FiBookOpen, FiClock, FiCheckCircle, FiPlay, FiFileText, FiUsers, FiMessageSquare, FiChevronRight, FiLock, FiAlertTriangle, FiChevronDown, FiExternalLink, FiDownload, FiBook } from 'react-icons/fi/index.js';
import { motion } from 'framer-motion';
import DiscussionForum from '../../components/student/DiscussionForum.js';

export default function LearnIQCourseView() {
  const { courseId } = useParams();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [progress, setProgress] = useState(0);
  const [modules, setModules] = useState([]);
  const [activeModuleIndex, setActiveModuleIndex] = useState(null); // Changed to null - no module expanded by default
  const [instructor, setInstructor] = useState(null);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('content'); // content, discussion, resources
  
  useEffect(() => {
    const fetchCourseData = async () => {
      if (!courseId || !currentUser) return;
      
      try {
        setLoading(true);
        console.log("Fetching course data for courseId:", courseId);
        
        // Fetch course data
        const courseDoc = await getDoc(doc(db, "courses", courseId));
        if (!courseDoc.exists()) {
          console.error("Course not found with ID:", courseId);
          setError("Course not found");
          setLoading(false);
          return;
        }
        
        const courseData = { id: courseDoc.id, ...courseDoc.data() };
        console.log("Course data fetched:", courseData);
        setCourse(courseData);
        
        // Fetch instructor data
        if (courseData.instructorId || courseData.creatorId) {
          const instructorId = courseData.instructorId || courseData.creatorId;
          const instructorDoc = await getDoc(doc(db, "users", instructorId));
          if (instructorDoc.exists()) {
            setInstructor(instructorDoc.data());
            console.log("Instructor data fetched:", instructorDoc.data());
          }
        }
        
        // Fetch progress data - check both 'progress' and 'enrollment' collections
        const progressQuery = query(
          collection(db, "progress"),
          where("studentId", "==", currentUser.uid),
          where("courseId", "==", courseId)
        );
        
        const progressSnapshot = await getDocs(progressQuery);
        let progressData = null;
        
        if (!progressSnapshot.empty) {
          progressData = progressSnapshot.docs[0].data();
          setProgress(progressData.percentComplete || progressData.progress || 0);
          console.log("✅ Progress data from 'progress' collection:", progressData);
        } else {
          // Also check enrollments collection for progress
          console.log("⚠️ No progress record found in 'progress' collection, checking 'enrollments'...");
          const enrollmentQuery = query(
            collection(db, "enrollments"),
            where("studentId", "==", currentUser.uid),
            where("courseId", "==", courseId)
          );
          const enrollmentSnapshot = await getDocs(enrollmentQuery);
          
          if (!enrollmentSnapshot.empty) {
            const enrollmentData = enrollmentSnapshot.docs[0].data();
            setProgress(enrollmentData.progress || 0);
            console.log("✅ Progress data from 'enrollments' collection:", enrollmentData);
          } else {
            console.log("⚠️ No progress data found in either collection");
          }
        }
        
        // Fetch modules and lessons - Try different collection names
        let modulesData = [];
        
        // Try "modules" collection
        const modulesQuery = query(
          collection(db, "modules"),
          where("courseId", "==", courseId)
        );
        
        const modulesSnapshot = await getDocs(modulesQuery);
        modulesData = modulesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        
        // If no modules found, try alternate structure (courseModules or content)
        if (modulesData.length === 0) {
          console.log("No modules found in 'modules' collection, checking courseData.modules");
          
          // Check if modules are embedded in course document
          if (courseData.modules && Array.isArray(courseData.modules)) {
            modulesData = courseData.modules.map((module, index) => ({
              ...module,
              id: module.id || `module-${index}`,
              order: module.order || index
            }));
          } else if (courseData.content && Array.isArray(courseData.content)) {
            modulesData = courseData.content.map((module, index) => ({
              ...module,
              id: module.id || `module-${index}`,
              title: module.title || module.name || `Module ${index + 1}`,
              order: module.order || index
            }));
          }
        }
        
        console.log("Modules found:", modulesData.length, modulesData);
        
        // Sort modules by order
        modulesData.sort((a, b) => (a.order || 0) - (b.order || 0));
        
        // Fetch lessons for each module
        const modulesWithLessons = await Promise.all(modulesData.map(async (module) => {
          let lessons = [];
          
          // Try fetching lessons from lessons collection
          const lessonsQuery = query(
            collection(db, "lessons"),
            where("moduleId", "==", module.id)
          );
          
          const lessonsSnapshot = await getDocs(lessonsQuery);
          lessons = lessonsSnapshot.docs.map(doc => ({ 
            id: doc.id, 
            ...doc.data(),
            isCompleted: false
          }));
          
          // If no lessons found in collection, check if they're embedded in module
          // Support both "lessons" and "topics" field names
          if (lessons.length === 0) {
            const embeddedLessons = module.lessons || module.topics || [];
            
            if (Array.isArray(embeddedLessons) && embeddedLessons.length > 0) {
              lessons = embeddedLessons.map((lesson, index) => ({
                ...lesson,
                id: lesson.id || `lesson-${module.id}-${index}`,
                isCompleted: false,
                order: lesson.order || index,
                // Handle different field names for title
                title: lesson.title || lesson.name || lesson.lessonTitle || `Lesson ${index + 1}`,
                // Handle different duration field names (seconds, minutes, length, etc.)
                duration: lesson.duration || lesson.videoDuration || lesson.length || lesson.time || 0,
                // Handle video URL field names (NOT content - that's for text!)
                videoUrl: lesson.videoUrl || lesson.video || lesson.url || lesson.videoLink || lesson.link || '',
                // Keep content separate
                content: lesson.content || '',
                // Handle type field
                type: lesson.type || lesson.lessonType || (lesson.videoUrl || lesson.video ? 'video' : 'lesson')
              }));
            }
          } else {
            // Also normalize field names for lessons from collection
            lessons = lessons.map((lesson, index) => ({
              ...lesson,
              title: lesson.title || lesson.name || lesson.lessonTitle || `Lesson ${index + 1}`,
              duration: lesson.duration || lesson.videoDuration || lesson.length || lesson.time || 0,
              videoUrl: lesson.videoUrl || lesson.video || lesson.url || lesson.videoLink || lesson.link || '',
              content: lesson.content || '',
              type: lesson.type || lesson.lessonType || (lesson.videoUrl || lesson.video ? 'video' : 'lesson')
            }));
          }
          
          console.log(`Module "${module.title}" lessons:`, lessons);
          
          // Sort lessons by order
          lessons.sort((a, b) => (a.order || 0) - (b.order || 0));
          
          return {
            ...module,
            lessons,
            title: module.title || module.name || 'Untitled Module',
            description: module.description || ''
          };
        }));
        
        console.log("Modules with lessons:", modulesWithLessons);
        
        // Fetch completed lessons - check both studentId and userId fields for backward compatibility
        const completedLessonsQuery = query(
          collection(db, "completedLessons"),
          where("studentId", "==", currentUser.uid),
          where("courseId", "==", courseId)
        );
        
        const completedLessonsSnapshot = await getDocs(completedLessonsQuery);
        let completedLessons = completedLessonsSnapshot.docs.map(doc => doc.data().lessonId);
        
        // Also check for userId field if no results with studentId
        if (completedLessons.length === 0) {
          console.log("⚠️ No completed lessons found with 'studentId', checking 'userId' field...");
          const completedLessonsQuery2 = query(
            collection(db, "completedLessons"),
            where("userId", "==", currentUser.uid),
            where("courseId", "==", courseId)
          );
          const completedLessonsSnapshot2 = await getDocs(completedLessonsQuery2);
          const additionalCompletedLessons = completedLessonsSnapshot2.docs.map(doc => doc.data().lessonId);
          completedLessons = [...completedLessons, ...additionalCompletedLessons];
        }
        
        console.log(`✅ Found ${completedLessons.length} completed lessons:`, completedLessons);
        
        // Mark completed lessons
        const updatedModules = modulesWithLessons.map((module, index) => {
          const updatedLessons = module.lessons.map(lesson => ({
            ...lesson,
            isCompleted: completedLessons.includes(lesson.id)
          }));
          
          const completedCount = updatedLessons.filter(lesson => lesson.isCompleted).length;
          const totalCount = updatedLessons.length;
          const isModuleCompleted = totalCount > 0 && completedCount === totalCount;
          
          // Lock module if previous module is not completed (except first module)
          let isLocked = false;
          if (index > 0) {
            const previousModule = modulesWithLessons[index - 1];
            const previousModuleLessons = previousModule.lessons || [];
            const previousCompletedCount = previousModuleLessons.filter(
              lesson => completedLessons.includes(lesson.id)
            ).length;
            const previousTotalCount = previousModuleLessons.length;
            
            // Lock if previous module is not fully completed
            isLocked = previousTotalCount === 0 || previousCompletedCount < previousTotalCount;
          }
          
          return {
            ...module,
            lessons: updatedLessons,
            completedCount,
            totalCount,
            isCompleted: isModuleCompleted,
            isLocked
          };
        });
        
        setModules(updatedModules);
        console.log("Final modules data with lock status:", updatedModules);
        
        // Auto-expand the first unlocked module
        const firstUnlockedIndex = updatedModules.findIndex(m => !m.isLocked);
        if (firstUnlockedIndex !== -1) {
          setActiveModuleIndex(firstUnlockedIndex);
        }
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching course data:", error);
        setError("Failed to load course data: " + error.message);
        setLoading(false);
      }
    };
    
    fetchCourseData();
  }, [courseId, currentUser]);
  
  // Format duration from minutes/seconds to hours and minutes
  const formatDuration = (duration) => {
    if (!duration || duration === 0) return "N/A";
    
    // If duration is very large, assume it's in seconds, convert to minutes
    let minutes = duration;
    if (duration > 500) {
      minutes = Math.floor(duration / 60);
    }
    
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    
    if (hours === 0) {
      return `${mins} min`;
    } else if (mins === 0) {
      return `${hours} hr`;
    } else {
      return `${hours} hr ${mins} min`;
    }
  };
  
  // Toggle module expansion
  const toggleModule = (index) => {
    if (activeModuleIndex === index) {
      setActiveModuleIndex(null);
    } else {
      setActiveModuleIndex(index);
    }
  };
  
  if (loading) {
    return (
      <div className="flex justify-center items-center p-10">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-lg shadow-sm mb-6">
        <div className="flex">
          <div className="flex-shrink-0">
            <FiAlertTriangle className="h-6 w-6 text-red-400" aria-hidden="true" />
          </div>
          <div className="ml-3">
            <h3 className="text-sm font-medium text-red-800">{error}</h3>
            <div className="mt-2 text-sm text-red-700">
              <p>Please try again later or contact support.</p>
            </div>
            <div className="mt-4">
              <div className="-mx-2 -my-1.5 flex">
                <Link
                  to="/student/courses"
                  className="px-2 py-1.5 rounded-md text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Back to My Courses
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return null;
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Course Header */}
      <div className="bg-white shadow rounded-2xl overflow-hidden mb-6">
        <div className="h-64 bg-gray-200 relative">
          {course.coverImageUrl ? (
            <img
              src={course.coverImageUrl}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-400 to-indigo-500 flex items-center justify-center">
              <FiBook size={64} className="text-white opacity-25" />
            </div>
          )}
          
          {/* Overlay gradient */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
          
          {/* Course title overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <h1 className="text-2xl md:text-3xl font-bold">{course.title}</h1>
            <div className="flex items-center mt-2 text-white/90">
              <FiClock size={18} className="mr-1" />
              <span className="text-sm mr-4">{formatDuration(course.totalDuration || 0)}</span>
              <FiFileText size={18} className="mr-1" />
              <span className="text-sm mr-4">{course.lessonCount || 0} lessons</span>
              <FiUsers size={18} className="mr-1" />
              <span className="text-sm">{course.enrollmentCount || 0} students</span>
            </div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="px-6 py-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-gray-700">Your Progress</h3>
            <span className="text-sm font-medium text-blue-700">{progress}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div 
              className="bg-blue-600 h-2.5 rounded-full" 
              style={{ width: `${progress}%` }}
            ></div>
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('content')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'content'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FiBookOpen className="inline-block mr-2" size={18} />
              Course Content
            </button>
            <button
              onClick={() => setActiveTab('discussion')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'discussion'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FiMessageSquare className="inline-block mr-2" size={18} />
              Discussion Forum
            </button>
            <button
              onClick={() => setActiveTab('resources')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'resources'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <FiDownload className="inline-block mr-2" size={18} />
              Resources
            </button>
          </nav>
        </div>
      </div>
      
      {/* Tab Content */}
      {activeTab === 'content' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main content - Course Curriculum */}
          <div className="lg:col-span-2 space-y-6">
          <div className="bg-white shadow rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Course Curriculum</h2>
              <p className="text-sm text-gray-500 mt-1">
                {modules.length > 0 ? (
                  <>
                    {modules.reduce((acc, module) => acc + (module.lessons?.length || 0), 0)} lessons 
                    ({formatDuration(course.totalDuration || 0)} total length)
                    <span className="ml-2 text-xs text-blue-600">• Click module to view lessons</span>
                  </>
                ) : (
                  "No curriculum available yet"
                )}
              </p>
            </div>
            
            <div className="divide-y divide-gray-100">
              {modules.length === 0 ? (
                <div className="px-6 py-12 text-center">
                  <FiBook size={48} className="mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Content Yet</h3>
                  <p className="text-sm text-gray-500">
                    The course content is being prepared. Please check back later.
                  </p>
                </div>
              ) : (
                modules.map((module, index) => (
                <div key={module.id} className={`cursor-pointer ${module.isLocked ? 'opacity-60' : ''}`}>
                  <div 
                    className={`px-6 py-4 ${module.isLocked ? 'cursor-not-allowed bg-gray-100' : 'hover:bg-gray-50'}`}
                    onClick={() => !module.isLocked && toggleModule(index)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="mr-3 flex-shrink-0">
                          {module.isLocked ? (
                            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                              <FiLock size={16} className="text-gray-500" />
                            </div>
                          ) : module.completedCount === module.totalCount && module.totalCount > 0 ? (
                            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                              <FiCheckCircle size={16} className="text-green-600" />
                            </div>
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-xs font-medium text-blue-800">
                                {module.completedCount}/{module.totalCount}
                              </span>
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-sm font-semibold text-gray-900">
                              {module.title || 'Untitled Module'}
                            </h3>
                            {module.isLocked && (
                              <span className="text-xs text-gray-500 bg-gray-200 px-2 py-0.5 rounded">
                                Locked
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {module.isLocked ? (
                              <span className="text-orange-600">Complete the previous module to unlock</span>
                            ) : (
                              <>
                                {module.lessons?.length || 0} {module.lessons?.length === 1 ? 'lesson' : 'lessons'}
                                {module.duration && module.duration > 0 && ` • ${formatDuration(module.duration)}`}
                                {!module.duration && module.lessons?.length > 0 && (
                                  <span className="ml-1 text-orange-500">• Duration not set</span>
                                )}
                              </>
                            )}
                          </p>
                        </div>
                      </div>
                      {!module.isLocked && (
                        <FiChevronDown 
                          size={20} 
                          className={`text-gray-400 transition-transform duration-200 ${activeModuleIndex === index ? 'transform rotate-180' : ''}`} 
                        />
                      )}
                    </div>
                  </div>
                  
                  {/* Expanded module content */}
                  {activeModuleIndex === index && !module.isLocked && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.3 }}
                      className="bg-gray-50 px-6 py-3 border-t border-gray-100"
                    >
                      <ul className="space-y-2">
                        {module.lessons && module.lessons.length > 0 ? (
                          module.lessons.map((lesson) => (
                            <li key={lesson.id} className="text-sm">
                              <Link
                                to={`/student/student-dashboard/course/${courseId}/lesson/${lesson.id}`}
                                className="flex items-center p-2 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <div className="mr-3 flex-shrink-0">
                                  {lesson.isCompleted ? (
                                    <FiCheckCircle size={16} className="text-green-500" />
                                  ) : lesson.locked ? (
                                    <FiLock size={16} className="text-gray-400" />
                                  ) : (
                                    <FiPlay size={16} className="text-blue-500" />
                                  )}
                                </div>
                                <div className="flex-1">
                                  <span className="text-sm font-medium text-gray-900">
                                    {lesson.title || 'Untitled Lesson'}
                                  </span>
                                  <div className="flex items-center text-xs text-gray-500 mt-0.5">
                                    <FiClock size={12} className="mr-1" />
                                    <span>{formatDuration(lesson.duration || 0)}</span>
                                    {(lesson.type || lesson.videoUrl) && (
                                      <span className="ml-2 px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">
                                        {lesson.type === 'video' || lesson.videoUrl ? '🎥 Video' : 
                                         lesson.type === 'quiz' ? '📝 Quiz' : 
                                         lesson.type === 'assignment' ? '📋 Assignment' : 
                                         lesson.type === 'reading' ? '📖 Reading' :
                                         '📚 Lesson'}
                                      </span>
                                    )}
                                  </div>
                                </div>
                                <FiChevronRight size={16} className="text-gray-400" />
                              </Link>
                            </li>
                          ))
                        ) : (
                          <li className="text-sm text-gray-500 italic p-2">
                            No lessons in this module yet
                          </li>
                        )}
                      </ul>
                    </motion.div>
                  )}
                </div>
                ))
              )}
            </div>
          </div>
          
          {/* Course description */}
          <div className="bg-white shadow rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">About This Course</h2>
            </div>
            <div className="px-6 py-4">
              <div className="prose prose-sm max-w-none text-gray-600">
                <p>{course.description || "No description available"}</p>
              </div>
              
              {course.prerequisites && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">Prerequisites</h3>
                  <div className="prose prose-sm max-w-none text-gray-600">
                    <p>{course.prerequisites}</p>
                  </div>
                </div>
              )}
              
              {course.learningOutcomes && Array.isArray(course.learningOutcomes) && course.learningOutcomes.length > 0 && (
                <div className="mt-6">
                  <h3 className="text-sm font-semibold text-gray-900 mb-2">What You'll Learn</h3>
                  <ul className="space-y-1 text-sm text-gray-600">
                    {course.learningOutcomes.map((outcome, index) => (
                      <li key={index} className="flex items-start">
                        <FiCheckCircle size={16} className="mr-2 text-green-500 flex-shrink-0 mt-0.5" />
                        <span>{outcome}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Instructor info */}
          {instructor && (
            <div className="bg-white shadow rounded-2xl overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900">Instructor</h2>
              </div>
              <div className="p-6">
                <div className="flex items-center">
                  <img
                    src={instructor.photoURL || "https://via.placeholder.com/128?text=Instructor"}
                    alt={instructor.displayName || "Instructor"}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                  <div className="ml-4">
                    <h3 className="text-base font-semibold text-gray-900">
                      {instructor.displayName || "Instructor Name"}
                    </h3>
                    <p className="text-sm text-gray-500">{instructor.title || "Instructor"}</p>
                  </div>
                </div>
                {instructor.bio && (
                  <div className="mt-4 text-sm text-gray-600">
                    <p>{instructor.bio}</p>
                  </div>
                )}
                <div className="mt-4">
                  <Link
                    to={`/instructor/${instructor.uid}`}
                    className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-500"
                  >
                    View Profile
                    <FiExternalLink size={14} className="ml-1" />
                  </Link>
                </div>
              </div>
            </div>
          )}
          
          {/* Course details */}
          <div className="bg-white shadow rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-100">
              <h2 className="text-xl font-bold text-gray-900">Course Details</h2>
            </div>
            <div className="divide-y divide-gray-100">
              <div className="px-6 py-4 flex justify-between items-center">
                <span className="text-sm text-gray-500">Language</span>
                <span className="text-sm font-medium text-gray-900">{course.language || "English"}</span>
              </div>
              <div className="px-6 py-4 flex justify-between items-center">
                <span className="text-sm text-gray-500">Last Updated</span>
                <span className="text-sm font-medium text-gray-900">
                  {course.updatedAt ? new Date(course.updatedAt.toDate()).toLocaleDateString() : "N/A"}
                </span>
              </div>
              <div className="px-6 py-4 flex justify-between items-center">
                <span className="text-sm text-gray-500">Level</span>
                <span className="text-sm font-medium text-gray-900">{course.level || "All Levels"}</span>
              </div>
              {course.certification && (
                <div className="px-6 py-4 flex justify-between items-center">
                  <span className="text-sm text-gray-500">Certification</span>
                  <span className="text-sm font-medium text-green-700 flex items-center">
                    <FiCheckCircle size={16} className="mr-1" />
                    Available
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      )}

      {/* Discussion Forum Tab */}
      {activeTab === 'discussion' && (
        <DiscussionForum courseId={courseId} />
      )}

      {/* Resources Tab */}
      {activeTab === 'resources' && (
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="bg-white rounded-xl shadow-sm p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Course Resources</h2>
            <div className="text-center py-12">
              <FiDownload size={48} className="mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No resources yet</h3>
              <p className="text-gray-600">Course materials and downloadable resources will appear here.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}