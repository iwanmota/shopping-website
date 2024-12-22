const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./shopping.db');

// Create products table and insert sample data
db.serialize(() => {
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

    // Insert sample data with some items on sale
    const sampleProducts = [
        ['Premium Coffee Maker', 199.99, 'Automatic drip coffee maker with built-in grinder', '/images/products/coffee-maker.jpg', 1, 149.99, 5],
        ['Wireless Headphones', 149.99, 'Noise-cancelling Bluetooth headphones with 30-hour battery', '/images/products/headphones.jpg', 1, 99.99, 10],
        ['Smart Watch', 299.99, 'Fitness tracking and notifications with OLED display', '/images/products/smartwatch.jpg', 0, null, 0],
        ['Laptop Backpack', 79.99, 'Water-resistant backpack with USB charging port', '/images/products/backpack.jpg', 1, 49.99, 15],
        ['Mechanical Keyboard', 129.99, 'RGB backlit mechanical gaming keyboard with Cherry MX switches', '/images/products/keyboard.jpg', 0, null, 0],
        ['Portable Speaker', 89.99, 'Waterproof Bluetooth speaker with 20-hour playtime', '/images/products/speaker.jpg', 0, null, 0]
    ];

    const insert = db.prepare('INSERT INTO products (name, price, description, image, isOnSale, salePrice, onSaleQuantity) VALUES (?, ?, ?, ?, ?, ?, ?)');
    sampleProducts.forEach(product => {
        insert.run(product);
    });
    insert.finalize();
});

db.close(); 