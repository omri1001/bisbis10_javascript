// models/orderModel.js
const db = require('../db/db');
const { v4: uuidv4 } = require('uuid');

const checkRestaurantExists = async (restaurantId) => {
    const result = await db.query('SELECT 1 FROM restaurants WHERE id = $1', [restaurantId]);
    return result.rows.length > 0;
};

const checkDishExistsInRestaurant = async (dishId, restaurantId) => {
    const result = await db.query('SELECT 1 FROM dishes WHERE id = $1 AND restaurant_id = $2', [dishId, restaurantId]);
    return result.rows.length > 0;
};


const createOrder = async (orderDetails) => {
    const { restaurantId, orderItems } = orderDetails;

    // Validate restaurant exists
    const restaurantExists = await checkRestaurantExists(restaurantId);
    if (!restaurantExists) {
        throw new Error("Restaurant not found");
    }

    // Validate each dish exists and belongs to the restaurant
    for (const item of orderItems) {
        const dishExistsInRestaurant = await checkDishExistsInRestaurant(item.dishId, restaurantId);
        if (!dishExistsInRestaurant) {
            throw new Error(`Dish with ID ${item.dishId} not found in the specified restaurant`);
        }
    }

    // Begin transaction
    await db.query('BEGIN');
    try {
        const orderId = uuidv4();
        await db.query('INSERT INTO orders (id, restaurant_id, created_at) VALUES ($1, $2, NOW())', [orderId, restaurantId]);

        for (const item of orderItems) {
            await db.query('INSERT INTO order_items (order_id, dish_id, amount) VALUES ($1, $2, $3)', [orderId, item.dishId, item.amount]);
        }

        await db.query('COMMIT');
        console.log("Order created successfully:", orderId);
        return { orderId: orderId };
    } catch (err) {
        await db.query('ROLLBACK');
        console.error("Transaction failed, rollback initiated:", err);
        throw err;
    }
};

module.exports = {
    createOrder
};