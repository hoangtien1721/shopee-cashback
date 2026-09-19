import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiRequest, setAuthToken, getAuthToken } from '../services/api';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load profile on mount if token exists
  useEffect(() => {
    async function loadUser() {
      const token = getAuthToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await apiRequest('/auth/profile');
        if (res.success && res.user) {
          setUser(res.user);
        } else {
          setAuthToken(null);
        }
      } catch (err) {
        console.warn('Session expired or invalid:', err.message);
        setAuthToken(null);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    loadUser();
  }, []);

  async function login(email, password) {
    const res = await apiRequest('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if (res.success && res.token) {
      setAuthToken(res.token);
      setUser(res.user);
    }
    return res;
  }

  async function register(data) {
    const res = await apiRequest('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data)
    });
    if (res.success && res.token) {
      setAuthToken(res.token);
      setUser(res.user);
    }
    return res;
  }

  async function loginWithGoogle(credential, manualData = null) {
    const payload = credential ? { credential } : manualData;
    const res = await apiRequest('/auth/google', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    if (res.success && res.token) {
      setAuthToken(res.token);
      setUser(res.user);
    }
    return res;
  }

  function logout() {
    setAuthToken(null);
    setUser(null);
  }

  async function refreshUser() {
    try {
      const res = await apiRequest('/auth/profile');
      if (res.success && res.user) {
        setUser(res.user);
      }
    } catch (err) {
      console.warn('Could not refresh user profile:', err);
    }
  }

  async function updateProfile(data) {
    const res = await apiRequest('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
    if (res.success && res.user) {
      setUser(res.user);
    }
    return res;
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        register,
        loginWithGoogle,
        logout,
        refreshUser,
        updateProfile,
        isAdmin: user?.role === 'admin'
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
