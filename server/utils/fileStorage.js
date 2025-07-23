/**
 * File Storage Utilities
 * 
 * This module provides utilities for managing product image files,
 * including directory creation, file naming conventions, and cleanup.
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Base directories for product images
const PRODUCT_IMAGES_BASE_DIR = path.join(__dirname, '../../public/images/products');
const PRODUCT_IMAGES_UPLOADS_DIR = path.join(PRODUCT_IMAGES_BASE_DIR, 'uploads');
const PRODUCT_IMAGES_THUMBNAILS_DIR = path.join(PRODUCT_IMAGES_BASE_DIR, 'thumbnails');

/**
 * Ensures all required directories exist, creating them if necessary
 * @returns {Promise<void>}
 */
const ensureDirectoriesExist = async () => {
    const directories = [
        PRODUCT_IMAGES_BASE_DIR,
        PRODUCT_IMAGES_UPLOADS_DIR,
        PRODUCT_IMAGES_THUMBNAILS_DIR
    ];

    for (const dir of directories) {
        if (!fs.existsSync(dir)) {
            await fs.promises.mkdir(dir, { recursive: true });
        }
    }
};

/**
 * Generates a unique filename for a product image
 * Format: {timestamp}-{random-hash}-{sanitized-original-name}
 * 
 * @param {string} originalFilename - Original filename from upload
 * @returns {string} Unique filename
 */
const generateUniqueFilename = (originalFilename) => {
    const timestamp = Date.now();
    const randomHash = crypto.randomBytes(8).toString('hex');

    // Sanitize the original filename
    const sanitizedName = originalFilename
        .toLowerCase()
        .replace(/[^a-z0-9.]/g, '-')
        .replace(/-+/g, '-');

    // Get file extension
    const ext = path.extname(sanitizedName);
    const nameWithoutExt = path.basename(sanitizedName, ext);

    // Limit the length of the original name part
    const truncatedName = nameWithoutExt.substring(0, 40);

    return `${timestamp}-${randomHash}-${truncatedName}${ext}`;
};

/**
 * Gets the relative path for a product image that can be stored in the database
 * 
 * @param {string} filename - Generated unique filename
 * @param {string} type - Type of image ('original' or 'thumbnail')
 * @returns {string} Relative path to be stored in database
 */
const getRelativeImagePath = (filename, type = 'original') => {
    if (type === 'thumbnail') {
        return `/images/products/thumbnails/${filename}`;
    }
    return `/images/products/uploads/${filename}`;
};

/**
 * Gets the absolute path for a product image file
 * 
 * @param {string} filename - Generated unique filename
 * @param {string} type - Type of image ('original' or 'thumbnail')
 * @returns {string} Absolute path to the file on the server
 */
const getAbsoluteImagePath = (filename, type = 'original') => {
    if (type === 'thumbnail') {
        return path.join(PRODUCT_IMAGES_THUMBNAILS_DIR, filename);
    }
    return path.join(PRODUCT_IMAGES_UPLOADS_DIR, filename);
};

/**
 * Extracts the filename from a relative image path
 * 
 * @param {string} relativePath - Relative path stored in database
 * @returns {string|null} Extracted filename or null if invalid path
 */
const extractFilenameFromPath = (relativePath) => {
    if (!relativePath) return null;

    return path.basename(relativePath);
};

module.exports = {
    ensureDirectoriesExist,
    generateUniqueFilename,
    getRelativeImagePath,
    getAbsoluteImagePath,
    extractFilenameFromPath,
    PRODUCT_IMAGES_BASE_DIR,
    PRODUCT_IMAGES_UPLOADS_DIR,
    PRODUCT_IMAGES_THUMBNAILS_DIR
};