// models/ratingModel.js
const db = require('../db/db');

const addRating = async (ratingDetails) => {
    const { restaurantId, rating } = ratingDetails;
    try {
        console.log(`Adding rating for restaurant ID: ${restaurantId}`);
        const query = 'INSERT INTO ratings (restaurant_id, rating) VALUES ($1, $2) RETURNING *';
        const { rows } = await db.query(query, [restaurantId, rating]);
        console.log("Rating added:", rows[0]);
        return rows[0];
    } catch (err) {
        console.error("Error adding rating: ", err);
        throw err;
    }
};

module.exports = {
    addRating
};