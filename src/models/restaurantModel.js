// models/restaurantModel.js
const db = require('../db/db');

// Fetch all restaurants from the database
const getAllRestaurants = async () => {
    try {
        console.log("Fetching all restaurants from the database");
        // SQL query to select all restaurant records from the 'restaurants' table
        const { rows } = await db.query('SELECT * FROM restaurants');
        console.log(`Retrieved ${rows.length} restaurants`);
        return rows;
    } catch (err) {
        console.error("Error fetching all restaurants: ", err);
        throw err;
    }
};

// Fetch restaurants that match a specific cuisine type
const getRestaurantsByCuisine = async (cuisine) => {
    try {
        console.log(`Fetching restaurants by cuisine: ${cuisine}`);
        // SQL query to select restaurants that include the specified cuisine in their cuisines array
        const { rows } = await db.query(
            'SELECT * FROM restaurants WHERE $1 = ANY(cuisines)',
            [cuisine]
        );
        console.log(`Retrieved ${rows.length} restaurants with cuisine ${cuisine}`);
        return rows; // Return the list of restaurants that serve the specified cuisine

    } catch (err) {
        console.error("Error fetching restaurants by cuisine: ", err);
        throw err;
    }
};


// Fetch a single restaurant by ID, including its dishes
const getRestaurantById = async (id) => {
    try {
        console.log(`Fetching restaurant by ID: ${id}`);
        const restaurantQuery = 'SELECT * FROM restaurants WHERE id = $1';
        // find all dishes associated with the restaurant ID
        const dishesQuery = 'SELECT id, name, description, price FROM dishes WHERE restaurant_id = $1';

        const restaurantResult = await db.query(restaurantQuery, [id]);
        const dishesResult = await db.query(dishesQuery, [id]);

        if (restaurantResult.rows.length === 0) {
            console.log("No restaurant found with ID:", id);
            return null;
        }

        const restaurant = restaurantResult.rows[0];
        restaurant.dishes = dishesResult.rows;

        console.log("Restaurant found:", restaurant);
        return restaurant;
    } catch (err) {
        console.error("Error fetching restaurant by ID: ", err);
        throw err;
    }
};

// Add a new restaurant to the database
const addRestaurant = async (restaurant) => {
    const { name, isKosher, cuisines } = restaurant;
    try {
        console.log("Adding new restaurant:", restaurant);
        const { rows } = await db.query(
            // SQL query to insert a new restaurant into the 'restaurants' table
            'INSERT INTO restaurants (name, isKosher, cuisines) VALUES ($1, $2, $3) RETURNING *',
            [name, isKosher, cuisines]
        );
        console.log("New restaurant added:", rows[0]);
        return rows[0]; // Return the newly added restaurant
    } catch (err) {
        console.error("Error adding new restaurant: ", err);
        throw err;
    }
};

// Update existing restaurant details in the database
const updateRestaurant = async (id, data) => {
    let query = 'UPDATE restaurants SET ';
    let fieldsToUpdate = [];
    let values = [];

    // Prepare dynamic part of SQL query based on provided data fields
    Object.keys(data).forEach((key, index) => {
        if (data[key] !== undefined) {
            fieldsToUpdate.push(`${key} = $${index + 1}`);
            values.push(data[key]);
        }
    });

    if (fieldsToUpdate.length === 0) {
        throw new Error("No valid fields provided for update");
    }

    // Complete SQL query to update specific fields in the 'restaurants' table
    query += fieldsToUpdate.join(', ');
    query += ` WHERE id = $${fieldsToUpdate.length + 1} RETURNING *`;
    values.push(id);

    try {
        console.log("Updating restaurant ID:", id);
        // Execute the update query and return the updated restaurant
        const { rows } = await db.query(query, values);
        if (rows.length === 0) {
            console.log("No restaurant found with ID:", id);
            return null;
        }
        console.log("Restaurant updated:", rows[0]);
        return rows[0];
    } catch (err) {
        console.error("Error updating restaurant: ", err);
        throw err;
    }



};

// Delete a restaurant and all related data
const deleteRestaurant = async (id) => {
    try {
        console.log("Deleting restaurant and related data for restaurant ID:", id);

        // Start a transaction
        await db.query('BEGIN');

        // First, find all dishes for the restaurant
        const { rows: dishes } = await db.query('SELECT id FROM dishes WHERE restaurant_id = $1', [id]);

        // Delete all order items for these dishes
        for (const dish of dishes) {
            await db.query('DELETE FROM order_items WHERE dish_id = $1', [dish.id]);
        }

        // Now delete the dishes
        await db.query('DELETE FROM dishes WHERE restaurant_id = $1', [id]);

        // Delete related ratings
        await db.query('DELETE FROM ratings WHERE restaurant_id = $1', [id]);

        // SQL query to select all order IDs for a specific restaurant
        const { rows: orders } = await db.query('SELECT id FROM orders WHERE restaurant_id = $1', [id]);

        // Delete all order items for these orders
        for (const order of orders) {
            await db.query('DELETE FROM order_items WHERE order_id = $1', [order.id]);
        }

        // Now delete the orders
        await db.query('DELETE FROM orders WHERE restaurant_id = $1', [id]);

        // Finally, delete the restaurant
        const { rowCount } = await db.query('DELETE FROM restaurants WHERE id = $1', [id]);
        if (rowCount === 0) {
            console.log("No restaurant found with ID:", id);
            await db.query('ROLLBACK'); // Rollback the transaction
            return false;
        }

        // Commit the transaction
        await db.query('COMMIT');

        console.log("Restaurant and all related data deleted successfully");
        return true;
    } catch (err) {
        console.error("Error deleting restaurant and related data: ", err);
        await db.query('ROLLBACK'); // Rollback the transaction on error
        throw err;
    }
};

module.exports = {
    getRestaurantsByCuisine,
    getAllRestaurants,
    getRestaurantById,
    addRestaurant,
    updateRestaurant,
    deleteRestaurant
};