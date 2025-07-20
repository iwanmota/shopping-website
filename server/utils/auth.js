/**
 * Authentication Utilities
 * 
 * This module provides utility functions for authentication, including
 * password hashing and verification using bcrypt.
 */

const bcrypt = require('bcrypt');

// Number of salt rounds for bcrypt hashing
const SALT_ROUNDS = 10;

/**
 * Hashes a password using bcrypt
 * 
 * @param {string} password - The plain text password to hash
 * @returns {Promise<string>} A promise that resolves to the hashed password
 * @throws {Error} If hashing fails
 */
const hashPassword = async (password) => {
  try {
    const salt = await bcrypt.genSalt(SALT_ROUNDS);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  } catch (error) {
    throw new Error(`Error hashing password: ${error.message}`);
  }
};

/**
 * Verifies a password against a hash
 * 
 * @param {string} password - The plain text password to verify
 * @param {string} hashedPassword - The hashed password to compare against
 * @returns {Promise<boolean>} A promise that resolves to true if the password matches, false otherwise
 * @throws {Error} If verification fails
 */
const verifyPassword = async (password, hashedPassword) => {
  try {
    return await bcrypt.compare(password, hashedPassword);
  } catch (error) {
    throw new Error(`Error verifying password: ${error.message}`);
  }
};

module.exports = {
  hashPassword,
  verifyPassword
};