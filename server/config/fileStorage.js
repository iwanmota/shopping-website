/**
 * File Storage Configuration
 * 
 * This module provides configuration settings for file storage.
 */

module.exports = {
  // Maximum file size for uploads in bytes (5MB)
  MAX_FILE_SIZE: 5 * 1024 * 1024,
  
  // Allowed file types for product images
  ALLOWED_IMAGE_TYPES: [
    'image/jpeg',
    'image/png',
    'image/webp',
    'image/gif'
  ],
  
  // Image quality settings for processing
  IMAGE_QUALITY: {
    JPEG: 85,
    PNG: 9,
    WEBP: 80
  },
  
  // Thumbnail dimensions
  THUMBNAIL: {
    WIDTH: 300,
    HEIGHT: 300
  }
};