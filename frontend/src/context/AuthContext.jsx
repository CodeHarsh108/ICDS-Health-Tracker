import { createContext, useContext, useState, useEffect } from 'react';
import { syncPendingRequests } from '../services/syncService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('ams_token');
    const savedUser = localStorage.getItem('ams_user');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = (tokenValue, userData) => {
    localStorage.setItem('ams_token', tokenValue);
    localStorage.setItem('ams_user', JSON.stringify(userData));
    setToken(tokenValue);
    setUser(userData);

    // If online, attempt to sync pending offline records after login
    if (navigator.onLine) {
      syncPendingRequests().then(result => {
        console.log('Post-login sync result:', result);
      });
    }
  };

  const logout = () => {
    localStorage.removeItem('ams_token');
    localStorage.removeItem('ams_user');
    setToken(null);
    setUser(null);
  };

  const hasRole = (...roles) => {
    return user && roles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}