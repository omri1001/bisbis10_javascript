// routes/ratingRoutes.js
const express = require('express');
const router = express.Router();
const ratingController = require('../controllers/ratingController');

// Post a rating
router.post('/ratings', ratingController.addRating);

module.exports = router;