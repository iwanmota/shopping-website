/**
 * Authentication Context
 * 
 * This module provides a React Context for managing authentication state across the application.
 * It handles login, logout, token storage, and user state management.
 * 
 * The implementation uses useReducer for state management with actions for different auth operations.
 */
import React, { createContext, useContext, useReducer, useEffect } from 'react';

// Create context for authentication state
const AuthContext = createContext();

// Token storage key in localStorage
const TOKEN_STORAGE_KEY = 'auth_token';
const USER_STORAGE_KEY = 'auth_user';

/**
 * Authentication state reducer function
 * 
 * Handles all authentication state updates based on dispatched actions.
 * 
 * @param {Object} state - Current authentication state
 * @param {Object} action - Action object with type and payload
 * @returns {Object} Updated authentication state
 */
const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return {
        ...state,
        isAuthenticated: true,
        user: action.payload.user,
        token: action.payload.token,
        error: null,
        loading: false
      };
    
    case 'LOGOUT':
      return {
        ...state,
        isAuthenticated: false,
        user: null,
        token: null,
        error: null,
        loading: false
      };
    
    case 'AUTH_ERROR':
      return {
        ...state,
        error: action.payload,
        loading: false
      };
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    
    case 'LOADING':
      return {
        ...state,
        loading: true
      };
    
    default:
      return state;
  }
};

/**
 * Authentication Context Provider Component
 * 
 * Provides authentication state and operations to all child components.
 * 
 * @param {Object} props - Component props
 * @param {React.ReactNode} props.children - Child components
 * @returns {React.ReactElement} Provider component
 */
export const AuthProvider = ({ children }) => {
  // Initialize authentication state with reducer
  const [state, dispatch] = useReducer(authReducer, {
    isAuthenticated: false,
    user: null,
    token: null,
    error: null,
    loading: true
  });

  // Load authentication state from localStorage on initial render
  useEffect(() => {
    const loadAuthState = () => {
      try {
        const token = localStorage.getItem(TOKEN_STORAGE_KEY);
        const user = JSON.parse(localStorage.getItem(USER_STORAGE_KEY));
        
        if (token && user) {
          dispatch({ 
            type: 'LOGIN', 
            payload: { token, user } 
          });
        } else {
          dispatch({ type: 'LOGOUT' });
        }
      } catch (error) {
        console.error('Error loading auth state:', error);
        dispatch({ type: 'LOGOUT' });
      }
    };

    loadAuthState();
  }, []);

  /**
   * Login user with email and password
   * 
   * @param {string} email - User email
   * @param {string} password - User password
   * @returns {Promise<Object>} User data on success
   * @throws {Error} On authentication failure
   */
  const login = async (email, password) => {
    dispatch({ type: 'LOADING' });
    
    try {
      const response = await fetch('http://localhost:3001/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Store token and user data
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
      
      dispatch({ 
        type: 'LOGIN', 
        payload: { 
          token: data.token, 
          user: data.user 
        } 
      });
      
      return data.user;
    } catch (error) {
      dispatch({ 
        type: 'AUTH_ERROR', 
        payload: error.message 
      });
      throw error;
    }
  };

  /**
   * Register a new user
   * 
   * @param {Object} userData - User registration data
   * @returns {Promise<Object>} User data on success
   * @throws {Error} On registration failure
   */
  const register = async (userData) => {
    dispatch({ type: 'LOADING' });
    
    try {
      const response = await fetch('http://localhost:3001/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(userData)
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      // Store token and user data
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
      localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(data.user));
      
      dispatch({ 
        type: 'LOGIN', 
        payload: { 
          token: data.token, 
          user: data.user 
        } 
      });
      
      return data.user;
    } catch (error) {
      dispatch({ 
        type: 'AUTH_ERROR', 
        payload: error.message 
      });
      throw error;
    }
  };

  /**
   * Logout the current user
   */
  const logout = async () => {
    try {
      // Call logout endpoint if needed
      await fetch('http://localhost:3001/api/auth/logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${state.token}`
        }
      });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Clear stored auth data
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(USER_STORAGE_KEY);
      
      dispatch({ type: 'LOGOUT' });
    }
  };

  /**
   * Clear any authentication errors
   */
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  /**
   * Get the authentication token for API requests
   * 
   * @returns {string|null} The authentication token or null if not authenticated
   */
  const getAuthToken = () => {
    return state.token;
  };

  /**
   * Check if the current user has a specific role
   * 
   * @param {string} role - Role to check for (e.g., 'admin')
   * @returns {boolean} True if user has the role, false otherwise
   */
  const hasRole = (role) => {
    return state.user && state.user.role === role;
  };

  /**
   * Check if the current user is an admin
   * 
   * @returns {boolean} True if user is an admin, false otherwise
   */
  const isAdmin = () => {
    return hasRole('admin');
  };

  return (
    <AuthContext.Provider value={{
      ...state,
      login,
      register,
      logout,
      clearError,
      getAuthToken,
      hasRole,
      isAdmin
    }}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Custom hook to access authentication context
 * 
 * @returns {Object} Authentication context value
 * @throws {Error} If used outside of AuthProvider
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};