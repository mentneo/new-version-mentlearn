const mongoose = require('mongoose');

const TransactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  },
  transactionType: {
    type: String,
    enum: ['purchase', 'refund', 'subscription', 'renewal', 'cancellation'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded', 'cancelled'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal', 'bank_transfer', 'crypto', 'other'],
    required: true
  },
  paymentDetails: {
    gateway: String,
    transactionId: String,
    last4: String,
    cardType: String
  },
  // For subscription-based models
  subscription: {
    planId: String,
    planName: String,
    interval: {
      type: String,
      enum: ['monthly', 'quarterly', 'annual']
    },
    startDate: Date,
    endDate: Date,
    autoRenew: {
      type: Boolean,
      default: true
    },
    status: {
      type: String,
      enum: ['active', 'cancelled', 'paused', 'expired']
    }
  },
  // For tax and billing
  invoiceDetails: {
    invoiceId: String,
    billingAddress: {
      name: String,
      addressLine1: String,
      addressLine2: String,
      city: String,
      state: String,
      country: String,
      postalCode: String
    },
    taxAmount: Number,
    discountAmount: Number
  },
  // Reference codes like coupons/promotions
  couponCode: String,
  discountApplied: Number,
  // Refund information if applicable
  refundInfo: {
    refundDate: Date,
    refundAmount: Number,
    reason: String,
    refundTransactionId: String
  },
  // Additional metadata
  metadata: {
    type: Object,
    default: {}
  },
  // IP address for fraud prevention
  ipAddress: String
}, { 
  timestamps: true 
});

// Indexes for payment tracking and reporting
TransactionSchema.index({ userId: 1, createdAt: -1 });
TransactionSchema.index({ courseId: 1, transactionType: 1 });
TransactionSchema.index({ status: 1, createdAt: -1 });
TransactionSchema.index({ 'subscription.status': 1, 'subscription.endDate': 1 });

module.exports = mongoose.model('Transaction', TransactionSchema);