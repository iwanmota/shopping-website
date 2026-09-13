import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { apiRequest, AUTH_TOKEN_EXPIRED } from '../services/api';

const AuthContext = createContext();
const TOKEN_STORAGE_KEY = 'auth_token';

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN':
      return { ...state, isAuthenticated: true, user: action.payload.user, token: action.payload.token, error: null, loading: false };
    case 'LOGOUT':
      return { ...state, isAuthenticated: false, user: null, token: null, error: null, loading: false };
    case 'AUTH_ERROR':
      return { ...state, error: action.payload, loading: false };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    case 'LOADING':
      return { ...state, loading: true };
    default:
      return state;
  }
};

const clearStoredToken = () => localStorage.removeItem(TOKEN_STORAGE_KEY);

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, {
    isAuthenticated: false,
    user: null,
    token: null,
    error: null,
    loading: true
  });

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (!token) {
      dispatch({ type: 'LOGOUT' });
      return;
    }

    apiRequest('/api/auth/me', { token })
      .then(user => dispatch({ type: 'LOGIN', payload: { token, user } }))
      .catch(() => {
        clearStoredToken();
        dispatch({ type: 'LOGOUT' });
      });
  }, []);

  const authenticate = async (path, body) => {
    dispatch({ type: 'LOADING' });
    try {
      const data = await apiRequest(path, { method: 'POST', body });
      localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
      dispatch({ type: 'LOGIN', payload: { token: data.token, user: data.user } });
      return data.user;
    } catch (error) {
      dispatch({ type: 'AUTH_ERROR', payload: error.message });
      throw error;
    }
  };

  const login = (email, password) => authenticate('/api/auth/login', { email, password });
  const register = userData => authenticate('/api/auth/register', userData);

  const logout = async () => {
    try {
      if (state.token) await apiRequest('/api/auth/logout', { method: 'POST', token: state.token });
    } catch (error) {
      // Local logout still completes if the backend is unavailable.
    } finally {
      clearStoredToken();
      dispatch({ type: 'LOGOUT' });
    }
  };

  const clearError = () => dispatch({ type: 'CLEAR_ERROR' });
  const getAuthToken = () => state.token;
  const hasRole = role => Boolean(state.user && state.user.role === role);
  const isAdmin = () => hasRole('admin');

  return (
    <AuthContext.Provider value={{ ...state, login, register, logout, clearError, getAuthToken, hasRole, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
