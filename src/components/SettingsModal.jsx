import React, { useState } from 'react';
import { getApiBase } from '../services/api';

export default function SettingsModal({ onClose, onSave }) {
  const [url, setUrl] = useState(localStorage.getItem('custom_api_url') || getApiBase());

  const handleSave = (e) => {
    e.preventDefault();
    if (url.trim()) {
      localStorage.setItem('custom_api_url', url.trim());
    } else {
      localStorage.removeItem('custom_api_url');
    }
    onSave();
    onClose();
  };

  const handleReset = () => {
    localStorage.removeItem('custom_api_url');
    setUrl(getApiBase());
    onSave();
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>Backend API Settings</h3>
          <button className="btn-close" onClick={onClose}>
            &times;
          </button>
        </div>

        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1.25rem' }}>
          Specify the Spring Boot Backend URL where API requests (e.g. <code>/auth/login</code>, <code>/transactions</code>) will be sent.
        </p>

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label htmlFor="api-url">Spring Boot Backend URL</label>
            <input
              id="api-url"
              type="text"
              className="form-control"
              placeholder="e.g. http://localhost:8080/api or https://your-backend.onrender.com/api"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>
              Save URL
            </button>
            <button
              type="button"
              className="btn-settings"
              onClick={handleReset}
              style={{ padding: '0.75rem 1rem' }}
            >
              Reset Default
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
