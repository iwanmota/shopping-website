const bcrypt = require('bcrypt');
const { ensureOrderSchema } = require('./orderService');

const run = (db, sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function(error) {
    if (error) reject(error);
    else resolve(this);
  });
});

const get = (db, sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (error, row) => error ? reject(error) : resolve(row));
});

const sampleProducts = [
  ['Premium Coffee Maker', 199.99, 'Automatic drip coffee maker with built-in grinder', '/images/products/coffee-maker.jpg', 1, 149.99, 5, 20],
  ['Wireless Headphones', 149.99, 'Noise-cancelling Bluetooth headphones with 30-hour battery', '/images/products/headphones.jpg', 1, 99.99, 10, 20],
  ['Smart Watch', 299.99, 'Fitness tracking and notifications with OLED display', '/images/products/smartwatch.jpg', 0, null, 0, 20],
  ['Laptop Backpack', 79.99, 'Water-resistant backpack with USB charging port', '/images/products/backpack.jpg', 1, 49.99, 15, 20],
  ['Mechanical Keyboard', 129.99, 'RGB backlit mechanical gaming keyboard with Cherry MX switches', '/images/products/keyboard.jpg', 0, null, 0, 20],
  ['Portable Speaker', 89.99, 'Waterproof Bluetooth speaker with 20-hour playtime', '/images/products/speaker.jpg', 0, null, 0, 20]
];

const ensureSchema = async db => {
  await run(db, `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL UNIQUE,
    password TEXT NOT NULL,
    firstName TEXT,
    lastName TEXT,
    role TEXT NOT NULL DEFAULT 'customer',
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);
  await run(db, `CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    description TEXT,
    image TEXT,
    isOnSale BOOLEAN DEFAULT 0,
    salePrice REAL,
    onSaleQuantity INTEGER DEFAULT 0,
    regularInventory INTEGER DEFAULT 0,
    lowStockThreshold INTEGER DEFAULT 5,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`);
};

const seedProducts = async db => {
  const findProduct = 'SELECT id, regularInventory FROM products WHERE name = ? ORDER BY id LIMIT 1';
  const insertSql = `INSERT INTO products
    (name, price, description, image, isOnSale, salePrice, onSaleQuantity, regularInventory)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
  const updateSql = `UPDATE products SET price = ?, description = ?, image = ?,
    isOnSale = ?, salePrice = ?, onSaleQuantity = ?,
    regularInventory = CASE WHEN regularInventory IS NULL OR regularInventory = 0
      THEN ? ELSE regularInventory END,
    updatedAt = CURRENT_TIMESTAMP WHERE id = ?`;

  for (const product of sampleProducts) {
    const existing = await get(db, findProduct, [product[0]]);
    if (existing) {
      await run(db, updateSql, [product[1], product[2], product[3], product[4], product[5], product[6], product[7], existing.id]);
      await run(db, 'DELETE FROM products WHERE name = ? AND id != ?', [product[0], existing.id]);
    } else {
      await run(db, insertSql, product);
    }
  }
};

const seedUsers = async db => {
  const users = [
    ['admin@shopsmart.com', 'admin123', 'Admin', 'User', 'admin'],
    ['customer@example.com', 'customer123', 'John', 'Doe', 'customer']
  ];

  for (const [email, password, firstName, lastName, role] of users) {
    const hash = await bcrypt.hash(password, 10);
    const existing = await get(db, 'SELECT id FROM users WHERE email = ?', [email]);
    if (!existing) {
      await run(db, `INSERT INTO users (email, password, firstName, lastName, role)
        VALUES (?, ?, ?, ?, ?)`, [email, hash, firstName, lastName, role]);
    }
  }
};

const initializeDatabase = async (db, options = {}) => {
  await run(db, 'BEGIN TRANSACTION');
  try {
    await ensureSchema(db);
    await ensureOrderSchema(db);
    if (options.failAfterSchema) throw new Error('Initialization test failure');
    await seedProducts(db);
    await seedUsers(db);
    await run(db, 'COMMIT');
  } catch (error) {
    await run(db, 'ROLLBACK');
    throw error;
  }
};

module.exports = { initializeDatabase, sampleProducts };
