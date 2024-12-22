const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const db = new sqlite3.Database('./shopping.db');

// Get all products
app.get('/api/products', (req, res) => {
    db.all('SELECT * FROM products', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Get only sale products for homepage
app.get('/api/products/sale', (req, res) => {
    db.all('SELECT * FROM products WHERE isOnSale = 1 AND onSaleQuantity > 0', [], (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(rows);
    });
});

// Get specific product with inventory info
app.get('/api/products/:id', (req, res) => {
    db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
            return;
        }
        res.json(row);
    });
});

// Update sale quantity when purchase is made
app.post('/api/products/purchase', (req, res) => {
    const { id, quantity, isOnSale } = req.body;
    
    if (isOnSale) {
        db.run(
            'UPDATE products SET onSaleQuantity = onSaleQuantity - ? WHERE id = ? AND onSaleQuantity >= ?',
            [quantity, id, quantity],
            function(err) {
                if (err) {
                    res.status(500).json({ error: err.message });
                    return;
                }
                if (this.changes === 0) {
                    res.status(400).json({ error: 'Not enough sale items in stock' });
                    return;
                }
                res.json({ message: 'Purchase successful' });
            }
        );
    } else {
        // Handle regular purchase (if you're tracking regular inventory)
        res.json({ message: 'Purchase successful' });
    }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
