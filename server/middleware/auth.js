/**
 * Authentication Middleware
 * 
 * This module provides middleware functions for JWT-based authentication
 * and authorization in Express routes.
 */

const jwt = require('jsonwebtoken');

// Secret key for JWT signing and verification
// In production, this should be stored in environment variables
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-here';

// Token expiration time (in seconds)
const TOKEN_EXPIRATION = '24h';

/**
 * Generates a JWT token for a user
 * 
 * @param {Object} user - User object containing id, email, and role
 * @returns {string} JWT token
 */
const generateToken = (user) => {
  const payload = {
    id: user.id,
    email: user.email,
    role: user.role
  };

  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRATION });
};

/**
 * Middleware to verify JWT token and attach user to request
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authenticateToken = (req, res, next) => {
  // Get token from Authorization header or cookies
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1]; // Format: "Bearer TOKEN"

  if (!token) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  try {
    // Verify token and attach user to request
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    }
    return res.status(403).json({ error: 'Invalid token' });
  }
};

/**
 * Middleware to check if user has admin role
 * 
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const requireAdmin = (req, res, next) => {
  // authenticateToken middleware should be called before this
  if (!req.user) {
    return res.status(401).json({ error: 'Authentication required' });
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }

  next();
};

/**
 * Middleware to handle authentication errors
 * 
 * @param {Error} err - Error object
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next function
 */
const authErrorHandler = (err, req, res, next) => {
  if (err.name === 'UnauthorizedError') {
    return res.status(401).json({ error: 'Invalid token' });
  }

  next(err);
};

module.exports = {
  generateToken,
  authenticateToken,
  requireAdmin,
  authErrorHandler
};