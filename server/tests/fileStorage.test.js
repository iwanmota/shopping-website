/**
 * File Storage Tests
 * 
 * This file contains tests for the file storage utilities.
 */

const fs = require('fs');
const path = require('path');
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

describe('File Storage Utilities', () => {
  test('should create required directories', async () => {
    await ensureDirectoriesExist();
    expect(fs.existsSync(PRODUCT_IMAGES_BASE_DIR)).toBe(true);
    expect(fs.existsSync(PRODUCT_IMAGES_UPLOADS_DIR)).toBe(true);
    expect(fs.existsSync(PRODUCT_IMAGES_THUMBNAILS_DIR)).toBe(true);
  });

  test('should generate unique filenames', () => {
    const originalFilename = 'test product image.jpg';
    const uniqueFilename = generateUniqueFilename(originalFilename);
    expect(uniqueFilename).toContain('-test-product-image.jpg');
    expect(uniqueFilename.length).toBeGreaterThan(originalFilename.length);
  });

  test('should generate correct relative paths', () => {
    const filename = 'test-image.jpg';
    const relativePath = getRelativeImagePath(filename);
    expect(relativePath).toMatch(/^\/images\/products\/uploads\//);
    expect(relativePath).toContain(filename);

    const thumbnailPath = getRelativeImagePath(filename, 'thumbnail');
    expect(thumbnailPath).toMatch(/^\/images\/products\/thumbnails\//);
    expect(thumbnailPath).toContain(filename);
  });

  test('should generate correct absolute paths', () => {
    const filename = 'test-image.jpg';
    const absolutePath = getAbsoluteImagePath(filename);
    expect(absolutePath).toContain(filename);
    expect(path.isAbsolute(absolutePath)).toBe(true);
  });

  test('should extract filenames from paths', () => {
    const filename = 'test-image.jpg';
    const relativePath = getRelativeImagePath(filename);
    const extractedFilename = extractFilenameFromPath(relativePath);
    expect(extractedFilename).toBe(filename);
    expect(extractFilenameFromPath(null)).toBe(null);
  });
});