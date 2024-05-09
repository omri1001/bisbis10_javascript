// controllers/dishController.js
const dishModel = require('../models/dishModel');

// List all dishes for a restaurant
exports.listDishes = async (req, res) => {
    const restaurantId = req.params.id;
    console.log(`API call: List all dishes for restaurant ID: ${restaurantId}`);
    try {
        const dishes = await dishModel.getDishesByRestaurant(restaurantId);
        console.log(`Sending ${dishes.length} dishes`);
        res.status(200).json(dishes);
    } catch (error) {
        console.error("Failed to list dishes for restaurant: ", error);
        res.status(500).json({ message: error.message });
    }
};


// Add a new dish
exports.addDish = async (req, res) => {
    console.log(`API call: Add a new dish to restaurant ID: ${req.params.id}`);
    try {
        const dish = await dishModel.addDish(req.params.id, req.body);
        res.status(201).json(dish);
    } catch (error) {
        console.error("Failed to add a new dish: ", error);
        res.status(500).json({ message: error.message });
    }
};

// Update a dish
exports.updateDish = async (req, res) => {
    console.log(`API call: Update dish ID: ${req.params.dishId}`);
    try {
        const updatedDish = await dishModel.updateDish(req.params.dishId, req.params.id, req.body);
        if (updatedDish) {
            res.status(200).json(updatedDish);
        } else {
            res.status(404).json({ message: 'Dish or restaurant not found' });
        }
    } catch (error) {
        console.error("Failed to update dish: ", error);
        res.status(500).json({ message: error.message });
    }
};

// Delete a dish
exports.deleteDish = async (req, res) => {
    console.log(`API call: Delete dish ID: ${req.params.dishId}`);
    try {
        await dishModel.deleteDish(req.params.dishId);
        res.status(204).send();
    } catch (error) {
        console.error("Failed to delete dish: ", error);
        res.status(500).json({ message: error.message });
    }
};