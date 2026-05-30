import { createContext, useEffect, useState } from 'react';
import api from '../services/api';

export const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const accessToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');
    if (accessToken && storedUser) {
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    const response = await api.post('/auth/login', { email, password });
    const { accessToken, refreshToken, email: userEmail, fullName, roles } = response.data;
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', refreshToken);
    const currentUser = { email: userEmail, fullName, roles: roles || [] };
    localStorage.setItem('user', JSON.stringify(currentUser));
    setUser(currentUser);
    setIsAuthenticated(true);
  };

  const register = async (payload) => {
    return api.post('/auth/register', payload);
  };

  const logout = async () => {
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      await api.post('/auth/logout', null, { headers: { 'Refresh-Token': refreshToken } });
    } catch (_) {
      // Server-side logout failed (expired token, network error, etc.) – ignore and clear locally
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
      setUser(null);
      setIsAuthenticated(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, loading, login, logout, register, setUser }}>
      {children}
    </AuthContext.Provider>
  );
}
