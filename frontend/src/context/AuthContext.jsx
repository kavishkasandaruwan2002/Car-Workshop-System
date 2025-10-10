import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { apiRequest } from '../api/client';

const AuthContext = createContext();

const initialState = {
  user: null,
  isAuthenticated: false,
  loading: true,
  error: null
};

// Mock email verification codes storage
let verificationCodes = new Map();

const authReducer = (state, action) => {
  switch (action.type) {
    case 'LOGIN_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: action.payload
      };
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        loading: false,
        error: null
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    case 'SEND_CODE_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'SEND_CODE_SUCCESS':
      return {
        ...state,
        loading: false,
        error: null
      };
    case 'SEND_CODE_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    case 'RESET_PASSWORD_START':
      return {
        ...state,
        loading: true,
        error: null
      };
    case 'RESET_PASSWORD_SUCCESS':
      return {
        ...state,
        loading: false,
        error: null
      };
    case 'RESET_PASSWORD_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload
      };
    default:
      return state;
  }
};

// Mock users database - moved outside component to persist data
let mockUsers = [];

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing session on mount
  useEffect(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) {
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: JSON.parse(savedUser)
      });
    } else {
      // For development: automatically login with a mock user if no user exists
      if (import.meta.env.DEV) {
        const mockUser = {
          id: '1',
          name: 'Test Owner',
          email: 'owner@test.com',
          role: 'owner'
        };
        const mockToken = 'development-token';
        localStorage.setItem('user', JSON.stringify(mockUser));
        localStorage.setItem('token', mockToken);
        dispatch({
          type: 'LOGIN_SUCCESS',
          payload: mockUser
        });
      } else {
        dispatch({ type: 'LOGOUT' });
      }
    }
  }, []);

  const login = async (email, password) => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const resp = await apiRequest('/auth/login', { method: 'POST', body: { email, password } });
      const { user, token } = resp;
      localStorage.setItem('user', JSON.stringify({ ...user }));
      localStorage.setItem('token', token);
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      return { success: true };
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error.message || 'Login failed. Please try again.'
      });
      return { success: false, error: error.message || 'Login failed. Please try again.' };
    }
  };

  const register = async (userData) => {
    dispatch({ type: 'LOGIN_START' });

    try {
      const resp = await apiRequest('/auth/register', { method: 'POST', body: userData });
      const { user, token } = resp;
      localStorage.setItem('user', JSON.stringify({ ...user }));
      localStorage.setItem('token', token);
      dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      return { success: true };
    } catch (error) {
      dispatch({
        type: 'LOGIN_FAILURE',
        payload: error.message || 'Registration failed. Please try again.'
      });
      return { success: false, error: error.message || 'Registration failed. Please try again.' };
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  };

  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  const sendResetCode = async (email) => {
    dispatch({ type: 'SEND_CODE_START' });

    try {
      await apiRequest('/auth/forgot-password', { method: 'POST', body: { email } });
      dispatch({ type: 'SEND_CODE_SUCCESS' });
      return { success: true };
    } catch (error) {
      dispatch({
        type: 'SEND_CODE_FAILURE',
        payload: error.message || 'Failed to send verification code. Please try again.'
      });
      return { success: false, error: error.message || 'Failed to send verification code. Please try again.' };
    }
  };

  const resetPassword = async (email, code, newPassword) => {
    dispatch({ type: 'RESET_PASSWORD_START' });

    try {
      await apiRequest('/auth/reset-password', { method: 'POST', body: { email, code, newPassword } });
      dispatch({ type: 'RESET_PASSWORD_SUCCESS' });
      return { success: true };
    } catch (error) {
      dispatch({
        type: 'RESET_PASSWORD_FAILURE',
        payload: error.message || 'Failed to reset password. Please try again.'
      });
      return { success: false, error: error.message || 'Failed to reset password. Please try again.' };
    }
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    clearError,
    sendResetCode,
    resetPassword
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};



