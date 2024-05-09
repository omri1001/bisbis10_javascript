const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');

const ratingController = require('../../controllers/ratingController');
const ratingModel = require('../../models/ratingModel');

jest.mock('../../models/ratingModel'); // Mock the rating model to prevent actual database interaction

const app = express();
app.use(bodyParser.json());

// Define the route corresponding to the controller method
app.post('/ratings', ratingController.addRating);

describe('Rating Controller Tests', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('POST /ratings - successfully adds a rating', async () => {
        const newRating = { restaurantId: 1, userId: 1, score: 5, comment: "Excellent!" };
        const expectedResponse = { id: 1, ...newRating };
        ratingModel.addRating.mockResolvedValue(expectedResponse);

        const response = await request(app)
            .post('/ratings')
            .send(newRating);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(expectedResponse);
        expect(ratingModel.addRating).toHaveBeenCalledWith(newRating);
    });

    test('POST /ratings - handles failures in adding a rating', async () => {
        const newRating = { restaurantId: 1, userId: 1, score: 5, comment: "Excellent!" };
        ratingModel.addRating.mockRejectedValue(new Error("Failed to add rating"));

        const response = await request(app)
            .post('/ratings')
            .send(newRating);

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: "Failed to add rating" });
        expect(ratingModel.addRating).toHaveBeenCalledWith(newRating);
    });
});