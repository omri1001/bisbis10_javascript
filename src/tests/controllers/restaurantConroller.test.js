const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');

const restaurantController = require('../../controllers/restaurantController');
const restaurantModel = require('../../models/restaurantModel');

// Mock the restaurant model to avoid actual database calls
jest.mock('../../models/restaurantModel');

const app = express();
app.use(bodyParser.json());

// Define routes corresponding to the controller methods
app.get('/restaurants', restaurantController.listAllRestaurants);
app.get('/restaurants/:id', restaurantController.getRestaurantById);
app.post('/restaurants', restaurantController.addRestaurant);
app.put('/restaurants/:id', restaurantController.updateRestaurant);
app.delete('/restaurants/:id', restaurantController.deleteRestaurant);


// Group tests into a describe block
describe('Restaurant Controller Tests', () => {
    // Clear all mocks before each test to ensure a clean test environment
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Test case for listing all restaurants successfully
    test('GET /restaurants - lists all restaurants', async () => {
        const mockRestaurants = [{ id: 1, name: 'Testaurant', cuisine: 'Testinese' }];
        restaurantModel.getAllRestaurants.mockResolvedValue(mockRestaurants);

        const response = await request(app).get('/restaurants');
        expect(response.status).toEqual(200);
        expect(response.body).toEqual(mockRestaurants);
        expect(restaurantModel.getAllRestaurants).toHaveBeenCalled();
    });

    // Test case for handling no matches when filtering by cuisine
    test('GET /restaurants - filters by cuisine and handles no matches', async () => {
        restaurantModel.getRestaurantsByCuisine.mockResolvedValue([]);

        const response = await request(app).get('/restaurants?cuisine=Unknown');
        expect(response.status).toEqual(404);
        expect(response.body).toEqual({ message: 'No restaurants found with that cuisine' });
        expect(restaurantModel.getRestaurantsByCuisine).toHaveBeenCalledWith('Unknown');
    });

    // Test case for fetching a single restaurant by ID
    test('GET /restaurants/:id - fetches a single restaurant', async () => {
        const mockRestaurant = { id: 1, name: 'Testaurant', cuisine: 'Testinese' };
        restaurantModel.getRestaurantById.mockResolvedValue(mockRestaurant);

        const response = await request(app).get('/restaurants/1');
        expect(response.status).toEqual(200);
        expect(response.body).toEqual(mockRestaurant);
        expect(restaurantModel.getRestaurantById).toHaveBeenCalledWith("1");
    });

    // Test case for creating a new restaurant successfully
    test('POST /restaurants - creates a new restaurant', async () => {
        const newRestaurant = { name: 'New Place', isKosher: true, cuisines: ['Italian'] };
        restaurantModel.addRestaurant.mockResolvedValue({ id: 2, ...newRestaurant });

        const response = await request(app)
            .post('/restaurants')
            .send(newRestaurant);
        expect(response.status).toEqual(201);
        expect(response.body).toEqual({ id: 2, ...newRestaurant });
        expect(restaurantModel.addRestaurant).toHaveBeenCalledWith(newRestaurant);
    });

    // Test case for updating an existing restaurant
    test('PUT /restaurants/:id - updates an existing restaurant', async () => {
        const updatedRestaurant = { name: 'Updated Name', isKosher: false, cuisines: ['Mexican'] };
        restaurantModel.updateRestaurant.mockResolvedValue({ id: 1, ...updatedRestaurant });

        const response = await request(app)
            .put('/restaurants/1')
            .send(updatedRestaurant);
        expect(response.status).toEqual(200);
        expect(response.body).toEqual({ id: 1, ...updatedRestaurant });
        expect(restaurantModel.updateRestaurant).toHaveBeenCalledWith("1", updatedRestaurant);
    });

    // Test case for deleting a restaurant successfully
    test('DELETE /restaurants/:id - deletes a restaurant', async () => {
        restaurantModel.deleteRestaurant.mockResolvedValue(true);

        const response = await request(app)
            .delete('/restaurants/1');
        expect(response.status).toEqual(204);
        expect(restaurantModel.deleteRestaurant).toHaveBeenCalledWith("1");
    });

    // Test case for handling deletion failure when the restaurant cannot be found
    test('DELETE /restaurants/:id - fails to find a restaurant to delete', async () => {
        restaurantModel.deleteRestaurant.mockResolvedValue(false);

        const response = await request(app)
            .delete('/restaurants/999');
        expect(response.status).toEqual(404);
        expect(response.body).toEqual({ message: 'Restaurant not found' });
    });
});
