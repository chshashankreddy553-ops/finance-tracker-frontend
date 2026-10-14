import React, { useState, useEffect } from 'react';
import SummaryCards from './SummaryCards';
import TransactionForm from './TransactionForm';
import TransactionList from './TransactionList';
import { api } from '../services/api';

export default function Dashboard({ onLogout }) {
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const fetchTransactions = async () => {
    setIsLoading(true);
    setError('');
    try {
      const data = await api.getTransactions();
      setTransactions(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.message === 'SESSION_EXPIRED') {
        onLogout();
        return;
      }
      setError('Unable to fetch transactions. Make sure the Spring Boot backend is running.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  const handleAdd = async (newTx) => {
    setIsLoading(true);
    setError('');
    try {
      await api.addTransaction(newTx);
      setSuccess('Transaction added successfully!');
      setTimeout(() => setSuccess(''), 3000);
      await fetchTransactions();
    } catch (err) {
      if (err.message === 'SESSION_EXPIRED') {
        onLogout();
        return;
      }
      setError(err.message || 'Failed to add transaction.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this transaction?')) return;
    setIsLoading(true);
    setError('');
    try {
      await api.deleteTransaction(id);
      setSuccess('Transaction deleted.');
      setTimeout(() => setSuccess(''), 3000);
      await fetchTransactions();
    } catch (err) {
      if (err.message === 'SESSION_EXPIRED') {
        onLogout();
        return;
      }
      setError(err.message || 'Failed to delete transaction.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {error && (
        <div className="alert alert-error">
          <span>{error}</span>
          <button className="btn-close" onClick={() => setError('')}>&times;</button>
        </div>
      )}

      {success && (
        <div className="alert alert-success">
          <span>{success}</span>
          <button className="btn-close" onClick={() => setSuccess('')}>&times;</button>
        </div>
      )}

      <SummaryCards transactions={transactions} />

      <div className="dashboard-grid">
        <TransactionForm onAddTransaction={handleAdd} isLoading={isLoading} />
        <TransactionList transactions={transactions} onDelete={handleDelete} isLoading={isLoading} />
      </div>
    </div>
  );
}
