// controllers/ratingController.js
const ratingModel = require('../models/ratingModel');

exports.addRating = async (req, res) => {
    try {
        console.log("API call: Add a new rating");
        const rating = await ratingModel.addRating(req.body);
        res.status(200).json(rating);
    } catch (error) {
        console.error("Failed to add rating: ", error);
        res.status(500).json({ message: error.message });
    }
};