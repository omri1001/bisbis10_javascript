const request = require('supertest'); // Used for making HTTP requests in tests
const express = require('express');
const bodyParser = require('body-parser'); // Middleware to parse JSON bodies
const dishModel = require('../../models/dishModel'); // Dish model for database operations
const dishController = require('../../controllers/dishController'); // Controller for dish-related routes

// Mock the dishModel module to prevent actual database operations during tests
jest.mock('../../models/dishModel');

const app = express();
app.use(bodyParser.json());

// Define routes using the dish controller methods
app.get('/restaurants/:id/dishes', dishController.listDishes);
app.post('/restaurants/:id/dishes', dishController.addDish);
app.put('/restaurants/:id/dishes/:dishId', dishController.updateDish);
app.delete('/restaurants/:id/dishes/:dishId', dishController.deleteDish);

// Group tests into a describe block
describe('Dish Controller Tests', () => {
    // Clear all mocks after each test to ensure clean test state
    afterEach(() => {
        jest.clearAllMocks();
    });

    // Test listing all dishes for a restaurant successfully
    test('List all dishes for a restaurant - success', async () => {
        const dishes = [{ id: 1, name: 'Pasta' }];
        dishModel.getDishesByRestaurant.mockResolvedValue(dishes);
        const response = await request(app).get('/restaurants/1/dishes');

        // Assertions to verify the response
        expect(response.status).toBe(200); // Expect a 200 OK response
        expect(response.body).toEqual(dishes); // Expect the response body to match the mock data
        expect(dishModel.getDishesByRestaurant).toHaveBeenCalledWith('1'); // Verify the correct restaurant ID was used
    });

    // Test listing dishes when an error occurs
    test('List all dishes for a restaurant - failure', async () => {
        dishModel.getDishesByRestaurant.mockRejectedValue(new Error('Failed to fetch dishes'));
        const response = await request(app).get('/restaurants/1/dishes');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Failed to fetch dishes' });
    });

    // Test adding a new dish successfully
    test('Add a new dish - success', async () => {
        const newDish = { name: 'New Dish', description: 'Delicious', price: 10 };
        dishModel.addDish.mockResolvedValue(newDish);
        const response = await request(app).post('/restaurants/1/dishes').send(newDish);

        expect(response.status).toBe(201);
        expect(response.body).toEqual(newDish);
    });

    // Test updating a dish successfully
    test('Update a dish - success', async () => {
        const updatedDish = { name: 'Updated Dish', description: 'More Delicious', price: 12 };
        dishModel.updateDish.mockResolvedValue(updatedDish);
        const response = await request(app).put('/restaurants/1/dishes/1').send(updatedDish);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(updatedDish);
    });

    // Test updating a dish that is not found
    test('Update a dish - not found', async () => {
        dishModel.updateDish.mockResolvedValue(null);
        const response = await request(app).put('/restaurants/1/dishes/1').send({ name: 'Nonexistent' });

        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: 'Dish or restaurant not found' });
    });

    test('Delete a dish - success', async () => {
        dishModel.deleteDish.mockResolvedValue();
        const response = await request(app).delete('/restaurants/1/dishes/1');

        expect(response.status).toBe(204);
    });

    // Test deleting a dish successfully
    test('Delete a dish - failure', async () => {
        dishModel.deleteDish.mockRejectedValue(new Error('Failed to delete'));
        const response = await request(app).delete('/restaurants/1/dishes/1');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Failed to delete' });  // Updated expected message
    });
});