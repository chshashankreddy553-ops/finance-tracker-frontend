import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import SettingsModal from './components/SettingsModal';
import { api } from './services/api';

export default function App() {
  const [user, setUser] = useState(null);
  const [authView, setAuthView] = useState('login'); // 'login' | 'register'
  const [showSettings, setShowSettings] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const currentUser = api.getCurrentUser();
    if (currentUser && currentUser.token) {
      setUser(currentUser);
    }
  }, []);

  const handleLoginSuccess = (userData) => {
    setUser({
      token: userData.token,
      name: userData.name || 'User',
      email: userData.email || ''
    });
  };

  const handleLogout = () => {
    api.logout();
    setUser(null);
    setAuthView('login');
  };

  return (
    <div className="app-container">
      <Navbar
        user={user}
        onLogout={handleLogout}
        onOpenSettings={() => setShowSettings(true)}
      />

      <main className="main-content" key={refreshKey}>
        {user ? (
          <Dashboard onLogout={handleLogout} />
        ) : authView === 'login' ? (
          <Login
            onLoginSuccess={handleLoginSuccess}
            onSwitchToRegister={() => setAuthView('register')}
          />
        ) : (
          <Register
            onRegisterSuccess={() => setAuthView('login')}
            onSwitchToLogin={() => setAuthView('login')}
          />
        )}
      </main>

      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          onSave={() => setRefreshKey((prev) => prev + 1)}
        />
      )}
    </div>
  );
}
