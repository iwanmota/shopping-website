/**
 * Login Form Component
 * 
 * Provides a form for user authentication with email and password inputs.
 * Handles form validation, submission, and error display.
 * 
 * @component
 */
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import './LoginForm.css';

/**
 * LoginForm component for user authentication
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onSuccess - Callback function called after successful login
 * @param {Function} props.onRegisterClick - Handler function to switch to registration form
 * @returns {React.ReactElement} Login form component
 */
const LoginForm = ({ onSuccess, onRegisterClick }) => {
  // Form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [formErrors, setFormErrors] = useState({});
  
  // Get authentication context
  const { login, error, loading, clearError } = useAuth();

  /**
   * Validate form inputs
   * 
   * @returns {boolean} True if form is valid, false otherwise
   */
  const validateForm = () => {
    const errors = {};
    
    // Email validation
    if (!email.trim()) {
      errors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errors.email = 'Email is invalid';
    }
    
    // Password validation
    if (!password) {
      errors.password = 'Password is required';
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
      // Attempt login
      await login(email, password);
      
      // Call success callback if provided
      if (onSuccess) {
        onSuccess();
      }
    } catch (err) {
      // Error is handled by the auth context
      console.error('Login error:', err);
    }
  };

  return (
    <div className="auth-form-container">
      <h2>Login</h2>
      
      <form className="auth-form" onSubmit={handleSubmit}>
        {/* Email field */}
        <div className="form-group">
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={formErrors.email ? 'error' : ''}
            placeholder="Enter your email"
            autoComplete="email"
          />
          {formErrors.email && <div className="error-message">{formErrors.email}</div>}
        </div>
        
        {/* Password field */}
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={formErrors.password ? 'error' : ''}
            placeholder="Enter your password"
            autoComplete="current-password"
          />
          {formErrors.password && <div className="error-message">{formErrors.password}</div>}
        </div>
        
        {/* Display authentication error */}
        {error && <div className="auth-error">{error}</div>}
        
        {/* Submit button */}
        <button 
          type="submit" 
          className="auth-button"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
      
      {/* Registration link */}
      <div className="auth-switch">
        Don't have an account?{' '}
        <button 
          type="button" 
          className="text-button"
          onClick={onRegisterClick}
        >
          Register
        </button>
      </div>
    </div>
  );
};

export default LoginForm;