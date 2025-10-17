const mongoose = require('mongoose');

const UserProgressSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  enrollmentDate: {
    type: Date,
    default: Date.now
  },
  lastAccessDate: {
    type: Date,
    default: Date.now
  },
  completionDate: Date,
  // Overall course completion percentage
  overallProgress: {
    type: Number,
    default: 0,
    min: 0,
    max: 100
  },
  // Individual module progress
  modules: [{
    moduleId: {
      type: String,
      required: true
    },
    moduleName: String,
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed'],
      default: 'not_started'
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100
    },
    startDate: Date,
    completionDate: Date,
    timeSpent: {
      type: Number, // in seconds
      default: 0
    },
    // Track which lessons were completed
    lessons: [{
      lessonId: {
        type: String,
        required: true
      },
      lessonName: String,
      status: {
        type: String,
        enum: ['not_started', 'in_progress', 'completed'],
        default: 'not_started'
      },
      completionDate: Date,
      timeSpent: {
        type: Number, // in seconds
        default: 0
      }
    }],
    // Track quiz attempts and scores
    quizzes: [{
      quizId: {
        type: String,
        required: true
      },
      quizName: String,
      attempts: [{
        attemptNumber: Number,
        startDate: Date,
        completionDate: Date,
        score: {
          type: Number,
          min: 0,
          max: 100
        },
        timeSpent: Number, // in seconds
        answers: [{
          questionId: String,
          selectedOption: String,
          isCorrect: Boolean
        }]
      }],
      bestScore: {
        type: Number,
        min: 0,
        max: 100
      },
      passed: {
        type: Boolean,
        default: false
      }
    }]
  }],
  // Store certificates earned
  certificates: [{
    certificateId: String,
    name: String,
    issueDate: Date,
    url: String
  }],
  // Notes or comments from instructors
  instructorFeedback: [{
    instructorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    message: String,
    date: {
      type: Date,
      default: Date.now
    }
  }]
}, { 
  timestamps: true
});

// Indexes for faster queries
UserProgressSchema.index({ userId: 1, courseId: 1 }, { unique: true });
UserProgressSchema.index({ courseId: 1, 'modules.quizzes.passed': 1 });
UserProgressSchema.index({ userId: 1, enrollmentDate: -1 });
UserProgressSchema.index({ overallProgress: 1 });

module.exports = mongoose.model('UserProgress', UserProgressSchema);