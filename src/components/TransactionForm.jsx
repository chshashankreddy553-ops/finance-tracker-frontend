import React, { useState } from 'react';

export default function TransactionForm({ onAddTransaction, isLoading }) {
  const today = new Date().toISOString().slice(0, 10);
  const [formData, setFormData] = useState({
    type: 'EXPENSE',
    category: 'Food',
    amount: '',
    date: today,
    description: ''
  });
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');

    const amt = parseFloat(formData.amount);
    if (!amt || amt <= 0) {
      setError('Please enter an amount greater than 0');
      return;
    }

    if (!formData.date) {
      setError('Please select a valid date');
      return;
    }

    onAddTransaction({
      type: formData.type,
      category: formData.category,
      amount: amt,
      date: formData.date,
      description: formData.description.trim()
    });

    setFormData({
      type: 'EXPENSE',
      category: 'Food',
      amount: '',
      date: today,
      description: ''
    });
  };

  return (
    <div className="card">
      <h3 className="section-title">Add Transaction</h3>

      {error && <div className="alert alert-error">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label htmlFor="tx-type">Type</label>
            <select
              id="tx-type"
              name="type"
              className="form-control"
              value={formData.type}
              onChange={handleChange}
            >
              <option value="EXPENSE">EXPENSE</option>
              <option value="INCOME">INCOME</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="tx-cat">Category</label>
            <select
              id="tx-cat"
              name="category"
              className="form-control"
              value={formData.category}
              onChange={handleChange}
            >
              <option value="Food">Food</option>
              <option value="Travel">Travel</option>
              <option value="Shopping">Shopping</option>
              <option value="Education">Education</option>
              <option value="Bills">Bills</option>
              <option value="Salary">Salary</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor="tx-amount">Amount (₹)</label>
            <input
              id="tx-amount"
              name="amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              className="form-control"
              value={formData.amount}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="tx-date">Date</label>
            <input
              id="tx-date"
              name="date"
              type="date"
              className="form-control"
              value={formData.date}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="tx-desc">Description (Optional)</label>
          <input
            id="tx-desc"
            name="description"
            type="text"
            placeholder="e.g. Dinner with team"
            className="form-control"
            value={formData.description}
            onChange={handleChange}
          />
        </div>

        <button type="submit" className="btn btn-primary" disabled={isLoading}>
          {isLoading ? 'Saving...' : '+ Add Transaction'}
        </button>
      </form>
    </div>
  );
}
