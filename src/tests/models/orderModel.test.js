const db = require('../../db/db');
const orderModel = require('../../models/orderModel');
const { v4: uuidv4 } = require('uuid');

jest.mock('../../db/db');
jest.mock('uuid', () => ({
    v4: jest.fn(() => '1234-5678-uuid')
}));

describe('Order Model', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('createOrder', () => {
        const orderDetails = {
            restaurantId: 'rest-1',
            orderItems: [
                { dishId: 'dish-1', amount: 2 },
                { dishId: 'dish-2', amount: 1 }
            ]
        };

        it('should create an order successfully', async () => {
            db.query.mockResolvedValueOnce({ rows: [{ '1': 1 }] });  // Mock restaurant check
            db.query.mockResolvedValueOnce({ rows: [{ '1': 1 }] });  // Mock dish check for dish-1
            db.query.mockResolvedValueOnce({ rows: [{ '1': 1 }] });  // Mock dish check for dish-2
            db.query.mockResolvedValue(); // Mock for BEGIN, INSERT INTO orders, INSERT INTO order_items, and COMMIT

            const result = await orderModel.createOrder(orderDetails);

            expect(result).toEqual({ orderId: '1234-5678-uuid' });
            expect(db.query).toHaveBeenCalledWith('BEGIN');
            expect(db.query).toHaveBeenCalledWith('COMMIT');
        });

        it('should fail to create an order if restaurant does not exist', async () => {
            db.query.mockResolvedValueOnce({ rows: [] });  // Mock restaurant check fails

            await expect(orderModel.createOrder(orderDetails)).rejects.toThrow("Restaurant not found");
        });

        it('should fail to create an order if a dish does not exist in the restaurant', async () => {
            db.query.mockResolvedValueOnce({ rows: [{ '1': 1 }] });  // Mock restaurant check
            db.query.mockResolvedValueOnce({ rows: [] });  // Mock dish check fails for dish-1

            await expect(orderModel.createOrder(orderDetails)).rejects.toThrow("Dish with ID dish-1 not found in the specified restaurant");
        });

        it('should handle errors and rollback transaction if the order creation fails', async () => {
            db.query.mockResolvedValueOnce({ rows: [{ '1': 1 }] });  // Mock restaurant check
            db.query.mockResolvedValueOnce({ rows: [{ '1': 1 }] });  // Mock dish check for dish-1
            db.query.mockResolvedValueOnce({ rows: [{ '1': 1 }] });  // Mock dish check for dish-2
            db.query.mockResolvedValueOnce(); // Mock BEGIN
            db.query.mockRejectedValueOnce(new Error("Database error"));  // Fail on inserting order

            await expect(orderModel.createOrder(orderDetails)).rejects.toThrow("Database error");
            expect(db.query).toHaveBeenCalledWith('ROLLBACK');
        });
    });
});
