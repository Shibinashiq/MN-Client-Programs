import React, { useState, useEffect } from 'react';
import { X, Sheet, ExternalLink, Save, Loader2, CheckCircle2, AlertCircle, Settings } from 'lucide-react';
import { getSavedScriptUrl, saveScriptUrl, backupToSheets } from '../../lib/sheetsBackup';
import './SheetsBackupModal.css';

export const SheetsBackupModal = ({ events, onClose, onToast }) => {
  const [scriptUrl, setScriptUrl] = useState('');
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState(null); // { type: 'success'|'error', message }

  useEffect(() => {
    setScriptUrl(getSavedScriptUrl());
  }, []);

  const handleSaveUrl = () => {
    saveScriptUrl(scriptUrl);
    onToast?.('Script URL saved.', 'success');
  };

  const handleBackup = async () => {
    const urlToUse = scriptUrl.trim();
    if (!urlToUse) {
      setStatus({ type: 'error', message: 'Please enter your Apps Script Web App URL first.' });
      return;
    }
    setSaving(true);
    setStatus(null);
    const result = await backupToSheets(events, urlToUse);
    setSaving(false);
    setStatus({ type: result.success ? 'success' : 'error', message: result.message });
    if (result.success) {
      saveScriptUrl(urlToUse);
      onToast?.(result.message, 'success');
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card sheets-modal" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="sheets-modal-header">
          <div className="sheets-header-left">
            <div className="sheets-icon-badge">
              <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
                <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 3c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm7 13H5v-.23c0-.62.28-1.2.76-1.58C7.47 15.82 9.64 15 12 15s4.53.82 6.24 2.19c.48.38.76.97.76 1.58V19z"/>
              </svg>
            </div>
            <div>
              <h2 className="sheets-modal-title">Backup to Google Sheets</h2>
              <p className="sheets-modal-sub">Push all {events.length} event{events.length !== 1 ? 's' : ''} to your Google Sheet</p>
            </div>
          </div>
          <button type="button" className="close-modal-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Setup Steps */}
        <div className="sheets-setup-steps">
          <div className="setup-step">
            <div className="step-num">1</div>
            <div className="step-content">
              <strong>Create your Google Apps Script</strong>
              <p>Open <a href="https://script.google.com" target="_blank" rel="noreferrer" className="link-highlight">script.google.com <ExternalLink size={11} /></a>, create a new project, paste the script below, then deploy as a <em>Web App</em> (Execute as: Me, Who has access: Anyone).</p>
            </div>
          </div>

          <div className="apps-script-code">
            <div className="code-header">
              <span>Google Apps Script — paste this exactly</span>
              <button
                type="button"
                className="copy-code-btn"
                onClick={() => {
                  navigator.clipboard.writeText(APPS_SCRIPT_CODE);
                  onToast?.('Script code copied!', 'success');
                }}
              >
                Copy
              </button>
            </div>
            <pre className="code-block">{APPS_SCRIPT_CODE}</pre>
          </div>

          <div className="setup-step">
            <div className="step-num">2</div>
            <div className="step-content">
              <strong>Paste your Web App URL below</strong>
              <p>After deploying, copy the Web App URL (looks like <code>https://script.google.com/macros/s/…/exec</code>) and paste it here.</p>
            </div>
          </div>
        </div>

        {/* URL Input */}
        <div className="url-input-group">
          <label htmlFor="script-url">Apps Script Web App URL</label>
          <div className="url-input-row">
            <input
              id="script-url"
              type="url"
              placeholder="https://script.google.com/macros/s/.../exec"
              value={scriptUrl}
              onChange={(e) => setScriptUrl(e.target.value)}
            />
            <button type="button" className="save-url-btn" onClick={handleSaveUrl} title="Save URL">
              <Save size={16} />
            </button>
          </div>
        </div>

        {/* Status Message */}
        {status && (
          <div className={`backup-status-msg ${status.type}`}>
            {status.type === 'success' ? <CheckCircle2 size={17} /> : <AlertCircle size={17} />}
            <span>{status.message}</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="modal-footer">
          <button type="button" className="modal-cancel-btn" onClick={onClose}>
            Close
          </button>
          <button
            type="button"
            className="sheets-backup-btn"
            onClick={handleBackup}
            disabled={saving || events.length === 0}
          >
            {saving ? (
              <>
                <Loader2 size={17} className="spin-icon" />
                <span>Backing up…</span>
              </>
            ) : (
              <>
                <svg viewBox="0 0 24 24" fill="currentColor" width="17" height="17">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-2 10H7v-2h10v2zm0-4H7V7h10v2z"/>
                </svg>
                <span>Backup {events.length} Event{events.length !== 1 ? 's' : ''} Now</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

const APPS_SCRIPT_CODE = `function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var sheet = ss.getSheetByName("Events Backup") 
              || ss.insertSheet("Events Backup");

    // Write headers on first use
    if (sheet.getLastRow() === 0) {
      var headers = [
        "ID","Event Name","Date","Start Time","End Time",
        "Location","Location URL","Contact Name","Contact Phone",
        "Total (₹)","Advance (₹)","Pending (₹)","Payment Status",
        "Status","Sound Check","Sound Check Time",
        "Description","Special Notes","Created","Last Updated","Backed Up At"
      ];
      sheet.appendRow(headers);
      sheet.getRange(1,1,1,headers.length).setFontWeight("bold")
           .setBackground("#1a73e8").setFontColor("#ffffff");
    }

    // Clear old data (keep header)
    if (sheet.getLastRow() > 1) {
      sheet.deleteRows(2, sheet.getLastRow() - 1);
    }

    // Write all rows
    var rows = data.rows || [];
    rows.forEach(function(ev) {
      sheet.appendRow([
        ev.id, ev.eventName, ev.eventDate, ev.startTime, ev.endTime,
        ev.location, ev.locationUrl, ev.contactName, ev.contactPhone,
        ev.totalAmount, ev.advanceAmount, ev.pendingAmount, ev.paymentStatus,
        ev.status, ev.hasSoundCheck, ev.soundCheckTime,
        ev.description, ev.specialNotes, ev.createdDate, ev.lastUpdated,
        data.timestamp
      ]);
    });

    return ContentService.createTextOutput(
      JSON.stringify({ success: true, count: rows.length })
    ).setMimeType(ContentService.MimeType.JSON);

  } catch(err) {
    return ContentService.createTextOutput(
      JSON.stringify({ success: false, error: err.toString() })
    ).setMimeType(ContentService.MimeType.JSON);
  }
}`;
