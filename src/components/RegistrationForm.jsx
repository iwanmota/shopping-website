/**
 * Registration Form Component
 * 
 * Provides a form for new user registration with validation.
 * Handles form submission, password strength validation, and error display.
 * 
 * @component
 */
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './LoginForm.css'; // Reusing the same styles

/**
 * RegistrationForm component for user registration
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onSuccess - Callback function called after successful registration
 * @param {Function} props.onLoginClick - Handler function to switch to login form
 * @param {boolean} props.allowAdminCreation - Whether to allow admin role selection
 * @returns {React.ReactElement} Registration form component
 */
const RegistrationForm = ({ onSuccess, onLoginClick, allowAdminCreation = false }) => {
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    role: 'customer'
  });
  const [formErrors, setFormErrors] = useState({});
  
  // Get authentication context
  const { register, error, loading, clearError } = useAuth();

  /**
   * Handle input change
   * 
   * @param {Event} e - Input change event
   */
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear specific error when field is edited
    if (formErrors[name]) {
      setFormErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  /**
   * Check password strength
   * 
   * @param {string} password - Password to check
   * @returns {boolean} True if password meets strength requirements
   */
  const checkPasswordStrength = (password) => {
    // Password must be at least 8 characters long and contain at least one:
    // - Uppercase letter
    // - Lowercase letter
    // - Number
    // - Special character
    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    return strongPasswordRegex.test(password);
  };

  /**
   * Validate form inputs
   * 
   * @returns {boolean} True if form is valid, false otherwise
   */
  const validateForm = () => {
    const errors = {};
    
    // Email validation
    if (!formData.email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Email is invalid';
    }
    
    // Password validation
    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (!checkPasswordStrength(formData.password)) {
      errors.password = 'Password must be at least 8 characters and include uppercase, lowercase, number, and special character';
    }
    
    // Confirm password validation
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }
    
    // Name validation (optional fields)
    if (formData.firstName && formData.firstName.length > 50) {
      errors.firstName = 'First name is too long';
    }
    
    if (formData.lastName && formData.lastName.length > 50) {
      errors.lastName = 'Last name is too long';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  /**
   * Handle form submission
   * 
   * @param {Event} e - Form submit event
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    
    // Validate form
    if (!validateForm()) {
      return;
    }
    
    try {
      // Remove confirmPassword from data sent to API
      const { confirmPassword, ...registrationData } = formData;
      
      // Attempt registration
      await register(registrationData);
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      // Error is handled by the auth context
      console.error('Registration error:', err);
    }
  };

  return (
    <div className="auth-form-container">
      <h2>Create Account</h2>
      
      <form className="auth-form" onSubmit={handleSubmit}>
        {/* Email field */}
        <div className="form-group">
          <label htmlFor="email">Email *</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className={formErrors.email ? 'error' : ''}
            placeholder="Enter your email"
            autoComplete="email"
            required
          />
          {formErrors.email && <div className="error-message">{formErrors.email}</div>}
        </div>
        
        {/* Password field */}
        <div className="form-group">
          <label htmlFor="password">Password *</label>
          <input
            type="password"
            id="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className={formErrors.password ? 'error' : ''}
            placeholder="Create a password"
            autoComplete="new-password"
            required
          />
          {formErrors.password && <div className="error-message">{formErrors.password}</div>}
        </div>
        
        {/* Confirm Password field */}
        <div className="form-group">
          <label htmlFor="confirmPassword">Confirm Password *</label>
          <input
            type="password"
            id="confirmPassword"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className={formErrors.confirmPassword ? 'error' : ''}
            placeholder="Confirm your password"
            autoComplete="new-password"
            required
          />
          {formErrors.confirmPassword && <div className="error-message">{formErrors.confirmPassword}</div>}
        </div>
        
        {/* First Name field */}
        <div className="form-group">
          <label htmlFor="firstName">First Name</label>
          <input
            type="text"
            id="firstName"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            className={formErrors.firstName ? 'error' : ''}
            placeholder="Enter your first name"
            autoComplete="given-name"
          />
          {formErrors.firstName && <div className="error-message">{formErrors.firstName}</div>}
        </div>
        
        {/* Last Name field */}
        <div className="form-group">
          <label htmlFor="lastName">Last Name</label>
          <input
            type="text"
            id="lastName"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            className={formErrors.lastName ? 'error' : ''}
            placeholder="Enter your last name"
            autoComplete="family-name"
          />
          {formErrors.lastName && <div className="error-message">{formErrors.lastName}</div>}
        </div>
        
        {/* Role selection (admin only) */}
        {allowAdminCreation && (
          <div className="form-group">
            <label htmlFor="role">User Role</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className={formErrors.role ? 'error' : ''}
            >
              <option value="customer">Customer</option>
              <option value="admin">Administrator</option>
            </select>
            {formErrors.role && <div className="error-message">{formErrors.role}</div>}
          </div>
        )}
        
        {/* Display authentication error */}
        {error && <div className="auth-error">{error}</div>}
        
        {/* Submit button */}
        <button 
          type="submit" 
          className="auth-button"
          disabled={loading}
        >
          {loading ? 'Creating Account...' : 'Register'}
        </button>
      </form>
      
      {/* Login link */}
      <div className="auth-switch">
        Already have an account?{' '}
        <button 
          type="button" 
          className="text-button"
          onClick={onLoginClick}
        >
          Login
        </button>
      </div>
    </div>
  );
};

export default RegistrationForm;