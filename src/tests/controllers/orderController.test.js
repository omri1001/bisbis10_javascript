const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');

const orderController = require('../../controllers/orderController');
const orderModel = require('../../models/orderModel');

jest.mock('../../models/orderModel'); // Mock the order model to prevent actual database interaction

const app = express();
app.use(bodyParser.json());

// Define the route corresponding to the controller method
app.post('/orders', orderController.createOrder);

// Group tests into a describe block
describe('Order Controller Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Test case for successfully creating an order
    test('POST /orders - successfully creates an order', async () => {
        const newOrder = {
            restaurantId: 'rest-123',
            orderItems: [{ dishId: 'dish-456', amount: 2 }]
        };
        const expectedResponse = { orderId: '1234-5678' };
        orderModel.createOrder.mockResolvedValue(expectedResponse);

        const response = await request(app)
            .post('/orders')
            .send(newOrder);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(expectedResponse);
        expect(orderModel.createOrder).toHaveBeenCalledWith(newOrder);
    });

    // Test case for handling errors when creating an order
    test('POST /orders - handles error when failing to create an order', async () => {
        const newOrder = {
            restaurantId: 'rest-123',
            orderItems: [{ dishId: 'dish-456', amount: 2 }]
        };
        orderModel.createOrder.mockRejectedValue(new Error("Failed to create order"));

        const response = await request(app)
            .post('/orders')
            .send(newOrder);

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: "Failed to create order" });
        expect(orderModel.createOrder).toHaveBeenCalledWith(newOrder);
    });
});