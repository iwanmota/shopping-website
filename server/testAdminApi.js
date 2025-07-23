/**
 * Test Script for Product Management API
 * 
 * This script tests all the product management API endpoints:
 * 1. Login to get a bearer token
 * 2. List products with filtering and pagination
 * 3. Create a new product
 * 4. Get a specific product
 * 5. Update a product
 * 6. Delete a product
 */

const axios = require('axios');

// API base URL
const API_URL = 'http://localhost:3001/api';

// Admin credentials
const adminCredentials = {
  email: 'admin@shopsmart.com',
  password: 'admin123'
};

// Test data for product creation
const newProduct = {
  name: 'Test Product',
  price: 19.99,
  description: 'This is a test product created by the API test script',
  image: '/images/products/test.jpg',
  isOnSale: false,
  regularInventory: 100,
  onSaleQuantity: 0,
  lowStockThreshold: 10
};

// Test data for product update
const productUpdate = {
  name: 'Updated Test Product',
  price: 24.99,
  isOnSale: true,
  salePrice: 19.99,
  onSaleQuantity: 50
};

// Store the token and created product ID
let token;
let createdProductId;

/**
 * Login and get authentication token
 */
async function login() {
  try {
    console.log('1. Logging in as admin...');
    const response = await axios.post(`${API_URL}/auth/login`, adminCredentials);
    token = response.data.token;
    console.log('✅ Login successful');
    console.log(`Token: ${token.substring(0, 20)}...`);
    return token;
  } catch (error) {
    console.error('❌ Login failed:', error.response?.data || error.message);
    process.exit(1);
  }
}

/**
 * List products with filtering and pagination
 */
async function listProducts() {
  try {
    console.log('\n2. Listing products...');
    const response = await axios.get(
      `${API_URL}/admin/products?search=&sort=name&order=asc&page=1&limit=5`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    const { products, pagination } = response.data;
    console.log('✅ Products retrieved successfully');
    console.log(`Total products: ${pagination.total}`);
    console.log(`Page ${pagination.page} of ${pagination.totalPages}`);
    console.log('Products:');
    products.forEach(product => {
      console.log(`- ${product.id}: ${product.name} ($${product.price})`);
    });
    
    return products;
  } catch (error) {
    console.error('❌ Failed to list products:', error.response?.data || error.message);
  }
}

/**
 * Create a new product
 */
async function createProduct() {
  try {
    console.log('\n3. Creating a new product...');
    const response = await axios.post(
      `${API_URL}/admin/products`,
      newProduct,
      {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    createdProductId = response.data.product?.id || response.data.productId;
    console.log('✅ Product created successfully');
    console.log(`Product ID: ${createdProductId}`);
    console.log('Product details:', response.data.product || 'Details not returned');
    
    return createdProductId;
  } catch (error) {
    console.error('❌ Failed to create product:', error.response?.data || error.message);
  }
}

/**
 * Get a specific product by ID
 */
async function getProduct(id) {
  try {
    console.log(`\n4. Getting product with ID ${id}...`);
    const response = await axios.get(
      `${API_URL}/admin/products/${id}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    console.log('✅ Product retrieved successfully');
    console.log('Product details:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('❌ Failed to get product:', error.response?.data || error.message);
  }
}

/**
 * Update a product
 */
async function updateProduct(id) {
  try {
    console.log(`\n5. Updating product with ID ${id}...`);
    const response = await axios.put(
      `${API_URL}/admin/products/${id}`,
      productUpdate,
      {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ Product updated successfully');
    console.log('Updated product details:', response.data.product || response.data);
    
    return response.data;
  } catch (error) {
    console.error('❌ Failed to update product:', error.response?.data || error.message);
  }
}

/**
 * Delete a product
 */
async function deleteProduct(id) {
  try {
    console.log(`\n6. Deleting product with ID ${id}...`);
    const response = await axios.delete(
      `${API_URL}/admin/products/${id}`,
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    );
    
    console.log('✅ Product deleted successfully');
    console.log('Response:', response.data);
    
    return response.data;
  } catch (error) {
    console.error('❌ Failed to delete product:', error.response?.data || error.message);
  }
}

/**
 * Run all tests in sequence
 */
async function runTests() {
  console.log('=== PRODUCT MANAGEMENT API TEST ===');
  
  // Step 1: Login
  await login();
  
  // Step 2: List products
  await listProducts();
  
  // Step 3: Create a product
  const productId = await createProduct();
  
  if (productId) {
    // Step 4: Get the created product
    await getProduct(productId);
    
    // Step 5: Update the product
    await updateProduct(productId);
    
    // Step 6: Delete the product
    await deleteProduct(productId);
    
    // Step 7: Verify deletion by trying to get the product again
    console.log('\n7. Verifying deletion...');
    try {
      await getProduct(productId);
    } catch (error) {
      console.log('✅ Product was successfully deleted (404 Not Found expected)');
    }
  }
  
  console.log('\n=== TEST COMPLETED ===');
}

// Run the tests
runTests().catch(error => {
  console.error('Unhandled error during tests:', error);
});