CREATE DATABASE IF NOT EXISTS dukaanx_db;
USE dukaanx_db;

DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(120) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL
);

CREATE TABLE products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    category_id INT,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    featured BOOLEAN DEFAULT FALSE,
    color_options VARCHAR(150) DEFAULT 'Black,White',
    size_options VARCHAR(150) DEFAULT 'XS,S,M,L,XL,XXL,XXXL',
    image_url TEXT NOT NULL,
    stock INT DEFAULT 50,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
);

CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_number VARCHAR(64) UNIQUE NOT NULL,
    user_id INT NULL,
    customer_name VARCHAR(150) NOT NULL,
    customer_email VARCHAR(150) NOT NULL,
    shipping_address TEXT NOT NULL,
    payment_method VARCHAR(50) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    order_status VARCHAR(50) DEFAULT 'Confirmed',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

CREATE TABLE order_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    product_title VARCHAR(255) NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    quantity INT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    selected_color VARCHAR(50),
    selected_size VARCHAR(50),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id)
);

-- Categories exactly as displayed in the reference images
INSERT INTO categories (id, name, slug) VALUES 
(1, 'All', 'all'),
(2, 'Bags', 'bags'),
(3, 'Drinkware', 'drinkware'),
(4, 'Electronics', 'electronics'),
(5, 'Footware', 'footware'),
(6, 'Headwear', 'headwear'),
(7, 'Hoodies', 'hoodies'),
(8, 'Jackets', 'jackets'),
(9, 'Kids', 'kids'),
(10, 'Pets', 'pets'),
(11, 'Shirts', 'shirts'),
(12, 'Stickers', 'stickers');

-- Seed products with reference titles, images, and prices in INR
INSERT INTO products (category_id, title, description, price, featured, color_options, size_options, image_url) VALUES 
(11, 'Dukaanx Circles T-Shirt', '60% combed ringspun cotton / 40% polyester jersey tee with radial geometric silkscreen print.', 1650.00, 1, 'Black,White,Blue', 'XS,S,M,L,XL,XXL,XXXL', '/images/t-shirt-spiral-1.jpg'),
(2, 'Dukaanx Drawstring Bag', 'Lightweight, durable ripstop nylon drawstring carry bag with minimalist reflective print.', 990.00, 0, 'Black', 'One Size', 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&q=80'),
(3, 'Dukaanx Cup', 'Matte finish ceramic tumbler with heat silicone sleeve and reusable silicone sipper lid.', 1250.00, 0, 'Black,White', '350ml', 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=800&q=80'),
(4, 'Dukaanx Keyboard', 'Anodized aluminum wireless mechanical keyboard featuring low-latency custom switches.', 12400.00, 0, 'White,Silver', 'TKL', 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=800&q=80'),
(11, 'Dukaanx T-Shirt', 'Everyday classic relaxed-fit crewneck t-shirt featuring minimal crest embroidery.', 1650.00, 0, 'Black,White', 'XS,S,M,L,XL,XXL', 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=800&q=80'),
(7, 'Dukaanx Hoodie', 'Heavyweight 450 GSM French terry cotton full-zip hoodie with white braided drawstrings.', 4150.00, 0, 'Black,Charcoal', 'S,M,L,XL,XXL', 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80'),
(6, 'Dukaanx Cowboy Hat', 'Structured felt brim western silhouette finished with high-contrast crest detail.', 13200.00, 0, 'Black', 'M,L', '/images/cowboy-hat-black-1.jpg'),
(6, 'Dukaanx Cap', 'Unstructured 6-panel athletic baseball cap with curved bill and metal buckle strap.', 1650.00, 0, 'Black,Navy', 'Adjustable', '/images/cap-1.jpg'),
(6, 'Dukaanx Baby Cap', 'Ribbed knit cuff beanie formulated with ultra-soft hypoallergenic organic cotton.', 850.00, 0, 'Black,Grey', 'Infant', 'https://images.unsplash.com/photo-1576871337632-b9aef4c17ab9?w=800&q=80'),
(11, 'Dukaanx Prism T-Shirt', 'Graphic tee highlighted with spectrum ray refraction illustration across premium cotton base.', 2050.00, 0, 'Black', 'S,M,L,XL', 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=800&q=80'),
(3, 'Dukaanx Matte Mug', 'Industrial aesthetic stoneware mug with ergonomic handle and smooth insulated glaze.', 1100.00, 0, 'Black', '400ml', 'https://images.unsplash.com/photo-1517256064527-09c73fc73e38?w=800&q=80'),
(9, 'Dukaanx Baby Onesie', 'Snug organic cotton short-sleeve bodysuit tailored with envelope shoulders.', 1400.00, 0, 'Beige,White', '0-3M,3-6M,6-12M', 'https://images.unsplash.com/photo-1522771930-78848d9293e8?w=800&q=80'),
(12, 'Dukaanx Sticker Pack', 'Weatherproof matte vinyl die-cut stickers suitable for laptops and bottles.', 450.00, 0, 'Monochrome', 'Pack of 5', 'https://images.unsplash.com/photo-1572375992501-4b0892d50c69?w=800&q=80'),
(5, 'Dukaanx Minimalist Runners', 'Low-profile vulcanized street sneakers equipped with shock-absorbing foam soles.', 5200.00, 0, 'Black,White', 'UK 7,UK 8,UK 9,UK 10', 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=800&q=80'),
(8, 'Dukaanx Windbreaker Jacket', 'Water-resistant technical jacket featuring taped seams and adjustable bungee waist.', 4800.00, 0, 'Black', 'S,M,L,XL', 'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=800&q=80'),
(10, 'Dukaanx Pet Collar & Leash', 'Heavy-duty webbing dog collar and leash combo with quick-release metal hardware.', 1200.00, 0, 'Black', 'S,M,L', 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=800&q=80');