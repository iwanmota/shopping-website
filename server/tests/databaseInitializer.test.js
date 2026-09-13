const sqlite3 = require('sqlite3').verbose();
const { initializeDatabase } = require('../services/databaseInitializer');

const all = (db, sql) => new Promise((resolve, reject) => {
  db.all(sql, (error, rows) => error ? reject(error) : resolve(rows));
});
const run = (db, sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, error => error ? reject(error) : resolve());
});
const close = db => new Promise(resolve => db.close(resolve));

describe('initializeDatabase', () => {
  test('can run twice without duplicating sample products or users', async () => {
    const db = new sqlite3.Database(':memory:');

    await initializeDatabase(db);
    await initializeDatabase(db);

    const products = await all(db, 'SELECT name, regularInventory FROM products ORDER BY id');
    const users = await all(db, 'SELECT email, role FROM users ORDER BY email');

    expect(products).toHaveLength(6);
    expect(products.every(product => product.regularInventory === 20)).toBe(true);
    expect(users).toEqual([
      { email: 'admin@shopsmart.com', role: 'admin' },
      { email: 'customer@example.com', role: 'customer' }
    ]);

    await close(db);
  });

  test('removes duplicate sample products left by the old initializer', async () => {
    const db = new sqlite3.Database(':memory:');
    await initializeDatabase(db);
    await run(db, "INSERT INTO products (name, price) SELECT name, price FROM products WHERE name = 'Smart Watch'");

    await initializeDatabase(db);

    const products = await all(db, "SELECT name FROM products WHERE name = 'Smart Watch'");
    expect(products).toHaveLength(1);
    await close(db);
  });

  test('rolls back schema and seed changes when initialization fails', async () => {
    const db = new sqlite3.Database(':memory:');

    await expect(initializeDatabase(db, { failAfterSchema: true })).rejects.toThrow(
      'Initialization test failure'
    );

    await expect(all(db, "SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'products'"))
      .resolves.toEqual([]);

    await close(db);
  });
});
