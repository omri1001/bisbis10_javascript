// models/orderModel.js
const db = require('../db/db');
const { v4: uuidv4 } = require('uuid');

// Check if a restaurant exists in the database by its ID
const checkRestaurantExists = async (restaurantId) => {
    const result = await db.query('SELECT 1 FROM restaurants WHERE id = $1', [restaurantId]);
    return result.rows.length > 0;
};

// Check if a dish exists within a specific restaurant
const checkDishExistsInRestaurant = async (dishId, restaurantId) => {
    const result = await db.query('SELECT 1 FROM dishes WHERE id = $1 AND restaurant_id = $2', [dishId, restaurantId]);
    return result.rows.length > 0; // Return true if the dish is found in the specified restaurant, false otherwise
};

// Create a new order with multiple order items
const createOrder = async (orderDetails) => {
    const { restaurantId, orderItems } = orderDetails;

    // Check if the specified restaurant exists
    const restaurantExists = await checkRestaurantExists(restaurantId);
    if (!restaurantExists) {
        throw new Error("Restaurant not found"); // Throw an error if the restaurant doesn't exist
    }

    // Check if each dish in the order exists and belongs to the specified restaurant
    for (const item of orderItems) {
        const dishExistsInRestaurant = await checkDishExistsInRestaurant(item.dishId, restaurantId);
        if (!dishExistsInRestaurant) {
            throw new Error(`Dish with ID ${item.dishId} not found in the specified restaurant`);
        }
    }

    // Start a transaction to ensure all operations are performed atomically
    await db.query('BEGIN');
    try {
        const orderId = uuidv4();
        // Insert the main order record into the orders table
        await db.query('INSERT INTO orders (id, restaurant_id, created_at) VALUES ($1, $2, NOW())', [orderId, restaurantId]);

        // Insert each order item associated with the order
        for (const item of orderItems) {
            await db.query('INSERT INTO order_items (order_id, dish_id, amount) VALUES ($1, $2, $3)', [orderId, item.dishId, item.amount]);
        }
        // Commit the transaction if all operations are successful
        await db.query('COMMIT');
        console.log("Order created successfully:", orderId);
        return { orderId: orderId };
    } catch (err) {
        // Rollback the transaction in case of any error
        await db.query('ROLLBACK');
        console.error("Transaction failed, rollback initiated:", err);
        throw err;
    }
};

module.exports = {
    createOrder
};