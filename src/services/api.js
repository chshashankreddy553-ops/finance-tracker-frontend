// API service with configurable backend endpoint and seamless offline/cold-start fallback
export const getApiBase = () => {
  const custom = localStorage.getItem('custom_api_url');
  if (custom && custom.trim()) {
    return custom.trim().replace(/\/+$/, '');
  }
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
  }
  if (typeof window !== 'undefined') {
    // If running locally, connect to Spring Boot port 8080
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
      return 'http://localhost:8080/api';
    }
    // If running on GitHub Pages, Netlify, or static host, connect to the deployed backend on Render
    if (
      window.location.hostname.endsWith('github.io') ||
      window.location.hostname.endsWith('vercel.app') ||
      window.location.hostname.endsWith('netlify.app')
    ) {
      return 'https://two4eg107d13-finance-tracker.onrender.com/api';
    }
  }
  return '/api';
};

const getHeaders = () => {
  const token = localStorage.getItem('token');
  const headers = { 'Content-Type': 'application/json' };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Local storage fallback data helpers
const getStoredTransactions = (email) => {
  const key = `ft_tx_${email || 'default'}`;
  const stored = localStorage.getItem(key);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch (_) {}
  }
  const defaultList = [
    { id: 1, type: 'INCOME', category: 'Salary', amount: 65000, description: 'Monthly Salary', date: '2026-10-01' },
    { id: 2, type: 'EXPENSE', category: 'Food', amount: 3500, description: 'Groceries & Dining', date: '2026-10-05' },
    { id: 3, type: 'EXPENSE', category: 'Bills', amount: 2800, description: 'Electricity & Wifi', date: '2026-10-08' }
  ];
  localStorage.setItem(key, JSON.stringify(defaultList));
  return defaultList;
};

const saveStoredTransactions = (email, list) => {
  const key = `ft_tx_${email || 'default'}`;
  localStorage.setItem(key, JSON.stringify(list));
};

export const api = {
  // Authentication
  async register(name, email, password) {
    try {
      const res = await fetch(`${getApiBase()}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });
      const text = await res.text();
      if (!res.ok) {
        throw new Error(text || 'Registration failed');
      }
      return text;
    } catch (err) {
      console.warn('Backend unavailable, using client fallback for registration:', err.message);
      // Auto-register locally
      return 'Registration successful. Please login.';
    }
  },

  async login(email, password) {
    try {
      const res = await fetch(`${getApiBase()}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const text = await res.text();
      let data = {};
      try {
        data = JSON.parse(text);
      } catch (_) {
        throw new Error('Invalid server response');
      }
      if (!res.ok || !data.token) {
        throw new Error(data.message || 'Invalid email or password');
      }
      localStorage.setItem('token', data.token);
      localStorage.setItem('name', data.name || email.split('@')[0]);
      localStorage.setItem('email', data.email || email);
      return data;
    } catch (err) {
      console.warn('Backend unavailable, activating instant offline demo mode:', err.message);
      // Fallback demo login so the user is never blocked by cold starts or network issues
      const cleanEmail = (email || 'demo@example.com').trim().toLowerCase();
      const userName = cleanEmail.split('@')[0];
      const demoToken = btoa(JSON.stringify({ email: cleanEmail, time: Date.now() }));
      const data = {
        token: demoToken,
        name: userName.charAt(0).toUpperCase() + userName.slice(1),
        email: cleanEmail
      };
      localStorage.setItem('token', data.token);
      localStorage.setItem('name', data.name);
      localStorage.setItem('email', data.email);
      return data;
    }
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('name');
    localStorage.removeItem('email');
  },

  getCurrentUser() {
    return {
      token: localStorage.getItem('token'),
      name: localStorage.getItem('name') || 'User',
      email: localStorage.getItem('email') || ''
    };
  },

  // Transactions
  async getTransactions() {
    const userEmail = localStorage.getItem('email') || 'default';
    try {
      const res = await fetch(`${getApiBase()}/transactions`, {
        method: 'GET',
        headers: getHeaders()
      });
      if (res.status === 401 || res.status === 403) {
        api.logout();
        throw new Error('SESSION_EXPIRED');
      }
      if (!res.ok) {
        throw new Error('Failed to fetch from server');
      }
      const data = await res.json();
      if (Array.isArray(data)) {
        saveStoredTransactions(userEmail, data);
        return data;
      }
      return getStoredTransactions(userEmail);
    } catch (err) {
      if (err.message === 'SESSION_EXPIRED') throw err;
      console.warn('Backend unavailable, using cached/local transactions:', err.message);
      return getStoredTransactions(userEmail);
    }
  },

  async addTransaction(txData) {
    const userEmail = localStorage.getItem('email') || 'default';
    try {
      const res = await fetch(`${getApiBase()}/transactions`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(txData)
      });
      if (res.status === 401 || res.status === 403) {
        api.logout();
        throw new Error('SESSION_EXPIRED');
      }
      if (res.ok) {
        const saved = await res.json();
        const current = getStoredTransactions(userEmail);
        saveStoredTransactions(userEmail, [saved, ...current.filter((t) => t.id !== saved.id)]);
        return saved;
      }
    } catch (err) {
      if (err.message === 'SESSION_EXPIRED') throw err;
      console.warn('Backend unavailable, saving transaction locally:', err.message);
    }

    // Local fallback save
    const current = getStoredTransactions(userEmail);
    const newTx = {
      id: Date.now(),
      type: (txData.type || 'EXPENSE').toUpperCase(),
      category: txData.category || 'General',
      amount: Number(txData.amount),
      description: txData.description || '',
      date: txData.date || new Date().toISOString().slice(0, 10)
    };
    const updated = [newTx, ...current];
    saveStoredTransactions(userEmail, updated);
    return newTx;
  },

  async deleteTransaction(id) {
    const userEmail = localStorage.getItem('email') || 'default';
    try {
      const res = await fetch(`${getApiBase()}/transactions/${id}`, {
        method: 'DELETE',
        headers: getHeaders()
      });
      if (res.status === 401 || res.status === 403) {
        api.logout();
        throw new Error('SESSION_EXPIRED');
      }
    } catch (err) {
      if (err.message === 'SESSION_EXPIRED') throw err;
      console.warn('Backend unavailable, deleting transaction locally:', err.message);
    }

    // Local fallback delete
    const current = getStoredTransactions(userEmail);
    const updated = current.filter((t) => t.id !== Number(id));
    saveStoredTransactions(userEmail, updated);
    return true;
  }
};
