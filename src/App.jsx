import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { LoginPage } from './components/LoginPage/LoginPage';
import { Navbar } from './components/Navbar/Navbar';
import { Dashboard } from './components/Dashboard/Dashboard';
import { EventsManager } from './components/Events/EventsManager';
import { CreateEventForm } from './components/EventForm/CreateEventForm';
import { Toast } from './components/Toast/Toast';
import './App.css';

const MainApp = () => {
  const [toast, setToast] = useState(null);
  const [editingEvent, setEditingEvent] = useState(null);

  // Events state with localStorage persistence
  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem('abdu_events');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error(e);
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('abdu_events', JSON.stringify(events));
  }, [events]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  // Event CRUD Handlers
  const handleSaveEvent = (eventData) => {
    setEvents(prev => {
      const existsIndex = prev.findIndex(e => e.id === eventData.id);
      if (existsIndex >= 0) {
        const updated = [...prev];
        updated[existsIndex] = eventData;
        return updated;
      }
      return [eventData, ...prev];
    });
    setEditingEvent(null);
  };

  const handleDeleteEvent = (id) => {
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  return (
    <BrowserRouter>
      <div className="app-wrapper">
        <Routes>
          {/* Public Login Route */}
          <Route 
            path="/login" 
            element={<LoginPage onToast={showToast} />} 
          />

          {/* Protected Dashboard Route */}
          <Route 
            path="/dashboard" 
            element={
              <ProtectedRoute>
                <Navbar onToast={showToast} />
                <main className="app-main-content">
                  <Dashboard events={events} onToast={showToast} />
                </main>
                <footer className="app-footer">
                  <div className="footer-content">
                    <p>© 2026 MN | Client Programs — Private Program & Event Management System.</p>
                  </div>
                </footer>
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
                    onDeleteEvent={handleDeleteEvent}
                    onEditEvent={(ev) => setEditingEvent(ev)}
                    onToast={showToast}
                  />
                </main>
                <footer className="app-footer">
                  <div className="footer-content">
                    <p>© 2026 MN | Client Programs — Private Program & Event Management System.</p>
                  </div>
                </footer>
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
                <footer className="app-footer">
                  <div className="footer-content">
                    <p>© 2026 MN | Client Programs — Private Program & Event Management System.</p>
                  </div>
                </footer>
              </ProtectedRoute>
            } 
          />

          {/* Redirect root and unknown routes to /dashboard */}
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
