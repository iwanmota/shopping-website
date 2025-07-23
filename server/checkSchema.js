/**
 * Script to check the schema of the products table
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Connect to SQLite database
const db = new sqlite3.Database(path.join(__dirname, './shopping.db'));

// Query to get table info
db.all(`PRAGMA table_info(products)`, (err, rows) => {
    if (err) {
        console.error('Error querying table schema:', err);
        return;
    }

    console.log('Products table schema:');
    console.log(rows);

    // Close the database connection
    db.close();
});