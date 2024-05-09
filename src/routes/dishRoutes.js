// routes/dishRoutes.js
const express = require('express');
const router = express.Router({ mergeParams: true });
const dishController = require('../controllers/dishController');

// List all dishes or filter them based on criteria (if implemented in the controller)
router.get('/dishes', dishController.listDishes);

// Add a new dish to a restaurant
router.post('/dishes', dishController.addDish);

// Update an existing dish's details
router.put('/dishes/:dishId', dishController.updateDish);

// Delete a dish from the menu
router.delete('/dishes/:dishId', dishController.deleteDish);

module.exports = router;