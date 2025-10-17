/**
 * Activity Tracking Service for Client Side
 * Used to track user activities and send them to the backend
 */

import axios from 'axios';

class ActivityTracker {
  constructor(baseUrl = '/api') {
    this.apiUrl = `${baseUrl}/activities`;
    this.queue = [];
    this.processing = false;
    this.userId = null;
    
    // Process the queue every 10 seconds
    setInterval(this.processQueue.bind(this), 10000);
  }
  
  /**
   * Set the current user ID
   * @param {string} userId - The ID of the logged in user
   */
  setUserId(userId) {
    this.userId = userId;
  }
  
  /**
   * Track a user activity
   * @param {string} activityType - Type of activity
   * @param {Object} data - Additional data about the activity
   * @param {string} courseId - Optional course ID if activity is related to a course
   * @param {string} quizId - Optional quiz ID if activity is related to a quiz
   * @param {string} lessonId - Optional lesson ID if activity is related to a lesson
   */
  track(activityType, data = {}, courseId = null, quizId = null, lessonId = null) {
    if (!this.userId) {
      console.warn('ActivityTracker: No user ID set. Activity will be queued until user ID is available.');
    }
    
    const activity = {
      userId: this.userId,
      activityType,
      data,
      courseId,
      quizId,
      lessonId,
      timestamp: new Date().toISOString()
    };
    
    // Add to queue
    this.queue.push(activity);
    
    // Try to process immediately
    if (!this.processing) {
      this.processQueue();
    }
    
    return activity;
  }
  
  /**
   * Process the queue of pending activities
   */
  async processQueue() {
    // If already processing or queue is empty, do nothing
    if (this.processing || this.queue.length === 0 || !this.userId) {
      return;
    }
    
    this.processing = true;
    
    try {
      // Take up to 10 items from the queue
      const batch = this.queue.splice(0, 10);
      
      // Update user ID for all items in batch
      batch.forEach(item => {
        item.userId = this.userId;
      });
      
      // Send activities one by one (could be optimized with a batch API endpoint)
      for (const activity of batch) {
        try {
          await axios.post(this.apiUrl, activity);
        } catch (error) {
          console.error('Error tracking activity:', error);
          // Put the activity back in the queue
          this.queue.unshift(activity);
        }
      }
    } finally {
      this.processing = false;
      
      // If there are still items in the queue, process them
      if (this.queue.length > 0) {
        setTimeout(this.processQueue.bind(this), 1000);
      }
    }
  }
  
  /**
   * Track course view
   * @param {string} courseId - The course ID
   * @param {string} courseTitle - The course title
   */
  trackCourseView(courseId, courseTitle) {
    return this.track('course_view', { courseTitle }, courseId);
  }
  
  /**
   * Track course enrollment
   * @param {string} courseId - The course ID
   * @param {string} courseTitle - The course title
   */
  trackCourseEnrollment(courseId, courseTitle) {
    return this.track('course_enrollment', { courseTitle }, courseId);
  }
  
  /**
   * Track course purchase
   * @param {string} courseId - The course ID
   * @param {string} courseTitle - The course title
   * @param {Object} transactionDetails - Details of the transaction
   */
  trackCoursePurchase(courseId, courseTitle, transactionDetails) {
    return this.track('course_purchase', { courseTitle, transactionDetails }, courseId);
  }
  
  /**
   * Track lesson start
   * @param {string} courseId - The course ID
   * @param {string} lessonId - The lesson ID
   * @param {string} lessonTitle - The lesson title
   */
  trackLessonStart(courseId, lessonId, lessonTitle) {
    return this.track('lesson_start', { lessonTitle }, courseId, null, lessonId);
  }
  
  /**
   * Track lesson completion
   * @param {string} courseId - The course ID
   * @param {string} lessonId - The lesson ID
   * @param {string} lessonTitle - The lesson title
   * @param {number} timeSpent - Time spent in seconds
   */
  trackLessonCompletion(courseId, lessonId, lessonTitle, timeSpent) {
    return this.track(
      'lesson_completion',
      { lessonTitle, timeSpent, completionDate: new Date().toISOString() },
      courseId,
      null,
      lessonId
    );
  }
  
  /**
   * Track quiz start
   * @param {string} courseId - The course ID
   * @param {string} quizId - The quiz ID
   * @param {string} quizTitle - The quiz title
   */
  trackQuizStart(courseId, quizId, quizTitle) {
    return this.track('quiz_start', { quizTitle, startTime: new Date().toISOString() }, courseId, quizId);
  }
  
  /**
   * Track quiz submission
   * @param {string} courseId - The course ID
   * @param {string} quizId - The quiz ID
   * @param {string} quizTitle - The quiz title
   * @param {Array} answers - The answers submitted
   * @param {number} timeSpent - Time spent in seconds
   */
  trackQuizSubmission(courseId, quizId, quizTitle, answers, timeSpent) {
    return this.track(
      'quiz_submission',
      { 
        quizTitle, 
        answers,
        timeSpent,
        submissionDate: new Date().toISOString()
      },
      courseId,
      quizId
    );
  }
  
  /**
   * Track quiz completion
   * @param {string} courseId - The course ID
   * @param {string} quizId - The quiz ID
   * @param {string} quizTitle - The quiz title
   * @param {number} score - The score (0-100)
   * @param {Array} answers - The answers submitted
   * @param {number} timeSpent - Time spent in seconds
   */
  trackQuizCompletion(courseId, quizId, quizTitle, score, answers, timeSpent) {
    return this.track(
      'quiz_completion',
      { 
        quizTitle, 
        score,
        answers,
        timeSpent,
        completionDate: new Date().toISOString() 
      },
      courseId,
      quizId
    );
  }
}

// Create singleton instance
const activityTracker = new ActivityTracker();

export default activityTracker;