/**
 * Authentication Page Component
 * 
 * Provides a page for user authentication with login and registration forms.
 * Handles switching between login and registration views.
 * 
 * @component
 */
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import LoginForm from './LoginForm';
import RegistrationForm from './RegistrationForm';
import { useAuth } from '../context/AuthContext';

/**
 * AuthPage component for user authentication
 * 
 * @returns {React.ReactElement} Authentication page component
 */
const AuthPage = () => {
  // State to toggle between login and registration forms
  const [isLogin, setIsLogin] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  
  // Get the return URL from location state or default to homepage
  const from = location.state?.from || '/';
  
  // If user is already authenticated, redirect to the return URL
  if (isAuthenticated) {
    navigate(from, { replace: true });
    return null;
  }

  /**
   * Handle successful authentication
   */
  const handleAuthSuccess = () => {
    navigate(from, { replace: true });
  };

  return (
    <div className="auth-page">
      <div className="auth-container">
        {isLogin ? (
          <LoginForm 
            onSuccess={handleAuthSuccess}
            onRegisterClick={() => setIsLogin(false)}
          />
        ) : (
          <RegistrationForm 
            onSuccess={handleAuthSuccess}
            onLoginClick={() => setIsLogin(true)}
          />
        )}
      </div>
    </div>
  );
};

export default AuthPage;