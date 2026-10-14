# Personal Finance Tracker - React Frontend

A modern, responsive React Single-Page Application (SPA) built with Vite for tracking personal income, expenses, and net balance with JWT authentication.

## 🚀 Features
- **Modern React (Vite)**: Lightning fast SPA with component-based architecture.
- **JWT Authentication**: User registration and login flow with secure token persistence.
- **Dashboard in Indian Rupees (₹)**: Financial summary cards with automatic currency formatting.
- **Transaction Management**: Add income and expense transactions, select categories, and manage transaction history.
- **Configurable Backend Connection**: Works seamlessly with Spring Boot backend locally (`http://localhost:8080/api`) or with cloud deployments (Render, Railway, etc.).

## 🛠️ Quick Start (Local Development)

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Open in your browser:
   `http://localhost:3000`

## 📦 Build for Production

```bash
npm run build
```
Build output is generated in the `dist/` directory, ready to be hosted on GitHub Pages, Render, Vercel, or Netlify.
