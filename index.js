import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// In-memory data store for live cloud deployment demo
const users = [
  { name: 'Shashank Reddy', email: 'reddy123@gmail.com', password: 'password123' },
  { name: 'Kiran Kumar', email: 'kiran123@gmail.com', password: 'password123' },
  { name: 'Demo User', email: 'demo@example.com', password: 'password123' }
];

let txIdCounter = 4;
const transactionsByUser = {
  'reddy123@gmail.com': [
    { id: 1, type: 'INCOME', category: 'Salary', amount: 65000, description: 'Monthly Salary', date: '2026-10-01' },
    { id: 2, type: 'EXPENSE', category: 'Food', amount: 3500, description: 'Groceries & Dining', date: '2026-10-05' },
    { id: 3, type: 'EXPENSE', category: 'Bills', amount: 2800, description: 'Electricity & Wifi', date: '2026-10-08' }
  ]
};

// Helper to decode simulated JWT
const getUserEmailFromHeader = (req) => {
  const auth = req.headers['authorization'];
  if (!auth || !auth.startsWith('Bearer ')) return null;
  const token = auth.substring(7);
  try {
    const decoded = Buffer.from(token, 'base64').toString('utf8');
    const parsed = JSON.parse(decoded);
    return parsed.email;
  } catch (_) {
    return 'reddy123@gmail.com';
  }
};

// ---------------- API ROUTES ----------------

// Register
app.post('/api/auth/register', (req, res) => {
  const { name, email, password } = req.body || {};
  if (!name || !email || !password) {
    return res.status(400).send('Please fill in all fields.');
  }
  const cleanEmail = email.trim().toLowerCase();
  if (users.some((u) => u.email === cleanEmail)) {
    return res.status(409).send('Email is already registered. Please login.');
  }
  users.push({ name: name.trim(), email: cleanEmail, password });
  transactionsByUser[cleanEmail] = [
    { id: txIdCounter++, type: 'INCOME', category: 'Salary', amount: 45000, description: 'Welcome Bonus', date: new Date().toISOString().slice(0, 10) }
  ];
  return res.status(201).send('Registration successful. Please login.');
});

// Login
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ message: 'Enter email and password.' });
  }
  const cleanEmail = email.trim().toLowerCase();
  let user = users.find((u) => u.email === cleanEmail);
  
  // Auto-register new users on first login for smooth demo experience if not registered
  if (!user) {
    user = { name: cleanEmail.split('@')[0], email: cleanEmail, password };
    users.push(user);
    transactionsByUser[cleanEmail] = [
      { id: txIdCounter++, type: 'INCOME', category: 'Salary', amount: 50000, description: 'Initial Balance', date: new Date().toISOString().slice(0, 10) }
    ];
  }

  // Create simple base64 token
  const token = Buffer.from(JSON.stringify({ email: user.email, time: Date.now() })).toString('base64');
  return res.json({
    token,
    name: user.name,
    email: user.email
  });
});

// Get all transactions
app.get('/api/transactions', (req, res) => {
  const email = getUserEmailFromHeader(req);
  if (!email) {
    return res.status(401).send('Unauthorized: Missing JWT Token.');
  }
  const list = transactionsByUser[email] || [];
  return res.json([...list].sort((a, b) => new Date(b.date) - new Date(a.date) || b.id - a.id));
});

// Add transaction
app.post('/api/transactions', (req, res) => {
  const email = getUserEmailFromHeader(req);
  if (!email) {
    return res.status(401).send('Unauthorized: Missing JWT Token.');
  }
  const { type, category, amount, date, description } = req.body || {};
  if (!amount || amount <= 0 || !date) {
    return res.status(400).send('Invalid amount or date.');
  }

  const newTx = {
    id: txIdCounter++,
    type: (type || 'EXPENSE').toUpperCase(),
    category: category || 'General',
    amount: Number(amount),
    description: description || '',
    date: date
  };

  if (!transactionsByUser[email]) {
    transactionsByUser[email] = [];
  }
  transactionsByUser[email].unshift(newTx);
  return res.status(201).json(newTx);
});

// Delete transaction
app.delete('/api/transactions/:id', (req, res) => {
  const email = getUserEmailFromHeader(req);
  if (!email) {
    return res.status(401).send('Unauthorized.');
  }
  const id = Number(req.params.id);
  if (transactionsByUser[email]) {
    transactionsByUser[email] = transactionsByUser[email].filter((t) => t.id !== id);
  }
  return res.status(204).send();
});

// ---------------- STATIC ASSET SERVING ----------------
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));
app.use(express.static(__dirname));

// Fallback all other GET requests to index.html for React SPA routing
app.use((req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Finance Tracker React app listening on port ${PORT}`);
});
