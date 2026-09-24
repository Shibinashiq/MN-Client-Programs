import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext({});

const SESSION_KEY = 'mn_auth_session';

// ── Single-user credentials ──────────────────────────────
const APP_USERNAME = 'mn-client-programs';
const APP_PASSWORD = 'mn-client-programs';
// ────────────────────────────────────────────────────────

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Restore session on app load
    const storedSession =
      localStorage.getItem(SESSION_KEY) ||
      sessionStorage.getItem(SESSION_KEY);

    if (storedSession) {
      try {
        const sessionData = JSON.parse(storedSession);
        if (sessionData?.isAuthenticated && sessionData?.username === APP_USERNAME) {
          setUser({ username: APP_USERNAME, name: 'MN Programs' });
          setIsAuthenticated(true);
        }
      } catch {
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

    if (trimmedUsername === APP_USERNAME && rawPassword === APP_PASSWORD) {
      const userObj = { username: APP_USERNAME, name: 'MN Programs' };

      const sessionPayload = {
        isAuthenticated: true,
        username: APP_USERNAME,
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
