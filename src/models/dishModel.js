// models/dishModel.js
const db = require('../db/db');



// Get all dishes by restaurant ID
const getDishesByRestaurant = async (restaurantId) => {
    try {
        console.log(`Fetching all dishes for restaurant ID: ${restaurantId}`);
        // Selects all dishes from the database that belong to a specific restaurant
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
    if (!name || !description || typeof price !== 'number') {
        console.error("Validation failed: invalid inputs for new dish");
        throw new Error("Invalid input data for dish");
    }
    try {
        console.log(`Adding new dish to restaurant ID: ${restaurantId}`, dish);
        // Inserts a new dish into the dishes table and returns the inserted dish
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

// Update a dish
const updateDish = async (dishId, restaurantId, data) => {
    let query = 'SELECT * FROM dishes WHERE id = $1 AND restaurant_id = $2';
    try {
        const checkResult = await db.query(query, [dishId, restaurantId]);
        if (checkResult.rows.length === 0) {
            console.log("No dish found with the specified ID and restaurant ID.");
            return null; // Or you can throw an error or handle as appropriate
        }

        // Proceed with the update if the dish is found
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

// Delete a dish
const deleteDish = async (dishId) => {
    try {
        console.log(`Deleting dish ID: ${dishId} and all associated order items`);

        // Start a transaction
        await db.query('BEGIN');

        // Delete all order items related to the dish
        const { rowCount: orderItemsDeleted } = await db.query('DELETE FROM order_items WHERE dish_id = $1', [dishId]);
        console.log(`Deleted ${orderItemsDeleted} order items associated with dish ID: ${dishId}`);

        // Delete the dish
        const { rowCount: dishDeleted } = await db.query('DELETE FROM dishes WHERE id = $1', [dishId]);
        if (dishDeleted === 0) {
            console.log("No dish found with ID:", dishId);
            await db.query('ROLLBACK'); // Rollback the transaction if no dish is found
            return false;
        }

        console.log("Dish deleted successfully");
        await db.query('COMMIT'); // Commit the transaction
        return true;
    } catch (err) {
        console.error("Error deleting dish: ", err);
        await db.query('ROLLBACK'); // Rollback the transaction on error
        throw err;
    }
};

module.exports = {
    getDishesByRestaurant,
    addDish,
    updateDish,
    deleteDish
};