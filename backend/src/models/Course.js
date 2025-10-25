const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  title: String,
  price: { type: Number, required: true }, // price in rupees (e.g., 999)
  thumbnailUrl: String,
  // add fields as needed
}, { timestamps: true });

module.exports = mongoose.model('Course', CourseSchema);
