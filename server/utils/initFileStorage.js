/**
 * Initialize File Storage
 * 
 * This script ensures that all required directories for product images exist.
 * It should be run when the server starts.
 */

const { ensureDirectoriesExist } = require('./fileStorage');

// Initialize file storage directories
const initFileStorage = async () => {
  try {
    await ensureDirectoriesExist();
    console.log('File storage directories initialized successfully');
  } catch (error) {
    console.error('Error initializing file storage directories:', error);
    throw error;
  }
};

module.exports = initFileStorage;