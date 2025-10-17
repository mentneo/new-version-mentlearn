const express = require('express');
const router = express.Router();
const demoController = require('../controllers/demoController');

module.exports = (firestore) => {
  router.get('/', demoController.getDemos(firestore));
  router.post('/', demoController.createDemo(firestore));
  return router;
};
