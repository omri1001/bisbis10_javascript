const db = require('../db/db');

// Disconnect from DB after each test file
afterAll(async () => {
    await db.default.end();  // Assuming the exported client object has an `end` method
});