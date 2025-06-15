const express = require('express');
const router = express.Router();
const { isAuthenticatedUser, authorizeRoles } = require('../middleware/auth');
const studentController = require('../controllers/student.controller');

// ...existing routes...

router.get('/notifications', isAuthenticatedUser, authorizeRoles('student'), studentController.getNotifications);

module.exports = router;