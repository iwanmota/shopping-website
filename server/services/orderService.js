const run = (db, sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function(error) { error ? reject(error) : resolve(this); });
});

const all = (db, sql, params = []) => new Promise((resolve, reject) => {
  db.all(sql, params, (error, rows) => error ? reject(error) : resolve(rows));
});

const ensureOrderSchema = async db => {
  await run(db, `CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId INTEGER NOT NULL,
    total REAL NOT NULL,
    status TEXT NOT NULL DEFAULT 'completed',
    createdAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`);
  await run(db, `CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    orderId INTEGER NOT NULL,
    productId INTEGER NOT NULL,
    productName TEXT NOT NULL,
    pricingTier TEXT NOT NULL CHECK(pricingTier IN ('sale', 'regular')),
    unitPrice REAL NOT NULL,
    quantity INTEGER NOT NULL CHECK(quantity > 0),
    subtotal REAL NOT NULL,
    FOREIGN KEY(orderId) REFERENCES orders(id) ON DELETE CASCADE
  )`);
  await run(db, 'CREATE INDEX IF NOT EXISTS idx_orders_user_created ON orders(userId, createdAt DESC)');
  await run(db, 'CREATE INDEX IF NOT EXISTS idx_order_items_order ON order_items(orderId)');
};

const getOrdersForUser = async (db, userId) => {
  await ensureOrderSchema(db);
  return all(db, `SELECT id, userId, total, status, createdAt, updatedAt
    FROM orders WHERE userId = ? ORDER BY datetime(createdAt) DESC, id DESC`, [userId]);
};

const getOrderById = async (db, userId, orderId) => {
  await ensureOrderSchema(db);
  const [order] = await all(db, `SELECT id, userId, total, status, createdAt, updatedAt
    FROM orders WHERE id = ? AND userId = ?`, [orderId, userId]);
  if (!order) return null;
  order.items = await all(db, `SELECT productId, productName, pricingTier, unitPrice, quantity, subtotal
    FROM order_items WHERE orderId = ? ORDER BY id`, [orderId]);
  return order;
};

module.exports = { ensureOrderSchema, getOrderById, getOrdersForUser };
