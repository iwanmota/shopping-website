/**
 * Image Processing Utilities
 * 
 * This module provides utilities for processing uploaded images,
 * including validation, optimization, and thumbnail generation.
 */

const fs = require('fs');
const path = require('path');
const {
  getAbsoluteImagePath,
  getRelativeImagePath,
  extractFilenameFromPath
} = require('./fileStorage');

const IMAGE_SIGNATURES = {
  'image/jpeg': buffer => buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff,
  'image/png': buffer => buffer.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])),
  'image/gif': buffer => buffer.subarray(0, 6).toString('ascii').match(/^GIF8[79]a$/) !== null,
  'image/webp': buffer => buffer.subarray(0, 4).toString('ascii') === 'RIFF'
    && buffer.subarray(8, 12).toString('ascii') === 'WEBP'
};

/**
 * Validates an uploaded image file
 * 
 * @param {Object} file - Multer file object
 * @returns {Object} Validation result with success flag and any errors
 */
const validateUploadedImage = (file) => {
  const errors = [];
  
  if (!file) {
    errors.push('No file provided');
    return { success: false, errors };
  }
  
  // Check if file exists on disk
  if (!fs.existsSync(file.path)) {
    errors.push('Uploaded file not found');
  }
  
  // Verify the file signature instead of trusting the client-provided MIME type.
  if (fs.existsSync(file.path)) {
    const signatureValidator = IMAGE_SIGNATURES[file.mimetype];
    if (!signatureValidator || !signatureValidator(fs.readFileSync(file.path, { end: 11 }))) {
      errors.push('File content does not match its declared image type');
    }
  }

  return {
    success: errors.length === 0,
    errors
  };
};

/**
 * Processes an uploaded image file
 * This is a basic implementation that can be extended with image optimization
 * 
 * @param {Object} file - Multer file object
 * @returns {Promise<Object>} Processing result with file information
 */
const processUploadedImage = async (file) => {
  try {
    // Validate the uploaded file
    const validation = validateUploadedImage(file);
    if (!validation.success) {
      throw new Error(`Image validation failed: ${validation.errors.join(', ')}`);
    }
    
    // Get file information
    const filename = file.filename;
    const originalName = file.originalname;
    const size = file.size;
    const mimetype = file.mimetype;
    
    // Generate paths
    const relativePath = getRelativeImagePath(filename);
    const absolutePath = getAbsoluteImagePath(filename);
    
    // Verify file was saved correctly
    const stats = fs.statSync(absolutePath);
    
    return {
      success: true,
      file: {
        filename,
        originalName,
        size,
        mimetype,
        relativePath,
        absolutePath,
        uploadedAt: new Date().toISOString()
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Cleans up an uploaded file if processing fails
 * 
 * @param {string} filePath - Path to the file to clean up
 */
const cleanupFailedUpload = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error cleaning up failed upload:', error);
  }
};

/**
 * Gets image file information from a relative path
 * 
 * @param {string} relativePath - Relative path to the image
 * @returns {Object|null} File information or null if file doesn't exist
 */
const getImageInfo = (relativePath) => {
  if (!relativePath) return null;
  
  try {
    const filename = extractFilenameFromPath(relativePath);
    const absolutePath = getAbsoluteImagePath(filename);
    
    if (!fs.existsSync(absolutePath)) {
      return null;
    }
    
    const stats = fs.statSync(absolutePath);
    
    return {
      filename,
      relativePath,
      absolutePath,
      size: stats.size,
      createdAt: stats.birthtime,
      modifiedAt: stats.mtime
    };
  } catch (error) {
    console.error('Error getting image info:', error);
    return null;
  }
};

module.exports = {
  validateUploadedImage,
  processUploadedImage,
  cleanupFailedUpload,
  getImageInfo
};