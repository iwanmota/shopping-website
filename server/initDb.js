const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./shopping.db');

// Create products table and insert sample data
db.serialize(() => {
    db.run(`
        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            price REAL NOT NULL,
            description TEXT
        )
    `);

    // Insert sample data
    const sampleProducts = [
        ['Product 1', 99.99, 'Description for product 1'],
        ['Product 2', 149.99, 'Description for product 2']
    ];

    const insert = db.prepare('INSERT INTO products (name, price, description) VALUES (?, ?, ?)');
    sampleProducts.forEach(product => {
        insert.run(product);
    });
    insert.finalize();
});

db.close(); 