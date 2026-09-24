/**
 * sheetsBackup.js
 * Sends all events to a Google Apps Script Web App that writes them
 * into a Google Sheet owned by the configured account.
 */

const SCRIPT_URL_KEY = 'mn_sheets_script_url';

export const getSavedScriptUrl = () => localStorage.getItem(SCRIPT_URL_KEY) || '';

export const saveScriptUrl = (url) => {
  if (url) {
    localStorage.setItem(SCRIPT_URL_KEY, url.trim());
  } else {
    localStorage.removeItem(SCRIPT_URL_KEY);
  }
};

/**
 * Pushes all events to the configured Google Apps Script Web App.
 * @param {Array} events - The events array from localStorage state.
 * @param {string} scriptUrl - The deployed Apps Script Web App URL.
 * @returns {Promise<{ success: boolean, message: string }>}
 */
export const backupToSheets = async (events, scriptUrl) => {
  if (!scriptUrl) {
    return { success: false, message: 'No Google Apps Script URL configured.' };
  }

  const rows = events.map((ev) => ({
    id: ev.id || '',
    eventName: ev.eventName || '',
    eventDate: ev.eventDate || '',
    startTime: ev.startTime || '',
    endTime: ev.endTime || '',
    location: ev.location || '',
    locationUrl: ev.locationUrl || '',
    contactName: ev.contactName || '',
    contactPhone: ev.contactPhone || '',
    totalAmount: ev.totalAmount || 0,
    advanceAmount: ev.advanceAmount || 0,
    pendingAmount:
      ev.pendingAmount !== undefined
        ? ev.pendingAmount
        : Math.max(0, (parseFloat(ev.totalAmount) || 0) - (parseFloat(ev.advanceAmount) || 0)),
    paymentStatus: ev.paymentStatus || '',
    status: ev.status || '',
    hasSoundCheck: ev.hasSoundCheck ? 'Yes' : 'No',
    soundCheckTime: ev.soundCheckTime || '',
    description: ev.description || '',
    specialNotes: ev.specialNotes || '',
    createdDate: ev.createdDate || '',
    lastUpdated: ev.lastUpdated || '',
  }));

  try {
    // Google Apps Script requires no-cors fetch — an opaque response is expected.
    // No exception thrown = success.
    await fetch(scriptUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'backup',
        timestamp: new Date().toISOString(),
        totalEvents: events.length,
        rows,
      }),
    });

    return {
      success: true,
      message: `✅ ${events.length} event${events.length !== 1 ? 's' : ''} backed up to Google Sheets!`,
    };
  } catch (err) {
    console.error('[Sheets Backup] Error:', err);
    return {
      success: false,
      message: `❌ Backup failed: ${err.message || 'Network error'}`,
    };
  }
};
