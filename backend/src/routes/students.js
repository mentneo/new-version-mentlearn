const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');

// Optional query param `?source=legacy` forces reading from legacy users collection
router.get('/', (req, res, next) => {
	if (req.query.source === 'legacy') return studentController.getStudents(req, res, next);
	return studentController.getStudents(req, res, next);
});
router.get('/:id', studentController.getStudent);
router.post('/', studentController.createStudent);
router.put('/:id', studentController.updateStudent);

module.exports = router;
