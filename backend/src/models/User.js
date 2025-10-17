const mongoose = require('mongoose');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, required: true, select: false },
  avatar: { type: String },
  role: { 
    type: String, 
    enum: ['admin', 'mentor', 'student', 'guest'], 
    default: 'student' 
  },
  isActive: { type: Boolean, default: true },
  lastLogin: { type: Date },
  passwordResetToken: String,
  passwordResetExpires: Date,
  metadata: { type: Object },
}, { timestamps: true });

// Method to check if password matches the hashed password
UserSchema.methods.matchPassword = async function(enteredPassword) {
  // In a real app, use bcrypt or similar to compare passwords
  // This is a simple placeholder implementation
  const hash = crypto.createHash('sha256').update(enteredPassword).digest('hex');
  return hash === this.password;
};

// Pre-save hook to hash password
UserSchema.pre('save', function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  // In a real app, use bcrypt or similar to hash passwords
  // This is a simple placeholder implementation
  this.password = crypto.createHash('sha256').update(this.password).digest('hex');
  next();
});

module.exports = mongoose.model('User', UserSchema);