CREATE TABLE example (
    id SERIAL PRIMARY KEY,
    data VARCHAR(255) NOT NULL
);

-- Creating the 'restaurants' table
CREATE TABLE restaurants (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    isKosher BOOLEAN,
    cuisines TEXT[]
);

-- Creating the 'dishes' table
CREATE TABLE dishes (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price NUMERIC(10, 2),
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);

-- Creating the 'ratings' table
CREATE TABLE ratings (
    id SERIAL PRIMARY KEY,
    restaurant_id INTEGER NOT NULL,
    rating NUMERIC(2, 1),
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);

-- Creating the 'orders' table
CREATE TABLE orders (
    id UUID PRIMARY KEY,
    restaurant_id INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurant_id) REFERENCES restaurants(id)
);

-- Creating the 'order_items' table
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id UUID NOT NULL,
    dish_id INTEGER NOT NULL,
    amount INTEGER NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id),
    FOREIGN KEY (dish_id) REFERENCES dishes(id)
);