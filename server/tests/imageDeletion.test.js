/**
 * Image Deletion Tests
 * 
 * Tests for the image deletion functionality in the file storage utilities
 * and product deletion endpoints.
 */

const fs = require('fs');
const path = require('path');
const { 
    deleteProductImage, 
    deleteMultipleProductImages,
    getAbsoluteImagePath,
    generateUniqueFilename,
    ensureDirectoriesExist
} = require('../utils/fileStorage');

// Test setup and teardown helpers
const createTestImage = async (filename, type = 'original') => {
    await ensureDirectoriesExist();
    const imagePath = getAbsoluteImagePath(filename, type);
    await fs.promises.writeFile(imagePath, 'test image content');
    return imagePath;
};

const cleanupTestFiles = async (filePaths) => {
    for (const filePath of filePaths) {
        try {
            if (fs.existsSync(filePath)) {
                await fs.promises.unlink(filePath);
            }
        } catch (error) {
            // Ignore cleanup errors
        }
    }
};

describe('Image Deletion Functionality', () => {
    let testFiles = [];

    afterEach(async () => {
        // Clean up any test files created during tests
        await cleanupTestFiles(testFiles);
        testFiles = [];
    });

    describe('deleteProductImage', () => {
        test('should delete both original and thumbnail images when they exist', async () => {
            // Create test images
            const filename = generateUniqueFilename('test-image.jpg');
            const originalPath = await createTestImage(filename, 'original');
            const thumbnailPath = await createTestImage(filename, 'thumbnail');
            testFiles.push(originalPath, thumbnailPath);

            // Test deletion
            const relativePath = `/images/products/uploads/${filename}`;
            const result = await deleteProductImage(relativePath);

            // Verify results
            expect(result.success).toBe(true);
            expect(result.deletedFiles).toHaveLength(2);
            expect(result.deletedFiles).toContain(originalPath);
            expect(result.deletedFiles).toContain(thumbnailPath);
            expect(result.errors).toHaveLength(0);

            // Verify files are actually deleted
            expect(fs.existsSync(originalPath)).toBe(false);
            expect(fs.existsSync(thumbnailPath)).toBe(false);
        });

        test('should handle case where only original image exists', async () => {
            // Create only original image
            const filename = generateUniqueFilename('test-image.jpg');
            const originalPath = await createTestImage(filename, 'original');
            testFiles.push(originalPath);

            // Test deletion
            const relativePath = `/images/products/uploads/${filename}`;
            const result = await deleteProductImage(relativePath);

            // Verify results
            expect(result.success).toBe(true);
            expect(result.deletedFiles).toHaveLength(1);
            expect(result.deletedFiles).toContain(originalPath);
            expect(result.errors).toHaveLength(0);

            // Verify file is actually deleted
            expect(fs.existsSync(originalPath)).toBe(false);
        });

        test('should handle case where only thumbnail image exists', async () => {
            // Create only thumbnail image
            const filename = generateUniqueFilename('test-image.jpg');
            const thumbnailPath = await createTestImage(filename, 'thumbnail');
            testFiles.push(thumbnailPath);

            // Test deletion
            const relativePath = `/images/products/uploads/${filename}`;
            const result = await deleteProductImage(relativePath);

            // Verify results
            expect(result.success).toBe(true);
            expect(result.deletedFiles).toHaveLength(1);
            expect(result.deletedFiles).toContain(thumbnailPath);
            expect(result.errors).toHaveLength(0);

            // Verify file is actually deleted
            expect(fs.existsSync(thumbnailPath)).toBe(false);
        });

        test('should handle case where no images exist', async () => {
            // Test deletion with non-existent file
            const filename = generateUniqueFilename('non-existent.jpg');
            const relativePath = `/images/products/uploads/${filename}`;
            const result = await deleteProductImage(relativePath);

            // Verify results
            expect(result.success).toBe(true);
            expect(result.deletedFiles).toHaveLength(0);
            expect(result.errors).toHaveLength(0);
        });

        test('should handle null or empty relative path', async () => {
            // Test with null path
            let result = await deleteProductImage(null);
            expect(result.success).toBe(true);
            expect(result.deletedFiles).toHaveLength(0);
            expect(result.errors).toHaveLength(0);

            // Test with empty path
            result = await deleteProductImage('');
            expect(result.success).toBe(true);
            expect(result.deletedFiles).toHaveLength(0);
            expect(result.errors).toHaveLength(0);
        });

        test('should handle invalid relative path', async () => {
            // Test with invalid path
            const result = await deleteProductImage('invalid/path');
            expect(result.success).toBe(false);
            expect(result.deletedFiles).toHaveLength(0);
            expect(result.errors.length).toBeGreaterThan(0);
            expect(result.errors[0]).toContain('Invalid image path provided');
        });
    });

    describe('deleteMultipleProductImages', () => {
        test('should delete multiple product images', async () => {
            // Create test images
            const filename1 = generateUniqueFilename('test-image-1.jpg');
            const filename2 = generateUniqueFilename('test-image-2.jpg');
            
            const originalPath1 = await createTestImage(filename1, 'original');
            const thumbnailPath1 = await createTestImage(filename1, 'thumbnail');
            const originalPath2 = await createTestImage(filename2, 'original');
            
            testFiles.push(originalPath1, thumbnailPath1, originalPath2);

            // Test deletion
            const relativePaths = [
                `/images/products/uploads/${filename1}`,
                `/images/products/uploads/${filename2}`
            ];
            const result = await deleteMultipleProductImages(relativePaths);

            // Verify results
            expect(result.success).toBe(true);
            expect(result.totalDeleted).toBe(3); // 2 files for first image, 1 for second
            expect(result.totalErrors).toBe(0);
            expect(result.results).toHaveLength(2);

            // Verify files are actually deleted
            expect(fs.existsSync(originalPath1)).toBe(false);
            expect(fs.existsSync(thumbnailPath1)).toBe(false);
            expect(fs.existsSync(originalPath2)).toBe(false);
        });

        test('should handle empty array', async () => {
            const result = await deleteMultipleProductImages([]);
            expect(result.success).toBe(true);
            expect(result.totalDeleted).toBe(0);
            expect(result.totalErrors).toBe(0);
            expect(result.results).toHaveLength(0);
        });

        test('should handle null or undefined input', async () => {
            let result = await deleteMultipleProductImages(null);
            expect(result.success).toBe(true);
            expect(result.totalDeleted).toBe(0);
            expect(result.totalErrors).toBe(0);
            expect(result.results).toHaveLength(0);

            result = await deleteMultipleProductImages(undefined);
            expect(result.success).toBe(true);
            expect(result.totalDeleted).toBe(0);
            expect(result.totalErrors).toBe(0);
            expect(result.results).toHaveLength(0);
        });

        test('should handle mix of valid and invalid paths', async () => {
            // Create one valid test image
            const filename = generateUniqueFilename('test-image.jpg');
            const originalPath = await createTestImage(filename, 'original');
            testFiles.push(originalPath);

            // Test deletion with mix of valid and invalid paths
            const relativePaths = [
                `/images/products/uploads/${filename}`, // valid
                'invalid/path', // invalid
                `/images/products/uploads/non-existent.jpg` // valid format but file doesn't exist
            ];
            const result = await deleteMultipleProductImages(relativePaths);

            // Verify results
            expect(result.success).toBe(false); // Should be false due to invalid path
            expect(result.totalDeleted).toBe(1); // Only the valid file should be deleted
            expect(result.totalErrors).toBeGreaterThan(0);
            expect(result.results).toHaveLength(3);

            // Verify valid file is deleted
            expect(fs.existsSync(originalPath)).toBe(false);
        });
    });
});