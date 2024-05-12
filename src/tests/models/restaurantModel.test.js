const db = require('../../db/db');
const restaurantModel = require('../../models/restaurantModel');

// Mock the database query function
db.query = jest.fn();

describe('Restaurant Model'), () => {
    beforeEach(() => {
        db.query.mockReset();
    });

    describe('getAllRestaurants', () => {
        it('returns all restaurants successfully', async () => {
            const mockRestaurants = [{
                id: 1,
                name: 'Taizu',
                averageRating: 4.83,
                isKosher: false,
                cuisines: ['Asian', 'Mexican', 'Indian']
            }];
            db.query.mockResolvedValue({rows: mockRestaurants});

            const results = await restaurantModel.getAllRestaurants();

            expect(results).toEqual(mockRestaurants);
            expect(db.query).toHaveBeenCalledWith('SELECT * FROM restaurants');
        });
    });

    describe('getRestaurantsByCuisine', () => {
        it('returns restaurants filtered by cuisine successfully', async () => {
            const mockRestaurants = [{id: 1, name: 'Taizu', cuisine: 'Asian'}];
            db.query.mockResolvedValue({rows: mockRestaurants});

            const results = await restaurantModel.getRestaurantsByCuisine('Asian');

            expect(results).toEqual(mockRestaurants);
            expect(db.query).toHaveBeenCalledWith(
                'SELECT * FROM restaurants WHERE $1 = ANY(cuisines)', ['Asian']
            );
        });

        it('handles errors when database operation fails', async () => {
            db.query.mockRejectedValue(new Error('Database error'));

            await expect(restaurantModel.getRestaurantsByCuisine('Asian')).rejects.toThrow('Database error');
        });
    });

    describe('getRestaurantById', () => {
        it('returns a single restaurant by ID including its dishes', async () => {
            const mockRestaurant = {id: 1, name: 'Taizu'};
            const mockDishes = [{id: 1, name: 'Noodles'}];
            db.query.mockResolvedValueOnce({rows: [mockRestaurant]});
            db.query.mockResolvedValueOnce({rows: mockDishes});

            const result = await restaurantModel.getRestaurantById(1);

            expect(result).toEqual({...mockRestaurant, dishes: mockDishes});
            expect(db.query).toHaveBeenCalledTimes(2);
        });

        it('returns null if restaurant is not found', async () => {
            db.query.mockResolvedValueOnce({rows: []});

            const result = await restaurantModel.getRestaurantById(1);

            expect(result).toBeNull();
        });
    });

    describe('addRestaurant', () => {
        it('successfully adds a new restaurant', async () => {
            const newRestaurant = {name: 'Taizu', isKosher: false, cuisines: ['Asian']};
            const addedRestaurant = {...newRestaurant, id: 1};
            db.query.mockResolvedValue({rows: [addedRestaurant]});

            const result = await restaurantModel.addRestaurant(newRestaurant);

            expect(result).toEqual(addedRestaurant);
        });
    });

    describe('updateRestaurant', () => {
        it('updates an existing restaurant', async () => {
            const updatedData = {name: 'Updated Name'};
            const updatedRestaurant = {id: 1, name: 'Updated Name'};
            db.query.mockResolvedValue({rows: [updatedRestaurant]});

            const result = await restaurantModel.updateRestaurant(1, updatedData);

            expect(result).toEqual(updatedRestaurant);
        });

        it('returns null if no restaurant is found to update', async () => {
            db.query.mockResolvedValue({rows: []});

            const result = await restaurantModel.updateRestaurant(1, {name: 'Updated Name'});

            expect(result).toBeNull();
        });
    });

    describe('deleteRestaurant', () => {
        it('should return false if no restaurant is found to delete', async () => {
            // Mock the db.query to simulate no restaurant found
            db.query.mockImplementation((query, params) => {
                if (query.includes('SELECT id FROM dishes WHERE restaurant_id = $1')) {
                    return Promise.resolve({rows: []}); // No dishes found
                }
                if (query.includes('SELECT id FROM orders WHERE restaurant_id = $1')) {
                    return Promise.resolve({rows: []}); // No orders found
                }
                if (query.includes('DELETE FROM restaurants WHERE id = $1')) {
                    return Promise.resolve({rowCount: 0}); // No restaurant deleted
                }
                return Promise.resolve(); // Default case for other queries
            });

            // Call the deleteRestaurant function
            const result = await restaurantModel.deleteRestaurant(1);

            expect(result).toBeFalsy();
            expect(db.query).toHaveBeenCalledWith('BEGIN');
            expect(db.query).toHaveBeenCalledWith('DELETE FROM restaurants WHERE id = $1', [1]);
            expect(db.query).toHaveBeenCalledWith('ROLLBACK'); // Ensure transaction is rolled back
        });

        it('should handle database errors during deletion', async () => {
            // Simulate a database error on deleting dishes
            db.query.mockRejectedValueOnce(new Error('Database error during deletion'));

            // Check if the error is propagated
            await expect(restaurantModel.deleteRestaurant(1)).rejects.toThrow('Database error during deletion');
            expect(db.query).toHaveBeenCalledWith('ROLLBACK'); // Ensure transaction is rolled back on error
        });
    });
}