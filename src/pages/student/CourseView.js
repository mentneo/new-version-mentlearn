import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { doc, getDoc, collection, query, where, getDocs, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/firebase';
import { useAuth } from '../../contexts/AuthContext';
import Navbar from '../../components/student/Navbar';
import { FaArrowLeft, FaListUl, FaVideo, FaFileAlt, FaPencilAlt, FaLock, FaCheck } from 'react-icons/fa';

export default function CourseView() {
  const { courseId } = useParams();
  const { currentUser } = useAuth();
  const [course, setCourse] = useState(null);
  const [currentModule, setCurrentModule] = useState(null);
  const [currentTopic, setCurrentTopic] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(0);
  const [enrollmentId, setEnrollmentId] = useState(null);
  const [completedTopics, setCompletedTopics] = useState({});
  const [topicProgress, setTopicProgress] = useState({});
  const [currentVideoTime, setCurrentVideoTime] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const videoRef = useRef(null);
  const [blockedTopics, setBlockedTopics] = useState({});
  const youtubeIframeRef = useRef(null);
  const youtubePlayerRef = useRef(null);
  const lastTimeUpdateRef = useRef(0);
  const [youtubeApiReady, setYoutubeApiReady] = useState(false);
  const progressIntervalRef = useRef(null);

  useEffect(() => {
    async function fetchCourseData() {
      try {
        // Fetch course details
        const courseRef = doc(db, "courses", courseId);
        const courseDoc = await getDoc(courseRef);
        
        if (!courseDoc.exists()) {
          setError("Course not found.");
          setLoading(false);
          return;
        }
        
        const courseData = { id: courseDoc.id, ...courseDoc.data() };
        setCourse(courseData);
        
        // Set default module and topic if available
        if (courseData.modules && courseData.modules.length > 0) {
          setCurrentModule(courseData.modules[0]);
          
          if (courseData.modules[0].topics && courseData.modules[0].topics.length > 0) {
            setCurrentTopic(courseData.modules[0].topics[0]);
          }
        }
        
        // Fetch enrollment to get progress
        const enrollmentQuery = query(
          collection(db, "enrollments"),
          where("studentId", "==", currentUser.uid),
          where("courseId", "==", courseId)
        );
        
        const enrollmentDocs = await getDocs(enrollmentQuery);
        
        if (!enrollmentDocs.empty) {
          const enrollmentData = enrollmentDocs.docs[0];
          setEnrollmentId(enrollmentData.id);
          setProgress(enrollmentData.data().progress || 0);
          
          // Get completed topics from enrollment document
          if (enrollmentData.data().completedTopics) {
            setCompletedTopics(enrollmentData.data().completedTopics);
          }
          
          // Get topic progress from enrollment document
          if (enrollmentData.data().topicProgress) {
            setTopicProgress(enrollmentData.data().topicProgress);
          }
          
          // Initialize blocked topics
          const blocked = {};
          if (courseData.modules) {
            courseData.modules.forEach(module => {
              if (module.topics && module.topics.length > 0) {
                // First topic in each module is never blocked
                module.topics.forEach((topic, index) => {
                  if (index > 0) {
                    const prevTopic = module.topics[index - 1];
                    blocked[topic.id] = !enrollmentData.data().completedTopics?.[prevTopic.id];
                  }
                });
              }
            });
          }
          setBlockedTopics(blocked);
        }
      } catch (err) {
        console.error("Error fetching course data:", err);
        setError("Failed to load course data. Please try again later.");
      } finally {
        setLoading(false);
      }
    }

    fetchCourseData();

    // Load YouTube API for iframe control
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    
    // Clean up
    return () => {
      if (youtubePlayerRef.current) {
        youtubePlayerRef.current.destroy();
      }
    };
  }, [courseId, currentUser]);

  // Load YouTube API
  useEffect(() => {
    // Only load if not already loaded
    if (window.YT) {
      setYoutubeApiReady(true);
      return;
    }
    
    // Create YouTube API script tag
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    
    // Set up callback for when API is ready
    window.onYouTubeIframeAPIReady = () => {
      console.log('YouTube API is ready');
      setYoutubeApiReady(true);
    };
    
    // Add script to page
    const firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    
    // Cleanup
    return () => {
      window.onYouTubeIframeAPIReady = null;
      
      // Clear any existing interval
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      
      // Destroy YouTube player if it exists
      if (youtubePlayerRef.current) {
        try {
          youtubePlayerRef.current.destroy();
        } catch (e) {
          console.error("Error destroying YouTube player:", e);
        }
        youtubePlayerRef.current = null;
      }
    };
  }, []);

  // Create YouTube player when topic changes or API becomes ready
  useEffect(() => {
    // Clear any existing interval
    if (progressIntervalRef.current) {
      clearInterval(progressIntervalRef.current);
      progressIntervalRef.current = null;
    }
    
    // Destroy previous player if it exists
    if (youtubePlayerRef.current) {
      try {
        youtubePlayerRef.current.destroy();
      } catch (e) {
        console.error("Error destroying previous YouTube player:", e);
      }
      youtubePlayerRef.current = null;
    }
    
    if (!youtubeApiReady || !currentTopic || 
        currentTopic.type !== 'video' || 
        !currentTopic.videoUrl || 
        !(currentTopic.videoUrl.includes('youtube.com') || currentTopic.videoUrl.includes('youtu.be'))) {
      return;
    }
    
    // Extract video ID
    let videoId = '';
    try {
      if (currentTopic.videoUrl.includes('youtube.com/watch')) {
        const url = new URL(currentTopic.videoUrl);
        videoId = url.searchParams.get('v');
      } else if (currentTopic.videoUrl.includes('youtube.com/embed/')) {
        videoId = currentTopic.videoUrl.split('/embed/')[1].split('?')[0];
      } else if (currentTopic.videoUrl.includes('youtu.be/')) {
        videoId = currentTopic.videoUrl.split('youtu.be/')[1].split('?')[0];
      }
    } catch (error) {
      console.error("Error parsing YouTube URL:", error);
      return;
    }
    
    if (!videoId) {
      console.error("Could not extract YouTube video ID from:", currentTopic.videoUrl);
      return;
    }
    
    console.log("Creating YouTube player with video ID:", videoId);
    
    // Create div for player if not already present
    const playerContainer = document.getElementById('youtube-player');
    if (!playerContainer) {
      console.error("YouTube player container not found");
      return;
    }
    
    // Initialize player
    try {
      youtubePlayerRef.current = new window.YT.Player('youtube-player', {
        videoId: videoId,
        playerVars: {
          'playsinline': 1,
          'rel': 0,
          'modestbranding': 1
        },
        events: {
          'onReady': onPlayerReady,
          'onStateChange': onPlayerStateChange
        }
      });
    } catch (error) {
      console.error("Error creating YouTube player:", error);
    }
    
    function onPlayerReady(event) {
      console.log("YouTube player is ready");
      
      // Set duration
      if (event.target && typeof event.target.getDuration === 'function') {
        const duration = event.target.getDuration();
        console.log("Video duration:", duration);
        setVideoDuration(duration);
        
        // Set initial time if we have progress data
        if (topicProgress[currentTopic.id]?.currentTime && 
            typeof event.target.seekTo === 'function') {
          event.target.seekTo(topicProgress[currentTopic.id].currentTime, true);
        }
      }
    }
    
    function onPlayerStateChange(event) {
      // Clear any existing interval
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
      
      // Start tracking progress if playing (state 1)
      if (event.data === window.YT.PlayerState.PLAYING) {
        progressIntervalRef.current = setInterval(() => {
          // Safely access player methods
          if (youtubePlayerRef.current && 
              typeof youtubePlayerRef.current.getCurrentTime === 'function' &&
              typeof youtubePlayerRef.current.getDuration === 'function') {
            
            try {
              const currentTime = youtubePlayerRef.current.getCurrentTime();
              const duration = youtubePlayerRef.current.getDuration();
              
              setCurrentVideoTime(currentTime);
              
              // Save progress every 5 seconds
              if (Math.abs(currentTime - lastTimeUpdateRef.current) >= 5) {
                lastTimeUpdateRef.current = currentTime;
                saveVideoProgress(currentTime, duration);
                
                // Mark as completed if watched 80% or more
                const percentWatched = (currentTime / duration) * 100;
                if (percentWatched >= 80 && !completedTopics[currentTopic.id]) {
                  markTopicAsCompleted(currentTopic.id);
                }
              }
            } catch (error) {
              console.error("Error tracking YouTube progress:", error);
            }
          }
        }, 1000);
      }
    }
    
    // Cleanup function
    return () => {
      if (progressIntervalRef.current) {
        clearInterval(progressIntervalRef.current);
        progressIntervalRef.current = null;
      }
    };
  }, [currentTopic, youtubeApiReady, topicProgress, completedTopics]);

  const handleModuleClick = (module) => {
    setCurrentModule(module);
    if (module.topics && module.topics.length > 0) {
      // Select the first incomplete topic or the first topic
      const incompleteTopic = module.topics.find(topic => !completedTopics[topic.id]);
      setCurrentTopic(incompleteTopic || module.topics[0]);
    } else {
      setCurrentTopic(null);
    }
  };

  const handleTopicClick = (topic) => {
    // Check if topic is blocked
    if (blockedTopics[topic.id]) {
      alert("You need to complete the previous topic first (watch at least 80% of the video).");
      return;
    }
    
    setCurrentTopic(topic);
    
    // YouTube player will be initialized in useEffect
    
    // For direct video files, we'll set the current time in the next render
    if (topic.type === 'video' && 
        topic.videoUrl && 
        !topic.videoUrl.includes('youtube.com') && 
        !topic.videoUrl.includes('youtu.be') && 
        videoRef.current && 
        topicProgress[topic.id]?.currentTime) {
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.currentTime = topicProgress[topic.id].currentTime || 0;
        }
      }, 500);
    }
  };

  const handleVideoTimeUpdate = (e) => {
    if (!currentTopic || !videoRef.current) return;
    
    const video = e.target;
    setCurrentVideoTime(video.currentTime);
    setVideoDuration(video.duration);
    
    // Save progress every 5 seconds
    if (Math.abs(video.currentTime - lastTimeUpdateRef.current) >= 5) {
      lastTimeUpdateRef.current = video.currentTime;
      saveVideoProgress(video.currentTime, video.duration);
      
      // Mark as completed if watched 80% or more
      const percentWatched = (video.currentTime / video.duration) * 100;
      if (percentWatched >= 80 && !completedTopics[currentTopic.id]) {
        markTopicAsCompleted(currentTopic.id);
      }
    }
  };
  
  const saveVideoProgress = async (currentTime, duration) => {
    if (!enrollmentId || !currentTopic) return;
    
    try {
      // Update the topic progress in state
      const updatedProgress = {
        ...topicProgress,
        [currentTopic.id]: {
          currentTime,
          duration,
          percent: Math.round((currentTime / duration) * 100)
        }
      };
      
      setTopicProgress(updatedProgress);
      
      // Update the topic progress in Firestore
      const enrollmentRef = doc(db, "enrollments", enrollmentId);
      await updateDoc(enrollmentRef, {
        topicProgress: updatedProgress
      });
    } catch (err) {
      console.error("Error saving video progress:", err);
    }
  };

  const markTopicAsCompleted = async (topicId) => {
    if (!enrollmentId) return;
    
    try {
      // Check if course has modules and topics
      if (!course || !course.modules) return;
      
      // Update in state
      const updatedCompletedTopics = {
        ...completedTopics,
        [topicId]: true
      };
      
      setCompletedTopics(updatedCompletedTopics);
      
      // Calculate total number of topics
      let totalTopics = 0;
      let completedCount = 0;
      
      course.modules.forEach(module => {
        if (module.topics && module.topics.length > 0) {
          module.topics.forEach(topic => {
            totalTopics++;
            if (updatedCompletedTopics[topic.id]) {
              completedCount++;
            }
          });
        }
      });
      
      // Calculate new overall progress
      const newProgress = Math.round((completedCount / totalTopics) * 100);
      
      // Update blocked topics
      const updatedBlockedTopics = { ...blockedTopics };
      course.modules.forEach(module => {
        if (module.topics && module.topics.length > 1) {
          for (let i = 1; i < module.topics.length; i++) {
            const currentTopic = module.topics[i];
            const prevTopic = module.topics[i - 1];
            
            if (prevTopic.id === topicId) {
              updatedBlockedTopics[currentTopic.id] = false;
            }
          }
        }
      });
      
      setBlockedTopics(updatedBlockedTopics);
      
      // Update progress and completed topics in Firestore
      const enrollmentRef = doc(db, "enrollments", enrollmentId);
      await updateDoc(enrollmentRef, {
        progress: newProgress,
        completedTopics: updatedCompletedTopics
      });
      
      setProgress(newProgress);
    } catch (err) {
      console.error("Error updating progress:", err);
    }
  };

  const getTopicProgressPercent = (topicId) => {
    if (completedTopics[topicId]) return 100;
    if (topicProgress[topicId]) return topicProgress[topicId].percent || 0;
    return 0;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
            <p className="text-center mt-4">Loading course content...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <div className="py-10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
            <Link
              to="/student/dashboard"
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
            >
              <FaArrowLeft className="mr-2" /> Back to Dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navbar />
      <div className="py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row mb-6">
            <Link
              to="/student/dashboard"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-indigo-700 bg-indigo-100 hover:bg-indigo-200"
            >
              <FaArrowLeft className="mr-2" /> Back to Dashboard
            </Link>
            <div className="md:ml-auto mt-4 md:mt-0">
              <div className="text-sm font-medium text-gray-500">
                Your Progress: <span className="text-indigo-600">{progress}%</span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full mt-1">
                <div 
                  className="h-2 bg-indigo-600 rounded-full" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
          </div>

          <div className="bg-white shadow overflow-hidden sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-1">{course.title}</h2>
              <p className="text-sm text-gray-600">{course.description}</p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Course Modules Sidebar */}
            <div className="md:col-span-1">
              <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                  <h3 className="text-lg font-medium text-gray-900 flex items-center">
                    <FaListUl className="mr-2" /> Modules
                  </h3>
                </div>
                <div className="divide-y divide-gray-200">
                  {course.modules?.map((module, index) => (
                    <button
                      key={module.id || index}
                      onClick={() => handleModuleClick(module)}
                      className={`w-full text-left px-4 py-4 hover:bg-gray-50 flex items-center justify-between ${
                        currentModule && currentModule.id === module.id ? 'bg-indigo-50' : ''
                      }`}
                    >
                      <div>
                        <span className="text-gray-900 font-medium">{module.title}</span>
                        <p className="text-xs text-gray-500 mt-1">
                          {module.topics?.length || 0} topics
                        </p>
                      </div>
                      {currentModule && currentModule.id === module.id && (
                        <span className="bg-indigo-100 rounded-full w-2 h-2"></span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Course Content */}
            <div className="md:col-span-3">
              {currentModule ? (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                  <div className="px-4 py-5 sm:px-6 border-b border-gray-200">
                    <h3 className="text-xl font-medium text-gray-900">{currentModule.title}</h3>
                    <p className="mt-1 max-w-2xl text-sm text-gray-500">{currentModule.description}</p>
                  </div>
                  
                  {/* Topics List */}
                  <div className="border-b border-gray-200">
                    <div className="px-4 py-3 bg-gray-50 text-sm font-medium text-gray-500">
                      Topics
                    </div>
                    <div className="divide-y divide-gray-200">
                      {currentModule.topics?.map((topic, index) => (
                        <button
                          key={topic.id || index}
                          onClick={() => handleTopicClick(topic)}
                          disabled={blockedTopics[topic.id]}
                          className={`w-full text-left px-4 py-3 hover:bg-gray-50 flex items-center ${
                            currentTopic && currentTopic.id === topic.id ? 'bg-indigo-50' : ''
                          } ${blockedTopics[topic.id] ? 'opacity-60 cursor-not-allowed' : ''}`}
                        >
                          <div className="flex-shrink-0 mr-3">
                            {blockedTopics[topic.id] ? (
                              <FaLock className="text-gray-400" />
                            ) : completedTopics[topic.id] ? (
                              <FaCheck className="text-green-500" />
                            ) : topic.type === 'video' ? (
                              <FaVideo className="text-indigo-500" />
                            ) : topic.type === 'quiz' ? (
                              <FaPencilAlt className="text-green-500" />
                            ) : (
                              <FaFileAlt className="text-gray-500" />
                            )}
                          </div>
                          <div className="flex-1">
                            <span className="text-gray-900">{topic.title}</span>
                            <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                              <div 
                                className={`h-1.5 rounded-full ${completedTopics[topic.id] ? 'bg-green-500' : 'bg-indigo-500'}`}
                                style={{ width: `${getTopicProgressPercent(topic.id)}%` }}
                              ></div>
                            </div>
                          </div>
                          {blockedTopics[topic.id] && (
                            <div className="ml-2 text-xs text-gray-500">
                              Complete previous topic first
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                  
                  {/* Current Topic Content */}
                  {currentTopic && (
                    <div className="px-4 py-5 sm:px-6">
                      <h4 className="text-lg font-medium text-gray-900 mb-4">{currentTopic.title}</h4>
                      
                      {currentTopic.type === 'video' && currentTopic.videoUrl && (
                        <div className="mb-4">
                          {/* Video progress indicator */}
                          {videoDuration > 0 && (
                            <div className="mb-3">
                              <div className="flex items-center justify-between text-xs mb-1">
                                <span className="text-gray-500">
                                  {Math.floor(currentVideoTime / 60)}:{Math.floor(currentVideoTime % 60).toString().padStart(2, '0')} / 
                                  {Math.floor(videoDuration / 60)}:{Math.floor(videoDuration % 60).toString().padStart(2, '0')}
                                </span>
                                <span className={`font-medium ${completedTopics[currentTopic.id] ? 'text-green-600' : 'text-indigo-600'}`}>
                                  {Math.round((currentVideoTime / videoDuration) * 100)}%
                                </span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-1.5">
                                <div 
                                  className={`h-1.5 rounded-full ${completedTopics[currentTopic.id] ? 'bg-green-500' : 'bg-indigo-500'}`}
                                  style={{ width: `${(currentVideoTime / videoDuration) * 100}%` }}
                                ></div>
                              </div>
                              {!completedTopics[currentTopic.id] && (
                                <p className="mt-1 text-xs text-gray-500">
                                  Watch at least 80% of the video to unlock the next topic
                                </p>
                              )}
                            </div>
                          )}
                          
                          {/* Video player */}
                          {(currentTopic.videoUrl.includes('youtube.com') || currentTopic.videoUrl.includes('youtu.be')) ? (
                            <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
                              <div id="youtube-player" ref={youtubeIframeRef}></div>
                            </div>
                          ) : (
                            <video 
                              ref={videoRef}
                              controls
                              onTimeUpdate={handleVideoTimeUpdate}
                              className="w-full h-auto max-h-96 rounded-lg"
                              poster={currentTopic.thumbnailUrl}
                            >
                              <source src={currentTopic.videoUrl} type="video/mp4" />
                              Your browser does not support the video tag.
                            </video>
                          )}
                        </div>
                      )}
                      
                      {currentTopic.content && (
                        <div className="prose max-w-none mt-4">
                          <div className="text-gray-700">
                            {currentTopic.content}
                          </div>
                        </div>
                      )}
                      
                      {currentTopic.type === 'quiz' && (
                        <div className="mt-4">
                          <Link
                            to={`/student/quiz/${currentTopic.quizId}`}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700"
                          >
                            Start Quiz
                          </Link>
                        </div>
                      )}
                      
                      {currentTopic.attachments && currentTopic.attachments.length > 0 && (
                        <div className="mt-6">
                          <h5 className="text-sm font-medium text-gray-900 mb-2">Attachments</h5>
                          <ul className="border border-gray-200 rounded-md divide-y divide-gray-200">
                            {currentTopic.attachments.map((attachment) => (
                              <li key={attachment.id} className="pl-3 pr-4 py-3 flex items-center justify-between text-sm">
                                <div className="w-0 flex-1 flex items-center">
                                  <FaFileAlt className="flex-shrink-0 h-5 w-5 text-gray-400" />
                                  <span className="ml-2 flex-1 w-0 truncate">{attachment.name}</span>
                                </div>
                                <div className="ml-4 flex-shrink-0">
                                  <a
                                    href={attachment.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="font-medium text-indigo-600 hover:text-indigo-500"
                                  >
                                    Download
                                  </a>
                                </div>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div className="bg-white shadow overflow-hidden sm:rounded-lg p-6 text-center">
                  <p className="text-gray-500">Select a module to view content</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
