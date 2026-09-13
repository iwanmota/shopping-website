const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const { authenticateToken } = require('../middleware/auth');
const { DATABASE_PATH } = require('../config/database');
const { getOrderById, getOrdersForUser } = require('../services/orderService');

const router = express.Router();
const db = new sqlite3.Database(DATABASE_PATH);

router.get('/', authenticateToken, async (req, res) => {
  try {
    res.json(await getOrdersForUser(db, req.user.id));
  } catch (error) {
    console.error('Unable to retrieve orders:', error);
    res.status(500).json({ error: 'Unable to retrieve orders' });
  }
});

router.get('/:id', authenticateToken, async (req, res) => {
  if (!/^[1-9]\d*$/.test(req.params.id)) {
    return res.status(400).json({ error: 'Order ID must be a positive integer' });
  }
  const orderId = Number(req.params.id);

  try {
    const order = await getOrderById(db, req.user.id, orderId);
    if (!order) return res.status(404).json({ error: 'Order not found' });
    res.json(order);
  } catch (error) {
    console.error('Unable to retrieve order:', error);
    res.status(500).json({ error: 'Unable to retrieve order' });
  }
});

module.exports = router;
