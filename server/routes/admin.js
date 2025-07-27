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
 * Deletes a specific product by ID
 * Only accessible by admin users
 * 
 * @param {number} id - Product ID in URL path
 * 
 * @returns {Object} Success message
 * @response {200} Product deleted successfully
 * @response {401} Not authenticated
 * @response {403} Not authorized (not an admin)
 * @response {404} Product not found
 * @response {500} Server error
 */
router.delete('/products/:id', (req, res) => {
  const productId = req.params.id;
  const fs = require('fs');
  const path = require('path');
  
  // First get the product to check if it exists and to get the image path
  db.get('SELECT * FROM products WHERE id = ?', [productId], (err, product) => {
    if (err) {
      return res.status(500).json({ error: 'Database error', details: err.message });
    }
    
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    
    // Delete the product from the database
    db.run('DELETE FROM products WHERE id = ?', [productId], function(err) {
      if (err) {
        return res.status(500).json({ error: 'Error deleting product', details: err.message });
      }
      
      if (this.changes === 0) {
        return res.status(404).json({ error: 'Product not found' });
      }
      
      // If product has an image, attempt to delete it
      if (product.image) {
        try {
          // Determine the full path to the image
          // Assuming images are stored in public/images/products
          const imagePath = path.join(__dirname, '../../public', product.image);
          
          // Check if file exists before attempting to delete
          if (fs.existsSync(imagePath)) {
            fs.unlink(imagePath, (err) => {
              if (err) {
                // Log error but don't fail the request
                console.error(`Error deleting image file: ${imagePath}`, err);
              }
            });
          }
        } catch (error) {
          // Log error but don't fail the request
          console.error(`Error processing image deletion for product ${productId}:`, error);
        }
      }
      
      res.json({
        message: 'Product deleted successfully',
        productId
      });
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
        
        // Update product with new image path
        const updateSql = 'UPDATE products SET image = ?, updatedAt = ? WHERE id = ?';
        const updateParams = [imageInfo.relativePath, new Date().toISOString(), productId];
        
        db.run(updateSql, updateParams, function(updateErr) {
          if (updateErr) {
            // Clean up the uploaded file if database update failed
            cleanupFailedUpload(req.file.path);
            return res.status(500).json({ 
              error: 'Error updating product image', 
              details: updateErr.message 
            });
          }
          
          // Clean up old image file if it exists
          if (oldImagePath) {
            try {
              const fs = require('fs');
              const path = require('path');
              const oldImageFullPath = path.join(__dirname, '../../public', oldImagePath);
              
              if (fs.existsSync(oldImageFullPath)) {
                fs.unlink(oldImageFullPath, (err) => {
                  if (err) {
                    console.error(`Error deleting old image file: ${oldImageFullPath}`, err);
                  }
                });
              }
            } catch (error) {
              console.error('Error processing old image cleanup:', error);
            }
          }
          
          // Return success response
          res.json({
            message: 'Image uploaded successfully',
            productId,
            image: {
              filename: imageInfo.filename,
              originalName: imageInfo.originalName,
              size: imageInfo.size,
              path: imageInfo.relativePath,
              uploadedAt: imageInfo.uploadedAt
            }
          });
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