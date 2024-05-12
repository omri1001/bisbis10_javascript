// models/dishModel.js
const db = require('../db/db');



// Get all dishes by restaurant ID
const getDishesByRestaurant = async (restaurantId) => {
    try {
        console.log(`Fetching all dishes for restaurant ID: ${restaurantId}`);
        /// Execute SQL query to get all dishes for the specified restaurant
        const { rows } = await db.query('SELECT id, name, description, price FROM dishes WHERE restaurant_id = $1', [restaurantId]);
        console.log(`Retrieved ${rows.length} dishes`);
        return rows;
    } catch (err) {
        console.error("Error fetching dishes by restaurant ID: ", err);
        throw err;
    }
};


// Add a new dish to a restaurant
const addDish = async (restaurantId, dish) => {
    const { name, description, price } = dish;
    // Check for missing or incorrect data before insertion
    if (!name || !description || typeof price !== 'number') {
        console.error("Validation failed: invalid inputs for new dish");
        throw new Error("Invalid input data for dish");
    }
    try {
        console.log(`Adding new dish to restaurant ID: ${restaurantId}`, dish);
        // Execute SQL query to insert a new dish and return the created record
        const { rows } = await db.query(
            'INSERT INTO dishes (restaurant_id, name, description, price) VALUES ($1, $2, $3, $4) RETURNING *',
            [restaurantId, name, description, price]
        );
        console.log("New dish added:", rows[0]);
        return rows[0];
    } catch (err) {
        console.error("Error adding new dish: ", err);
        throw err;
    }
};

// Update details of an existing dish
const updateDish = async (dishId, restaurantId, data) => {
    let query = 'SELECT * FROM dishes WHERE id = $1 AND restaurant_id = $2';
    try {
        // First check if the dish exists for the given ID and restaurant
        const checkResult = await db.query(query, [dishId, restaurantId]);
        if (checkResult.rows.length === 0) {
            console.log("No dish found with the specified ID and restaurant ID.");
            return null; // Or you can throw an error or handle as appropriate
        }

        // Update the dish if it exists
        query = 'UPDATE dishes SET ';
        let fieldsToUpdate = [];
        let values = [];

        Object.keys(data).forEach((key, index) => {
            fieldsToUpdate.push(`${key} = $${index + 1}`);
            values.push(data[key]);
        });

        query += fieldsToUpdate.join(', ');
        query += ` WHERE id = $${fieldsToUpdate.length + 1} AND restaurant_id = $${fieldsToUpdate.length + 2} RETURNING *`;
        values.push(dishId, restaurantId);

        console.log(`Updating dish ID: ${dishId} in restaurant ID: ${restaurantId}`);
        const { rows } = await db.query(query, values);
        if (rows.length > 0) {
            console.log("Dish updated:", rows[0]);
            return rows[0];
        } else {
            console.log("No changes made to dish or dish not found after initial check");
            return null;
        }
    } catch (err) {
        console.error("Error in dish update process: ", err);
        throw err;
    }
};

// Remove a dish from the database
const deleteDish = async (dishId) => {
    try {
        console.log(`Deleting dish ID: ${dishId} and all associated order items`);

        // Start a transaction to ensure all related deletions are successful
        await db.query('BEGIN');

        // First delete related order items
        const { rowCount: orderItemsDeleted } = await db.query('DELETE FROM order_items WHERE dish_id = $1', [dishId]);
        console.log(`Deleted ${orderItemsDeleted} order items associated with dish ID: ${dishId}`);

        // Then delete the dish itself
        const { rowCount: dishDeleted } = await db.query('DELETE FROM dishes WHERE id = $1', [dishId]);
        if (dishDeleted === 0) {
            console.log("No dish found with ID:", dishId);
            await db.query('ROLLBACK'); // Rollback the transaction if no dish is found
            return false;
        }

        console.log("Dish deleted successfully");
        await db.query('COMMIT'); // Commit the transaction if all deletions are successful
        return true;
    } catch (err) {
        console.error("Error deleting dish: ", err);
        await db.query('ROLLBACK'); // Rollback the transaction in case of error
        throw err;
    }
};

module.exports = {
    getDishesByRestaurant,
    addDish,
    updateDish,
    deleteDish
};