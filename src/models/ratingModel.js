// models/ratingModel.js
const db = require('../db/db');

// Adds a new rating to a restaurant in the database
const addRating = async (ratingDetails) => {
    const { restaurantId, rating } = ratingDetails;
    try {
        console.log(`Adding rating for restaurant ID: ${restaurantId}`);
        // SQL query to insert a new rating for a specific restaurant
        const query = 'INSERT INTO ratings (restaurant_id, rating) VALUES ($1, $2) RETURNING *';
        // Execute the query and return the newly added rating
        const { rows } = await db.query(query, [restaurantId, rating]);
        console.log("Rating added:", rows[0]);// Return the inserted rating row
        return rows[0];
    } catch (err) {
        console.error("Error adding rating: ", err);
        throw err;
    }
};

module.exports = {
    addRating
};