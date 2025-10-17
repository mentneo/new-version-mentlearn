const Student = require('../models/Student');
const { ObjectId } = require('mongodb');

// Helper: map legacy user doc to student shape
function mapUserToStudent(userDoc) {
  return {
    _id: userDoc._id,
    name: userDoc.name || userDoc.fullName || userDoc.displayName || userDoc.username,
    email: userDoc.email,
    avatar: userDoc.avatar || userDoc.photoURL,
    bio: userDoc.bio || userDoc.profile || null,
    enrolledCourses: userDoc.enrollments || userDoc.enrolledCourses || [],
    metadata: userDoc.metadata || {},
    legacy: true,
  };
}

exports.getStudents = async (req, res, next) => {
  try {
    const students = await Student.find().lean();
    if (students && students.length) return res.json(students);

    // Fallback: check for a legacy `users` collection in the connected DBs
    const db = require('mongoose').connection.db;
    const altNames = ['users', 'user', 'profiles'];
    for (const name of altNames) {
      const exists = await db.listCollections({ name }).hasNext();
      if (exists) {
        const docs = await db.collection(name).find({}).limit(1000).toArray();
        const mapped = docs.map(mapUserToStudent);
        return res.json(mapped);
      }
    }

    // nothing found
    res.json([]);
  } catch (err) {
    next(err);
  }
};

exports.getStudent = async (req, res, next) => {
  try {
    const student = await Student.findById(req.params.id).lean();
    if (student) return res.json(student);

    // fallback to users collection by ObjectId
    const db = require('mongoose').connection.db;
    let oid;
    try { oid = new ObjectId(req.params.id); } catch (e) { oid = null; }
    if (oid) {
      const names = ['users','user','profiles'];
      for (const n of names) {
        const exists = await db.listCollections({ name: n }).hasNext();
        if (!exists) continue;
        const doc = await db.collection(n).findOne({ _id: oid });
        if (doc) return res.json(mapUserToStudent(doc));
      }
    }

    return res.status(404).json({ message: 'Student not found' });
  } catch (err) {
    next(err);
  }
};

exports.createStudent = async (req, res, next) => {
  try {
    const payload = req.body;
    const student = await Student.create(payload);
    res.status(201).json(student);
  } catch (err) {
    next(err);
  }
};

exports.updateStudent = async (req, res, next) => {
  try {
    const updated = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Student not found' });
    res.json(updated);
  } catch (err) {
    next(err);
  }
};
