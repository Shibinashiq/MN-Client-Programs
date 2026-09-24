import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Dumbbell, 
  User, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle 
} from 'lucide-react';
import './LoginPage.css';

export const LoginPage = ({ onToast }) => {
  const { login, authError, setAuthError, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // If already authenticated, redirect to /dashboard
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setAuthError(null);

    if (!username || !password) {
      setAuthError('Invalid username or password');
      return;
    }

    setSubmitting(true);
    const res = await login(username, password);
    setSubmitting(false);

    if (res.success) {
      onToast?.('Login successful! Welcome to Dashboard.', 'success');
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div className="login-container">
      {/* Background ambient glow accents */}
      <div className="ambient-glow glow-1"></div>
      <div className="ambient-glow glow-2"></div>

      <div className="login-card-wrapper">
        <div className="login-card">
          {/* Brand Header */}
          <div className="brand-header">
            <div className="brand-icon-wrapper">
              <Dumbbell className="brand-icon" size={32} />
            </div>
            <h1 className="brand-title">MN | Client Programs</h1>
            <p className="brand-subtitle">Private Application Login</p>
          </div>

          {/* Auth Alert Message */}
          {authError && (
            <div className="auth-alert error">
              <AlertCircle size={18} />
              <span>{authError}</span>
            </div>
          )}

          {/* Clean Login Form */}
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label htmlFor="username">Username</label>
              <div className="input-wrapper">
                <User className="input-icon" size={18} />
                <input
                  id="username"
                  type="text"
                  required
                  placeholder="Enter username"
                  value={username}
                  onChange={(e) => {
                    setUsername(e.target.value);
                    if (authError) setAuthError(null);
                  }}
                  autoComplete="username"
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-wrapper">
                <Lock className="input-icon" size={18} />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (authError) setAuthError(null);
                  }}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex={-1}
                  aria-label="Toggle password visibility"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="submit-btn"
            >
              {submitting ? (
                <span className="spinner-text">
                  <span className="btn-spinner"></span> Authenticating...
                </span>
              ) : (
                <>
                  <span>Log In</span>
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          <div className="card-footer">
            <p>🔒 Private Management Portal</p>
          </div>
        </div>
      </div>
    </div>
  );
};
