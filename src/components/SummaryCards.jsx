import React from 'react';

export default function SummaryCards({ transactions }) {
  const formatRupees = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2
    }).format(amount || 0);
  };

  const totalIncome = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const netBalance = totalIncome - totalExpense;

  return (
    <div className="summary-grid">
      <div className="card summary-card">
        <div className="card-icon icon-income">📈</div>
        <div className="card-meta">
          <span className="card-title">Total Income</span>
          <span className="card-value income-color">+{formatRupees(totalIncome)}</span>
        </div>
      </div>

      <div className="card summary-card">
        <div className="card-icon icon-expense">📉</div>
        <div className="card-meta">
          <span className="card-title">Total Expenses</span>
          <span className="card-value expense-color">-{formatRupees(totalExpense)}</span>
        </div>
      </div>

      <div className="card summary-card">
        <div className="card-icon icon-balance">💰</div>
        <div className="card-meta">
          <span className="card-title">Net Balance</span>
          <span className={`card-value ${netBalance >= 0 ? 'balance-color' : 'expense-color'}`}>
            {formatRupees(netBalance)}
          </span>
        </div>
      </div>
    </div>
  );
}
