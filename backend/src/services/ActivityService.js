/**
 * Activity Service - Handles all user activity tracking
 * Syncs data between MongoDB and Firebase for both structured storage and real-time access
 */

const Activity = require('../models/Activity');
const UserProgress = require('../models/UserProgress');
const Transaction = require('../models/Transaction');
const mongoose = require('mongoose');

class ActivityService {
  constructor(firestore) {
    this.firestore = firestore;
  }

  /**
   * Track a user activity and sync to both MongoDB and Firebase
   * @param {Object} activityData - Details of the activity to record
   * @returns {Promise<Object>} The created activity record
   */
  async trackActivity(activityData) {
    try {
      // 1. Create in MongoDB
      const activity = await Activity.create(activityData);
      
      // 2. Sync to Firebase for real-time access
      await this.syncToFirebase('activities', activity._id.toString(), {
        userId: activity.userId.toString(),
        activityType: activity.activityType,
        createdAt: new Date().toISOString(),
        data: activity.data || {},
        status: activity.status || 'completed'
      });
      
      // 3. Handle specific activity types that need additional processing
      await this.processActivityByType(activity);
      
      return activity;
    } catch (error) {
      console.error('Error tracking activity:', error);
      throw error;
    }
  }
  
  /**
   * Process specific types of activities that need additional handling
   * @param {Object} activity - The activity object
   */
  async processActivityByType(activity) {
    switch (activity.activityType) {
      case 'signup':
        // Maybe send welcome email, update analytics, etc.
        break;
        
      case 'login':
        // Update last login time
        break;
        
      case 'course_purchase':
        // Update enrollment status and create transaction
        if (activity.data && activity.data.transactionDetails) {
          await this.createTransaction(activity);
        }
        break;
        
      case 'course_enrollment':
        // Create or update the user's progress record
        await this.initializeUserProgress(activity);
        break;
        
      case 'quiz_completion':
        // Update the user's progress with quiz results
        await this.updateUserProgressWithQuiz(activity);
        break;
        
      case 'lesson_completion':
        // Update the user's course progress
        await this.updateUserProgressWithLesson(activity);
        break;
    }
  }
  
