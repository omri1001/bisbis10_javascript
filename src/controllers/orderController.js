// controllers/orderController.js
const orderModel = require('../models/orderModel');

exports.createOrder = async (req, res) => {
    try {
        console.log("API call: Create a new order");
        const order = await orderModel.createOrder(req.body);
        res.status(200).json(order);
    } catch (error) {
        console.error("Failed to create order: ", error);
        res.status(400).json({ message: error.message });
    }
};