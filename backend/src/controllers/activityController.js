const ActivityService = require('../services/ActivityService');
const Activity = require('../models/Activity');
const UserProgress = require('../models/UserProgress');
const Transaction = require('../models/Transaction');

// Factory pattern to inject Firestore dependency
module.exports = (firestore) => {
  // Create service instance with Firestore
  const activityService = new ActivityService(firestore);
  
  return {
    /**
     * Track a new activity
     * @route POST /api/activities
     */
    trackActivity: async (req, res, next) => {
      try {
        const { userId, activityType, data, courseId, quizId, lessonId, status } = req.body;
        
        if (!userId || !activityType) {
          return res.status(400).json({ message: 'userId and activityType are required' });
        }
        
        // Get IP and user agent
        const ipAddress = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        const userAgent = req.headers['user-agent'];
        
        const activityData = {
          userId,
          activityType,
          data: data || {},
          courseId,
          quizId,
          lessonId,
          status,
          ipAddress,
          userAgent
        };
        
        const activity = await activityService.trackActivity(activityData);
        
        res.status(201).json({
          message: 'Activity tracked successfully',
          activity: {
            id: activity._id,
            activityType: activity.activityType,
            timestamp: activity.createdAt
          }
        });
      } catch (err) {
        next(err);
      }
    },
    
    /**
     * Get user activity history
     * @route GET /api/activities/user/:userId
     */
    getUserActivity: async (req, res, next) => {
      try {
        const { userId } = req.params;
        const { type, limit, skip } = req.query;
        
        const options = {
          limit: limit ? parseInt(limit) : 20,
          skip: skip ? parseInt(skip) : 0,
          type
        };
        
        const activities = await activityService.getUserActivityHistory(userId, options);
        
        res.json({
          count: activities.length,
          activities
        });
      } catch (err) {
        next(err);
      }
    },
    
    /**
     * Get user progress for a specific course
     * @route GET /api/activities/progress/:userId/:courseId
     */
    getCourseProgress: async (req, res, next) => {
      try {
        const { userId, courseId } = req.params;
        
        const progress = await activityService.getUserCourseProgress(userId, courseId);
        
        if (!progress) {
          return res.status(404).json({ message: 'No progress found for this course' });
        }
        
        res.json(progress);
      } catch (err) {
        next(err);
      }
    },
    
    /**
     * Get all course progress for a user
     * @route GET /api/activities/progress/:userId
     */
    getAllProgress: async (req, res, next) => {
      try {
        const { userId } = req.params;
        
        const allProgress = await activityService.getAllUserProgress(userId);
        
        res.json({
          count: allProgress.length,
          progress: allProgress
        });
      } catch (err) {
        next(err);
      }
    },
    
    /**
     * Get user transactions
     * @route GET /api/activities/transactions/:userId
     */
    getUserTransactions: async (req, res, next) => {
      try {
        const { userId } = req.params;
        const { type, limit, skip } = req.query;
        
        const options = {
          limit: limit ? parseInt(limit) : 20,
          skip: skip ? parseInt(skip) : 0,
          type
        };
        
        const transactions = await activityService.getUserTransactions(userId, options);
        
        res.json({
          count: transactions.length,
          transactions
        });
      } catch (err) {
        next(err);
      }
    },
    
    /**
     * Get activity dashboard stats
     * @route GET /api/activities/stats
     */
    getActivityStats: async (req, res, next) => {
      try {
        // Count activities by type
        const activityCounts = await Activity.aggregate([
          { $group: { _id: '$activityType', count: { $sum: 1 } } }
        ]);
        
        // Get recent activities
        const recentActivities = await Activity.find()
          .sort({ createdAt: -1 })
          .limit(10)
          .lean();
        
        // Get course enrollment stats
        const courseEnrollments = await UserProgress.aggregate([
          { $group: { _id: '$courseId', enrollmentCount: { $sum: 1 } } }
        ]);
        
        // Get payment stats
        const paymentStats = await Transaction.aggregate([
          { $match: { status: 'completed' } },
          { $group: { _id: '$transactionType', total: { $sum: '$amount' }, count: { $sum: 1 } } }
        ]);
        
        res.json({
          activityCounts,
          recentActivities,
          courseEnrollments,
          paymentStats
        });
      } catch (err) {
        next(err);
      }
    }
  };
};