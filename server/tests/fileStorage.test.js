/**
 * File Storage Tests
 * 
 * This file contains tests for the file storage utilities.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const {
  ensureDirectoriesExist,
  generateUniqueFilename,
  getRelativeImagePath,
  getAbsoluteImagePath,
  extractFilenameFromPath,
  PRODUCT_IMAGES_BASE_DIR,
  PRODUCT_IMAGES_UPLOADS_DIR,
  PRODUCT_IMAGES_THUMBNAILS_DIR
} = require('../utils/fileStorage');

async function runTests() {
  console.log('Running file storage tests...');
  
  // Test directory creation
  await ensureDirectoriesExist();
  assert(fs.existsSync(PRODUCT_IMAGES_BASE_DIR), 'Base directory should exist');
  assert(fs.existsSync(PRODUCT_IMAGES_UPLOADS_DIR), 'Uploads directory should exist');
  assert(fs.existsSync(PRODUCT_IMAGES_THUMBNAILS_DIR), 'Thumbnails directory should exist');
  console.log('✓ Directory creation test passed');
  
  // Test filename generation
  const originalFilename = 'test product image.jpg';
  const uniqueFilename = generateUniqueFilename(originalFilename);
  assert(uniqueFilename.includes('-test-product-image.jpg'), 'Unique filename should contain sanitized original name');
  assert(uniqueFilename.length > originalFilename.length, 'Unique filename should be longer than original');
  console.log('✓ Filename generation test passed');
  
  // Test path generation
  const relativePath = getRelativeImagePath(uniqueFilename);
  assert(relativePath.startsWith('/images/products/uploads/'), 'Relative path should start with correct directory');
  assert(relativePath.endsWith(uniqueFilename), 'Relative path should end with filename');
  
  const thumbnailPath = getRelativeImagePath(uniqueFilename, 'thumbnail');
  assert(thumbnailPath.startsWith('/images/products/thumbnails/'), 'Thumbnail path should start with correct directory');
  console.log('✓ Path generation test passed');
  
  // Test absolute path generation
  const absolutePath = getAbsoluteImagePath(uniqueFilename);
  assert(absolutePath.endsWith(uniqueFilename), 'Absolute path should end with filename');
  assert(path.isAbsolute(absolutePath), 'Absolute path should be absolute');
  console.log('✓ Absolute path generation test passed');
  
  // Test filename extraction
  const extractedFilename = extractFilenameFromPath(relativePath);
  assert.strictEqual(extractedFilename, uniqueFilename, 'Extracted filename should match original');
  assert.strictEqual(extractFilenameFromPath(null), null, 'Null path should return null');
  console.log('✓ Filename extraction test passed');
  
  console.log('All file storage tests passed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  });
}

module.exports = runTests;