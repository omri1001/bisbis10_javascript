//restaurantRoutes.js
const express = require('express');
const router = express.Router();
const restaurantController = require('../controllers/restaurantController');

// Get all restaurants or filter by cuisine
router.get('/restaurants', restaurantController.listAllRestaurants);

// Get a single restaurant by id
router.get('/restaurants/:id', restaurantController.getRestaurantById);

// Add a new restaurant
router.post('/restaurants', restaurantController.addRestaurant);

// Update an existing restaurant
router.put('/restaurants/:id', restaurantController.updateRestaurant);

// Delete a restaurant
router.delete('/restaurants/:id', restaurantController.deleteRestaurant);

module.exports = router;