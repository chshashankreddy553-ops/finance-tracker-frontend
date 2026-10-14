import React from 'react';

export default function TransactionList({ transactions, onDelete, isLoading }) {
  const formatRupees = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  return (
    <div className="card">
      <div className="section-title">
        <span>Recent Transactions</span>
        <span className="badge-count">{transactions.length} records</span>
      </div>

      {transactions.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <h4>No transactions yet</h4>
          <p>Add your first income or expense transaction to see it here.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="transaction-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Type</th>
                <th>Category</th>
                <th>Description</th>
                <th>Amount</th>
                <th style={{ textAlign: 'center' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t) => (
                <tr key={t.id}>
                  <td style={{ whiteSpace: 'nowrap' }}>{t.date}</td>
                  <td>
                    <span className={`pill-badge ${t.type === 'INCOME' ? 'pill-income' : 'pill-expense'}`}>
                      {t.type}
                    </span>
                  </td>
                  <td>
                    <span className="pill-category">{t.category}</span>
                  </td>
                  <td>
                    <div className="tx-title">{t.description || '-'}</div>
                  </td>
                  <td style={{ fontWeight: 700 }} className={t.type === 'INCOME' ? 'income-color' : 'expense-color'}>
                    {t.type === 'INCOME' ? '+' : '-'}{formatRupees(t.amount)}
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <button
                      className="btn-delete"
                      onClick={() => onDelete(t.id)}
                      title="Delete transaction"
                      disabled={isLoading}
                    >
                      🗑️
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
