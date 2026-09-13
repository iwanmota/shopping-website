const { ensureOrderSchema } = require('./orderService');

const get = (db, sql, params = []) => new Promise((resolve, reject) => {
  db.get(sql, params, (error, row) => error ? reject(error) : resolve(row));
});

const run = (db, sql, params = []) => new Promise((resolve, reject) => {
  db.run(sql, params, function(error) {
    if (error) reject(error);
    else resolve(this);
  });
});

class CheckoutError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.name = 'CheckoutError';
    this.status = status;
  }
}

const validateItems = items => {
  if (!Array.isArray(items) || items.length === 0) {
    throw new CheckoutError('Cart must contain at least one item');
  }

  for (const item of items) {
    if (!Number.isInteger(item.productId) || item.productId <= 0) {
      throw new CheckoutError('productId must be a positive integer');
    }
    if (!Number.isInteger(item.quantity) || item.quantity <= 0) {
      throw new CheckoutError('quantity must be a positive integer');
    }
    if (!['sale', 'regular'].includes(item.pricingTier)) {
      throw new CheckoutError('pricingTier must be sale or regular');
    }
  }
};

const checkoutCart = async (db, userId, items) => {
  validateItems(items);
  await ensureOrderSchema(db);
  await run(db, 'BEGIN IMMEDIATE TRANSACTION');

  try {
    const receiptItems = [];

    for (const item of items) {
      const product = await get(db, 'SELECT * FROM products WHERE id = ?', [item.productId]);
      if (!product) throw new CheckoutError(`Product ${item.productId} was not found`, 404);

      const isSale = item.pricingTier === 'sale';
      if (isSale && (!product.isOnSale || product.salePrice == null)) {
        throw new CheckoutError(`${product.name} is no longer on sale`, 409);
      }

      const inventoryField = isSale ? 'onSaleQuantity' : 'regularInventory';
      const update = await run(
        db,
        `UPDATE products SET ${inventoryField} = ${inventoryField} - ? WHERE id = ? AND ${inventoryField} >= ?`,
        [item.quantity, item.productId, item.quantity]
      );
      if (update.changes !== 1) {
        throw new CheckoutError(`${product.name} does not have enough ${item.pricingTier} inventory`, 409);
      }

      const unitPrice = isSale ? product.salePrice : product.price;
      receiptItems.push({
        productId: product.id,
        name: product.name,
        quantity: item.quantity,
        pricingTier: item.pricingTier,
        unitPrice,
        subtotal: Number((unitPrice * item.quantity).toFixed(2))
      });
    }

    const total = Number(receiptItems.reduce((sum, item) => sum + item.subtotal, 0).toFixed(2));
    const order = await run(db, 'INSERT INTO orders (userId, total, status) VALUES (?, ?, ?)', [userId, total, 'completed']);
    for (const item of receiptItems) {
      await run(db, `INSERT INTO order_items
        (orderId, productId, productName, pricingTier, unitPrice, quantity, subtotal)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [order.lastID, item.productId, item.name, item.pricingTier, item.unitPrice, item.quantity, item.subtotal]);
    }

    await run(db, 'COMMIT');
    const purchasedAt = new Date().toISOString();
    return { id: order.lastID, userId, items: receiptItems, total, status: 'completed', purchasedAt };
  } catch (error) {
    await run(db, 'ROLLBACK');
    throw error;
  }
};

module.exports = { checkoutCart, CheckoutError };
