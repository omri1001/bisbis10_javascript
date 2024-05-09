//index.js
const express = require('express');
const dotenv = require('dotenv');
const db = require('./db/db');
const restaurantRoutes = require('./routes/restaurantRoutes');
const dishRoutes = require('./routes/dishRoutes'); // Ensure this is correctly imported
const orderRoutes = require('./routes/orderRoutes');
const ratingRoutes = require('./routes/ratingRoutes');
dotenv.config(); // Load environment variables
const app = express(); // Create an Express application
const port = process.env.PORT || 8000; // Set the port
console.log(db)
app.use(express.json()); // Middleware to parse JSON bodies
app.use("/", restaurantRoutes); // Use the restaurant routes, mounted at '/'
app.use("/restaurants/:id", dishRoutes); // Mount dish routes under each restaurant
app.use("/", orderRoutes); // Mount order routes
app.use('/', ratingRoutes);

db.ensureTablesExist().then(() => {
    app.listen(port, () => {
        console.log(`Server is running at http://localhost:${port}`);
    });
}).catch(err => {
    console.error('Failed to ensure DB tables:', err);
    process.exit(1); // Exit if there is a failure setting up the database
});

// Graceful shutdown handling
process.on("SIGINT", () => {
    console.log("Disconnecting database and shutting down...");
    process.exit();
});
process.on("SIGTERM", () => {
    console.log("Received kill signal, shutting down gracefully...");
    process.exit();
});