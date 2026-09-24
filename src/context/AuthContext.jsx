import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext({});

const SESSION_KEY = 'abdu_auth_session';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Check for existing valid session on app load
    const storedSession = localStorage.getItem(SESSION_KEY) || sessionStorage.getItem(SESSION_KEY);
    if (storedSession) {
      try {
        const sessionData = JSON.parse(storedSession);
        if (sessionData && sessionData.isAuthenticated && sessionData.username === 'abdulla') {
          setUser({ username: 'abdulla', name: 'Abdulla' });
          setIsAuthenticated(true);
        }
      } catch (e) {
        localStorage.removeItem(SESSION_KEY);
        sessionStorage.removeItem(SESSION_KEY);
      }
    }
    setLoading(false);
  }, []);

  const login = async (usernameInput, passwordInput) => {
    setAuthError(null);

    const trimmedUsername = (usernameInput || '').trim();
    const rawPassword = passwordInput || '';

    // Credentials check: username = abdulla, password = abdulla@7224
    if (trimmedUsername === 'abdulla' && rawPassword === 'abdulla@7224') {
      const userObj = { username: 'abdulla', name: 'Abdulla' };
      
      // Store session info WITHOUT storing password
      const sessionPayload = {
        isAuthenticated: true,
        username: 'abdulla',
        loginTime: Date.now(),
      };

      localStorage.setItem(SESSION_KEY, JSON.stringify(sessionPayload));
      setUser(userObj);
      setIsAuthenticated(true);
      return { success: true };
    } else {
      const errorMsg = 'Invalid username or password';
      setAuthError(errorMsg);
      return { success: false, error: errorMsg };
    }
  };

  const logout = () => {
    localStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(SESSION_KEY);
    setUser(null);
    setIsAuthenticated(false);
    setAuthError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        authError,
        setAuthError,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
