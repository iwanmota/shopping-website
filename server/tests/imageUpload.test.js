/**
 * Image Upload Tests
 * 
 * This file contains tests for the image upload functionality.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { 
  validateUploadedImage, 
  processUploadedImage, 
  cleanupFailedUpload,
  getImageInfo 
} = require('../utils/imageProcessing');
const { 
  generateUniqueFilename,
  getAbsoluteImagePath,
  ensureDirectoriesExist 
} = require('../utils/fileStorage');

// Mock file object for testing
const createMockFile = (filename, size = 1024) => {
  const uniqueFilename = generateUniqueFilename(filename);
  const absolutePath = getAbsoluteImagePath(uniqueFilename);
  
  return {
    fieldname: 'image',
    originalname: filename,
    encoding: '7bit',
    mimetype: 'image/jpeg',
    destination: path.dirname(absolutePath),
    filename: uniqueFilename,
    path: absolutePath,
    size: size
  };
};

// Create a test image file
const createTestImageFile = (filePath) => {
  // Create a minimal JPEG header for testing
  const jpegHeader = Buffer.from([
    0xFF, 0xD8, 0xFF, 0xE0, 0x00, 0x10, 0x4A, 0x46, 0x49, 0x46, 0x00, 0x01,
    0x01, 0x01, 0x00, 0x48, 0x00, 0x48, 0x00, 0x00, 0xFF, 0xDB, 0x00, 0x43,
    0x00, 0x08, 0x06, 0x06, 0x07, 0x06, 0x05, 0x08, 0x07, 0x07, 0x07, 0x09,
    0x09, 0x08, 0x0A, 0x0C, 0x14, 0x0D, 0x0C, 0x0B, 0x0B, 0x0C, 0x19, 0x12,
    0x13, 0x0F, 0x14, 0x1D, 0x1A, 0x1F, 0x1E, 0x1D, 0x1A, 0x1C, 0x1C, 0x20,
    0x24, 0x2E, 0x27, 0x20, 0x22, 0x2C, 0x23, 0x1C, 0x1C, 0x28, 0x37, 0x29,
    0x2C, 0x30, 0x31, 0x34, 0x34, 0x34, 0x1F, 0x27, 0x39, 0x3D, 0x38, 0x32,
    0x3C, 0x2E, 0x33, 0x34, 0x32, 0xFF, 0xD9
  ]);
  
  fs.writeFileSync(filePath, jpegHeader);
};

async function runTests() {
  console.log('Running image upload tests...');
  
  // Ensure directories exist
  await ensureDirectoriesExist();
  
  // Test 1: Validate uploaded image - valid file
  const mockFile = createMockFile('test-image.jpg');
  createTestImageFile(mockFile.path);
  
  const validation = validateUploadedImage(mockFile);
  assert(validation.success, 'Valid image should pass validation');
  console.log('✓ Image validation test (valid file) passed');
  
  // Test 2: Validate uploaded image - no file
  const noFileValidation = validateUploadedImage(null);
  assert(!noFileValidation.success, 'Null file should fail validation');
  assert(noFileValidation.errors.includes('No file provided'), 'Should have correct error message');
  console.log('✓ Image validation test (no file) passed');
  
  // Test 3: Process uploaded image
  const processingResult = await processUploadedImage(mockFile);
  assert(processingResult.success, 'Image processing should succeed');
  assert(processingResult.file.filename === mockFile.filename, 'Filename should match');
  assert(processingResult.file.originalName === mockFile.originalname, 'Original name should match');
  console.log('✓ Image processing test passed');
  
  // Test 4: Get image info
  const imageInfo = getImageInfo(processingResult.file.relativePath);
  assert(imageInfo !== null, 'Image info should be retrieved');
  assert(imageInfo.filename === mockFile.filename, 'Filename should match');
  console.log('✓ Get image info test passed');
  
  // Test 5: Cleanup failed upload
  const cleanupFile = createMockFile('cleanup-test.jpg');
  createTestImageFile(cleanupFile.path);
  assert(fs.existsSync(cleanupFile.path), 'File should exist before cleanup');
  
  cleanupFailedUpload(cleanupFile.path);
  assert(!fs.existsSync(cleanupFile.path), 'File should be deleted after cleanup');
  console.log('✓ Cleanup failed upload test passed');
  
  // Clean up test files
  if (fs.existsSync(mockFile.path)) {
    fs.unlinkSync(mockFile.path);
  }
  
  console.log('All image upload tests passed!');
}

// Run tests if this file is executed directly
if (require.main === module) {
  runTests().catch(error => {
    console.error('Test failed:', error);
    process.exit(1);
  });
}

module.exports = runTests;