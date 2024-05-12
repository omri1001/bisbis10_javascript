
# Restaurant Management System

## Overview
The bisbis10 Restaurant Management System is a backend service designed in JavaScript to manage operations related to restaurants, their dishes, and customer ratings. It provides a comprehensive platform for restaurant data management, including details about the restaurants, their cuisines, dishes, and customer ratings.

This system aims to streamline restaurant operations by offering APIs for restaurant management, ratings, and dish handling, facilitating efficient data management and enhancing the overall restaurant experience.


## Project Structure

The project structure follows a modular approach, dividing components into models, controllers, and routes. This organization promotes clarity and maintainability by separating concerns and facilitating easy navigation of the codebase. With distinct modules handling specific tasks, developers can efficiently extend, test, and maintain the application.

```plaintext
/src
│   index.js                 # Entry point of the application
│
├── /models                  # Data models
│   ├── dishmodel.js         # Model for dishes
│   ├── ordermodel.js        # Model for orders
│   ├── ratingmodel.js       # Model for ratings
│   ├── restaurantmodel.js   # Model for restaurants
│
├── /controllers             # Controller files
│   ├── dishcontroller.js    # Logic for dish-related operations
│   ├── ordercontroller.js   # Logic for order-related operations
│   ├── ratingcontroller.js  # Logic for rating-related operations
│   ├── restaurantcontroller.js # Logic for restaurant-related operations
│
├── /routes                  # Route definitions
│   ├── dishroutes.js        # Routes for dish-related endpoints
│   ├── orderroutes.js       # Routes for order-related endpoints
│   ├── ratingroutes.js      # Routes for rating-related endpoints
│   ├── restaurantroutes.js  # Routes for restaurant-related endpoints
│
├── /db                      # Database configurations and scripts
├── /tests                   # Test cases for the application
```
## Technical Stack
- **Backend Framework**: Express.js
- **Database**: PostgreSQL (A Docker container is used for the database environment)
- **Other Tools**: Node.js, Docker
## NPM Start Process Description:
```bash
  npm start
```
When you execute npm start, several steps are taken to initialize the bisbis10 Restaurant Management System:

Database Connection: The db/db.js file initializes a connection to the PostgreSQL database using the credentials specified in the code. It connects to the database and logs a message indicating successful connection.

Table Creation: The ensureTablesExist function in db/db.js ensures that all necessary tables exist in the database. It iterates through a list of tables and creates them if they do not already exist. Each table's creation status is logged for verification.
## API Reference

### Restaurants

#### Retrieve All Restaurants
- **GET /restaurants**: Fetch a list of all restaurants. You can also filter by cuisine by providing a `cuisine` query parameter.

```http
 GET /restaurants
```

| Parameter | Type     | Description                |
| :-------- | :------- | :------------------------- |
| `cuisine` | `string` | Filter restaurants by cuisine (optional)|

#### Retrieve a Specific Restaurant
- **GET /restaurants/{id}**: Fetch a single restaurant by its ID, including details about its dishes.

```http
  GET /restaurants/{id}
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `id`      | `string` | Required. ID of the restaurant to fetch |

#### Add a Restaurant
- **POST /restaurants**: Add a new restaurant to the system. Requires a JSON body with `name`, `isKosher`, and `cuisines`.

| Body Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `name`      | `string` | Required. Name of the restaurant |
| `isKosher`      | `boolean` | Required. Indicates if the restaurant is kosher |
| `cuisines`      | `array` | Required. List of cuisines offered by the restaurant |

#### Update a Restaurant
- **PUT /restaurants/{id}**: Update details of an existing restaurant by its ID. Send the updated fields (such as `cuisines`) in JSON format in the request body.

```http
  PUT /restaurants/{id}
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `id`      | `string` | Required. ID of the restaurant to update |




#### Delete a Restaurant
- **DELETE /restaurants/{id}**: Delete an existing restaurant by its ID. This operation also deletes all associated dishes, ratings, and orders linked to this restaurant.

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `id`      | `string` | Required. ID of the restaurant to delete |


### Dishes

#### Retrieve Dishes by Restaurant
- **GET /restaurants/{id}/dishes**: Retrieve all dishes offered by a specific restaurant.
```http
  GET /restaurants/{id}/dishes
```
| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `id`      | `string` | Required. ID of the restaurant to fetch dishes for |

#### Add a Dish to a Restaurant
- **POST /restaurants/{id}/dishes**: Add a new dish to a specific restaurant. Requires a JSON body with `name`, `description`, and `price`.

```http
  POST /restaurants/{id}/dishes
```
| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `id`      | `string` | Required. ID of the restaurant to add dish to |

| Body Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `name`      | `string` | Required. Name of the dish |
| `description`      | `string` | Description of the dish |
| `price`      | `number` | 	Price of the dish |


#### Update a Dish
- **PUT /restaurants/{id}/dishes/{dishId}**: Update an existing dish by its ID for a specific restaurant. Requires updated `description` and `price` in the JSON body.

```http
  PUT /restaurants/{id}/dishes/{dishId}
```

| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `id`      | `string` | Required. ID of the restaurant |
| `dishId`      | `string` | Required. ID of the dish |

| Body Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `description`      | `string` | Description of the dish |
| `price`      | `number` | 	Price of the dish |

#### Delete a Dish
- **DELETE /restaurants/{id}/dishes/{dishId}**: Delete an existing dish by its ID from a specific restaurant.
This addition clarifies that when a dish is deleted from a restaurant, it is also removed from other associated tables in the database

```http
  DELETE /restaurants/{id}/dishes/{dishId}
```
| Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `id`      | `string` | Required. ID of the restaurant |
| `dishId`      | `string` | Required. ID of the dish |

### Ratings
#### Add a Rating

- **POST /ratings**: Add a new rating for a restaurant. Requires a JSON body with `restaurantId` and `rating`.

```http
  POST /ratings
```

| Body Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `restaurantId`      | `string` | Required. ID of the restaurant |
| `rating`      | `number` | 	Required. Rating value (0-5) |

### Ratings
#### Add a Rating

- **POST /ratings**: Add a new rating for a restaurant. Requires a JSON body with `restaurantId` and `rating`.

```http
  POST /ratings
```

| Body Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `restaurantId`      | `string` | Required. ID of the restaurant |
| `rating`      | `number` | 	Required. Rating value (0-5) |

### Order
#### Add a Order

- **POST /order**: Add a new order for a Orders. Requires a JSON body with `restaurantId` and `orderItems`.

Upon a successful order creation, this API call updates both the orders and order_items tables.
```http
  POST /order
```

| Body Parameter | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `restaurantId`      | `string` | Required. ID of the restaurant |
| `orderItems`      | `array` | 	Required. List of order items |




## Running Tests

To run tests, run the following command

```bash
  npm run test
```

