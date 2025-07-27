/**
 * Admin Routes
 * 
 * This module provides API endpoints for product management by administrators,
 * including product listing, creation, updating, and deletion.
 */

const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { uploadSingleImage, handleUploadError } = require('../middleware/upload');
const { processUploadedImage, cleanupFailedUpload } = require('../utils/imageProcessing');

// Connect to SQLite database
const path = require('path');
const db = new sqlite3.Database(path.join(__dirname, '../shopping.db'));

// Apply authentication and admin role middleware to all routes
router.use(authenticateToken, requireAdmin);

/**
 * GET /api/admin/products
 * 
 * Retrieves all products with optional filtering, sorting, and pagination
 * Only accessible by admin users
 * 
 * @query {string} search - Optional search term for product name
 * @query {string} sort - Optional sort field (name, price, inventory)
 * @query {string} order - Optional sort order (asc, desc)
 * @query {number} page - Optional page number for pagination (default: 1)
 * @query {number} limit - Optional items per page (default: 10)
 * 
 * @returns {Object} Products list with pagination metadata
 * @response {200} Successfully retrieved products
 * @response {401} Not authenticated
 * @response {403} Not authorized (not an admin)
 * @response {500} Server error
 */
router.get('/products', (req, res) => {
  // Extract query parameters with defaults
  const search = req.query.search || '';
  const sort = req.query.sort || 'id';
  const order = (req.query.order || 'asc').toUpperCase();
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;
  
  // Validate sort field to prevent SQL injection
  const validSortFields = ['id', 'name', 'price', 'regularInventory', 'onSaleQuantity', 'createdAt', 'updatedAt'];
  const sortField = validSortFields.includes(sort) ? sort : 'id';
  
  // Validate sort order
  const sortOrder = order === 'DESC' ? 'DESC' : 'ASC';
  
  // Build query with search condition if provided
  let query = 'SELECT * FROM products';
  let countQuery = 'SELECT COUNT(*) as total FROM products';
  const params = [];
  
  if (search) {
    query += ' WHERE name LIKE ? OR description LIKE ?';
    countQuery += ' WHERE name LIKE ? OR description LIKE ?';
    params.push(`%${search}%`, `%${search}%`);
  }
  
  // Add sorting and pagination
  query += ` ORDER BY ${sortField} ${sortOrder} LIMIT ? OFFSET ?`;
  params.push(limit, offset);
  
  // Execute count query to get total number of products
  db.get(countQuery, search ? [params[0], params[1]] : [], (err, countResult) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    
    const total = countResult.total;
    const totalPages = Math.ceil(total / limit);
    
    // Execute main query to get products
    db.all(query, params, (err, products) => {
      if (err) {
        return res.status(500).json({ error: 'Database error', details: err.message });
      }
      
      // Return products with pagination metadata
      res.json({
        products,
        pagination: {
          total,
          page,
          limit,
          totalPages,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
      });
    });
  });
});

/**
 * POST /api/admin/products
 * 
 * Creates a new product
 * Only accessible by admin users
 * 
 * @param {Object} req.body - Product data
 * @param {string} req.body.name - Product name
 * @param {number} req.body.price - Product price
 * @param {string} req.body.description - Product description
 * @param {string} req.body.image - Product image path
 * @param {boolean} req.body.isOnSale - Whether the product is on sale
 * @param {number} req.body.salePrice - Sale price (if isOnSale is true)
 * @param {number} req.body.regularInventory - Regular inventory quantity
 * @param {number} req.body.onSaleQuantity - Sale inventory quantity
 * @param {number} req.body.lowStockThreshold - Low stock threshold
 * 
 * @returns {Object} Created product data
 * @response {201} Product created successfully
 * @response {400} Validation error
 * @response {401} Not authenticated
 * @response {403} Not authorized (not an admin)
 * @response {500} Server error
 */
