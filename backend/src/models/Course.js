const mongoose = require('mongoose');

const CourseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: { type: String },
  tags: [String],
  price: { type: Number, default: 0 },
  published: { type: Boolean, default: false },
  metadata: { type: Object },
}, { timestamps: true });

module.exports = mongoose.model('Course', CourseSchema);
