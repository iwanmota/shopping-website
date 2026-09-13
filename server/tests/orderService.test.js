const sqlite3 = require('sqlite3').verbose();
const { checkoutCart } = require('../services/checkoutService');
const { getOrderById, getOrdersForUser } = require('../services/orderService');

const run = (db, sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function(error) { error ? reject(error) : resolve(this); });
});
const get = (db, sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (error, row) => error ? reject(error) : resolve(row));
});
const close = db => new Promise(resolve => db.close(resolve));

const createDatabase = async () => {
  const db = new sqlite3.Database(':memory:');
  await run(db, `CREATE TABLE products (
    id INTEGER PRIMARY KEY, name TEXT NOT NULL, price REAL NOT NULL,
    isOnSale INTEGER DEFAULT 0, salePrice REAL, onSaleQuantity INTEGER DEFAULT 0,
    regularInventory INTEGER DEFAULT 0
  )`);
  await run(db, "INSERT INTO products VALUES (1, 'Coffee Maker', 199.99, 1, 149.99, 3, 5)");
  return db;
};

describe('persistent orders', () => {
  test('persists an order and immutable item price snapshot with checkout', async () => {
    const db = await createDatabase();
    const receipt = await checkoutCart(db, 7, [{ productId: 1, quantity: 2, pricingTier: 'sale' }]);

    expect(receipt.id).toEqual(expect.any(Number));
    const order = await getOrderById(db, 7, receipt.id);
    expect(order).toMatchObject({ id: receipt.id, userId: 7, status: 'completed', total: 299.98 });
    expect(order.items).toEqual([expect.objectContaining({
      productId: 1, productName: 'Coffee Maker', pricingTier: 'sale', unitPrice: 149.99, quantity: 2, subtotal: 299.98
    })]);

    await run(db, 'UPDATE products SET price = 999.99 WHERE id = 1');
    expect((await getOrderById(db, 7, receipt.id)).items[0].unitPrice).toBe(149.99);
    await close(db);
  });

  test('does not persist an order when checkout rolls back', async () => {
    const db = await createDatabase();
    await expect(checkoutCart(db, 7, [{ productId: 1, quantity: 4, pricingTier: 'sale' }]))
      .rejects.toMatchObject({ status: 409 });
    await expect(get(db, 'SELECT * FROM orders')).resolves.toBeUndefined();
    await close(db);
  });

  test('returns only the requested user’s orders', async () => {
    const db = await createDatabase();
    await checkoutCart(db, 7, [{ productId: 1, quantity: 1, pricingTier: 'sale' }]);
    await run(db, 'UPDATE products SET onSaleQuantity = 3 WHERE id = 1');
    await checkoutCart(db, 8, [{ productId: 1, quantity: 1, pricingTier: 'sale' }]);

    expect(await getOrdersForUser(db, 7)).toHaveLength(1);
    expect(await getOrdersForUser(db, 8)).toHaveLength(1);
    await close(db);
  });
});