router.post('/products', (req, res) => {
  const {
    name,
    price,
    description,
    image,
    isOnSale,
    salePrice,
    regularInventory,
    onSaleQuantity,
    lowStockThreshold
  } = req.body;
  
  // Validate required fields
  if (!name || name.trim() === '') {
    return res.status(400).json({ error: 'Product name is required' });
  }
  
  if (!price || isNaN(price) || price <= 0) {
    return res.status(400).json({ error: 'Valid product price is required' });
  }
  
  // Validate inventory fields
  const parsedRegularInventory = parseInt(regularInventory) || 0;
  const parsedOnSaleQuantity = parseInt(onSaleQuantity) || 0;
  const parsedLowStockThreshold = parseInt(lowStockThreshold) || 5;
  
  if (parsedRegularInventory < 0) {
    return res.status(400).json({ error: 'Regular inventory cannot be negative' });
  }
  
  if (parsedOnSaleQuantity < 0) {
    return res.status(400).json({ error: 'Sale inventory cannot be negative' });
  }
  
  // Validate sale price if product is on sale
  if (isOnSale && (!salePrice || isNaN(salePrice) || salePrice <= 0)) {
    return res.status(400).json({ error: 'Valid sale price is required for products on sale' });
  }
  
  // Prepare data for insertion
  const productData = {
    name: name.trim(),
    price: parseFloat(price),
    description: description ? description.trim() : null,
    image: image ? image.trim() : null,
    isOnSale: isOnSale ? 1 : 0,
    salePrice: isOnSale ? parseFloat(salePrice) : null,
    regularInventory: parsedRegularInventory,
    onSaleQuantity: parsedOnSaleQuantity,
    lowStockThreshold: parsedLowStockThreshold,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  
  // Insert product into database
  const sql = `
    INSERT INTO products (
      name, price, description, image, isOnSale, salePrice,
      regularInventory, onSaleQuantity, lowStockThreshold,
      createdAt, updatedAt
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  
  const params = [
    productData.name,
    productData.price,
    productData.description,
    productData.image,
    productData.isOnSale,
    productData.salePrice,
    productData.regularInventory,
    productData.onSaleQuantity,
    productData.lowStockThreshold,
    productData.createdAt,
    productData.updatedAt
  ];
  
  db.run(sql, params, function(err) {
    if (err) {
      return res.status(500).json({ error: 'Error creating product', details: err.message });
    }
    
    // Get the newly created product
    db.get('SELECT * FROM products WHERE id = ?', [this.lastID], (err, product) => {
      if (err) {
        return res.status(201).json({
          message: 'Product created successfully',
          productId: this.lastID
        });
      }
      
      res.status(201).json({
        message: 'Product created successfully',
        product
      });
    });
  });
});

/**
 * GET /api/admin/products/:id
 * 
 * Retrieves a specific product by ID
 * Only accessible by admin users
 * 
 * @param {number} id - Product ID in URL path
 * 
 * @returns {Object} Product data
 * @response {200} Successfully retrieved product
 * @response {401} Not authenticated
 * @response {403} Not authorized (not an admin)
 * @response {404} Product not found
 * @response {500} Server error
 */
router.get('/products/:id', (req, res) => {
  const productId = req.params.id;
  
  db.get('SELECT * FROM products WHERE id = ?', [productId], (err, product) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    res.json(product);
  });
});

/**
 * PUT /api/admin/products/:id
 * 
 * Updates a specific product by ID
 * Only accessible by admin users
 * 
 * @param {number} id - Product ID in URL path
 * @param {Object} req.body - Updated product data
 * @param {string} req.body.name - Product name
 * @param {number} req.body.price - Product price
 * @param {string} req.body.description - Product description
 * @param {string} req.body.image - Product image path
 * @param {boolean} req.body.isOnSale - Whether the product is on sale
 * @param {number} req.body.salePrice - Sale price (if isOnSale is true)
 * @param {number} req.body.regularInventory - Regular inventory quantity
 * @param {number} req.body.onSaleQuantity - Sale inventory quantity
 * @param {number} req.body.lowStockThreshold - Low stock threshold
 * 
 * @returns {Object} Updated product data
 * @response {200} Product updated successfully
 * @response {400} Validation error
 * @response {401} Not authenticated
 * @response {403} Not authorized (not an admin)
 * @response {404} Product not found
 * @response {500} Server error
 */
router.put('/products/:id', (req, res) => {
  const productId = req.params.id;
  
  // First check if product exists
  db.get('SELECT * FROM products WHERE id = ?', [productId], (err, product) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Extract and validate fields from request body
    const {
      name,
      price,
      description,
      image,
      isOnSale,
      salePrice,
      regularInventory,
      onSaleQuantity,
      lowStockThreshold
    } = req.body;
    
    // Validate required fields
    if (name !== undefined && name.trim() === '') {
      return res.status(400).json({ error: 'Product name cannot be empty' });
    }
    
    if (price !== undefined && (isNaN(price) || price <= 0)) {
      return res.status(400).json({ error: 'Valid product price is required' });
    }
    
    // Validate inventory fields
    const parsedRegularInventory = regularInventory !== undefined ? parseInt(regularInventory) : product.regularInventory;
    const parsedOnSaleQuantity = onSaleQuantity !== undefined ? parseInt(onSaleQuantity) : product.onSaleQuantity;
    const parsedLowStockThreshold = lowStockThreshold !== undefined ? parseInt(lowStockThreshold) : product.lowStockThreshold;
    
    if (parsedRegularInventory < 0) {
      return res.status(400).json({ error: 'Regular inventory cannot be negative' });
    }
    
    if (parsedOnSaleQuantity < 0) {
      return res.status(400).json({ error: 'Sale inventory cannot be negative' });
    }
    
    // Determine if product is on sale
    const productIsOnSale = isOnSale !== undefined ? !!isOnSale : !!product.isOnSale;
    
    // Validate sale price if product is on sale
    const parsedSalePrice = salePrice !== undefined ? parseFloat(salePrice) : product.salePrice;
    if (productIsOnSale && (!parsedSalePrice || parsedSalePrice <= 0)) {
      return res.status(400).json({ error: 'Valid sale price is required for products on sale' });
    }
    
    // Prepare data for update
    const updates = [];
    const params = [];
    
    // Only update fields that were provided
    if (name !== undefined) {
      updates.push('name = ?');
      params.push(name.trim());
    }
    
    if (price !== undefined) {
      updates.push('price = ?');
      params.push(parseFloat(price));
    }
    
    if (description !== undefined) {
      updates.push('description = ?');
      params.push(description ? description.trim() : null);
    }
    
    if (image !== undefined) {
      updates.push('image = ?');
      params.push(image ? image.trim() : null);
    }
    
    if (isOnSale !== undefined) {
      updates.push('isOnSale = ?');
      params.push(productIsOnSale ? 1 : 0);
    }
    
    if (salePrice !== undefined || (productIsOnSale && product.isOnSale === 0)) {
      updates.push('salePrice = ?');
      params.push(productIsOnSale ? parsedSalePrice : null);
    }
    
    if (regularInventory !== undefined) {
      updates.push('regularInventory = ?');
      params.push(parsedRegularInventory);
    }
    
    if (onSaleQuantity !== undefined) {
      updates.push('onSaleQuantity = ?');
      params.push(parsedOnSaleQuantity);
    }
    
    if (lowStockThreshold !== undefined) {
      updates.push('lowStockThreshold = ?');
      params.push(parsedLowStockThreshold);
    }
    
    // Always update the updatedAt timestamp
    updates.push('updatedAt = ?');
    params.push(new Date().toISOString());
    
    // Add product ID to params
    params.push(productId);
    
    // If no fields to update, return the existing product
    if (updates.length === 1) { // Only updatedAt
      return res.json({
        message: 'No changes to update',
        product
      });
    }
    
    // Update product in database
    const sql = `UPDATE products SET ${updates.join(', ')} WHERE id = ?`;
    
    db.run(sql, params, function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error updating product', details: err.message });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Product not found or no changes made' });
      }
      
      // Get the updated product
      db.get('SELECT * FROM products WHERE id = ?', [productId], (err, updatedProduct) => {
        if (err) {
          return res.json({
            message: 'Product updated successfully',
            productId
          });
        }
        
        res.json({
          message: 'Product updated successfully',
          product: updatedProduct
        });
      });
    });
  });
});

/**
 * DELETE /api/admin/products/:id
 * 
 * Deletes a specific product by ID and associated image files
 * Only accessible by admin users
 * 
 * @param {number} id - Product ID in URL path
 * 
 * @returns {Object} Success message with deletion details
 * @response {200} Product deleted successfully
 * @response {401} Not authenticated
 * @response {403} Not authorized (not an admin)
 * @response {404} Product not found
 * @response {500} Server error
 */
router.delete('/products/:id', async (req, res) => {
  const productId = req.params.id;
  const { deleteProductImage } = require('../utils/fileStorage');
  
  // First get the product to check if it exists and to get the image path
  db.get('SELECT * FROM products WHERE id = ?', [productId], async (err, product) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Delete the product from the database
    db.run('DELETE FROM products WHERE id = ?', [productId], async function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error deleting product', details: err.message });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      // Initialize response data
      const responseData = {
        message: 'Product deleted successfully',
        productId,
        imageCleanup: {
          attempted: false,
          success: false,
          deletedFiles: [],
          errors: []
        }
      };
      
      // If product has an image, attempt to delete it using the utility function
      if (product.image) {
        responseData.imageCleanup.attempted = true;
        
        try {
          const deletionResult = await deleteProductImage(product.image);
          responseData.imageCleanup.success = deletionResult.success;
          responseData.imageCleanup.deletedFiles = deletionResult.deletedFiles;
          responseData.imageCleanup.errors = deletionResult.errors;
          
          // Log any errors but don't fail the request
          if (deletionResult.errors.length > 0) {
            console.error(`Image deletion errors for product ${productId}:`, deletionResult.errors);
          }
          
          // Log successful deletions
          if (deletionResult.deletedFiles.length > 0) {
            console.log(`Successfully deleted image files for product ${productId}:`, deletionResult.deletedFiles);
          }
          
        } catch (error) {
          // Log error but don't fail the request
          const errorMessage = `Error processing image deletion for product ${productId}: ${error.message}`;
          console.error(errorMessage);
          responseData.imageCleanup.errors.push(errorMessage);
        }
      }
      
      res.json(responseData);
    });
  });
});

/**
 * POST /api/admin/products/:id/image
 * 
 * Uploads an image for a specific product
 * Only accessible by admin users
 * 
 * @param {number} id - Product ID in URL path
 * @param {File} image - Image file in multipart form data
 * 
 * @returns {Object} Upload result with image information
 * @response {200} Image uploaded successfully
 * @response {400} Validation error or upload error
 * @response {401} Not authenticated
 * @response {403} Not authorized (not an admin)
 * @response {404} Product not found
 * @response {500} Server error
 */
router.post('/products/:id/image', (req, res) => {
  const productId = req.params.id;
  
  // First check if product exists
  db.get('SELECT * FROM products WHERE id = ?', [productId], (err, product) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Handle file upload
    uploadSingleImage(req, res, async (uploadErr) => {
      if (uploadErr) {
        return handleUploadError(uploadErr, req, res, () => {
          res.status(500).json({ error: 'Upload failed', details: uploadErr.message });
        });
      }
      
      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }
      
      try {
        // Process the uploaded image
        const processingResult = await processUploadedImage(req.file);
        
        if (!processingResult.success) {
          // Clean up the uploaded file if processing failed
          cleanupFailedUpload(req.file.path);
          return res.status(400).json({ 
            error: 'Image processing failed', 
            details: processingResult.error 
          });
        }
        
        const imageInfo = processingResult.file;
        
        // Store old image path for cleanup
        const oldImagePath = product.image;
        
        // Use the replaceProductImage function for proper image replacement handling
        const { replaceProductImage } = require('../utils/fileStorage');
        
        // Update product with new image path
        const updateSql = 'UPDATE products SET image = ?, updatedAt = ? WHERE id = ?';
        const updateParams = [imageInfo.relativePath, new Date().toISOString(), productId];
        
        db.run(updateSql, updateParams, async function(updateErr) {
          if (updateErr) {
            // Clean up the uploaded file if database update failed
            cleanupFailedUpload(req.file.path);
            return res.status(500).json({ 
              error: 'Error updating product image', 
              details: updateErr.message 
            });
          }
          
          // Handle image replacement with proper cleanup
          let replacementResult = null;
          if (oldImagePath) {
            try {
              replacementResult = await replaceProductImage(oldImagePath, imageInfo.relativePath);
              
              // Log replacement results
              if (replacementResult.errors.length > 0) {
                console.error(`Image replacement errors for product ${productId}:`, replacementResult.errors);
              }
              
              if (replacementResult.oldImageCleanup.attempted) {
                if (replacementResult.oldImageCleanup.success && replacementResult.oldImageCleanup.deletedFiles.length > 0) {
                  console.log(`Successfully replaced image for product ${productId}. Cleaned up files:`, replacementResult.oldImageCleanup.deletedFiles);
                } else if (replacementResult.oldImageCleanup.errors.length > 0) {
                  console.warn(`Image replacement completed for product ${productId}, but cleanup had issues:`, replacementResult.oldImageCleanup.errors);
                }
              }
              
            } catch (error) {
              console.error(`Error during image replacement for product ${productId}:`, error);
              // Don't fail the request if replacement cleanup has issues
            }
          }
          
          // Return success response with replacement details
          const response = {
            message: 'Image uploaded successfully',
            productId,
            image: {
              filename: imageInfo.filename,
              originalName: imageInfo.originalName,
              size: imageInfo.size,
              path: imageInfo.relativePath,
              uploadedAt: imageInfo.uploadedAt
            }
          };
          
          // Include replacement details if available
          if (replacementResult) {
            response.imageReplacement = {
              oldImageCleanup: replacementResult.oldImageCleanup,
              success: replacementResult.success,
              errors: replacementResult.errors
            };
          }
          
          res.json(response);
        });
        
      } catch (error) {
        // Clean up the uploaded file if an error occurred
        cleanupFailedUpload(req.file.path);
        res.status(500).json({ 
          error: 'Server error during image processing', 
          details: error.message 
        });
      }
    });
  });
});

/**
 * PUT /api/admin/products/:id/image
 * 
 * Replaces an existing product image with a new one
 * This endpoint handles the complete image replacement workflow
 * Only accessible by admin users
 * 
 * @param {number} id - Product ID in URL path
 * @param {File} image - New image file in multipart form data
 * 
 * @returns {Object} Replacement result with image information and cleanup details
 * @response {200} Image replaced successfully
 * @response {400} Validation error or upload error
 * @response {401} Not authenticated
 * @response {403} Not authorized (not an admin)
 * @response {404} Product not found
 * @response {500} Server error
 */
router.put('/products/:id/image', (req, res) => {
  const productId = req.params.id;
  
  // First check if product exists
  db.get('SELECT * FROM products WHERE id = ?', [productId], (err, product) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Handle file upload
    uploadSingleImage(req, res, async (uploadErr) => {
      if (uploadErr) {
        return handleUploadError(uploadErr, req, res, () => {
          res.status(500).json({ error: 'Upload failed', details: uploadErr.message });
        });
      }
      
      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({ error: 'No image file provided' });
      }
      
      try {
        // Process the uploaded image
        const processingResult = await processUploadedImage(req.file);
        
        if (!processingResult.success) {
          // Clean up the uploaded file if processing failed
          cleanupFailedUpload(req.file.path);
          return res.status(400).json({ 
            error: 'Image processing failed', 
            details: processingResult.error 
          });
        }
        
        const imageInfo = processingResult.file;
        const oldImagePath = product.image;
        
        // Use the replaceProductImage function for proper image replacement handling
        const { replaceProductImage } = require('../utils/fileStorage');
        
        // Update product with new image path
        const updateSql = 'UPDATE products SET image = ?, updatedAt = ? WHERE id = ?';
        const updateParams = [imageInfo.relativePath, new Date().toISOString(), productId];
        
        db.run(updateSql, updateParams, async function(updateErr) {
          if (updateErr) {
            // Clean up the uploaded file if database update failed
            cleanupFailedUpload(req.file.path);
            return res.status(500).json({ 
              error: 'Error updating product image', 
              details: updateErr.message 
            });
          }
          
          // Handle image replacement with proper cleanup
          let replacementResult = null;
          try {
            replacementResult = await replaceProductImage(oldImagePath, imageInfo.relativePath);
            
            // Log replacement results
            if (replacementResult.errors.length > 0) {
              console.error(`Image replacement errors for product ${productId}:`, replacementResult.errors);
            }
            
            if (replacementResult.oldImageCleanup.attempted) {
              if (replacementResult.oldImageCleanup.success && replacementResult.oldImageCleanup.deletedFiles.length > 0) {
                console.log(`Successfully replaced image for product ${productId}. Cleaned up files:`, replacementResult.oldImageCleanup.deletedFiles);
              } else if (replacementResult.oldImageCleanup.errors.length > 0) {
                console.warn(`Image replacement completed for product ${productId}, but cleanup had issues:`, replacementResult.oldImageCleanup.errors);
              }
            }
            
          } catch (error) {
            console.error(`Error during image replacement for product ${productId}:`, error);
            // Create a basic result object if replacement function fails
            replacementResult = {
              success: false,
              newImagePath: imageInfo.relativePath,
              oldImageCleanup: {
                attempted: false,
                success: false,
                deletedFiles: [],
                errors: [`Replacement function error: ${error.message}`]
              },
              errors: [error.message]
            };
          }
          
          // Return success response with replacement details
          res.json({
            message: 'Image replaced successfully',
            productId,
            image: {
              filename: imageInfo.filename,
              originalName: imageInfo.originalName,
              size: imageInfo.size,
              path: imageInfo.relativePath,
              uploadedAt: imageInfo.uploadedAt
            },
            replacement: {
              oldImagePath,
              newImagePath: imageInfo.relativePath,
              oldImageCleanup: replacementResult.oldImageCleanup,
              success: replacementResult.success,
              errors: replacementResult.errors
            }
          });
        });
        
      } catch (error) {
        // Clean up the uploaded file if an error occurred
        cleanupFailedUpload(req.file.path);
        res.status(500).json({ 
          error: 'Server error during image replacement', 
          details: error.message 
        });
      }
    });
  });
});

/**
 * POST /api/admin/upload/image
 * 
 * Standalone image upload endpoint for general use
 * Only accessible by admin users
 * 
 * @param {File} image - Image file in multipart form data
 * 
 * @returns {Object} Upload result with image information
 * @response {200} Image uploaded successfully
 * @response {400} Validation error or upload error
 * @response {401} Not authenticated
 * @response {403} Not authorized (not an admin)
 * @response {500} Server error
 */
router.post('/upload/image', (req, res) => {
  // Handle file upload
  uploadSingleImage(req, res, async (uploadErr) => {
    if (uploadErr) {
      return handleUploadError(uploadErr, req, res, () => {
        res.status(500).json({ error: 'Upload failed', details: uploadErr.message });
      });
    }
    
    // Check if file was uploaded
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }
    
    try {
      // Process the uploaded image
      const processingResult = await processUploadedImage(req.file);
      
      if (!processingResult.success) {
        // Clean up the uploaded file if processing failed
        cleanupFailedUpload(req.file.path);
        return res.status(400).json({ 
          error: 'Image processing failed', 
          details: processingResult.error 
        });
      }
      
      const imageInfo = processingResult.file;
      
      // Return success response
      res.json({
        message: 'Image uploaded successfully',
        image: {
          filename: imageInfo.filename,
          originalName: imageInfo.originalName,
          size: imageInfo.size,
          path: imageInfo.relativePath,
          uploadedAt: imageInfo.uploadedAt
        }
      });
      
    } catch (error) {
      // Clean up the uploaded file if an error occurred
      cleanupFailedUpload(req.file.path);
      res.status(500).json({ 
        error: 'Server error during image processing', 
        details: error.message 
      });
    }
  });
});

module.exports = router;