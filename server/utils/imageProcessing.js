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
  
  // Additional validation can be added here
  // For example: image dimensions, file integrity, etc.
  
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