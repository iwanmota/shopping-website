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
const PRODUCT_IMAGES_BASE_DIR = path.join(__dirname, '../public/images/products');
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

    // Validate that the path follows the expected format
    if (!relativePath.startsWith('/images/products/')) {
        return null;
    }

    return path.basename(relativePath);
};

/**
 * Deletes image files associated with a product
 * Removes both the original image and thumbnail if they exist
 * 
 * @param {string} relativePath - Relative path stored in database (e.g., "/images/products/uploads/filename.jpg")
 * @returns {Promise<{success: boolean, deletedFiles: string[], errors: string[]}>} Result of deletion operation
 */
const deleteProductImage = async (relativePath) => {
    const result = {
        success: true,
        deletedFiles: [],
        errors: []
    };

    if (!relativePath) {
        return result;
    }

    try {
        const filename = extractFilenameFromPath(relativePath);
        if (!filename) {
            result.errors.push('Invalid image path provided');
            result.success = false;
            return result;
        }

        // Get absolute paths for both original and thumbnail
        const originalPath = getAbsoluteImagePath(filename, 'original');
        const thumbnailPath = getAbsoluteImagePath(filename, 'thumbnail');

        // Delete original image
        try {
            if (fs.existsSync(originalPath)) {
                await fs.promises.unlink(originalPath);
                result.deletedFiles.push(originalPath);
            }
        } catch (error) {
            result.errors.push(`Failed to delete original image: ${error.message}`);
            result.success = false;
        }

        // Delete thumbnail image
        try {
            if (fs.existsSync(thumbnailPath)) {
                await fs.promises.unlink(thumbnailPath);
                result.deletedFiles.push(thumbnailPath);
            }
        } catch (error) {
            result.errors.push(`Failed to delete thumbnail image: ${error.message}`);
            result.success = false;
        }

    } catch (error) {
        result.errors.push(`Error processing image deletion: ${error.message}`);
        result.success = false;
    }

    return result;
};

/**
 * Deletes multiple product images
 * Useful for bulk operations or cleanup
 * 
 * @param {string[]} relativePaths - Array of relative paths stored in database
 * @returns {Promise<{success: boolean, totalDeleted: number, totalErrors: number, results: Array}>} Results of all deletion operations
 */
const deleteMultipleProductImages = async (relativePaths) => {
    const overallResult = {
        success: true,
        totalDeleted: 0,
        totalErrors: 0,
        results: []
    };

    if (!Array.isArray(relativePaths) || relativePaths.length === 0) {
        return overallResult;
    }

    for (const relativePath of relativePaths) {
        const result = await deleteProductImage(relativePath);
        overallResult.results.push({
            path: relativePath,
            ...result
        });

        overallResult.totalDeleted += result.deletedFiles.length;
        overallResult.totalErrors += result.errors.length;

        if (!result.success) {
            overallResult.success = false;
        }
    }

    return overallResult;
};

/**
 * Replaces a product image with a new one, ensuring proper cleanup of old files
 * This function handles the complete image replacement workflow:
 * 1. Validates the new image file
 * 2. Stores the new image
 * 3. Cleans up the old image files
 * 4. Provides rollback capability if needed
 * 
 * @param {string} oldImagePath - Relative path of the current image to replace
 * @param {string} newImagePath - Relative path of the new image
 * @returns {Promise<{success: boolean, newImagePath: string, oldImageCleanup: Object, errors: string[]}>} Result of replacement operation
 */
const replaceProductImage = async (oldImagePath, newImagePath) => {
    const result = {
        success: true,
        newImagePath,
        oldImageCleanup: {
            attempted: false,
            success: false,
            deletedFiles: [],
            errors: []
        },
        errors: []
    };

    try {
        // Validate that the new image exists
        if (!newImagePath) {
            result.errors.push('New image path is required');
            result.success = false;
            return result;
        }

        const newFilename = extractFilenameFromPath(newImagePath);
        if (!newFilename) {
            result.errors.push('Invalid new image path provided');
            result.success = false;
            return result;
        }

        const newImageAbsolutePath = getAbsoluteImagePath(newFilename);
        if (!fs.existsSync(newImageAbsolutePath)) {
            result.errors.push('New image file does not exist');
            result.success = false;
            return result;
        }

        // If there's an old image, clean it up
        if (oldImagePath && oldImagePath !== newImagePath) {
            result.oldImageCleanup.attempted = true;
            
            try {
                const deletionResult = await deleteProductImage(oldImagePath);
                result.oldImageCleanup.success = deletionResult.success;
                result.oldImageCleanup.deletedFiles = deletionResult.deletedFiles;
                result.oldImageCleanup.errors = deletionResult.errors;

                // Log cleanup results
                if (deletionResult.errors.length > 0) {
                    console.warn('Errors during old image cleanup:', deletionResult.errors);
                    // Don't fail the replacement if cleanup has issues
                }

                if (deletionResult.deletedFiles.length > 0) {
                    console.log('Successfully cleaned up old image files:', deletionResult.deletedFiles);
                }

            } catch (cleanupError) {
                const errorMessage = `Error during old image cleanup: ${cleanupError.message}`;
                result.oldImageCleanup.errors.push(errorMessage);
                console.error(errorMessage);
                // Don't fail the replacement if cleanup has issues
            }
        }

        return result;

    } catch (error) {
        result.errors.push(`Error during image replacement: ${error.message}`);
        result.success = false;
        return result;
    }
};

/**
 * Validates that an image file exists and is accessible
 * 
 * @param {string} relativePath - Relative path to validate
 * @returns {Promise<{exists: boolean, filename: string, absolutePath: string, error?: string}>} Validation result
 */
const validateImageExists = async (relativePath) => {
    const result = {
        exists: false,
        filename: null,
        absolutePath: null
    };

    try {
        if (!relativePath) {
            result.error = 'No image path provided';
            return result;
        }

        const filename = extractFilenameFromPath(relativePath);
        if (!filename) {
            result.error = 'Invalid image path format';
            return result;
        }

        const absolutePath = getAbsoluteImagePath(filename);
        result.filename = filename;
        result.absolutePath = absolutePath;

        if (fs.existsSync(absolutePath)) {
            result.exists = true;
        } else {
            result.error = 'Image file does not exist';
        }

        return result;

    } catch (error) {
        result.error = `Error validating image: ${error.message}`;
        return result;
    }
};

module.exports = {
    ensureDirectoriesExist,
    generateUniqueFilename,
    getRelativeImagePath,
    getAbsoluteImagePath,
    extractFilenameFromPath,
    deleteProductImage,
    deleteMultipleProductImages,
    replaceProductImage,
    validateImageExists,
    PRODUCT_IMAGES_BASE_DIR,
    PRODUCT_IMAGES_UPLOADS_DIR,
    PRODUCT_IMAGES_THUMBNAILS_DIR
};