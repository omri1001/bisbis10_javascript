const request = require('supertest');
const express = require('express');
const bodyParser = require('body-parser');
const dishModel = require('../../models/dishModel');
const dishController = require('../../controllers/dishController');

jest.mock('../../models/dishModel');

const app = express();
app.use(bodyParser.json());

app.get('/restaurants/:id/dishes', dishController.listDishes);
app.post('/restaurants/:id/dishes', dishController.addDish);
app.put('/restaurants/:id/dishes/:dishId', dishController.updateDish);
app.delete('/restaurants/:id/dishes/:dishId', dishController.deleteDish);

describe('Dish Controller Tests', () => {
    afterEach(() => {
        jest.clearAllMocks();
    });

    test('List all dishes for a restaurant - success', async () => {
        const dishes = [{ id: 1, name: 'Pasta' }];
        dishModel.getDishesByRestaurant.mockResolvedValue(dishes);
        const response = await request(app).get('/restaurants/1/dishes');

        expect(response.status).toBe(200);
        expect(response.body).toEqual(dishes);
        expect(dishModel.getDishesByRestaurant).toHaveBeenCalledWith('1');
    });

    test('List all dishes for a restaurant - failure', async () => {
        dishModel.getDishesByRestaurant.mockRejectedValue(new Error('Failed to fetch dishes'));
        const response = await request(app).get('/restaurants/1/dishes');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Failed to fetch dishes' });
    });

    test('Add a new dish - success', async () => {
        const newDish = { name: 'New Dish', description: 'Delicious', price: 10 };
        dishModel.addDish.mockResolvedValue(newDish);
        const response = await request(app).post('/restaurants/1/dishes').send(newDish);

        expect(response.status).toBe(201);
        expect(response.body).toEqual(newDish);
    });

    test('Update a dish - success', async () => {
        const updatedDish = { name: 'Updated Dish', description: 'More Delicious', price: 12 };
        dishModel.updateDish.mockResolvedValue(updatedDish);
        const response = await request(app).put('/restaurants/1/dishes/1').send(updatedDish);

        expect(response.status).toBe(200);
        expect(response.body).toEqual(updatedDish);
    });

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

    test('Delete a dish - failure', async () => {
        dishModel.deleteDish.mockRejectedValue(new Error('Failed to delete'));
        const response = await request(app).delete('/restaurants/1/dishes/1');

        expect(response.status).toBe(500);
        expect(response.body).toEqual({ message: 'Failed to delete' });  // Updated expected message
    });
});