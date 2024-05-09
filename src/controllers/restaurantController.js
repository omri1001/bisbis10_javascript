//restaurantController.js
const restaurantModel = require('../models/restaurantModel');

// List all restaurants or filter by cuisine
exports.listAllRestaurants = async (req, res) => {
    try {
        const cuisine = req.query.cuisine;
        console.log("API call: List all restaurants");
        let restaurants;
        if (cuisine) {
            console.log(`Filtering by cuisine: ${cuisine}`);
            restaurants = await restaurantModel.getRestaurantsByCuisine(cuisine);
            if (restaurants.length === 0) {
                return res.status(404).json({ message: 'No restaurants found with that cuisine' });
            }
        } else {
            restaurants = await restaurantModel.getAllRestaurants();
        }
        console.log(`Sending ${restaurants.length} restaurants`);
        res.status(200).json(restaurants);
    } catch (error) {
        console.error("Failed to list all restaurants: ", error);
        res.status(500).json({ message: error.message });
    }
};

// Get a single restaurant by ID
exports.getRestaurantById = async (req, res) => {
    try {
        console.log(`API call: Get a single restaurant by ID ${req.params.id}`);
        const restaurant = await restaurantModel.getRestaurantById(req.params.id);
        if (restaurant) {
            res.status(200).json(restaurant);
        } else {
            res.status(404).json({ message: 'Restaurant not found' });
        }
    } catch (error) {
        console.error("Failed to get restaurant by ID: ", error);
        res.status(500).json({ message: error.message });
    }
};

// Add a new restaurant
exports.addRestaurant = async (req, res) => {
    const { name, isKosher, cuisines } = req.body;
    if (!name || typeof name !== 'string' || !Array.isArray(cuisines)) {
        return res.status(400).json({ message: "Invalid input data" });
    }

    try {
        console.log("API call: Add a new restaurant");
        const restaurant = await restaurantModel.addRestaurant(req.body);
        console.log("New restaurant added:", restaurant);
        res.status(201).json(restaurant);
    } catch (error) {
        console.error("Failed to add a new restaurant: ", error);
        res.status(500).json({ message: error.message });
    }
};

// Update an existing restaurant
exports.updateRestaurant = async (req, res) => {
    try {
        console.log(`API call: Update a restaurant by ID ${req.params.id}`);
        const updatedRestaurant = await restaurantModel.updateRestaurant(req.params.id, req.body);
        if (updatedRestaurant) {
            res.status(200).json(updatedRestaurant);
        } else {
            res.status(404).json({ message: 'Restaurant not found' });
        }
    } catch (error) {
        console.error("Failed to update restaurant: ", error);
        res.status(500).json({ message: error.message });
    }
};

// Delete a restaurant
exports.deleteRestaurant = async (req, res) => {
    try {
        console.log(`API call: Delete a restaurant by ID ${req.params.id}`);
        const success = await restaurantModel.deleteRestaurant(req.params.id);
        if (success) {
            res.status(204).send();
        } else {
            res.status(404).json({ message: 'Restaurant not found' });
        }
    } catch (error) {
        console.error("Failed to delete restaurant: ", error);
        res.status(500).json({ message: error.message });
    }
};

