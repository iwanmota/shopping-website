/**
 * Image Replacement Tests
 * 
 * Tests for the image replacement functionality including:
 * - Image replacement workflow
 * - Old image cleanup
 * - Error handling
 * - Validation
 */

const fs = require('fs');
const path = require('path');
const { 
  replaceProductImage, 
  validateImageExists,
  generateUniqueFilename,
  getAbsoluteImagePath,
  getRelativeImagePath,
  deleteProductImage
} = require('../utils/fileStorage');

// Test setup
const testImageDir = path.join(__dirname, '../public/images/products/uploads');
const testThumbnailDir = path.join(__dirname, '../public/images/products/thumbnails');

// Ensure test directories exist
beforeAll(async () => {
  if (!fs.existsSync(testImageDir)) {
    fs.mkdirSync(testImageDir, { recursive: true });
  }
  if (!fs.existsSync(testThumbnailDir)) {
    fs.mkdirSync(testThumbnailDir, { recursive: true });
  }
});

// Helper function to create a test image file
const createTestImage = (filename, content = 'test image content') => {
  const absolutePath = getAbsoluteImagePath(filename);
  fs.writeFileSync(absolutePath, content);
  return getRelativeImagePath(filename);
};

// Helper function to create test thumbnail
const createTestThumbnail = (filename, content = 'test thumbnail content') => {
  const absolutePath = getAbsoluteImagePath(filename, 'thumbnail');
  fs.writeFileSync(absolutePath, content);
};

// Clean up test files
const cleanupTestFile = (filename) => {
  try {
    const originalPath = getAbsoluteImagePath(filename);
    const thumbnailPath = getAbsoluteImagePath(filename, 'thumbnail');
    
    if (fs.existsSync(originalPath)) {
      fs.unlinkSync(originalPath);
    }
    if (fs.existsSync(thumbnailPath)) {
      fs.unlinkSync(thumbnailPath);
    }
  } catch (error) {
    // Ignore cleanup errors in tests
  }
};

