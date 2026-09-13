const sqlite3 = require('sqlite3').verbose();
const { DATABASE_PATH } = require('./config/database');
const { initializeDatabase } = require('./services/databaseInitializer');

const db = new sqlite3.Database(DATABASE_PATH);

initializeDatabase(db)
  .then(() => {
    console.log(`Database initialized at ${DATABASE_PATH}`);
    db.close(error => {
      if (error) {
        console.error('Error closing database:', error);
        process.exitCode = 1;
      }
    });
  })
  .catch(error => {
    console.error('Database initialization failed:', error);
    db.close(() => {
      process.exitCode = 1;
    });
  });
