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
});

// Close the database connection when initialization is complete
db.close(); 