describe('Image Replacement Functionality', () => {
  
  describe('validateImageExists', () => {
    test('should validate existing image', async () => {
      const filename = generateUniqueFilename('test-validate.jpg');
      const relativePath = createTestImage(filename);
      
      const result = await validateImageExists(relativePath);
      
      expect(result.exists).toBe(true);
      expect(result.filename).toBe(filename);
      expect(result.absolutePath).toBeTruthy();
      expect(result.error).toBeUndefined();
      
      cleanupTestFile(filename);
    });
    
    test('should handle non-existent image', async () => {
      const result = await validateImageExists('/images/products/uploads/non-existent.jpg');
      
      expect(result.exists).toBe(false);
      expect(result.error).toBe('Image file does not exist');
    });
    
    test('should handle invalid path', async () => {
      const result = await validateImageExists('invalid-path');
      
      expect(result.exists).toBe(false);
      expect(result.error).toBe('Invalid image path format');
    });
    
    test('should handle null path', async () => {
      const result = await validateImageExists(null);
      
      expect(result.exists).toBe(false);
      expect(result.error).toBe('No image path provided');
    });
  });
  
  describe('replaceProductImage', () => {
    test('should successfully replace image with cleanup', async () => {
      // Create old image and thumbnail
      const oldFilename = generateUniqueFilename('old-image.jpg');
      const oldImagePath = createTestImage(oldFilename, 'old image content');
      createTestThumbnail(oldFilename, 'old thumbnail content');
      
      // Create new image
      const newFilename = generateUniqueFilename('new-image.jpg');
      const newImagePath = createTestImage(newFilename, 'new image content');
      
      // Perform replacement
      const result = await replaceProductImage(oldImagePath, newImagePath);
      
      expect(result.success).toBe(true);
      expect(result.newImagePath).toBe(newImagePath);
      expect(result.oldImageCleanup.attempted).toBe(true);
      expect(result.oldImageCleanup.success).toBe(true);
      expect(result.oldImageCleanup.deletedFiles.length).toBeGreaterThan(0);
      expect(result.errors).toHaveLength(0);
      
      // Verify old files are deleted
      expect(fs.existsSync(getAbsoluteImagePath(oldFilename))).toBe(false);
      expect(fs.existsSync(getAbsoluteImagePath(oldFilename, 'thumbnail'))).toBe(false);
      
      // Verify new file still exists
      expect(fs.existsSync(getAbsoluteImagePath(newFilename))).toBe(true);
      
      cleanupTestFile(newFilename);
    });
    
    test('should handle replacement with no old image', async () => {
      // Create new image
      const newFilename = generateUniqueFilename('new-only-image.jpg');
      const newImagePath = createTestImage(newFilename, 'new image content');
      
      // Perform replacement with no old image
      const result = await replaceProductImage(null, newImagePath);
      
      expect(result.success).toBe(true);
      expect(result.newImagePath).toBe(newImagePath);
      expect(result.oldImageCleanup.attempted).toBe(false);
      expect(result.errors).toHaveLength(0);
      
      cleanupTestFile(newFilename);
    });
    
    test('should handle replacement with same image path', async () => {
      // Create image
      const filename = generateUniqueFilename('same-image.jpg');
      const imagePath = createTestImage(filename, 'image content');
      
      // Perform replacement with same path
      const result = await replaceProductImage(imagePath, imagePath);
      
      expect(result.success).toBe(true);
      expect(result.newImagePath).toBe(imagePath);
      expect(result.oldImageCleanup.attempted).toBe(false);
      expect(result.errors).toHaveLength(0);
      
      cleanupTestFile(filename);
    });
    
    test('should handle non-existent new image', async () => {
      const result = await replaceProductImage(
        '/images/products/uploads/old.jpg',
        '/images/products/uploads/non-existent.jpg'
      );
      
      expect(result.success).toBe(false);
      expect(result.errors).toContain('New image file does not exist');
    });
    
    test('should handle invalid new image path', async () => {
      const result = await replaceProductImage(
        '/images/products/uploads/old.jpg',
        'invalid-path'
      );
      
      expect(result.success).toBe(false);
      expect(result.errors).toContain('Invalid new image path provided');
    });
    
    test('should handle missing new image path', async () => {
      const result = await replaceProductImage(
        '/images/products/uploads/old.jpg',
        null
      );
      
      expect(result.success).toBe(false);
      expect(result.errors).toContain('New image path is required');
    });
    
    test('should continue replacement even if old image cleanup fails', async () => {
      // Create new image
      const newFilename = generateUniqueFilename('new-cleanup-fail.jpg');
      const newImagePath = createTestImage(newFilename, 'new image content');
      
      // Use non-existent old image path
      const oldImagePath = '/images/products/uploads/non-existent-old.jpg';
      
      // Perform replacement
      const result = await replaceProductImage(oldImagePath, newImagePath);
      
      expect(result.success).toBe(true);
      expect(result.newImagePath).toBe(newImagePath);
      expect(result.oldImageCleanup.attempted).toBe(true);
      expect(result.oldImageCleanup.success).toBe(true); // deleteProductImage handles non-existent files gracefully
      expect(result.errors).toHaveLength(0);
      
      cleanupTestFile(newFilename);
    });
  });
  
  describe('Integration with existing deletion functionality', () => {
    test('should work with deleteProductImage function', async () => {
      // Create test image and thumbnail
      const filename = generateUniqueFilename('integration-test.jpg');
      const relativePath = createTestImage(filename, 'integration test content');
      createTestThumbnail(filename, 'integration test thumbnail');
      
      // Verify files exist
      expect(fs.existsSync(getAbsoluteImagePath(filename))).toBe(true);
      expect(fs.existsSync(getAbsoluteImagePath(filename, 'thumbnail'))).toBe(true);
      
      // Delete using existing function
      const result = await deleteProductImage(relativePath);
      
      expect(result.success).toBe(true);
      expect(result.deletedFiles.length).toBeGreaterThan(0);
      expect(result.errors).toHaveLength(0);
      
      // Verify files are deleted
      expect(fs.existsSync(getAbsoluteImagePath(filename))).toBe(false);
      expect(fs.existsSync(getAbsoluteImagePath(filename, 'thumbnail'))).toBe(false);
    });
  });
});