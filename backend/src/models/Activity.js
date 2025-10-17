const mongoose = require('mongoose');

const ActivitySchema = new mongoose.Schema({
  // Who performed the activity
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User',
    required: true
  },
  // The type of activity performed
  activityType: {
    type: String,
    required: true,
    enum: [
      'signup', 
      'login', 
      'logout', 
      'course_view',
      'course_purchase', 
      'course_enrollment',
      'course_completion',
      'quiz_start',
      'quiz_submission',
      'quiz_completion',
      'lesson_start',
      'lesson_completion',
      'profile_update',
      'payment',
      'refund_request',
      'support_request'
    ]
  },
  // Additional data about the activity (flexible JSON object)
  data: {
    type: Object,
    default: {}
  },
  // If activity relates to course or quiz, store reference
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  quizId: {
    type: String
  },
  lessonId: {
    type: String
  },
  // Track status of activities that have states
  status: {
    type: String,
    enum: ['started', 'completed', 'failed', 'pending', 'cancelled'],
    default: 'completed'
  },
  // IP address and device info for security tracking
  ipAddress: String,
  userAgent: String,
  // Duration of activity if applicable (in seconds)
  duration: Number
}, { 
  timestamps: true,
  // Store detailed timestamps for education analytics
  capped: { size: 1024 * 1024 * 50, max: 100000 } // 50MB cap, max 100k documents
});

// Indexes for common queries
ActivitySchema.index({ userId: 1, createdAt: -1 });
ActivitySchema.index({ activityType: 1, createdAt: -1 });
ActivitySchema.index({ courseId: 1, activityType: 1 });

module.exports = mongoose.model('Activity', ActivitySchema);