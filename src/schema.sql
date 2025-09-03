-- Drop old tables if needed
DROP TABLE IF EXISTS order_items, orders, wishlist, cart_items, products, categories, users CASCADE;

-- Categories
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL
);

-- Users
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    mobile VARCHAR(20) UNIQUE NOT NULL,
    password VARCHAR(200) NOT NULL
);

-- Products
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    category_id INT REFERENCES categories(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    brand VARCHAR(100),
    color VARCHAR(50),
    size VARCHAR(50),
    stock INT DEFAULT 0,
    buying_price DECIMAL(10,2),
    selling_price DECIMAL(10,2),
    images TEXT[],
    created_at TIMESTAMP DEFAULT NOW()
);

-- Cart
CREATE TABLE cart_items (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE CASCADE,
    quantity INT DEFAULT 1
);

-- Wishlist
CREATE TABLE wishlist (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id) ON DELETE CASCADE
);

-- Orders
CREATE TABLE orders (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'Pending',
    created_at TIMESTAMP DEFAULT NOW(),
    total_amount DECIMAL(10,2)
);

-- Order Items
CREATE TABLE order_items (
    id SERIAL PRIMARY KEY,
    order_id INT REFERENCES orders(id) ON DELETE CASCADE,
    product_id INT REFERENCES products(id),
    quantity INT,
    price DECIMAL(10,2)
);

----------------------------------------------------
-- Seed Data
----------------------------------------------------

-- Categories
INSERT INTO categories (name) VALUES
('Dresses'),
('Tops'),
('Shoes');

-- Users
INSERT INTO users (name, email, mobile, password)
VALUES
('Test User', 'test@example.com', '9999999999', 'hashed_password');

-- Products
INSERT INTO products (category_id, name, brand, color, size, stock, buying_price, selling_price, images)
VALUES
(1, 'Floral Summer Dress', 'Zara', 'Red', 'M', 20, 1200, 1999, ARRAY['/images/dress1.jpg','/images/dress1b.jpg']),
(1, 'Party Gown', 'H&M', 'Blue', 'L', 10, 2500, 3999, ARRAY['/images/gown1.jpg']),
(2, 'Casual Top', 'Only', 'White', 'S', 15, 800, 1499, ARRAY['/images/top1.jpg']),
(3, 'Running Shoes', 'Nike', 'Black', '9', 30, 3000, 4999, ARRAY['/images/shoe1.jpg']);

-- Cart Example
INSERT INTO cart_items (user_id, product_id, quantity) VALUES
(1, 1, 2);

-- Wishlist Example
INSERT INTO wishlist (user_id, product_id) VALUES
(1, 3);

-- Order Example
INSERT INTO orders (user_id, status, total_amount)
VALUES (1, 'Shipped', 3999);

INSERT INTO order_items (order_id, product_id, quantity, price)
VALUES (1, 2, 1, 3999);