  /**
   * Create a transaction record from a purchase activity
   * @param {Object} activity - The purchase activity
   */
  async createTransaction(activity) {
    try {
      const transactionData = {
        userId: activity.userId,
        courseId: activity.courseId,
        transactionType: 'purchase',
        amount: activity.data.transactionDetails.amount,
        currency: activity.data.transactionDetails.currency || 'USD',
        status: 'completed',
        paymentMethod: activity.data.transactionDetails.paymentMethod,
        paymentDetails: activity.data.transactionDetails.paymentDetails || {},
        ipAddress: activity.ipAddress
      };
      
      // Create in MongoDB
      const transaction = await Transaction.create(transactionData);
      
      // Sync to Firebase for real-time access
      await this.syncToFirebase('transactions', transaction._id.toString(), {
        userId: transaction.userId.toString(),
        courseId: transaction.courseId.toString(),
        amount: transaction.amount,
        status: transaction.status,
        createdAt: new Date().toISOString()
      });
      
      return transaction;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }
  
  /**
   * Initialize a user progress record when they enroll in a course
   * @param {Object} activity - The enrollment activity
   */
  async initializeUserProgress(activity) {
    try {
      // Check if a progress record already exists
      let userProgress = await UserProgress.findOne({
        userId: activity.userId,
        courseId: activity.courseId
      });
      
      // If it doesn't exist, create one
      if (!userProgress) {
        const modules = activity.data.courseModules || [];
        
        userProgress = await UserProgress.create({
          userId: activity.userId,
          courseId: activity.courseId,
          enrollmentDate: new Date(),
          overallProgress: 0,
          modules: modules.map(module => ({
            moduleId: module.id,
            moduleName: module.name,
            status: 'not_started',
            progress: 0,
            lessons: (module.lessons || []).map(lesson => ({
              lessonId: lesson.id,
              lessonName: lesson.name,
              status: 'not_started'
            })),
            quizzes: (module.quizzes || []).map(quiz => ({
              quizId: quiz.id,
              quizName: quiz.name,
              attempts: [],
              bestScore: 0,
              passed: false
            }))
          }))
        });
        
        // Sync to Firebase for real-time access
        await this.syncToFirebase('userProgress', userProgress._id.toString(), {
          userId: userProgress.userId.toString(),
          courseId: userProgress.courseId.toString(),
          enrollmentDate: userProgress.enrollmentDate.toISOString(),
          overallProgress: 0,
          updatedAt: new Date().toISOString()
        });
      }
      
      return userProgress;
    } catch (error) {
      console.error('Error initializing user progress:', error);
      throw error;
    }
  }
  
  /**
   * Update user progress when a quiz is completed
   * @param {Object} activity - The quiz activity
   */
  async updateUserProgressWithQuiz(activity) {
    try {
      const { userId, courseId, data } = activity;
      const { quizId, moduleId, score, answers, timeSpent } = data;
      
      // Find the user's progress record
      const userProgress = await UserProgress.findOne({ userId, courseId });
      
      if (!userProgress) {
        throw new Error('User progress record not found');
      }
      
      // Find the module containing this quiz
      const moduleIndex = userProgress.modules.findIndex(m => m.moduleId === moduleId);
      
      if (moduleIndex === -1) {
        throw new Error('Module not found in user progress');
      }
      
      // Find the quiz
      const quizIndex = userProgress.modules[moduleIndex].quizzes.findIndex(q => q.quizId === quizId);
      
      if (quizIndex === -1) {
        // Quiz not found, add it
        userProgress.modules[moduleIndex].quizzes.push({
          quizId,
          quizName: data.quizName || 'Quiz',
          attempts: [{
            attemptNumber: 1,
            startDate: new Date(data.startTime) || new Date(),
            completionDate: new Date(),
            score,
            timeSpent,
            answers: answers || []
          }],
          bestScore: score,
          passed: score >= (data.passingScore || 70) // Default passing score is 70%
        });
      } else {
        // Quiz found, add a new attempt
        const quiz = userProgress.modules[moduleIndex].quizzes[quizIndex];
        const attemptNumber = (quiz.attempts || []).length + 1;
        
        // Add the new attempt
        quiz.attempts.push({
          attemptNumber,
          startDate: new Date(data.startTime) || new Date(),
          completionDate: new Date(),
          score,
          timeSpent,
          answers: answers || []
        });
        
        // Update best score if this attempt is better
        if (score > quiz.bestScore) {
          quiz.bestScore = score;
        }
        
        // Update passed status
        quiz.passed = quiz.bestScore >= (data.passingScore || 70);
      }
      
      // Update module progress based on completed quizzes and lessons
      this.recalculateModuleProgress(userProgress, moduleIndex);
      
      // Save the updated progress
      await userProgress.save();
      
      // Update lastAccessDate
      userProgress.lastAccessDate = new Date();
      
      // Sync to Firebase for real-time access
      await this.syncToFirebase('userProgress', userProgress._id.toString(), {
        userId: userProgress.userId.toString(),
        courseId: userProgress.courseId.toString(),
        overallProgress: userProgress.overallProgress,
        lastAccessDate: userProgress.lastAccessDate.toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      // Also update the specific module in Firebase
      await this.syncToFirebase(
        `userProgress/${userProgress._id}/modules`, 
        moduleId, 
        userProgress.modules[moduleIndex]
      );
      
      return userProgress;
    } catch (error) {
      console.error('Error updating progress with quiz:', error);
      throw error;
    }
  }
  
  /**
   * Update user progress when a lesson is completed
   * @param {Object} activity - The lesson completion activity
   */
  async updateUserProgressWithLesson(activity) {
    try {
      const { userId, courseId, data } = activity;
      const { lessonId, moduleId, timeSpent } = data;
      
      // Find the user's progress record
      const userProgress = await UserProgress.findOne({ userId, courseId });
      
      if (!userProgress) {
        throw new Error('User progress record not found');
      }
      
      // Find the module containing this lesson
      const moduleIndex = userProgress.modules.findIndex(m => m.moduleId === moduleId);
      
      if (moduleIndex === -1) {
        throw new Error('Module not found in user progress');
      }
      
      // Find the lesson
      const lessonIndex = userProgress.modules[moduleIndex].lessons.findIndex(l => l.lessonId === lessonId);
      
      if (lessonIndex === -1) {
        // Lesson not found, add it
        userProgress.modules[moduleIndex].lessons.push({
          lessonId,
          lessonName: data.lessonName || 'Lesson',
          status: 'completed',
          completionDate: new Date(),
          timeSpent: timeSpent || 0
        });
      } else {
        // Lesson found, update it
        const lesson = userProgress.modules[moduleIndex].lessons[lessonIndex];
        lesson.status = 'completed';
        lesson.completionDate = new Date();
        lesson.timeSpent = (lesson.timeSpent || 0) + (timeSpent || 0);
      }
      
      // Update module progress based on completed lessons
      this.recalculateModuleProgress(userProgress, moduleIndex);
      
      // Save the updated progress
      await userProgress.save();
      
      // Update lastAccessDate
      userProgress.lastAccessDate = new Date();
      
      // Sync to Firebase for real-time access
      await this.syncToFirebase('userProgress', userProgress._id.toString(), {
        userId: userProgress.userId.toString(),
        courseId: userProgress.courseId.toString(),
        overallProgress: userProgress.overallProgress,
        lastAccessDate: userProgress.lastAccessDate.toISOString(),
        updatedAt: new Date().toISOString()
      });
      
      // Also update the specific module in Firebase
      await this.syncToFirebase(
        `userProgress/${userProgress._id}/modules`, 
        moduleId, 
        userProgress.modules[moduleIndex]
      );
      
      return userProgress;
    } catch (error) {
      console.error('Error updating progress with lesson:', error);
      throw error;
    }
  }
  
  /**
   * Recalculate module progress based on completed lessons and quizzes
   * @param {Object} userProgress - The user progress object
   * @param {Number} moduleIndex - Index of the module to recalculate
   */
  recalculateModuleProgress(userProgress, moduleIndex) {
    const module = userProgress.modules[moduleIndex];
    
    // Calculate lesson completion percentage
    const totalLessons = module.lessons.length;
    const completedLessons = module.lessons.filter(l => l.status === 'completed').length;
    
    // Calculate quiz completion percentage
    const totalQuizzes = module.quizzes.length;
    const passedQuizzes = module.quizzes.filter(q => q.passed).length;
    
    // Determine the total items (lessons + quizzes)
    const totalItems = totalLessons + totalQuizzes;
    
    // Calculate overall module progress
    if (totalItems > 0) {
      module.progress = Math.round(((completedLessons + passedQuizzes) / totalItems) * 100);
    } else {
      module.progress = 0;
    }
    
    // Update module status
    if (module.progress === 100) {
      module.status = 'completed';
      if (!module.completionDate) {
        module.completionDate = new Date();
      }
    } else if (module.progress > 0) {
      module.status = 'in_progress';
      if (!module.startDate) {
        module.startDate = new Date();
      }
    }
    
    // Recalculate overall course progress
    this.recalculateOverallProgress(userProgress);
  }
  
  /**
   * Recalculate overall course progress
   * @param {Object} userProgress - The user progress object
   */
  recalculateOverallProgress(userProgress) {
    const totalModules = userProgress.modules.length;
    
    if (totalModules === 0) {
      userProgress.overallProgress = 0;
      return;
    }
    
    // Sum up all module progress percentages
    const totalProgress = userProgress.modules.reduce((sum, module) => sum + module.progress, 0);
    
    // Calculate the average
    userProgress.overallProgress = Math.round(totalProgress / totalModules);
    
    // If everything is completed, set completion date
    if (userProgress.overallProgress === 100 && !userProgress.completionDate) {
      userProgress.completionDate = new Date();
    }
  }
  
  /**
   * Sync data to Firebase Firestore
   * @param {String} collection - The collection name
   * @param {String} documentId - The document ID
   * @param {Object} data - The data to store
   */
  async syncToFirebase(collection, documentId, data) {
    try {
      if (!this.firestore) {
        console.warn('Firestore not initialized, skipping sync');
        return;
      }
      
      // Add timestamp
      const dataToSync = {
        ...data,
        _syncedAt: new Date().toISOString()
      };
      
      // Write to Firestore
      const docRef = this.firestore.collection(collection).doc(documentId);
      
      // Determine if we're updating a subcollection
      if (collection.includes('/')) {
        // For subcollection paths like 'userProgress/123/modules'
        const segments = collection.split('/');
        let ref = this.firestore;
        
        for (let i = 0; i < segments.length; i += 2) {
          if (i + 1 < segments.length) {
            ref = ref.collection(segments[i]).doc(segments[i + 1]);
          } else {
            ref = ref.collection(segments[i]);
          }
        }
        
        await ref.doc(documentId).set(dataToSync, { merge: true });
      } else {
        // Standard collection
        await docRef.set(dataToSync, { merge: true });
      }
    } catch (error) {
      console.error(`Error syncing to Firebase (${collection}/${documentId}):`, error);
      // We don't throw here because Firebase sync is secondary to MongoDB storage
    }
  }
  
  /**
   * Get user activity history
   * @param {String} userId - The user ID
   * @param {Object} options - Query options (limit, skip, type)
   * @returns {Promise<Array>} Array of activity records
   */
  async getUserActivityHistory(userId, options = {}) {
    const { limit = 20, skip = 0, type } = options;
    
    const query = { userId: mongoose.Types.ObjectId(userId) };
    
    if (type) {
      query.activityType = type;
    }
    
    return Activity.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }
  
  /**
   * Get user progress for a specific course
   * @param {String} userId - The user ID
   * @param {String} courseId - The course ID
   * @returns {Promise<Object>} The user progress record
   */
  async getUserCourseProgress(userId, courseId) {
    return UserProgress.findOne({
      userId: mongoose.Types.ObjectId(userId),
      courseId: mongoose.Types.ObjectId(courseId)
    }).lean();
  }
  
  /**
   * Get all course progress for a user
   * @param {String} userId - The user ID
   * @returns {Promise<Array>} Array of progress records
   */
  async getAllUserProgress(userId) {
    return UserProgress.find({
      userId: mongoose.Types.ObjectId(userId)
    }).lean();
  }
  
  /**
   * Get all transactions for a user
   * @param {String} userId - The user ID
   * @param {Object} options - Query options
   * @returns {Promise<Array>} Array of transaction records
   */
  async getUserTransactions(userId, options = {}) {
    const { limit = 20, skip = 0, type } = options;
    
    const query = { userId: mongoose.Types.ObjectId(userId) };
    
    if (type) {
      query.transactionType = type;
    }
    
    return Transaction.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();
  }
}

module.exports = ActivityService;