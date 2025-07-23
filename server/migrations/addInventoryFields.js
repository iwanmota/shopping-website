/**
 * Migration Script: Add Inventory Fields to Products Table
 * 
 * This script adds inventory management fields to the existing products table:
 * - regularInventory: Number of items available at regular price
 * - lowStockThreshold: Threshold for low stock warning
 * - createdAt: Timestamp when the product was created
 * - updatedAt: Timestamp when the product was last updated
 * 
 * The script ensures backward compatibility by:
 * 1. Checking if columns already exist before adding them
 * 2. Setting default values for existing products
 * 3. Preserving all existing data
 */

const sqlite3 = require('sqlite3').verbose();
const path = require('path');
const fs = require('fs');

// Path to the database file
const dbPath = path.resolve(__dirname, '../shopping.db');

// Check if database file exists
if (!fs.existsSync(dbPath)) {
  console.error('Database file not found:', dbPath);
  process.exit(1);
}

// Connect to the database
const db = new sqlite3.Database(dbPath);

// Helper function to check if a column exists in a table
function columnExists(table, column) {
  return new Promise((resolve, reject) => {
    db.all(`PRAGMA table_info(${table})`, (err, rows) => {
      if (err) {
        reject(err);
        return;
      }
      
      const exists = rows.some(row => row && row.name === column);
      resolve(exists);
    });
  });
}

// Helper function to add a column if it doesn't exist
async function addColumnIfNotExists(table, column, definition) {
  try {
    const exists = await columnExists(table, column);
    if (!exists) {
      return new Promise((resolve, reject) => {
        db.run(`ALTER TABLE ${table} ADD COLUMN ${column} ${definition}`, (err) => {
          if (err) {
            reject(err);
            return;
          }
          console.log(`Added column ${column} to ${table}`);
          resolve();
        });
      });
    } else {
      console.log(`Column ${column} already exists in ${table}`);
      return Promise.resolve();
    }
  } catch (err) {
    console.error(`Error checking/adding column ${column}:`, err);
    return Promise.reject(err);
  }
}

// Run the migration
async function runMigration() {
  try {
    // Begin transaction
    await new Promise((resolve, reject) => {
      db.run('BEGIN TRANSACTION', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    // Add new columns if they don't exist
    await addColumnIfNotExists('products', 'regularInventory', 'INTEGER DEFAULT 0');
    await addColumnIfNotExists('products', 'lowStockThreshold', 'INTEGER DEFAULT 5');
    await addColumnIfNotExists('products', 'createdAt', 'TIMESTAMP');
    await addColumnIfNotExists('products', 'updatedAt', 'TIMESTAMP');

    // Set default inventory values for existing products
    // We'll set regularInventory to 20 for all existing products as a reasonable default
    await new Promise((resolve, reject) => {
      db.run(`UPDATE products SET regularInventory = 20 WHERE regularInventory IS NULL OR regularInventory = 0`, (err) => {
        if (err) {
          reject(err);
          return;
        }
        console.log('Updated regularInventory for existing products');
        resolve();
      });
    });
    
    // Set timestamp values for existing products
    const currentTimestamp = new Date().toISOString();
    await new Promise((resolve, reject) => {
      db.run(`UPDATE products SET createdAt = ?, updatedAt = ? WHERE createdAt IS NULL OR updatedAt IS NULL`, 
        [currentTimestamp, currentTimestamp], (err) => {
        if (err) {
          reject(err);
          return;
        }
        console.log('Updated timestamps for existing products');
        resolve();
      });
    });

    // Commit transaction
    await new Promise((resolve, reject) => {
      db.run('COMMIT', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });

    console.log('Migration completed successfully');
  } catch (err) {
    // Rollback on error
    console.error('Migration failed:', err);
    await new Promise((resolve) => {
      db.run('ROLLBACK', () => resolve());
    });
  } finally {
    // Close database connection
    db.close();
  }
}

// Execute the migration
runMigration().catch(err => {
  console.error('Unhandled error during migration:', err);
  process.exit(1);
});