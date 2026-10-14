// API service with configurable backend endpoint
export const getApiBase = () => {
  const custom = localStorage.getItem('custom_api_url');
  if (custom && custom.trim()) {
    return custom.trim().replace(/\/+$/, '');
  }
  if (import.meta.env.VITE_API_URL) {
    return import.meta.env.VITE_API_URL.replace(/\/+$/, '');
  }
  // If running locally on dev server, connect to Spring Boot port 8080
  if (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
    return 'http://localhost:8080/api';
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

export const api = {
  // Authentication
  async register(name, email, password) {
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
  },

  async login(email, password) {
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
      throw new Error(text || 'Login failed');
    }
    if (!res.ok || !data.token) {
      throw new Error(data.message || text || 'Invalid email or password');
    }
    localStorage.setItem('token', data.token);
    localStorage.setItem('name', data.name || 'User');
    localStorage.setItem('email', data.email || email);
    return data;
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
    const res = await fetch(`${getApiBase()}/transactions`, {
      method: 'GET',
      headers: getHeaders()
    });
    if (res.status === 401 || res.status === 403) {
      api.logout();
      throw new Error('SESSION_EXPIRED');
    }
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || 'Failed to fetch transactions');
    }
    return res.json();
  },

  async addTransaction(data) {
    const res = await fetch(`${getApiBase()}/transactions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data)
    });
    if (res.status === 401 || res.status === 403) {
      api.logout();
      throw new Error('SESSION_EXPIRED');
    }
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || 'Failed to add transaction');
    }
    return res.json();
  },

  async deleteTransaction(id) {
    const res = await fetch(`${getApiBase()}/transactions/${id}`, {
      method: 'DELETE',
      headers: getHeaders()
    });
    if (res.status === 401 || res.status === 403) {
      api.logout();
      throw new Error('SESSION_EXPIRED');
    }
    if (!res.ok) {
      const err = await res.text();
      throw new Error(err || 'Failed to delete transaction');
    }
    return true;
  }
};
