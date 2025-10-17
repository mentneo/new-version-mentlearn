import React, { useState, useEffect, useRef } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { FiChevronRight, FiPlay, FiCheckCircle, FiX, FiMessageSquare, FiChevronLeft, FiPause, FiVolumeX, FiVolume2, FiVolume1, FiMaximize, FiDownload, FiExternalLink, FiThumbsUp, FiThumbsDown, FiList } from 'react-icons/fi/index.js';
import { motion } from 'framer-motion';
import { useAuth } from '../../contexts/AuthContext.js';
import { collection, query, where, getDocs, doc, getDoc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/firebase.js';

export default function LearnIQLessonView() {
  const { courseId, lessonId } = useParams();
  const { currentUser } = useAuth();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  
  const [loading, setLoading] = useState(true);
  const [course, setCourse] = useState(null);
  const [lesson, setLesson] = useState(null);
  const [module, setModule] = useState(null);
  const [allLessons, setAllLessons] = useState([]);
  const [currentLessonIndex, setCurrentLessonIndex] = useState(0);
  const [showNotes, setShowNotes] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [notes, setNotes] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [error, setError] = useState(null);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [isCompleted, setIsCompleted] = useState(false);
  const [feedback, setFeedback] = useState(null);
  
  // Helper function to detect video type and convert URL
  const getVideoEmbedInfo = (url) => {
    if (!url) return { type: 'none', embedUrl: '' };
    
    // YouTube detection and conversion
    // Supports: youtube.com/watch?v=, youtu.be/, youtube.com/embed/
    const youtubeRegex = /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    
    if (youtubeMatch) {
      const videoId = youtubeMatch[1];
      return {
        type: 'youtube',
        embedUrl: `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`
      };
    }
    
    // Vimeo detection and conversion
    // Supports: vimeo.com/123456, player.vimeo.com/video/123456
    const vimeoRegex = /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/;
    const vimeoMatch = url.match(vimeoRegex);
    
    if (vimeoMatch) {
      const videoId = vimeoMatch[1];
      return {
        type: 'vimeo',
        embedUrl: `https://player.vimeo.com/video/${videoId}`
      };
    }
    
    // Direct video file (mp4, webm, etc.)
    if (url.match(/\.(mp4|webm|ogg)(\?.*)?$/i)) {
      return {
        type: 'direct',
        embedUrl: url
      };
    }
    
    // Default: assume it's a direct URL
    return {
      type: 'direct',
      embedUrl: url
    };
  };
  
  const videoInfo = lesson?.videoUrl ? getVideoEmbedInfo(lesson.videoUrl) : { type: 'none', embedUrl: '' };
  
  // Temporary debug logging for video
  if (lesson) {
    console.log("=== VIDEO INFO DEBUG ===");
    console.log("Lesson videoUrl:", lesson.videoUrl);
    console.log("Video info type:", videoInfo.type);
    console.log("Video embed URL:", videoInfo.embedUrl);
  }
  
  // Fetch lesson data
  useEffect(() => {
    const fetchLessonData = async () => {
      if (!lessonId || !courseId || !currentUser) return;
      
      try {
        setLoading(true);
        
        // Fetch course data first
        const courseDoc = await getDoc(doc(db, "courses", courseId));
        if (!courseDoc.exists()) {
          setError("Course not found");
          setLoading(false);
          return;
        }
        
        const courseData = { id: courseDoc.id, ...courseDoc.data() };
        setCourse(courseData);
        
        // Check if course has embedded modules with topics/lessons
        let allLessonsData = [];
        let foundLesson = null;
        let foundModule = null;
        
        if (courseData.modules && Array.isArray(courseData.modules)) {
          // Course has embedded modules structure
          courseData.modules.forEach((mod, moduleIndex) => {
            const moduleId = mod.id || `module-${moduleIndex}`;
            const topics = mod.topics || mod.lessons || [];
            
            topics.forEach((topic, topicIndex) => {
              const topicId = topic.id || `topic-${moduleId}-${topicIndex}`;
              const lessonData = {
                id: topicId,
                moduleId: moduleId,
                moduleName: mod.title || mod.name || `Module ${moduleIndex + 1}`,
                moduleOrder: mod.order || moduleIndex,
                order: topic.order || topicIndex,
                title: topic.title || topic.name || `Lesson ${topicIndex + 1}`,
                type: topic.type || 'video',
                videoUrl: topic.videoUrl || topic.video || topic.url || topic.videoLink || '',
                content: topic.content || '',
                description: topic.description || '',
                duration: topic.duration || topic.videoDuration || 0,
                ...topic
              };
              
              allLessonsData.push(lessonData);
              
              // Check if this is the lesson we're looking for
              if (topicId === lessonId) {
                foundLesson = lessonData;
                foundModule = { id: moduleId, ...mod };
              }
            });
          });
        } else {
          // Try fetching from separate collections (legacy structure)
          try {
            const lessonDoc = await getDoc(doc(db, "lessons", lessonId));
            if (lessonDoc.exists()) {
              foundLesson = { id: lessonDoc.id, ...lessonDoc.data() };
              
              // Fetch module data
              if (foundLesson.moduleId) {
                const moduleDoc = await getDoc(doc(db, "modules", foundLesson.moduleId));
                if (moduleDoc.exists()) {
                  foundModule = { id: moduleDoc.id, ...moduleDoc.data() };
                }
              }
              
              // Fetch all lessons from modules collection
              const modulesQuery = query(
                collection(db, "modules"),
                where("courseId", "==", courseId)
              );
              
              const modulesSnapshot = await getDocs(modulesQuery);
              const moduleIds = modulesSnapshot.docs.map(doc => doc.id);
              
              if (moduleIds.length > 0) {
                const lessonsQuery = query(
                  collection(db, "lessons"),
                  where("moduleId", "in", moduleIds)
                );
                
                const lessonsSnapshot = await getDocs(lessonsQuery);
                allLessonsData = lessonsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
              }
            }
          } catch (err) {
            console.log("No separate lessons collection, using embedded structure only");
          }
        }
        
        if (!foundLesson) {
          setError("Lesson not found");
          setLoading(false);
          return;
        }
        
        // Temporary debug logging
        console.log("=== LESSON DEBUG ===");
        console.log("Lesson found:", foundLesson);
        console.log("Lesson type:", foundLesson.type);
        console.log("Video URL:", foundLesson.videoUrl);
        console.log("All lesson fields:", Object.keys(foundLesson));
        
        setLesson(foundLesson);
        setModule(foundModule);
        
        // Sort all lessons by module order and lesson order
        allLessonsData.sort((a, b) => {
          if (a.moduleOrder !== b.moduleOrder) {
            return (a.moduleOrder || 0) - (b.moduleOrder || 0);
          }
          return (a.order || 0) - (b.order || 0);
        });
        
        setAllLessons(allLessonsData);
        
        // Find current lesson index
        const index = allLessonsData.findIndex(lesson => lesson.id === lessonId);
        if (index !== -1) {
          setCurrentLessonIndex(index);
        }
        
        // Check if lesson is completed
        const completedQuery = query(
          collection(db, "completedLessons"),
          where("studentId", "==", currentUser.uid),
          where("courseId", "==", courseId)
        );
        
        const completedSnapshot = await getDocs(completedQuery);
        const completedIds = completedSnapshot.docs.map(doc => doc.data().lessonId);
        setCompletedLessons(completedIds);
        
        if (completedIds.includes(lessonId)) {
          setIsCompleted(true);
        }
        
        // Fetch user notes for this lesson
        const notesQuery = query(
          collection(db, "notes"),
          where("studentId", "==", currentUser.uid),
          where("lessonId", "==", lessonId)
        );
        
        const notesSnapshot = await getDocs(notesQuery);
        const notesData = notesSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setNotes(notesData);
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching lesson data:", error);
        setError("Failed to load lesson data");
        setLoading(false);
      }
    };
    
    fetchLessonData();
  }, [courseId, lessonId, currentUser]);
  
  // Handle video player events
  useEffect(() => {
    const videoElement = videoRef.current;
    if (!videoElement) return;
    
    const handleTimeUpdate = () => {
      setCurrentTime(videoElement.currentTime);
    };
    
    const handleDurationChange = () => {
      setDuration(videoElement.duration);
    };
    
    const handleEnded = () => {
      setIsPlaying(false);
      markLessonAsCompleted();
    };
    
    const handlePlay = () => {
      setIsPlaying(true);
    };
    
    const handlePause = () => {
      setIsPlaying(false);
    };
    
    videoElement.addEventListener('timeupdate', handleTimeUpdate);
    videoElement.addEventListener('durationchange', handleDurationChange);
    videoElement.addEventListener('ended', handleEnded);
    videoElement.addEventListener('play', handlePlay);
    videoElement.addEventListener('pause', handlePause);
    
    return () => {
      if (videoElement) {
        videoElement.removeEventListener('timeupdate', handleTimeUpdate);
        videoElement.removeEventListener('durationchange', handleDurationChange);
        videoElement.removeEventListener('ended', handleEnded);
        videoElement.removeEventListener('play', handlePlay);
        videoElement.removeEventListener('pause', handlePause);
      }
    };
  }, [videoRef, lessonId]);
  
  // Mark lesson as completed
  const markLessonAsCompleted = async () => {
    if (isCompleted || !currentUser || !lessonId || !courseId) return;
    
    try {
      // Check if already marked as completed
      const completedRef = collection(db, "completedLessons");
      const completedQuery = query(
        completedRef,
        where("studentId", "==", currentUser.uid),
        where("lessonId", "==", lessonId)
      );
      
      const completedSnapshot = await getDocs(completedQuery);
      
      if (completedSnapshot.empty) {
        // Add to completed lessons
        await addDoc(completedRef, {
          studentId: currentUser.uid,
          lessonId: lessonId,
          courseId: courseId,
          completedAt: serverTimestamp()
        });
        
        // Update progress
        const progressRef = query(
          collection(db, "progress"),
          where("studentId", "==", currentUser.uid),
          where("courseId", "==", courseId)
        );
        
        const progressSnapshot = await getDocs(progressRef);
        
        const totalLessons = allLessons.length;
        const newCompletedLessons = [...completedLessons, lessonId];
        const percentComplete = Math.round((newCompletedLessons.length / totalLessons) * 100);
        
        if (!progressSnapshot.empty) {
          const progressDoc = progressSnapshot.docs[0];
          await updateDoc(doc(db, "progress", progressDoc.id), {
            completedLessons: newCompletedLessons.length,
            percentComplete,
            updatedAt: serverTimestamp()
          });
        } else {
          await addDoc(collection(db, "progress"), {
            studentId: currentUser.uid,
            courseId: courseId,
            completedLessons: 1,
            percentComplete: Math.round((1 / totalLessons) * 100),
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
          });
        }
        
        setIsCompleted(true);
        setCompletedLessons([...completedLessons, lessonId]);
      }
    } catch (error) {
      console.error("Error marking lesson as completed:", error);
    }
  };
  
  // Handle video playback
  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (video.paused) {
      video.play();
    } else {
      video.pause();
    }
  };
  
  // Format time for video player
  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  };
  
  // Handle seeking
  const handleSeek = (e) => {
    const video = videoRef.current;
    if (!video) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const position = (e.clientX - rect.left) / rect.width;
    video.currentTime = position * video.duration;
  };
  
  // Handle volume change
  const handleVolumeChange = (e) => {
    const video = videoRef.current;
    if (!video) return;
    
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    video.volume = newVolume;
    
    if (newVolume === 0) {
      setIsMuted(true);
      video.muted = true;
    } else {
      setIsMuted(false);
      video.muted = false;
    }
  };
  
  // Toggle mute
  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (video.muted) {
      video.muted = false;
      setIsMuted(false);
      if (volume === 0) {
        setVolume(0.5);
        video.volume = 0.5;
      }
    } else {
      video.muted = true;
      setIsMuted(true);
    }
  };
  
  // Enter fullscreen
  const enterFullscreen = () => {
    const video = videoRef.current;
    if (!video) return;
    
    if (video.requestFullscreen) {
      video.requestFullscreen();
    } else if (video.webkitRequestFullscreen) {
      video.webkitRequestFullscreen();
    } else if (video.msRequestFullscreen) {
      video.msRequestFullscreen();
    }
  };
  
  // Navigate to next lesson
  const goToNextLesson = () => {
    if (currentLessonIndex < allLessons.length - 1) {
      const nextLesson = allLessons[currentLessonIndex + 1];
      navigate(`/student/student-dashboard/course/${courseId}/lesson/${nextLesson.id}`);
    }
  };
  
  // Navigate to previous lesson
  const goToPrevLesson = () => {
    if (currentLessonIndex > 0) {
      const prevLesson = allLessons[currentLessonIndex - 1];
      navigate(`/student/student-dashboard/course/${courseId}/lesson/${prevLesson.id}`);
    }
  };
  
  // Add a new note
  const addNote = async () => {
    if (!noteText.trim() || !currentUser || !lessonId) return;
    
    try {
      const newNote = {
        studentId: currentUser.uid,
        lessonId: lessonId,
        courseId: courseId,
        content: noteText,
        timestamp: serverTimestamp(),
        videoTimestamp: videoRef.current ? videoRef.current.currentTime : 0
      };
      
      const noteRef = await addDoc(collection(db, "notes"), newNote);
      const newNoteWithId = { id: noteRef.id, ...newNote, timestamp: new Date() };
      
      setNotes([...notes, newNoteWithId]);
      setNoteText('');
    } catch (error) {
      console.error("Error adding note:", error);
    }
  };
  
  // Submit feedback
  const submitFeedback = async (isPositive) => {
    if (!currentUser || !lessonId || feedback !== null) return;
    
    try {
      await addDoc(collection(db, "feedback"), {
        studentId: currentUser.uid,
        lessonId: lessonId,
        courseId: courseId,
        isPositive,
        timestamp: serverTimestamp()
      });
      
      setFeedback(isPositive);
    } catch (error) {
      console.error("Error submitting feedback:", error);
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
      <div className="bg-red-50 p-6 rounded-lg">
        <h3 className="text-lg font-medium text-red-800">{error}</h3>
        <p className="mt-2 text-sm text-red-700">
          Please try again or return to the course page.
        </p>
        <div className="mt-4">
          <Link
            to={`/student/student-dashboard/course/${courseId}`}
            className="text-sm font-medium text-red-800 hover:text-red-700"
          >
            Back to Course
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Lesson header */}
      <div className="bg-white shadow rounded-xl mb-6 p-4">
        <div className="flex items-center justify-between">
          <Link
            to={`/student/student-dashboard/course/${courseId}`}
            className="flex items-center text-sm font-medium text-gray-700 hover:text-gray-900"
          >
            <FiChevronLeft size={20} className="mr-1" />
            Back to Course
          </Link>
          
          <div className="flex items-center space-x-1">
            <button
              onClick={goToPrevLesson}
              disabled={currentLessonIndex === 0}
              className={`p-1 rounded ${
                currentLessonIndex === 0
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FiChevronLeft size={20} />
            </button>
            <span className="text-sm text-gray-700">
              Lesson {currentLessonIndex + 1} of {allLessons.length}
            </span>
            <button
              onClick={goToNextLesson}
              disabled={currentLessonIndex === allLessons.length - 1}
              className={`p-1 rounded ${
                currentLessonIndex === allLessons.length - 1
                  ? 'text-gray-300 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FiChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main content - Lesson */}
        <div className="lg:col-span-3">
          {/* Video player - ALWAYS show if we have an embed URL */}
          {lesson && videoInfo.embedUrl && (
            <div className="bg-black rounded-xl overflow-hidden mb-6 shadow-lg relative">
              {/* YouTube/Vimeo iframe player */}
              {(videoInfo.type === 'youtube' || videoInfo.type === 'vimeo') && (
                <div className="relative w-full" style={{ paddingTop: '56.25%' }}>
                  <iframe
                    src={videoInfo.embedUrl}
                    className="absolute top-0 left-0 w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={lesson?.title || 'Video Lesson'}
                  />
                </div>
              )}
              
              {/* Direct video file player */}
              {videoInfo.type === 'direct' && (
                <>
                  <video
                    ref={videoRef}
                    src={videoInfo.embedUrl}
                    className="w-full aspect-video"
                    controls
                    controlsList="nodownload"
                    onClick={togglePlay}
                  />
                  
                  {/* Custom video controls for direct files */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    {/* Progress bar */}
                    <div 
                      className="w-full h-2 bg-gray-600 rounded-full cursor-pointer mb-2"
                      onClick={handleSeek}
                    >
                      <div 
                        className="h-full bg-blue-500 rounded-full"
                        style={{ width: `${(currentTime / duration) * 100}%` }}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4">
                        <button 
                          onClick={togglePlay}
                          className="text-white hover:text-blue-300 focus:outline-none"
                        >
                          {isPlaying ? <FiPause size={20} /> : <FiPlay size={20} />}
                        </button>
                        
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={toggleMute}
                            className="text-white hover:text-blue-300 focus:outline-none"
                          >
                            {isMuted ? (
                              <FiVolumeX size={20} />
                            ) : volume > 0.5 ? (
                              <FiVolume2 size={20} />
                            ) : (
                              <FiVolume1 size={20} />
                            )}
                          </button>
                          
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.05"
                            value={isMuted ? 0 : volume}
                            onChange={handleVolumeChange}
                            className="w-16 md:w-24 h-1 bg-gray-500 rounded-lg appearance-none"
                          />
                        </div>
                        
                        <span className="text-white text-sm">
                          {formatTime(currentTime)} / {formatTime(duration || lesson?.duration || 0)}
                        </span>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <button
                          onClick={enterFullscreen}
                          className="text-white hover:text-blue-300 focus:outline-none"
                        >
                          <FiMaximize size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
          
          {/* Lesson content */}
          <div className="bg-white shadow rounded-xl p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{lesson?.title}</h1>
            
            {module && (
              <p className="text-sm text-gray-600 mb-4">
                Module: {module.title}
              </p>
            )}
            
            {/* Show lesson metadata */}
            <div className="flex items-center gap-4 mb-4 text-sm text-gray-600">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full">
                {lesson?.type || 'unknown'}
              </span>
              {lesson?.duration && (
                <span className="flex items-center">
                  <FiPlay size={14} className="mr-1" />
                  {lesson.duration} minutes
                </span>
              )}
            </div>
            
            {/* TEMPORARY DEBUG PANEL - Remove after fixing */}
            <div className="mb-4 p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg">
              <p className="text-sm font-bold text-yellow-900 mb-2">🔧 DEBUG INFO (Temporary)</p>
              <div className="text-xs text-yellow-800 space-y-1">
                <p><strong>Lesson Type:</strong> {lesson?.type || 'NOT SET'}</p>
                <p><strong>Video URL:</strong> {lesson?.videoUrl || 'NOT SET'}</p>
                <p><strong>Video Info Type:</strong> {videoInfo?.type || 'NOT SET'}</p>
                <p><strong>Embed URL:</strong> {videoInfo?.embedUrl || 'NOT SET'}</p>
                <p><strong>Content Field:</strong> {lesson?.content ? 'EXISTS' : 'NOT SET'}</p>
                <p><strong>Available Fields:</strong> {lesson ? Object.keys(lesson).join(', ') : 'NONE'}</p>
              </div>
            </div>
            
            {lesson?.type !== 'video' && (
              <div className="prose prose-blue max-w-none">
                <div dangerouslySetInnerHTML={{ __html: lesson?.content || 'No content available' }} />
              </div>
            )}
            
            {lesson?.description && (
              <div className="mt-6 prose prose-blue max-w-none">
                <h3 className="text-lg font-semibold mb-2">Description</h3>
                <p>{lesson.description}</p>
              </div>
            )}
            
            {/* Resources section */}
            {lesson?.resources && lesson.resources.length > 0 && (
              <div className="mt-6 border-t border-gray-200 pt-6">
                <h3 className="text-lg font-semibold mb-4">Resources</h3>
                <div className="space-y-3">
                  {lesson.resources.map((resource, index) => (
                    <div key={index} className="flex items-center">
                      <FiDownload size={18} className="text-gray-500 mr-2" />
                      <a 
                        href={resource.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:text-blue-800 hover:underline flex items-center"
                      >
                        {resource.title || `Resource ${index + 1}`}
                        <FiExternalLink size={14} className="ml-1" />
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {/* Lesson completion */}
            <div className="mt-8 border-t border-gray-200 pt-6 flex items-center justify-between">
              <div>
                {isCompleted ? (
                  <div className="flex items-center text-green-600">
                    <FiCheckCircle size={20} className="mr-2" />
                    <span>Lesson completed</span>
                  </div>
                ) : (
                  <button
                    onClick={markLessonAsCompleted}
                    className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <FiCheckCircle size={16} className="mr-2 -ml-1" />
                    Mark as Complete
                  </button>
                )}
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="text-sm">Was this helpful?</div>
                <div className="flex space-x-3">
                  <button 
                    onClick={() => submitFeedback(true)}
                    disabled={feedback !== null}
                    className={`p-2 rounded-full ${
                      feedback === true
                        ? 'bg-green-100 text-green-700'
                        : 'hover:bg-gray-100 text-gray-500'
                    } ${feedback !== null ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <FiThumbsUp size={18} />
                  </button>
                  <button 
                    onClick={() => submitFeedback(false)}
                    disabled={feedback !== null}
                    className={`p-2 rounded-full ${
                      feedback === false
                        ? 'bg-red-100 text-red-700'
                        : 'hover:bg-gray-100 text-gray-500'
                    } ${feedback !== null ? 'cursor-default' : 'cursor-pointer'}`}
                  >
                    <FiThumbsDown size={18} />
                  </button>
                </div>
              </div>
            </div>
            
            {/* Navigation buttons */}
            <div className="mt-6 flex justify-between">
              {currentLessonIndex > 0 ? (
                <button
                  onClick={goToPrevLesson}
                  className="flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  <FiChevronLeft size={16} className="mr-2 -ml-1" />
                  Previous Lesson
                </button>
              ) : (
                <div />
              )}
              
              {currentLessonIndex < allLessons.length - 1 && (
                <button
                  onClick={goToNextLesson}
                  className="flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Next Lesson
                  <FiChevronRight size={16} className="ml-2 -mr-1" />
                </button>
              )}
            </div>
          </div>
        </div>
        
        {/* Sidebar */}
        <div className="space-y-6">
          {/* Notes panel */}
          <div className="bg-white shadow rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200 flex justify-between items-center">
              <h3 className="font-medium text-gray-900">My Notes</h3>
              <button
                onClick={() => setShowNotes(!showNotes)}
                className="text-gray-500 hover:text-gray-700 lg:hidden"
              >
                {showNotes ? <FiX size={20} /> : <FiList size={20} />}
              </button>
            </div>
            
            <div className={`p-4 ${showNotes ? 'block' : 'hidden lg:block'}`}>
              {notes.length > 0 ? (
                <div className="space-y-3 mb-4 max-h-80 overflow-y-auto">
                  {notes.map((note) => (
                    <div key={note.id} className="bg-gray-50 p-3 rounded-lg">
                      <p className="text-sm text-gray-800">{note.content}</p>
                      <div className="mt-2 flex items-center justify-between text-xs text-gray-500">
                        <span>
                          {note.videoTimestamp !== undefined ? `${formatTime(note.videoTimestamp)}` : ''}
                        </span>
                        <span>
                          {note.timestamp instanceof Date
                            ? note.timestamp.toLocaleString()
                            : note.timestamp?.toDate?.().toLocaleString() || ''}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 mb-4">No notes yet. Add your first note below.</p>
              )}
              
              <div className="mt-2">
                <textarea
                  value={noteText}
                  onChange={(e) => setNoteText(e.target.value)}
                  placeholder="Add a note..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  rows={3}
                />
                <div className="mt-2 flex justify-end">
                  <button
                    onClick={addNote}
                    disabled={!noteText.trim()}
                    className={`px-3 py-1 rounded-md text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                      noteText.trim()
                        ? 'bg-blue-600 text-white hover:bg-blue-700'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    Add Note
                  </button>
                </div>
              </div>
            </div>
          </div>
          
          {/* Course navigation */}
          <div className="bg-white shadow rounded-xl overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-200">
              <h3 className="font-medium text-gray-900">Course Navigation</h3>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {allLessons.map((navLesson, index) => (
                <Link
                  key={navLesson.id}
                  to={`/student/student-dashboard/course/${courseId}/lesson/${navLesson.id}`}
                  className={`flex items-center px-4 py-3 hover:bg-gray-50 ${
                    navLesson.id === lessonId ? 'bg-blue-50' : ''
                  }`}
                >
                  <div className="mr-3 flex-shrink-0">
                    {completedLessons.includes(navLesson.id) ? (
                      <div className="h-6 w-6 rounded-full bg-green-100 flex items-center justify-center">
                        <FiCheckCircle size={14} className="text-green-600" />
                      </div>
                    ) : navLesson.id === lessonId ? (
                      <div className="h-6 w-6 rounded-full bg-blue-100 flex items-center justify-center">
                        <FiPlay size={14} className="text-blue-600" />
                      </div>
                    ) : (
                      <div className="h-6 w-6 rounded-full bg-gray-100 flex items-center justify-center">
                        <span className="text-xs font-medium text-gray-600">{index + 1}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex-1">
                    <p className={`text-sm ${
                      navLesson.id === lessonId ? 'font-medium text-blue-700' : 'text-gray-700'
                    } line-clamp-2`}>
                      {navLesson.title}
                    </p>
                    
                    {navLesson.duration && (
                      <p className="text-xs text-gray-500 mt-0.5">
                        {Math.floor(navLesson.duration / 60)} min
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}