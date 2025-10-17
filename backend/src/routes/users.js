const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// Regular user routes
router.get('/', userController.getUsers);
router.get('/:id', userController.getUser);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

// Auth routes
router.post('/register', userController.register);
router.post('/login', userController.login);
router.get('/me', userController.me);

module.exports = router;