import React, { createContext, useState, useEffect } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      fetchUserProfile();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await api.get('/auth/profile');
      setUser(response.data);
    } catch (error) {
      console.error('Failed to fetch profile', error);
      localStorage.removeItem('token');
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    const formData = new URLSearchParams();
    formData.append('username', email); // OAuth2 expects 'username' instead of 'email'
    formData.append('password', password);

    const response = await api.post('/auth/login', formData, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    localStorage.setItem('token', response.data.access_token);
    await fetchUserProfile();
  };

  const register = async (userData) => {
    await api.post('/auth/register', userData);
    // Auto-login after registration
    await login(userData.email, userData.password);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const googleLogin = async (token, role = 'client') => {
    const response = await api.post('/auth/google-login', { token, role });
    localStorage.setItem('token', response.data.access_token);
    await fetchUserProfile();
  };

  return (
    <AuthContext.Provider value={{ user, login, register, logout, googleLogin, fetchUserProfile, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
