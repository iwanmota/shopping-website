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
            image TEXT
        )
    `);

    // Insert sample data with image paths
    const sampleProducts = [
        ['Premium Coffee Maker', 199.99, 'Automatic drip coffee maker', '/images/products/coffee-maker.jpg'],
        ['Wireless Headphones', 149.99, 'Noise-cancelling Bluetooth headphones with 30-hour battery', '/images/products/headphones.jpg'],
        ['Smart Watch', 299.99, 'Fitness tracking and notifications with OLED display', '/images/products/smartwatch.jpg'],
        ['Laptop Backpack', 79.99, 'Water-resistant backpack with USB charging port', '/images/products/backpack.jpg'],
        ['Mechanical Keyboard', 129.99, 'RGB backlit mechanical gaming keyboard with Cherry MX switches', '/images/products/keyboard.jpg'],
        ['Portable Speaker', 89.99, 'Waterproof Bluetooth speaker with 20-hour playtime', '/images/products/speaker.jpg']
    ];

    const insert = db.prepare('INSERT INTO products (name, price, description, image) VALUES (?, ?, ?, ?)');
    sampleProducts.forEach(product => {
        insert.run(product);
    });
    insert.finalize();
});

db.close(); 