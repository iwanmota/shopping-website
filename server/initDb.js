/**
 * Database Initialization Script
 * 
 * This script initializes the SQLite database for the ShopSmart application.
 * It creates the necessary tables and populates them with sample data.
 * 
 * The script is intended to be run once during initial setup or for resetting
 * the database to a known state during development.
 */

// Import SQLite with verbose mode for detailed error information
const sqlite3 = require('sqlite3').verbose();
// Import bcrypt for password hashing
const bcrypt = require('bcrypt');

// Connect to the database (creates it if it doesn't exist)
const db = new sqlite3.Database('./shopping.db');

/**
 * Database initialization process
 * 
 * Using serialize() ensures that all operations are executed sequentially,
 * which is important for table creation and initial data population.
 */
db.serialize(() => {
    /**
     * Create users table if it doesn't exist
     * 
     * Schema:
     * - id: Unique identifier for each user
     * - email: User's email address (required, unique)
     * - password: Hashed password using bcrypt (required)
     * - firstName: User's first name
     * - lastName: User's last name
     * - role: User's role (customer or admin, defaults to customer)
     * - createdAt: Timestamp when the user was created
     * - updatedAt: Timestamp when the user was last updated
     */
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL,
            firstName TEXT,
            lastName TEXT,
            role TEXT NOT NULL DEFAULT 'customer',
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `);

    /**
     * Create products table if it doesn't exist
     * 
     * Schema:
     * - id: Unique identifier for each product
     * - name: Product name (required)
     * - price: Regular product price (required)
     * - description: Product description text
     * - image: Path to product image file
     * - isOnSale: Boolean flag indicating if product is on sale (0=false, 1=true)
     * - salePrice: Discounted price when product is on sale
     * - onSaleQuantity: Number of items available at sale price
     */
    db.run(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            description TEXT,
            image TEXT,
            isOnSale BOOLEAN DEFAULT 0,
            salePrice REAL,
            onSaleQuantity INTEGER DEFAULT 0
        )
    `);

    /**
     * Sample product data for initial database population
     * 
     * Format: [name, price, description, image_path, isOnSale, salePrice, onSaleQuantity]
     * 
     * Note: Some products are configured as sale items (isOnSale=1) with special pricing
     * and limited quantity available at that price.
     */
    const sampleProducts = [
        ['Premium Coffee Maker', 199.99, 'Automatic drip coffee maker with built-in grinder', '/images/products/coffee-maker.jpg', 1, 149.99, 5],
        ['Wireless Headphones', 149.99, 'Noise-cancelling Bluetooth headphones with 30-hour battery', '/images/products/headphones.jpg', 1, 99.99, 10],
        ['Smart Watch', 299.99, 'Fitness tracking and notifications with OLED display', '/images/products/smartwatch.jpg', 0, null, 0],
        ['Laptop Backpack', 79.99, 'Water-resistant backpack with USB charging port', '/images/products/backpack.jpg', 1, 49.99, 15],
        ['Mechanical Keyboard', 129.99, 'RGB backlit mechanical gaming keyboard with Cherry MX switches', '/images/products/keyboard.jpg', 0, null, 0],
        ['Portable Speaker', 89.99, 'Waterproof Bluetooth speaker with 20-hour playtime', '/images/products/speaker.jpg', 0, null, 0]
    ];

    /**
     * Prepare and execute batch insert for sample products
     * 
     * Using prepared statements for better performance and security when
     * inserting multiple records.
     */
    const insert = db.prepare('INSERT INTO products (name, price, description, image, isOnSale, salePrice, onSaleQuantity) VALUES (?, ?, ?, ?, ?, ?, ?)');
    sampleProducts.forEach(product => {
        insert.run(product);
    });
    insert.finalize();

    /**
     * Create sample users for testing
     * 
     * Creating an admin user and a regular customer user with hashed passwords.
     * The password hashing is done synchronously for simplicity in this initialization script.
     */
    const saltRounds = 10;
    const adminPassword = bcrypt.hashSync('admin123', saltRounds);
    const customerPassword = bcrypt.hashSync('customer123', saltRounds);

    // Check if users already exist to avoid duplicates
    db.get('SELECT COUNT(*) as count FROM users WHERE email = ?', ['admin@shopsmart.com'], (err, row) => {
        if (err) {
            console.error('Error checking for existing admin user:', err);
            return;
        }
        
        // Only insert if user doesn't exist
        if (row.count === 0) {
            db.run(
                'INSERT INTO users (email, password, firstName, lastName, role) VALUES (?, ?, ?, ?, ?)',
                ['admin@shopsmart.com', adminPassword, 'Admin', 'User', 'admin'],
                (err) => {
                    if (err) {
                        console.error('Error creating admin user:', err);
                    } else {
                        console.log('Admin user created successfully');
                    }
                }
            );
        }
    });

    db.get('SELECT COUNT(*) as count FROM users WHERE email = ?', ['customer@example.com'], (err, row) => {
        if (err) {
            console.error('Error checking for existing customer user:', err);
            return;
        }
        
        // Only insert if user doesn't exist
        if (row.count === 0) {
            db.run(
                'INSERT INTO users (email, password, firstName, lastName, role) VALUES (?, ?, ?, ?, ?)',
                ['customer@example.com', customerPassword, 'John', 'Doe', 'customer'],
                (err) => {
                    if (err) {
                        console.error('Error creating customer user:', err);
                    } else {
                        console.log('Customer user created successfully');
                    }
                }
            );
        }
    });
});

// Close the database connection when initialization is complete
setTimeout(() => {
    db.close();
    console.log('Database initialization complete');
}, 1000); // Small delay to ensure async operations complete