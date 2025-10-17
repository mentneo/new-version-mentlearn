const mongoose = require('mongoose');

const StudentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  avatar: { type: String },
  bio: { type: String },
  enrolledCourses: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
  metadata: { type: Object },
}, { timestamps: true });

module.exports = mongoose.model('Student', StudentSchema);
