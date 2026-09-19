/**
 * ShopSmart API Server
 *
 * This Express server provides the backend API for the ShopSmart e-commerce application.
 * It handles product data retrieval, inventory management, and purchase processing.
 *
 * The server uses SQLite for data storage and provides RESTful endpoints for the frontend.
 */

// Import required dependencies
const express = require('express');
const sqlite3 = require('sqlite3').verbose(); // Use verbose mode for more detailed error messages
const cors = require('cors');
const path = require('path');
const { authErrorHandler } = require('./middleware/auth');
const { DATABASE_PATH } = require('./config/database');

// Import routes
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');
const checkoutRoutes = require('./routes/checkout');

// Import file storage initialization
const initFileStorage = require('./utils/initFileStorage');
const { ensureProductInventorySchema } = require('./services/databaseSchema');

// Initialize Express application
const app = express();

// Apply middleware
app.use(cors()); // Enable CORS for all routes to allow frontend access
app.use(express.json()); // Parse JSON request bodies
app.use(express.static(path.join(__dirname, '../public'))); // Serve static files from public directory

// Connect to SQLite database
const db = new sqlite3.Database(DATABASE_PATH);

/**
 * GET /api/products
 *
 * Retrieves all products from the database.
 *
 * @returns {Array} Array of product objects with all product details
 * @response {200} Successfully retrieved products
 * @response {500} Server error
 */
app.get('/api/products', (req, res) => {
  db.all('SELECT * FROM products', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(rows);
  });
});

/**
 * GET /api/products/sale
 *
 * Retrieves only products that are on sale and have available sale quantity.
 * Used primarily for the homepage to display special offers.
 *
 * @returns {Array} Array of product objects that are on sale
 * @response {200} Successfully retrieved sale products
 * @response {500} Server error
 */
app.get('/api/products/sale', (req, res) => {
  db.all(
    'SELECT * FROM products WHERE isOnSale = 1 AND onSaleQuantity > 0',
    [],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
        return;
      }
      res.json(rows);
    }
  );
});

/**
 * GET /api/products/:id
 *
 * Retrieves a specific product by its ID, including inventory information.
 *
 * @param {number} id - Product ID in the URL path
 * @returns {Object} Product object with all details
 * @response {200} Successfully retrieved product
 * @response {500} Server error
 */
app.get('/api/products/:id', (req, res) => {
  db.get('SELECT * FROM products WHERE id = ?', [req.params.id], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    res.json(row);
  });
});

/**
 * POST /api/products/purchase
 *
 * Updates inventory when a purchase is made.
 * For sale items, decrements the onSaleQuantity.
 * Currently only handles sale items properly.
 *
 * @param {Object} req.body - Request body
 * @param {number} req.body.id - Product ID
 * @param {number} req.body.quantity - Quantity being purchased
 * @param {boolean} req.body.isOnSale - Whether the item is being purchased at sale price
 *
 * @returns {Object} Success or error message
 * @response {200} Purchase successful
 * @response {400} Not enough items in stock
 * @response {500} Server error
 */
app.post('/api/products/purchase', (req, res) => {
  res
    .status(410)
    .json({ error: 'This endpoint has been replaced by POST /api/checkout' });
});

// Register authentication routes
app.use('/api/auth', authRoutes);

// Register admin routes
app.use('/api/admin', adminRoutes);

// Register checkout route
app.use('/api/checkout', checkoutRoutes);

// Register authentication error handler
app.use(authErrorHandler);

// Set up server port and start listening
const PORT = process.env.PORT || 3001;

// Initialize file storage before starting the server
(async () => {
  try {
    await initFileStorage();
    await ensureProductInventorySchema(db);
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize server:', error);
    process.exit(1);
  }
})();
