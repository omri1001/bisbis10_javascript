const db = require('../../db/db');
const dishModel = require('../../models/dishModel');

jest.mock('../../db/db'); // Mocking the database module

// Group tests into a describe block for the Dish Model
describe('Dish Model', () => {
    // Clear all mocks before each test to ensure a clean test environment
    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Testing the function that fetches dishes by restaurant
    describe('getDishesByRestaurant', () => {
        it('should fetch all dishes for a specified restaurant', async () => {
            // Mock data for dishes
            const mockDishes = [{ id: 1, name: 'Spaghetti', description: 'Italian pasta', price: 10 }];
            // Mock the query function to resolve with the mock dishes
            db.query.mockResolvedValue({ rows: mockDishes });

            // Call the function to fetch dishes and assert the results
            const dishes = await dishModel.getDishesByRestaurant('1');
            expect(dishes).toEqual(mockDishes);
            // Verify that the query was called with the correct SQL and parameters
            expect(db.query).toHaveBeenCalledWith('SELECT id, name, description, price FROM dishes WHERE restaurant_id = $1', ['1']);
        });

        it('should handle errors during fetching of dishes', async () => {
            db.query.mockRejectedValue(new Error('Database error'));
            await expect(dishModel.getDishesByRestaurant('1')).rejects.toThrow('Database error');
        });
    });

    // Testing the function that adds a new dish
    describe('addDish', () => {
        const newDish = { name: 'Pizza', description: 'Cheesy pizza', price: 12 };

        it('should add a new dish successfully', async () => {
            db.query.mockResolvedValue({ rows: [newDish] });
            const result = await dishModel.addDish('1', newDish);
            expect(result).toEqual(newDish);
            expect(db.query).toHaveBeenCalledWith(
                'INSERT INTO dishes (restaurant_id, name, description, price) VALUES ($1, $2, $3, $4) RETURNING *',
                ['1', 'Pizza', 'Cheesy pizza', 12]
            );
        });

        it('should throw an error for invalid input data', async () => {
            await expect(dishModel.addDish('1', {})).rejects.toThrow('Invalid input data for dish');
        });

        it('should handle database errors when adding a new dish', async () => {
            db.query.mockRejectedValue(new Error('Database error'));
            await expect(dishModel.addDish('1', newDish)).rejects.toThrow('Database error');
        });
    });

    // Testing the function that updates a dish
    describe('updateDish', () => {
        it('should update a dish successfully', async () => {
            const updatedDish = { name: 'Updated Pizza', description: 'Updated description', price: 15 };
            db.query.mockResolvedValueOnce({ rows: [{ id: 1 }] }).mockResolvedValueOnce({ rows: [updatedDish] });

            const result = await dishModel.updateDish('1', '1', updatedDish);
            expect(result).toEqual(updatedDish);
            expect(db.query).toHaveBeenCalledTimes(2);
        });

        it('should return null if no dish found for updating', async () => {
            db.query.mockResolvedValueOnce({ rows: [] });
            const result = await dishModel.updateDish('1', '1', { name: 'Nonexistent' });
            expect(result).toBeNull();
        });
    });

    describe('deleteDish', () => {
        it('should delete a dish successfully', async () => {
            db.query.mockResolvedValue({ rowCount: 1 });
            await dishModel.deleteDish('1');
            expect(db.query).toHaveBeenCalledWith('DELETE FROM dishes WHERE id = $1', ['1']);
        });

        it('should handle errors during dish deletion', async () => {
            db.query.mockRejectedValue(new Error('Database error'));
            await expect(dishModel.deleteDish('1')).rejects.toThrow('Database error');
        });
    });
});