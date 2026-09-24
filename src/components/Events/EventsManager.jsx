import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SheetsBackupModal } from '../SheetsBackup/SheetsBackupModal';
import { 
  Search, 
  Filter, 
  Plus, 
  Calendar, 
  Clock, 
  MapPin, 
  ExternalLink, 
  User, 
  Phone, 
  DollarSign, 
  Eye, 
  Edit3, 
  Trash2, 
  X, 
  Sparkles,
  Music,
  CheckCircle2,
  AlertCircle,
  Mic,
  Tag
} from 'lucide-react';
import './EventsManager.css';

export const EventsManager = ({ events, onDeleteEvent, onEditEvent, onToast }) => {
  const navigate = useNavigate();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('All');
  const [viewingEvent, setViewingEvent] = useState(null);
  const [deleteConfirmId, setDeleteConfirmId] = useState(null);
  const [showSheetsModal, setShowSheetsModal] = useState(false);

  // Status counters for top status tabs
  const countAll = events.length;
  const countEnquired = events.filter(e => e.status === 'Enquired').length;
  const countConfirmed = events.filter(e => e.status === 'Confirmed').length;
  const countCompleted = events.filter(e => e.status === 'Completed').length;
  const countCancelled = events.filter(e => e.status === 'Cancelled').length;

  const filteredEvents = events.filter((ev) => {
    const query = searchQuery.toLowerCase();
    const matchesSearch = 
      (ev.eventName || '').toLowerCase().includes(query) ||
      (ev.location || '').toLowerCase().includes(query) ||
      (ev.contactName || '').toLowerCase().includes(query) ||
      (ev.description || '').toLowerCase().includes(query);

    const matchesStatus = selectedStatus === 'All' || ev.status === selectedStatus;
    const matchesPayment = selectedPaymentStatus === 'All' || ev.paymentStatus === selectedPaymentStatus;

    return matchesSearch && matchesStatus && matchesPayment;
  });

  const handleEditClick = (e, eventItem) => {
    e.stopPropagation();
    onEditEvent(eventItem);
    navigate('/create-event');
  };

  const handleDeleteClick = (e, id) => {
    e.stopPropagation();
    setDeleteConfirmId(id);
  };

  const handleConfirmDelete = (id) => {
    const ev = events.find(e => e.id === id);
    onDeleteEvent(id);
    setDeleteConfirmId(null);
    onToast?.(`Event "${ev?.eventName || 'Event'}" removed.`, 'info');
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return isNaN(d.getTime()) ? dateStr : d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch (e) {
      return dateStr;
    }
  };

  return (
    <div className="events-manager-container">
      {/* Page Header */}
      <div className="manager-header">
        <div>
          <h1 className="manager-title">Singer Programs & Events</h1>
          <p className="manager-subtitle">
            Manage live performances, bookings, venue locations, and payment status.
          </p>
        </div>
        <div className="manager-header-actions">
          <button 
            type="button" 
            className="sheets-action-btn"
            onClick={() => setShowSheetsModal(true)}
            title="Backup to Google Sheets"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" width="17" height="17">
              <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2zm0-4H7V7h10v2z"/>
            </svg>
            <span>Backup to Sheets</span>
          </button>
          <button 
            type="button" 
            className="create-event-btn"
            onClick={() => {
              onEditEvent(null);
              navigate('/create-event');
            }}
          >
            <Plus size={18} />
            <span>+ Create New Event</span>
          </button>
        </div>
      </div>

      {/* Primary Event Status Tabs */}
      <div className="status-tabs-nav">
        {[
          { id: 'All', label: 'All Events', count: countAll },
          { id: 'Enquired', label: 'Enquired', count: countEnquired },
          { id: 'Confirmed', label: 'Confirmed', count: countConfirmed },
          { id: 'Completed', label: 'Completed', count: countCompleted },
          { id: 'Cancelled', label: 'Cancelled', count: countCancelled },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`status-nav-tab ${selectedStatus === tab.id ? 'active ' + tab.id.toLowerCase() : ''}`}
            onClick={() => setSelectedStatus(tab.id)}
          >
            <span>{tab.label}</span>
            <span className="tab-count">{tab.count}</span>
          </button>
        ))}
      </div>

      {/* Filter and Search Bar */}
      <div className="filter-bar-card">
        <div className="search-input-wrapper">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search events, venues, contact persons..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button className="clear-search" onClick={() => setSearchQuery('')}>
              <X size={14} />
            </button>
          )}
        </div>

        <div className="filter-controls">
          <div className="filter-group">
            <Filter size={16} className="filter-icon" />
            <span className="filter-label">Payment Status:</span>
            <select 
              value={selectedPaymentStatus} 
              onChange={(e) => setSelectedPaymentStatus(e.target.value)}
            >
              <option value="All">All Payments</option>
              <option value="Pending">Pending</option>
              <option value="Partially Paid">Partially Paid</option>
              <option value="Fully Paid">Fully Paid</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events Grid */}
      {filteredEvents.length === 0 ? (
        <div className="empty-events-card">
          <Music size={48} className="empty-icon" />
          <h3>No events found</h3>
          <p>
            {events.length === 0 
              ? 'No singer events recorded yet. Click "+ Create New Event" to add your first program.' 
              : 'No events match your selected status tab or search criteria.'}
          </p>
          <button 
            className="create-event-btn" 
            onClick={() => {
              onEditEvent(null);
              navigate('/create-event');
            }}
          >
            <Plus size={16} />
            <span>Create New Event</span>
          </button>
        </div>
      ) : (
        <div className="events-grid">
          {filteredEvents.map((ev) => {
            const pending = ev.pendingAmount !== undefined 
              ? ev.pendingAmount 
              : Math.max(0, (parseFloat(ev.totalAmount) || 0) - (parseFloat(ev.advanceAmount) || 0));

            return (
              <div 
                key={ev.id} 
                className="event-card clickable-card"
                onClick={() => setViewingEvent(ev)}
                title="Click to view full event details"
              >
                {/* Event Poster Header */}
                <div className="event-card-banner">
                  {ev.eventImage ? (
                    <img src={ev.eventImage} alt={ev.eventName} className="poster-img" />
                  ) : (
                    <div className="poster-placeholder">
                      <Music size={32} />
                      <span>Singer Program</span>
                    </div>
                  )}
                  <div className="banner-badges">
                    <span className={`status-pill ${ev.status?.toLowerCase()}`}>
                      {ev.status}
                    </span>
                    <span className={`payment-pill ${ev.paymentStatus?.toLowerCase().replace(' ', '-')}`}>
                      {ev.paymentStatus}
                    </span>
                  </div>
                </div>

                <div className="event-card-body">
                  <h3 className="event-title">{ev.eventName}</h3>

                  <div className="event-info-rows">
                    <div className="info-row">
                      <Calendar size={15} />
                      <span>{ev.eventDate ? formatDate(ev.eventDate) : 'Date TBD'}</span>
                      {ev.startTime && <span className="time-tag"><Clock size={12} /> {ev.startTime} {ev.endTime ? `- ${ev.endTime}` : ''}</span>}
                    </div>

                    {ev.hasSoundCheck && (
                      <div className="info-row soundcheck-badge">
                        <Mic size={14} />
                        <span>Sound Check: <strong>{ev.soundCheckTime || 'Scheduled'}</strong></span>
                      </div>
                    )}

                    <div className="info-row">
                      <MapPin size={15} />
                      <span className="location-text">{ev.location || 'Location Not Specified'}</span>
                      {ev.locationUrl && (
                        <a 
                          href={ev.locationUrl} 
                          target="_blank" 
                          rel="noreferrer" 
                          className="map-link" 
                          title="Open Map"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <ExternalLink size={13} />
                        </a>
                      )}
                    </div>

                    {ev.contactName && (
                      <div className="info-row contact-row">
                        <User size={15} />
                        <span><strong>{ev.contactName}</strong> {ev.contactPhone ? `(${ev.contactPhone})` : ''}</span>
                      </div>
                    )}
                  </div>

                  {/* Payment Summary Pill Box */}
                  <div className="payment-summary-box">
                    <div className="pay-col">
                      <span className="pay-lbl">Total</span>
                      <span className="pay-val">₹{(ev.totalAmount || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="pay-col">
                      <span className="pay-lbl">Advance</span>
                      <span className="pay-val green">₹{(ev.advanceAmount || 0).toLocaleString('en-IN')}</span>
                    </div>
                    <div className="pay-col">
                      <span className="pay-lbl">Pending</span>
                      <span className="pay-val orange">₹{pending.toLocaleString('en-IN')}</span>
                    </div>
                  </div>

                  {/* Created Date Footer */}
                  {ev.createdDate && (
                    <div className="card-footer-date">
                      <Tag size={12} />
                      <span>Created: {formatDate(ev.createdDate)}</span>
                    </div>
                  )}

                  {/* Card Actions */}
                  <div className="card-actions">
                    <button
                      type="button"
                      className="card-action-btn view"
                      onClick={(e) => {
                        e.stopPropagation();
                        setViewingEvent(ev);
                      }}
                    >
                      <Eye size={15} />
                      <span>View</span>
                    </button>

                    <button
                      type="button"
                      className="card-action-btn edit"
                      onClick={(e) => handleEditClick(e, ev)}
                    >
                      <Edit3 size={15} />
                      <span>Edit</span>
                    </button>

                    <button
                      type="button"
                      className="card-action-btn delete"
                      onClick={(e) => handleDeleteClick(e, ev.id)}
                    >
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW EVENT DETAILS MODAL */}
      {viewingEvent && (
        <div className="modal-backdrop" onClick={() => setViewingEvent(null)}>
          <div className="modal-card view-event-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <div className="badges-row">
                  <span className={`status-pill ${viewingEvent.status?.toLowerCase()}`}>
                    {viewingEvent.status}
                  </span>
                  <span className={`payment-pill ${viewingEvent.paymentStatus?.toLowerCase().replace(' ', '-')}`}>
                    {viewingEvent.paymentStatus}
                  </span>
                </div>
                <h2 className="view-modal-title">{viewingEvent.eventName}</h2>
              </div>
              <button 
                type="button" 
                className="close-modal-btn"
                onClick={() => setViewingEvent(null)}
              >
                <X size={20} />
              </button>
            </div>

            <div className="modal-body-content">
              {viewingEvent.eventImage && (
                <div className="modal-image-preview">
                  <img src={viewingEvent.eventImage} alt={viewingEvent.eventName} />
                </div>
              )}

              <div className="details-section">
                <h4>Event Logistics</h4>
                <div className="details-grid">
                  <div><strong>Date:</strong> {formatDate(viewingEvent.eventDate)}</div>
                  <div><strong>Timing:</strong> {viewingEvent.startTime || 'N/A'} {viewingEvent.endTime ? `- ${viewingEvent.endTime}` : ''}</div>
                  {viewingEvent.hasSoundCheck && (
                    <div><strong>Sound Check:</strong> Required ({viewingEvent.soundCheckTime || 'Scheduled'})</div>
                  )}
                  <div><strong>Venue:</strong> {viewingEvent.location || 'N/A'}</div>
                  {viewingEvent.locationUrl && (
                    <div>
                      <strong>Google Maps:</strong>{' '}
                      <a href={viewingEvent.locationUrl} target="_blank" rel="noreferrer" className="link-highlight">
                        Open Map <ExternalLink size={12} />
                      </a>
                    </div>
                  )}
                  {viewingEvent.eventUrl && (
                    <div>
                      <strong>Event Link:</strong>{' '}
                      <a href={viewingEvent.eventUrl} target="_blank" rel="noreferrer" className="link-highlight">
                        Visit URL <ExternalLink size={12} />
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="details-section">
                <h4>Payment Details</h4>
                <div className="payment-details-bar">
                  <div className="pay-metric">
                    <span>Total Amount</span>
                    <strong>₹{(viewingEvent.totalAmount || 0).toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="pay-metric">
                    <span>Advance Deposit</span>
                    <strong className="text-green">₹{(viewingEvent.advanceAmount || 0).toLocaleString('en-IN')}</strong>
                  </div>
                  <div className="pay-metric">
                    <span>Pending Balance</span>
                    <strong className="text-orange">₹{(viewingEvent.pendingAmount || 0).toLocaleString('en-IN')}</strong>
                  </div>
                </div>
              </div>

              {viewingEvent.description && (
                <div className="details-section">
                  <h4>Program Description</h4>
                  <p className="description-text">{viewingEvent.description}</p>
                </div>
              )}

              {/* Contact Person Data & Timestamps */}
              <div className="details-section">
                <h4>Contact Person & Audit Log</h4>
                <div className="contact-box">
                  <p><strong>Contact Name:</strong> {viewingEvent.contactName || 'Not specified'}</p>
                  {viewingEvent.contactPhone && <p><strong>Contact Phone:</strong> {viewingEvent.contactPhone}</p>}
                  {viewingEvent.specialNotes && <p><strong>Special Requirements:</strong> {viewingEvent.specialNotes}</p>}
                  <div className="audit-row">
                    <span><strong>Created:</strong> {formatDate(viewingEvent.createdDate)}</span>
                    {viewingEvent.lastUpdated && <span> • <strong>Updated:</strong> {formatDate(viewingEvent.lastUpdated)}</span>}
                  </div>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="modal-cancel-btn"
                onClick={() => setViewingEvent(null)}
              >
                Close
              </button>
              <button
                type="button"
                className="modal-submit-btn"
                onClick={(e) => {
                  const ev = viewingEvent;
                  setViewingEvent(null);
                  handleEditClick(e, ev);
                }}
              >
                <Edit3 size={16} />
                <span>Edit Event</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CONFIRM DELETE MODAL */}
      {deleteConfirmId && (
        <div className="modal-backdrop" onClick={() => setDeleteConfirmId(null)}>
          <div className="modal-card delete-confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Delete Event</h3>
            <p>Are you sure you want to delete this program/event? This action cannot be undone.</p>
            <div className="modal-footer">
              <button 
                type="button"
                className="modal-cancel-btn"
                onClick={() => setDeleteConfirmId(null)}
              >
                Cancel
              </button>
              <button 
                type="button"
                className="delete-danger-btn"
                onClick={() => handleConfirmDelete(deleteConfirmId)}
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}

      {showSheetsModal && (
        <SheetsBackupModal
          events={events}
          onClose={() => setShowSheetsModal(false)}
          onToast={onToast}
        />
      )}
    </div>
  );
};
