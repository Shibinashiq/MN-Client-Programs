import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './components/LoginPage/LoginPage';
import { Navbar } from './components/Navbar/Navbar';
import { Dashboard } from './components/Dashboard/Dashboard';
import { EventsManager } from './components/Events/EventsManager';
import { CreateEventForm } from './components/EventForm/CreateEventForm';
import { Toast } from './components/Toast/Toast';
import { supabase } from './lib/supabaseClient';
import './App.css';

// ── Helper: convert Supabase row → app event object ──────────────
const rowToEvent = (row) => ({
  id: row.id,
  eventName: row.event_name,
  eventDate: row.event_date,
  startTime: row.start_time,
  endTime: row.end_time,
  location: row.location,
  locationUrl: row.location_url,
  contactName: row.contact_name,
  contactPhone: row.contact_phone,
  totalAmount: row.total_amount,
  advanceAmount: row.advance_amount,
  pendingAmount: row.pending_amount,
  paymentStatus: row.payment_status,
  status: row.status,
  hasSoundCheck: row.has_sound_check,
  soundCheckTime: row.sound_check_time,
  description: row.description,
  specialNotes: row.special_notes,
  posterUrl: row.poster_url,
  createdDate: row.created_date,
  lastUpdated: row.last_updated,
});

// ── Helper: convert app event object → Supabase row ──────────────
const eventToRow = (ev) => ({
  id: ev.id,
  event_name: ev.eventName || '',
  event_date: ev.eventDate || '',
  start_time: ev.startTime || '',
  end_time: ev.endTime || '',
  location: ev.location || '',
  location_url: ev.locationUrl || '',
  contact_name: ev.contactName || '',
  contact_phone: ev.contactPhone || '',
  total_amount: parseFloat(ev.totalAmount) || 0,
  advance_amount: parseFloat(ev.advanceAmount) || 0,
  pending_amount: parseFloat(ev.pendingAmount) || 0,
  payment_status: ev.paymentStatus || 'Pending',
  status: ev.status || 'Enquired',
  has_sound_check: Boolean(ev.hasSoundCheck),
  sound_check_time: ev.soundCheckTime || '',
  description: ev.description || '',
  special_notes: ev.specialNotes || '',
  poster_url: ev.posterUrl || '',
  created_date: ev.createdDate || '',
  last_updated: ev.lastUpdated || '',
});

// ─────────────────────────────────────────────────────────────────

const MainApp = () => {
  const [toast, setToast] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  // ── Fetch all events from Supabase ───────────────────────────
  const fetchEvents = useCallback(async () => {
    setLoadingEvents(true);
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Supabase fetch error:', error);
      showToast('Failed to load events. Check your connection.', 'error');
    } else {
      setEvents((data || []).map(rowToEvent));
    }
    setLoadingEvents(false);
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  // ── Real-time subscription: sync across all tabs / devices ───
  useEffect(() => {
    const channel = supabase
      .channel('events-realtime')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'events' },
        () => {
          // Re-fetch on any change
          fetchEvents();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchEvents]);

  // ── Save (insert or update) event ───────────────────────────
  const handleSaveEvent = async (eventData) => {
    const row = eventToRow(eventData);

    const { error } = await supabase
      .from('events')
      .upsert(row, { onConflict: 'id' });

    if (error) {
      console.error('Supabase upsert error:', error);
      showToast('❌ Failed to save event. Please try again.', 'error');
    } else {
      setEditingEvent(null);
      showToast(
        editingEvent
          ? `✅ Event "${eventData.eventName}" updated!`
          : `✅ Event "${eventData.eventName}" created!`,
        'success'
      );
      fetchEvents();
    }
  };

  // ── Delete event ─────────────────────────────────────────────
  const handleDeleteEvent = async (id) => {
    const { error } = await supabase.from('events').delete().eq('id', id);

    if (error) {
      console.error('Supabase delete error:', error);
      showToast('❌ Failed to delete event. Please try again.', 'error');
    } else {
      setEvents((prev) => prev.filter((e) => e.id !== id));
    }
  };

  const Footer = () => (
    <footer className="app-footer">
      <div className="footer-content">
        <p>© 2026 MN | Client Programs — Private Program & Event Management System.</p>
      </div>
    </footer>
  );

  return (
    <BrowserRouter>
      <div className="app-wrapper">
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<LoginPage onToast={showToast} />} />

          {/* Protected Dashboard Route */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Navbar onToast={showToast} />
                <main className="app-main-content">
                  <Dashboard
                    events={events}
                    loadingEvents={loadingEvents}
                    onToast={showToast}
                  />
                </main>
                <Footer />
              </ProtectedRoute>
            }
          />

          {/* Protected Events Listing Route */}
          <Route
            path="/events"
            element={
              <ProtectedRoute>
                <Navbar onToast={showToast} />
                <main className="app-main-content">
                  <EventsManager
                    events={events}
                    loadingEvents={loadingEvents}
                    onDeleteEvent={handleDeleteEvent}
                    onEditEvent={(ev) => setEditingEvent(ev)}
                    onToast={showToast}
                  />
                </main>
                <Footer />
              </ProtectedRoute>
            }
          />

          {/* Protected Create / Edit Event Form Route */}
          <Route
            path="/create-event"
            element={
              <ProtectedRoute>
                <Navbar onToast={showToast} />
                <main className="app-main-content">
                  <CreateEventForm
                    onSaveEvent={handleSaveEvent}
                    onToast={showToast}
                    initialData={editingEvent}
                    isEditing={Boolean(editingEvent)}
                  />
                </main>
                <Footer />
              </ProtectedRoute>
            }
          />

          {/* Redirect root and unknown routes */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>

        <Toast toast={toast} onClose={() => setToast(null)} />
      </div>
    </BrowserRouter>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
