const express = require('express');
const activityControllerFactory = require('../controllers/activityController');

module.exports = (firestore) => {
  const router = express.Router();
  const activityController = activityControllerFactory(firestore);
  
  // Track a new activity
  router.post('/', activityController.trackActivity);
  
  // Get user activity history
  router.get('/user/:userId', activityController.getUserActivity);
  
  // Get user progress for a specific course
  router.get('/progress/:userId/:courseId', activityController.getCourseProgress);
  
  // Get all course progress for a user
  router.get('/progress/:userId', activityController.getAllProgress);
  
  // Get user transactions
  router.get('/transactions/:userId', activityController.getUserTransactions);
  
  // Get activity dashboard stats
  router.get('/stats', activityController.getActivityStats);
  
  return router;
};