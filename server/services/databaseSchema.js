const all = (db, sql) =>
  new Promise((resolve, reject) => {
    db.all(sql, (error, rows) => (error ? reject(error) : resolve(rows)));
  });

const run = (db, sql) =>
  new Promise((resolve, reject) => {
    db.run(sql, (error) => (error ? reject(error) : resolve()));
  });

const ensureProductInventorySchema = async (db) => {
  const columns = await all(db, 'PRAGMA table_info(products)');
  if (columns.length === 0) {
    throw new Error(
      'Products table is missing. Run node server/initDb.js first.'
    );
  }

  const existingColumns = new Set(columns.map((column) => column.name));
  const requiredColumns = [
    ['regularInventory', 'INTEGER DEFAULT 0'],
    ['lowStockThreshold', 'INTEGER DEFAULT 5'],
    ['createdAt', 'TIMESTAMP'],
    ['updatedAt', 'TIMESTAMP'],
  ];

  for (const [name, definition] of requiredColumns) {
    if (!existingColumns.has(name)) {
      await run(db, `ALTER TABLE products ADD COLUMN ${name} ${definition}`);
    }
  }

  if (!existingColumns.has('regularInventory')) {
    await run(db, 'UPDATE products SET regularInventory = 20');
  }
};

module.exports = { ensureProductInventorySchema };
