import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Link as LinkIcon, 
  User, 
  Phone, 
  Upload, 
  CheckCircle2, 
  X, 
  ArrowLeft,
  Save,
  Mic
} from 'lucide-react';
import './CreateEventForm.css';

export const CreateEventForm = ({ onSaveEvent, onToast, initialData = null, isEditing = false }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    eventName: '',
    eventImage: '',
    eventDate: '',
    hasSoundCheck: false,
    soundCheckTime: '',
    startTime: '',
    endTime: '',
    location: '',
    locationUrl: '',
    eventUrl: '',
    description: '',
    totalAmount: '',
    advanceAmount: '',
    paymentStatus: 'Pending',
    status: 'Enquired',
    contactName: '',
    contactPhone: '',
    specialNotes: '',
  });

  const [imagePreview, setImagePreview] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        eventName: initialData.eventName || '',
        eventImage: initialData.eventImage || '',
        eventDate: initialData.eventDate || '',
        hasSoundCheck: Boolean(initialData.hasSoundCheck),
        soundCheckTime: initialData.soundCheckTime || '',
        startTime: initialData.startTime || '',
        endTime: initialData.endTime || '',
        location: initialData.location || '',
        locationUrl: initialData.locationUrl || '',
        eventUrl: initialData.eventUrl || '',
        description: initialData.description || '',
        totalAmount: initialData.totalAmount !== undefined ? String(initialData.totalAmount) : '',
        advanceAmount: initialData.advanceAmount !== undefined ? String(initialData.advanceAmount) : '',
        paymentStatus: initialData.paymentStatus || 'Pending',
        status: initialData.status || 'Enquired',
        contactName: initialData.contactName || '',
        contactPhone: initialData.contactPhone || '',
        specialNotes: initialData.specialNotes || '',
      });
      if (initialData.eventImage) {
        setImagePreview(initialData.eventImage);
      }
    }
  }, [initialData]);

  // Auto-calculated Pending Amount: Total Amount - Advance Amount
  const total = parseFloat(formData.totalAmount) || 0;
  const advance = parseFloat(formData.advanceAmount) || 0;
  const pendingAmount = Math.max(0, total - advance);

  const handleAmountChange = (field, value) => {
    const nextForm = { ...formData, [field]: value };
    const nextTotal = parseFloat(field === 'totalAmount' ? value : formData.totalAmount) || 0;
    const nextAdvance = parseFloat(field === 'advanceAmount' ? value : formData.advanceAmount) || 0;
    
    if (nextTotal > 0 && nextAdvance >= nextTotal) {
      nextForm.paymentStatus = 'Fully Paid';
    } else if (nextAdvance > 0 && nextAdvance < nextTotal) {
      nextForm.paymentStatus = 'Partially Paid';
    } else if (nextAdvance === 0) {
      nextForm.paymentStatus = 'Pending';
    }

    setFormData(nextForm);
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, eventImage: 'Image size should be under 5MB.' }));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
        setFormData(prev => ({ ...prev, eventImage: reader.result }));
        setErrors(prev => ({ ...prev, eventImage: null }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setImagePreview('');
    setFormData(prev => ({ ...prev, eventImage: '' }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.eventName.trim()) newErrors.eventName = 'Event Name is required.';
    if (!formData.eventDate) newErrors.eventDate = 'Event Date is required.';
    if (!formData.location.trim()) newErrors.location = 'Location / Venue is required.';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) {
      onToast?.('Please fill in all required fields.', 'error');
      return;
    }

    const nowIso = new Date().toISOString();
    const eventPayload = {
      id: initialData?.id || `event-${Date.now()}`,
      ...formData,
      totalAmount: total,
      advanceAmount: advance,
      pendingAmount: pendingAmount,
      createdDate: initialData?.createdDate || nowIso,
      lastUpdated: nowIso,
    };

    onSaveEvent(eventPayload);
    onToast?.('Event created successfully.', 'success');
    navigate('/events');
  };

  return (
    <div className="create-event-container">
      <div className="create-event-header">
        <button 
          type="button" 
          className="back-btn" 
          onClick={() => navigate('/events')}
        >
          <ArrowLeft size={18} />
          <span>Back to Events</span>
        </button>
        <div className="header-titles">
          <h1 className="form-page-title">
            {isEditing ? 'Edit Singer Event' : 'Create Singer Program / Event'}
          </h1>
          <p className="form-page-subtitle">
            Fill in the event specs, payment details, venue location, and contact information.
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="event-form-grid">
        {/* SECTION 1: EVENT DETAILS */}
        <div className="form-section-card">
          <div className="section-card-header">
            <div className="section-badge icon-cyan">1</div>
            <div>
              <h2 className="section-title">Event Information</h2>
              <p className="section-desc">Basic details about the singer performance and program setup</p>
            </div>
          </div>

          <div className="section-body">
            <div className="form-group full-width">
              <label htmlFor="eventName">Event Name *</label>
              <input
                id="eventName"
                type="text"
                placeholder="e.g. Wedding Reception Live Concert, Music Fest 2026"
                value={formData.eventName}
                onChange={(e) => setFormData({ ...formData, eventName: e.target.value })}
                className={errors.eventName ? 'input-error' : ''}
              />
              {errors.eventName && <span className="error-text">{errors.eventName}</span>}
            </div>

            {/* Event Image Upload */}
            <div className="form-group full-width">
              <label>Event Image / Poster</label>
              <div className="image-upload-wrapper">
                {imagePreview ? (
                  <div className="image-preview-box">
                    <img src={imagePreview} alt="Event Preview" />
                    <button
                      type="button"
                      className="remove-img-btn"
                      onClick={handleRemoveImage}
                      title="Remove Image"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="upload-dropzone">
                    <Upload size={32} className="upload-icon" />
                    <div className="upload-prompt">
                      <span>Click to upload event poster</span>
                      <small>PNG, JPG or WEBP (Max 5MB)</small>
                    </div>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="file-input-hidden"
                    />
                  </div>
                )}
              </div>
              {errors.eventImage && <span className="error-text">{errors.eventImage}</span>}
            </div>

            <div className="form-row-3">
              <div className="form-group">
                <label htmlFor="eventDate">Event Date *</label>
                <div className="input-with-icon">
                  <Calendar size={18} className="field-icon" />
                  <input
                    id="eventDate"
                    type="date"
                    value={formData.eventDate}
                    onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
                    className={errors.eventDate ? 'input-error' : ''}
                  />
                </div>
                {errors.eventDate && <span className="error-text">{errors.eventDate}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="startTime">Start Time</label>
                <div className="input-with-icon">
                  <Clock size={18} className="field-icon" />
                  <input
                    id="startTime"
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="endTime">End Time</label>
                <div className="input-with-icon">
                  <Clock size={18} className="field-icon" />
                  <input
                    id="endTime"
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                  />
                </div>
              </div>
            </div>

            {/* SOUND CHECK CHECKBOX & CONDITIONAL TIME FIELD */}
            <div className="soundcheck-row full-width">
              <label className="checkbox-container">
                <input
                  type="checkbox"
                  checked={formData.hasSoundCheck}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    hasSoundCheck: e.target.checked,
                    soundCheckTime: e.target.checked ? (formData.soundCheckTime || '17:00') : ''
                  })}
                />
                <span className="checkbox-label-text">🎵 Sound Check Required</span>
              </label>

              {formData.hasSoundCheck && (
                <div className="form-group soundcheck-time-group animate-slide">
                  <label htmlFor="soundCheckTime">Sound Check Time</label>
                  <div className="input-with-icon">
                    <Mic size={18} className="field-icon" />
                    <input
                      id="soundCheckTime"
                      type="time"
                      value={formData.soundCheckTime}
                      onChange={(e) => setFormData({ ...formData, soundCheckTime: e.target.value })}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="location">Location / Venue *</label>
                <div className="input-with-icon">
                  <MapPin size={18} className="field-icon" />
                  <input
                    id="location"
                    type="text"
                    placeholder="e.g. Grand Palace Convention Centre, Kochi"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className={errors.location ? 'input-error' : ''}
                  />
                </div>
                {errors.location && <span className="error-text">{errors.location}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="locationUrl">Google Maps / Location URL</label>
                <div className="input-with-icon">
                  <LinkIcon size={18} className="field-icon" />
                  <input
                    id="locationUrl"
                    type="url"
                    placeholder="https://maps.google.com/..."
                    value={formData.locationUrl}
                    onChange={(e) => setFormData({ ...formData, locationUrl: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="form-group full-width">
              <label htmlFor="eventUrl">Event URL / Website</label>
              <div className="input-with-icon">
                <LinkIcon size={18} className="field-icon" />
                <input
                  id="eventUrl"
                  type="url"
                  placeholder="https://event-booking.com/..."
                  value={formData.eventUrl}
                  onChange={(e) => setFormData({ ...formData, eventUrl: e.target.value })}
                />
              </div>
            </div>

            <div className="form-group full-width">
              <label htmlFor="description">Event Description & Notes</label>
              <textarea
                id="description"
                rows="3"
                placeholder="e.g. Wedding reception program. Program starts at 7:30 PM. Sound system will be provided by the venue. Travel allowance included."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: PAYMENT INFORMATION */}
        <div className="form-section-card">
          <div className="section-card-header">
            <div className="section-badge icon-green">2</div>
            <div>
              <h2 className="section-title">Payment Information</h2>
              <p className="section-desc">Budget, advance deposit, pending amount, and payment status tracking</p>
            </div>
          </div>

          <div className="section-body">
            <div className="form-row-3">
              <div className="form-group">
                <label htmlFor="totalAmount">Total Program Amount (₹)</label>
                <div className="input-with-icon">
                  <span className="currency-prefix">₹</span>
                  <input
                    id="totalAmount"
                    type="number"
                    min="0"
                    step="500"
                    placeholder="50000"
                    value={formData.totalAmount}
                    onChange={(e) => handleAmountChange('totalAmount', e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="advanceAmount">Advance Amount (₹)</label>
                <div className="input-with-icon">
                  <span className="currency-prefix">₹</span>
                  <input
                    id="advanceAmount"
                    type="number"
                    min="0"
                    step="500"
                    placeholder="15000"
                    value={formData.advanceAmount}
                    onChange={(e) => handleAmountChange('advanceAmount', e.target.value)}
                  />
                </div>
              </div>

              {/* Calculated Pending Amount */}
              <div className="form-group highlight-calculated">
                <label>Pending Amount (Calculated)</label>
                <div className="calculated-box">
                  <span className="calc-currency">₹</span>
                  <span className="calc-val">{pendingAmount.toLocaleString('en-IN')}</span>
                </div>
                <small className="calc-hint">Total Amount - Advance Amount</small>
              </div>
            </div>

            <div className="form-group full-width">
              <label>Payment Status</label>
              <div className="pill-radio-group">
                {['Pending', 'Partially Paid', 'Fully Paid'].map((statusOption) => (
                  <button
                    key={statusOption}
                    type="button"
                    className={`pill-option ${formData.paymentStatus === statusOption ? 'active ' + statusOption.toLowerCase().replace(' ', '-') : ''}`}
                    onClick={() => setFormData({ ...formData, paymentStatus: statusOption })}
                  >
                    <CheckCircle2 size={16} />
                    <span>{statusOption}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 3: EVENT STATUS */}
        <div className="form-section-card">
          <div className="section-card-header">
            <div className="section-badge icon-purple">3</div>
            <div>
              <h2 className="section-title">Event Status</h2>
              <p className="section-desc">Current booking lifecycle stage</p>
            </div>
          </div>

          <div className="section-body">
            <div className="form-group full-width">
              <label>Event Status Level</label>
              <div className="status-cards-grid">
                {[
                  { id: 'Enquired', label: 'Enquired', desc: 'Initial inquiry / quote requested' },
                  { id: 'Confirmed', label: 'Confirmed', desc: 'Booking confirmed with date locked' },
                  { id: 'Completed', label: 'Completed', desc: 'Program successfully performed' },
                  { id: 'Cancelled', label: 'Cancelled', desc: 'Event cancelled or postponed' }
                ].map((item) => (
                  <div
                    key={item.id}
                    className={`status-select-card ${formData.status === item.id ? 'selected ' + item.id.toLowerCase() : ''}`}
                    onClick={() => setFormData({ ...formData, status: item.id })}
                  >
                    <div className="status-card-header">
                      <span className="status-label-name">{item.label}</span>
                      <div className="radio-dot"></div>
                    </div>
                    <p className="status-card-desc">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 4: ADDITIONAL INFORMATION */}
        <div className="form-section-card">
          <div className="section-card-header">
            <div className="section-badge icon-blue">4</div>
            <div>
              <h2 className="section-title">Additional Information</h2>
              <p className="section-desc">Contact person details and special requirements</p>
            </div>
          </div>

          <div className="section-body">
            <div className="form-row-2">
              <div className="form-group">
                <label htmlFor="contactName">Contact Person Name</label>
                <div className="input-with-icon">
                  <User size={18} className="field-icon" />
                  <input
                    id="contactName"
                    type="text"
                    placeholder="e.g. Rahul Nair (Event Organizer)"
                    value={formData.contactName}
                    onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="contactPhone">Contact Person Phone</label>
                <div className="input-with-icon">
                  <Phone size={18} className="field-icon" />
                  <input
                    id="contactPhone"
                    type="tel"
                    placeholder="e.g. +91 9876543210"
                    value={formData.contactPhone}
                    onChange={(e) => setFormData({ ...formData, contactPhone: e.target.value })}
                  />
                </div>
              </div>
            </div>

            <div className="form-group full-width">
              <label htmlFor="specialNotes">Special Requirements / Notes</label>
              <textarea
                id="specialNotes"
                rows="3"
                placeholder="e.g. 4 wireless mics required, stage monitor setup, green room hospitality, travel reimbursement."
                value={formData.specialNotes}
                onChange={(e) => setFormData({ ...formData, specialNotes: e.target.value })}
              />
            </div>
          </div>
        </div>

        {/* FORM ACTIONS */}
        <div className="form-actions-bar">
          <button
            type="button"
            className="form-cancel-btn"
            onClick={() => navigate('/events')}
          >
            Cancel
          </button>

          <button
            type="submit"
            className="form-save-btn"
          >
            <Save size={18} />
            <span>Save Event</span>
          </button>
        </div>
      </form>
    </div>
  );
};
