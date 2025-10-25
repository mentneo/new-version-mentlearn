const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true }, // razorpay order id
  amount: Number, // in paise
  currency: { type: String, default: 'INR' },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  createdBy: String, // firebase uid
  status: { type: String, default: 'created' }
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);