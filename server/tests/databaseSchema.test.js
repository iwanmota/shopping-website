const sqlite3 = require('sqlite3').verbose();
const { ensureProductInventorySchema } = require('../services/databaseSchema');

const run = (db, sql) => new Promise((resolve, reject) => {
  db.run(sql, error => error ? reject(error) : resolve());
});
const all = (db, sql) => new Promise((resolve, reject) => {
  db.all(sql, (error, rows) => error ? reject(error) : resolve(rows));
});
const close = db => new Promise(resolve => db.close(resolve));

test('upgrades an existing products table with checkout inventory columns', async () => {
  const db = new sqlite3.Database(':memory:');
  await run(db, 'CREATE TABLE products (id INTEGER PRIMARY KEY, name TEXT, price REAL)');

  await run(db, "INSERT INTO products (id, name, price) VALUES (1, 'Watch', 99.99)");

  await ensureProductInventorySchema(db);

  const columns = await all(db, 'PRAGMA table_info(products)');
  expect(columns.map(column => column.name)).toEqual(expect.arrayContaining([
    'regularInventory',
    'lowStockThreshold',
    'createdAt',
    'updatedAt'
  ]));
  const products = await all(db, 'SELECT regularInventory FROM products');
  expect(products).toEqual([{ regularInventory: 20 }]);
  await close(db);
});
