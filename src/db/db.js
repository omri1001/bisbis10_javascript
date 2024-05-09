//db/db.js
Object.defineProperty(exports, "__esModule", { value: true });
const pg_1 = require("pg");
const client = new pg_1.Client({
    host: "localhost",
    port: 5432,
    user: "postgres",
    password: "example",
    database: "postgres",
});
client.connect((err) => {
    if (err) {
        console.error("DB connection error", err.stack);
    }
    else {
        console.log("connected to DB");
    }
});

async function ensureTablesExist() {
    const tables = [
        { name: 'example', createSql: `CREATE TABLE IF NOT EXISTS example (id SERIAL PRIMARY KEY, data VARCHAR(255) NOT NULL);` },
        { name: 'restaurants', createSql: `CREATE TABLE IF NOT EXISTS restaurants (id SERIAL PRIMARY KEY, name VARCHAR(255) NOT NULL, isKosher BOOLEAN, cuisines TEXT[]);` },
        { name: 'dishes', createSql: `CREATE TABLE IF NOT EXISTS dishes (id SERIAL PRIMARY KEY, restaurant_id INTEGER NOT NULL, name VARCHAR(255) NOT NULL, description TEXT, price NUMERIC(10, 2), FOREIGN KEY (restaurant_id) REFERENCES restaurants(id));` },
        { name: 'orders', createSql: `CREATE TABLE IF NOT EXISTS orders (id UUID PRIMARY KEY, restaurant_id INTEGER NOT NULL, created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP, FOREIGN KEY (restaurant_id) REFERENCES restaurants(id));` },
        { name: 'ratings', createSql: `CREATE TABLE IF NOT EXISTS ratings (id SERIAL PRIMARY KEY, restaurant_id INTEGER NOT NULL, rating NUMERIC(2, 1), FOREIGN KEY (restaurant_id) REFERENCES restaurants(id));` },
        { name: 'order_items', createSql: `CREATE TABLE IF NOT EXISTS order_items (id SERIAL PRIMARY KEY, order_id UUID NOT NULL, dish_id INTEGER NOT NULL, amount INTEGER NOT NULL, FOREIGN KEY (order_id) REFERENCES orders(id), FOREIGN KEY (dish_id) REFERENCES dishes(id));` }
    ];

    for (let table of tables) {
        try {
            const result = await client.query(table.createSql);
            console.log(`Checked/created table: ${table.name}, Result: ${result.command}`);
        } catch (err) {
            console.error(`Error creating table ${table.name}:`, err.message);
        }
    }
}


// Expose the 'query' method
exports.query = async (text, params) => {
    try {
        const result = await client.query(text, params);
        return result;
    } catch (error) {
        throw error;
    }
};

exports.default = client;
exports.ensureTablesExist = ensureTablesExist