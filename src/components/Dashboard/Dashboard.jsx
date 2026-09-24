import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { SheetsBackupModal } from '../SheetsBackup/SheetsBackupModal';
import { 
  Music, 
  Calendar, 
  DollarSign, 
  PlusCircle, 
  CheckCircle2, 
  Sparkles, 
  ArrowUpRight,
  ShieldCheck,
  AlertCircle,
  MapPin,
  Sheet
} from 'lucide-react';
import './Dashboard.css';

export const Dashboard = ({ events, loadingEvents, onToast }) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [showSheetsModal, setShowSheetsModal] = useState(false);

  const totalEvents = events.length;
  const confirmedCount = events.filter(e => e.status === 'Confirmed').length;
  const completedCount = events.filter(e => e.status === 'Completed').length;
  
  const totalRevenue = events.reduce((acc, e) => acc + (parseFloat(e.totalAmount) || 0), 0);
  const totalAdvance = events.reduce((acc, e) => acc + (parseFloat(e.advanceAmount) || 0), 0);
  const totalPending = events.reduce((acc, e) => {
    const pending = e.pendingAmount !== undefined 
      ? e.pendingAmount 
      : Math.max(0, (parseFloat(e.totalAmount) || 0) - (parseFloat(e.advanceAmount) || 0));
    return acc + pending;
  }, 0);

  const username = user?.name || user?.username || 'MN Programs';

  return (
    <>
    <div className="dashboard-container">
      {/* Welcome Banner */}
      <div className="dashboard-banner">
        <div className="banner-content">
          <div className="welcome-tag">
            <Sparkles size={16} className="sparkle-icon" />
            <span>SINGER PROGRAM & EVENT MANAGEMENT</span>
          </div>
          <h1 className="banner-title">
            Welcome back, {username}!
          </h1>
          <p className="banner-subtitle">
            Manage your live singing performances, event bookings, venue logistics, advance deposits, and pending balances.
          </p>
        </div>

        <div className="banner-actions">
          <button 
            type="button" 
            className="action-btn primary"
            onClick={() => navigate('/create-event')}
          >
            <PlusCircle size={18} />
            <span>+ Create New Event</span>
          </button>
          <button 
            type="button" 
            className="action-btn secondary"
            onClick={() => navigate('/events')}
          >
            <Music size={18} />
            <span>View All Events</span>
          </button>
          <button 
            type="button" 
            className="action-btn sheets-btn"
            onClick={() => setShowSheetsModal(true)}
            title="Backup all events to Google Sheets"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2zm0-4H7V7h10v2z"/>
            </svg>
            <span>Backup to Sheets</span>
          </button>
        </div>
      </div>

      {/* Singer Event Metrics Grid */}
      <div className="metrics-grid">
        <div className="metric-card cyan">
          <div className="metric-header">
            <span className="metric-title">Total Singer Events</span>
            <div className="metric-icon"><Music size={20} /></div>
          </div>
          <div className="metric-value">{totalEvents}</div>
          <div className="metric-footer">
            <span className="metric-badge green">{confirmedCount} Confirmed</span>
            <span className="metric-sub">{completedCount} Completed</span>
          </div>
        </div>

        <div className="metric-card green">
          <div className="metric-header">
            <span className="metric-title">Total Event Revenue</span>
            <div className="metric-icon"><DollarSign size={20} /></div>
          </div>
          <div className="metric-value">₹{totalRevenue.toLocaleString('en-IN')}</div>
          <div className="metric-footer">
            <span className="metric-badge green">Advance: ₹{totalAdvance.toLocaleString('en-IN')}</span>
          </div>
        </div>

        <div className="metric-card orange">
          <div className="metric-header">
            <span className="metric-title">Pending Balances</span>
            <div className="metric-icon"><AlertCircle size={20} /></div>
          </div>
          <div className="metric-value">₹{totalPending.toLocaleString('en-IN')}</div>
          <div className="metric-footer">
            <span className="metric-badge orange">Receivables</span>
          </div>
        </div>

        <div className="metric-card purple">
          <div className="metric-header">
            <span className="metric-title">Confirmed Shows</span>
            <div className="metric-icon"><CheckCircle2 size={20} /></div>
          </div>
          <div className="metric-value">{confirmedCount}</div>
          <div className="metric-footer">
            <span className="metric-badge purple">Locked dates</span>
          </div>
        </div>
      </div>

      {/* Dashboard Main Grid */}
      <div className="dashboard-content-grid">
        {/* Recent Events Table */}
        <div className="content-card programs-overview">
          <div className="card-header">
            <div>
              <h2 className="card-title">Recent Singer Programs</h2>
              <p className="card-subtitle">Upcoming and recently booked shows</p>
            </div>
            <button 
              type="button" 
              className="link-btn"
              onClick={() => navigate('/events')}
            >
              <span>Manage All</span>
              <ArrowUpRight size={16} />
            </button>
          </div>

          <div className="programs-table-wrapper">
            <table className="dashboard-table">
              <thead>
                <tr>
                  <th>Event Name</th>
                  <th>Date & Time</th>
                  <th>Venue / Location</th>
                  <th>Total (₹)</th>
                  <th>Status</th>
                  <th>Payment</th>
                </tr>
              </thead>
              <tbody>
                {events.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="empty-table-cell">
                      <div className="empty-table-box">
                        <Music size={28} className="empty-icon" />
                        <p>No singer events created yet. Click <strong>"+ Create New Event"</strong> to add your first program!</p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  events.slice(0, 5).map((ev) => (
                    <tr key={ev.id}>
                      <td>
                        <div className="program-title-cell">
                          <span className="program-name">{ev.eventName}</span>
                          {ev.contactName && <span className="program-desc-snippet">Contact: {ev.contactName}</span>}
                        </div>
                      </td>
                      <td>{ev.eventDate || 'N/A'} {ev.startTime ? `(${ev.startTime})` : ''}</td>
                      <td>
                        <div className="client-cell">
                          <MapPin size={14} className="pin-icon" />
                          <span className="location-text">{ev.location || 'Venue TBD'}</span>
                        </div>
                      </td>
                      <td>₹{(ev.totalAmount || 0).toLocaleString('en-IN')}</td>
                      <td>
                        <span className={`status-pill ${ev.status?.toLowerCase()}`}>
                          {ev.status}
                        </span>
                      </td>
                      <td>
                        <span className={`payment-pill ${ev.paymentStatus?.toLowerCase().replace(' ', '-')}`}>
                          {ev.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar Info & Activity Feed */}
        <div className="dashboard-sidebar">
          {/* Active Session Info Card */}
          <div className="content-card auth-info-card">
            <div className="card-head-with-icon">
              <ShieldCheck size={20} className="status-green" />
              <h3 className="card-title">Manager Session</h3>
            </div>
            <div className="session-details">
              <div className="session-row">
                <span className="session-label">Logged In:</span>
                <span className="session-val highlight">{username}</span>
              </div>
              <div className="session-row">
                <span className="session-label">Role:</span>
                <span className="session-val">Singer Manager</span>
              </div>
              <div className="session-row">
                <span className="session-label">Portal Status:</span>
                <span className="session-val status-active">Active</span>
              </div>
            </div>
          </div>

          {/* Activity Feed */}
          <div className="content-card activity-card">
            <h3 className="card-title">Recent Event Feed</h3>
            <div className="activity-list">
              {events.length === 0 ? (
                <div className="empty-activity-box">
                  <Calendar size={24} className="empty-icon" />
                  <p>No activity yet. Created singer programs will appear here.</p>
                </div>
              ) : (
                events.slice(0, 4).map((ev, idx) => (
                  <div key={ev.id || idx} className="activity-item">
                    <div className={`activity-dot ${idx === 0 ? 'green' : idx === 1 ? 'cyan' : 'purple'}`}></div>
                    <div className="activity-details">
                      <span className="activity-text">
                        <strong>{ev.eventName}</strong> at {ev.location || 'Venue'}
                      </span>
                      <span className="activity-time">{ev.status} • ₹{(ev.totalAmount || 0).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>

      {showSheetsModal && (
        <SheetsBackupModal
          events={events}
          onClose={() => setShowSheetsModal(false)}
          onToast={onToast}
        />
      )}
    </>
  );
};
