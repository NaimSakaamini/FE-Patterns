import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

// Base URL for all API requests - Main App Backend
const API_BASE_URL = 'http://localhost:3001';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      console.log('🔍 [Main App] Checking authentication status...');
      try {
        const response = await axios.get(`${API_BASE_URL}/api/auth/me`, {
          withCredentials: true
        });
        setUser(response.data);
        console.log('✅ [Main App] User authenticated:', response.data.username);
      } catch (error) {
        console.log('❌ [Main App] Not authenticated');
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login function
  const login = async (username, password) => {
    console.log(`🔑 [Main App] Attempting login for user: ${username}`);
    try {
      setError(null);
      const response = await axios.post(`${API_BASE_URL}/api/auth/login`, {
        username,
        password
      }, {
        withCredentials: true
      });
      setUser(response.data);
      console.log('✅ [Main App] Login successful');
      alert(`Welcome, ${response.data.username}! You are now logged in to the Main App.`);
      return response.data;
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed';
      console.error('❌ [Main App] Login error:', errorMessage);
      setError(errorMessage);
      alert(`Login failed: ${errorMessage}`);
      throw error;
    }
  };

  // Logout function
  const logout = async () => {
    console.log('🚪 [Main App] Logging out...');
    try {
      await axios.post(`${API_BASE_URL}/api/auth/logout`, {}, {
        withCredentials: true
      });
      setUser(null);
      console.log('✅ [Main App] Logout successful');
      alert('You have been logged out from the Main App.');
    } catch (error) {
      console.error('❌ [Main App] Logout error:', error);
      alert('Error during logout. Please try again.');
    }
  };

  const value = {
    user,
    loading,
    error,
    login,
    logout,
    isAuthenticated: !!user
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}; 