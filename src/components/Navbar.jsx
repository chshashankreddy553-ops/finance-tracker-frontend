import React from 'react';

export default function Navbar({ user, onLogout, onOpenSettings }) {
  return (
    <nav className="navbar">
      <div className="nav-brand">
        <span className="brand-icon">💳</span>
        <span>Personal Finance Tracker</span>
      </div>

      {user ? (
        <div className="nav-user">
          <span className="user-badge">
            Welcome, <strong>{user.name}</strong>
          </span>
          <button className="btn-settings" onClick={onOpenSettings} title="Configure Backend API URL">
            ⚙️ Backend API
          </button>
          <button className="btn-logout" onClick={onLogout}>
            Logout
          </button>
        </div>
      ) : (
        <button className="btn-settings" onClick={onOpenSettings} title="Configure Backend API URL">
          ⚙️ Backend API
        </button>
      )}
    </nav>
  );
}
