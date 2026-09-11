const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { authenticateToken } = require('../middleware/auth');
const { DATABASE_PATH } = require('../config/database');
const { checkoutCart, CheckoutError } = require('../services/checkoutService');

const router = express.Router();
const db = new sqlite3.Database(DATABASE_PATH);

router.post('/', authenticateToken, async (req, res) => {
  try {
    const receipt = await checkoutCart(db, req.user.id, req.body.items);
    res.json({ message: 'Checkout successful', receipt });
  } catch (error) {
    if (error instanceof CheckoutError) {
      return res.status(error.status).json({ error: error.message });
    }

    console.error('Checkout failed:', error);
    res.status(500).json({ error: 'Checkout failed' });
  }
});

module.exports = router;
