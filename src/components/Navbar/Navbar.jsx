import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { 
  Music, 
  LayoutDashboard, 
  PlusCircle, 
  LogOut, 
  User 
} from 'lucide-react';
import './Navbar.css';

export const Navbar = ({ onToast }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    onToast?.('Logged out successfully.', 'info');
    navigate('/login', { replace: true });
  };

  const username = user?.name || user?.username || 'MN Programs';

  return (
    <header className="main-navbar">
      <div className="navbar-container">
        {/* Brand Logo */}
        <div className="nav-brand" onClick={() => navigate('/dashboard')} style={{ cursor: 'pointer' }}>
          <div className="nav-logo-icon">
            <Music size={22} />
          </div>
          <div className="nav-title-group">
            <span className="brand-name">MN | Client Programs</span>
            <span className="brand-tag">Event Portal</span>
          </div>
        </div>

        {/* Navigation Routes */}
        <nav className="nav-links">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <LayoutDashboard size={17} />
            <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/events"
            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
          >
            <Music size={17} />
            <span>Singer Events</span>
          </NavLink>

          <NavLink
            to="/create-event"
            className={({ isActive }) => `nav-link create-nav-link ${isActive ? 'active' : ''}`}
          >
            <PlusCircle size={17} />
            <span>+ Create Event</span>
          </NavLink>
        </nav>

        {/* User Profile & Logout */}
        <div className="nav-user-controls">
          <div className="user-profile-badge">
            <div className="avatar-wrapper">
              <User size={18} className="avatar-icon" />
            </div>
            <div className="user-meta">
              <span className="user-name">{username}</span>
              <span className="user-role">Manager</span>
            </div>
          </div>

          {/* Logout Action Button */}
          <button
            type="button"
            className="logout-btn"
            onClick={handleLogout}
            title="Log Out"
          >
            <LogOut size={18} />
            <span className="logout-text">Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
};
