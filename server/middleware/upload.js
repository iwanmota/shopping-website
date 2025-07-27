/**
 * File Upload Middleware
 * 
 * This module provides middleware for handling file uploads using multer.
 * It includes validation for file types, sizes, and secure storage.
 */

const multer = require('multer');
const path = require('path');
const crypto = require('crypto');
const { 
  generateUniqueFilename, 
  getAbsoluteImagePath,
  PRODUCT_IMAGES_UPLOADS_DIR 
} = require('../utils/fileStorage');
const { 
  MAX_FILE_SIZE, 
  ALLOWED_IMAGE_TYPES 
} = require('../config/fileStorage');

// Configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Use the uploads directory from our file storage system
    cb(null, PRODUCT_IMAGES_UPLOADS_DIR);
  },
  filename: (req, file, cb) => {
    // Generate unique filename using our utility function
    const uniqueFilename = generateUniqueFilename(file.originalname);
    cb(null, uniqueFilename);
  }
});

// File filter function to validate file types
const fileFilter = (req, file, cb) => {
  // Check if the file type is allowed
  if (ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    const error = new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.');
    error.code = 'INVALID_FILE_TYPE';
    cb(error, false);
  }
};

// Configure multer with storage, file filter, and limits
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE,
    files: 1 // Only allow one file at a time
  }
});

/**
 * Middleware for handling single image upload
 * Field name should be 'image'
 */
const uploadSingleImage = upload.single('image');

/**
 * Error handling middleware for multer errors
 */
const handleUploadError = (error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    switch (error.code) {
      case 'LIMIT_FILE_SIZE':
        return res.status(400).json({
          error: 'File too large',
          message: `File size must be less than ${MAX_FILE_SIZE / (1024 * 1024)}MB`
        });
      case 'LIMIT_FILE_COUNT':
        return res.status(400).json({
          error: 'Too many files',
          message: 'Only one file can be uploaded at a time'
        });
      case 'LIMIT_UNEXPECTED_FILE':
        return res.status(400).json({
          error: 'Unexpected field',
          message: 'File must be uploaded in the "image" field'
        });
      default:
        return res.status(400).json({
          error: 'Upload error',
          message: error.message
        });
    }
  } else if (error && error.code === 'INVALID_FILE_TYPE') {
    return res.status(400).json({
      error: 'Invalid file type',
      message: error.message
    });
  }
  
  // If it's not a multer error, pass it to the next error handler
  next(error);
};

module.exports = {
  uploadSingleImage,
  handleUploadError
};