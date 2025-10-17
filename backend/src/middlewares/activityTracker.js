const User = require('../models/User');

/**
 * Activity tracking middleware
 * Automatically tracks user activity for specific routes
 */
module.exports = (activityService) => {
  return async (req, res, next) => {
    // Only track for authenticated users
    if (!req.user || !req.user._id) {
      return next();
    }

    // Skip OPTIONS requests
    if (req.method === 'OPTIONS') {
      return next();
    }

    // Get basic request data
    const userId = req.user._id;
    const path = req.originalUrl || req.url;
    const method = req.method;
    let activityType = null;
    let courseId = null;
    let quizId = null;
    let lessonId = null;
    let data = {};

    // Extract courseId, quizId, lessonId from URL params or body
    if (req.params.courseId) {
      courseId = req.params.courseId;
    } else if (req.body.courseId) {
      courseId = req.body.courseId;
    }

    if (req.params.quizId) {
      quizId = req.params.quizId;
    } else if (req.body.quizId) {
      quizId = req.body.quizId;
    }

    if (req.params.lessonId) {
      lessonId = req.params.lessonId;
    } else if (req.body.lessonId) {
      lessonId = req.body.lessonId;
    }

    // Determine activity type based on path and method
    if (path.match(/\/courses\/\w+$/) && method === 'GET') {
      activityType = 'course_view';
    } else if (path.match(/\/courses\/\w+\/enroll/) && method === 'POST') {
      activityType = 'course_enrollment';
    } else if (path.match(/\/courses\/\w+\/lessons\/\w+/) && method === 'GET') {
      activityType = 'lesson_start';
    } else if (path.match(/\/courses\/\w+\/lessons\/\w+\/complete/) && method === 'POST') {
      activityType = 'lesson_completion';
    } else if (path.match(/\/courses\/\w+\/quizzes\/\w+/) && method === 'GET') {
      activityType = 'quiz_start';
    } else if (path.match(/\/courses\/\w+\/quizzes\/\w+\/submit/) && method === 'POST') {
      activityType = 'quiz_submission';
      data = { answers: req.body.answers };
    } else if (path.match(/\/profile/) && method === 'PUT') {
      activityType = 'profile_update';
    } else if (path.match(/\/payment\/checkout/) && method === 'POST') {
      activityType = 'course_purchase';
      data = { transactionDetails: req.body.payment };
    }

    // If we've identified an activity to track
    if (activityType) {
      try {
        // Track asynchronously (don't wait for it to complete)
        activityService.trackActivity({
          userId,
          activityType,
          courseId,
          quizId,
          lessonId,
          data,
          ipAddress: req.headers['x-forwarded-for'] || req.socket.remoteAddress,
          userAgent: req.headers['user-agent']
        }).catch(err => {
          console.error('Error tracking activity:', err);
        });
      } catch (err) {
        // Log error but don't fail the request
        console.error('Error in activity tracking middleware:', err);
      }
    }

    next();
  };
};