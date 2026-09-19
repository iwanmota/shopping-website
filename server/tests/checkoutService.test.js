const sqlite3 = require('sqlite3').verbose();
const { checkoutCart } = require('../services/checkoutService');

const run = (db, sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (error) {
      if (error) reject(error);
      else resolve(this);
    });
  });

const get = (db, sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (error, row) => (error ? reject(error) : resolve(row)));
  });

const createDatabase = async () => {
  const db = new sqlite3.Database(':memory:');
  await run(
    db,
    `CREATE TABLE products (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    isOnSale INTEGER DEFAULT 0,
    salePrice REAL,
    onSaleQuantity INTEGER DEFAULT 0,
    regularInventory INTEGER DEFAULT 0
  )`
  );
  await run(
    db,
    `INSERT INTO products VALUES
    (1, 'Coffee Maker', 199.99, 1, 149.99, 3, 5),
    (2, 'Smart Watch', 299.99, 0, NULL, 0, 2)`
  );
  return db;
};

const close = (db) => new Promise((resolve) => db.close(resolve));

describe('checkoutCart', () => {
  test('prices items on the server and atomically decrements sale and regular inventory', async () => {
    const db = await createDatabase();

    const receipt = await checkoutCart(db, 7, [
      { productId: 1, quantity: 2, pricingTier: 'sale' },
      { productId: 2, quantity: 1, pricingTier: 'regular' },
    ]);

    expect(receipt.userId).toBe(7);
    expect(receipt.items).toEqual([
      expect.objectContaining({
        productId: 1,
        unitPrice: 149.99,
        subtotal: 299.98,
      }),
      expect.objectContaining({
        productId: 2,
        unitPrice: 299.99,
        subtotal: 299.99,
      }),
    ]);
    expect(receipt.total).toBe(599.97);
    expect(
      await get(db, 'SELECT onSaleQuantity FROM products WHERE id = 1')
    ).toEqual({ onSaleQuantity: 1 });
    expect(
      await get(db, 'SELECT regularInventory FROM products WHERE id = 2')
    ).toEqual({ regularInventory: 1 });

    await close(db);
  });

  test('rolls back every inventory change when any cart line is unavailable', async () => {
    const db = await createDatabase();

    await expect(
      checkoutCart(db, 7, [
        { productId: 1, quantity: 2, pricingTier: 'sale' },
        { productId: 2, quantity: 3, pricingTier: 'regular' },
      ])
    ).rejects.toMatchObject({ status: 409 });

    expect(
      await get(db, 'SELECT onSaleQuantity FROM products WHERE id = 1')
    ).toEqual({ onSaleQuantity: 3 });
    expect(
      await get(db, 'SELECT regularInventory FROM products WHERE id = 2')
    ).toEqual({ regularInventory: 2 });

    await close(db);
  });

  test.each([
    [[], 'Cart must contain at least one item'],
    [[{ productId: 1, quantity: -1, pricingTier: 'sale' }], 'positive integer'],
    [[{ productId: 1, quantity: 1, pricingTier: 'discount' }], 'pricingTier'],
  ])('rejects malformed carts', async (items, message) => {
    const db = await createDatabase();
    await expect(checkoutCart(db, 7, items)).rejects.toThrow(message);
    await close(db);
  });
});
