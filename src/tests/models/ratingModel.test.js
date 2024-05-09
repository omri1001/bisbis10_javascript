const db = require('../../db/db');
const ratingModel = require('../../models/ratingModel');

jest.mock('../../db/db'); // Mocking the database module

describe('Rating Model', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('addRating', () => {
        it('should add a rating successfully', async () => {
            const mockRatingDetails = { restaurantId: 1, rating: 5 };
            const mockResponse = { id: 1, restaurant_id: 1, rating: 5 };
            db.query.mockResolvedValue({ rows: [mockResponse] });

            const result = await ratingModel.addRating(mockRatingDetails);
            expect(result).toEqual(mockResponse);
            expect(db.query).toHaveBeenCalledWith(
                'INSERT INTO ratings (restaurant_id, rating) VALUES ($1, $2) RETURNING *',
                [1, 5]
            );
        });

        it('should handle errors when adding a rating', async () => {
            const mockRatingDetails = { restaurantId: 1, rating: 4 };
            db.query.mockRejectedValue(new Error('Database error'));

            await expect(ratingModel.addRating(mockRatingDetails)).rejects.toThrow('Database error');
        });
    });
});