/**
 * Authentication Routes
 * 
 * This module provides API endpoints for user authentication, including
 * login, registration, logout, and user profile retrieval.
 */

const express = require('express');
const router = express.Router();
const sqlite3 = require('sqlite3').verbose();
const { hashPassword, verifyPassword } = require('../utils/auth');
const { generateToken, authenticateToken } = require('../middleware/auth');

// Connect to SQLite database
const db = new sqlite3.Database('./shopping.db');

/**
 * Validate email format
 * 
 * @param {string} email - Email to validate
 * @returns {boolean} True if email is valid, false otherwise
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate password strength
 * 
 * @param {string} password - Password to validate
 * @returns {boolean} True if password is strong enough, false otherwise
 */
const isStrongPassword = (password) => {
  // Password must be at least 8 characters long
  return password && password.length >= 8;
};

/**
 * POST /api/auth/login
 * 
 * Authenticates a user and returns a JWT token
 * 
 * @param {Object} req.body - Request body
 * @param {string} req.body.email - User's email
 * @param {string} req.body.password - User's password
 * 
 * @returns {Object} User data and JWT token
 * @response {200} Login successful
 * @response {400} Invalid credentials
 * @response {500} Server error
 */
router.post('/login', (req, res) => {
  const { email, password } = req.body;
  
  // Validate input
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  // Find user by email
  db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }
    
    try {
      // Verify password
      const isValid = await verifyPassword(password, user.password);
      
      if (!isValid) {
        return res.status(400).json({ error: 'Invalid credentials' });
      }
      
      // Generate JWT token
      const token = generateToken(user);
      
      // Return user data (excluding password) and token
      const { password: _, ...userData } = user;
      
      res.json({
        user: userData,
        token
      });
    } catch (error) {
      res.status(500).json({ error: 'Authentication error' });
    }
  });
});

/**
 * POST /api/auth/register
 * 
 * Registers a new user
 * 
 * @param {Object} req.body - Request body
 * @param {string} req.body.email - User's email
 * @param {string} req.body.password - User's password
 * @param {string} req.body.firstName - User's first name (optional)
 * @param {string} req.body.lastName - User's last name (optional)
 * 
 * @returns {Object} Success message
 * @response {201} Registration successful
 * @response {400} Validation error
 * @response {409} Email already exists
 * @response {500} Server error
 */
router.post('/register', async (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  
  // Validate required fields
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }
  
  // Validate email format
  if (!isValidEmail(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }
  
  // Validate password strength
  if (!isStrongPassword(password)) {
    return res.status(400).json({ 
      error: 'Password must be at least 8 characters long'
    });
  }
  
  try {
    // Check if email already exists
    db.get('SELECT id FROM users WHERE email = ?', [email], async (err, existingUser) => {
      if (err) {
        return res.status(500).json({ error: 'Database error' });
      }
      
      if (existingUser) {
        return res.status(409).json({ error: 'Email already registered' });
      }
      
      try {
        // Hash password
        const hashedPassword = await hashPassword(password);
        
        // Insert new user
        db.run(
          'INSERT INTO users (email, password, firstName, lastName, role) VALUES (?, ?, ?, ?, ?)',
          [email, hashedPassword, firstName || null, lastName || null, 'customer'],
          function(err) {
            if (err) {
              return res.status(500).json({ error: 'Error creating user' });
            }
            
            // Get the newly created user
            db.get('SELECT * FROM users WHERE id = ?', [this.lastID], (err, user) => {
              if (err) {
                return res.status(201).json({ 
                  message: 'Registration successful',
                  userId: this.lastID
                });
              }
              
              // Generate token for automatic login
              const token = generateToken(user);
              
              // Return user data (excluding password) and token
              const { password: _, ...userData } = user;
              
              res.status(201).json({
                message: 'Registration successful',
                user: userData,
                token
              });
            });
          }
        );
      } catch (error) {
        res.status(500).json({ error: 'Error creating user' });
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Registration error' });
  }
});

/**
 * POST /api/auth/logout
 * 
 * Logs out a user (client-side token removal)
 * 
 * @returns {Object} Success message
 * @response {200} Logout successful
 */
router.post('/logout', (req, res) => {
  // JWT is stateless, so server-side logout just returns success
  // Actual token invalidation happens on the client side
  res.json({ message: 'Logout successful' });
});

/**
 * GET /api/auth/me
 * 
 * Retrieves the current user's profile
 * 
 * @returns {Object} User profile data
 * @response {200} Profile retrieved successfully
 * @response {401} Not authenticated
 * @response {500} Server error
 */
router.get('/me', authenticateToken, (req, res) => {
  // User ID is available from the JWT token
  const userId = req.user.id;
  
  // Retrieve user from database
  db.get('SELECT * FROM users WHERE id = ?', [userId], (err, user) => {
    if (err) {
      return res.status(500).json({ error: 'Database error' });
    }
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Return user data without password
    const { password, ...userData } = user;
    res.json(userData);
  });
});

module.exports = router;