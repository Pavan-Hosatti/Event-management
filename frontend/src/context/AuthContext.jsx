import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../utilis/api';

const API_BASE_URL = `${import.meta.env.VITE_API_URL || '/api'}/auth`; 

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(null);
    const [role, setRole] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAuthReady, setIsAuthReady] = useState(false); // 🔥 Critical for preventing "flash" of login screen

    // ✅ Initial Load: Read from LocalStorage
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        const storedToken = localStorage.getItem('token');

        if (storedUser && storedToken) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            setToken(storedToken);
            setRole(parsedUser.role);
            setIsAuthenticated(true);
        }
        setIsAuthReady(true); // App is now ready to determine routes
    }, []);

    // ✅ Sync State with LocalStorage
    useEffect(() => {
        if (user && token) {
            localStorage.setItem('user', JSON.stringify(user));
            localStorage.setItem('token', token);
            setIsAuthenticated(true);
            setRole(user.role);
        } else if (isAuthReady) { 
            // Only remove if we've actually finished the initial check
            localStorage.removeItem('user');
            localStorage.removeItem('token');
            setIsAuthenticated(false);
            setRole(null);
        }
    }, [user, token, isAuthReady]);

    // ✅ Login Function
   // In AuthContext.js
const login = (userData) => {
  // Expects { user: { name, email, role }, token: "..." }
  console.log('Logging in user:', userData);
  
  if (!userData.user || !userData.token) {
    console.error('Invalid login data:', userData);
    return;
  }
  
  setUser(userData.user);
  setToken(userData.token);
  setRole(userData.user.role);
  setIsAuthenticated(true);
  
  // Also store in localStorage
  localStorage.setItem('user', JSON.stringify(userData.user));
  localStorage.setItem('token', userData.token);
};

    // ✅ Logout Function
 

// AuthContext.jsx - Update logout function
const logout = async () => {
  try {
    // ✅ Use correct endpoint
    await api.get('/api/auth/logout');
  } catch (error) {
    console.error("Logout API error:", error.message);
  } finally {
    // Always clear local state regardless of API success
    setUser(null);
    setToken(null);
    setRole(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setIsAuthenticated(false);
    
    // Redirect to login
    window.location.href = '/login';
  }
};

    const value = {
        user,
        token,
        role,
        isAuthenticated,
        isAuthReady,
        login,
        logout
    };

    return (
        <AuthContext.Provider value={value}>
            {/* Don't render children until we know if the user is logged in */}
            {isAuthReady ? children : (
                <div className="min-h-screen flex items-center justify-center bg-slate-900">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
                </div>
            )}
        </AuthContext.Provider>
    );
};