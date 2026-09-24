import React, { useEffect, useState } from 'react';
import { Wallet, Plus, Download, CreditCard, ShieldCheck, ArrowUpRight } from 'lucide-react';
import api from '../services/api';

export default function Billing() {
  const [transactions, setTransactions] = useState([]);
  const [showAddFunds, setShowAddFunds] = useState(false);
  const [amount, setAmount] = useState(5000);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      const res = await api.get('/billing/transactions');
      setTransactions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleAddFunds = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post(`/billing/add-funds?amount=${amount}`);
      setShowAddFunds(false);
      fetchTransactions();
      alert(`₹${amount.toLocaleString()} successfully added to your Ad Wallet!`);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper">
      {/* Title Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Ad Wallet & Billing History
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Manage pre-funded campaign wallet, auto-debit rules, and tax invoices.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowAddFunds(true)}>
          <Plus size={16} /> Add Funds to Wallet
        </button>
      </div>

      {/* Wallet Balance Header Banner */}
      <div style={{
        background: 'linear-gradient(135deg, #4f46e5 0%, #3b82f6 100%)',
        borderRadius: 'var(--border-radius-lg)',
        padding: '2rem',
        color: '#ffffff',
        marginBottom: '2rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: 'var(--shadow-glow)'
      }}>
        <div>
          <span style={{ fontSize: '0.875rem', opacity: 0.9, fontWeight: 500 }}>Available Ad Wallet Balance</span>
          <h2 style={{ fontSize: '2.5rem', fontWeight: 800, margin: '0.25rem 0' }}>₹12,550.00</h2>
          <span style={{ fontSize: '0.8125rem', opacity: 0.85, display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
            <ShieldCheck size={14} /> Secured auto-deduction across Facebook, Instagram, Google & Snapchat
          </span>
        </div>

        <button className="btn btn-outline" style={{ background: '#ffffff', color: '#4f46e5', fontWeight: 700 }} onClick={() => setShowAddFunds(true)}>
          Instant UPI Recharge
        </button>
      </div>

      {/* Billing Transactions Table */}
      <div className="card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.25rem' }}>Billing & Transaction History</h3>
        
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Transaction Description</th>
                <th>Payment Gateway</th>
                <th>Amount (INR)</th>
                <th>Status</th>
                <th>Date & Time</th>
                <th>Invoice</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td>
                    <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{tx.description}</div>
                  </td>
                  <td>
                    <span className="badge badge-purple">{tx.platform}</span>
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--text-main)' }}>₹{tx.amount.toLocaleString()}</td>
                  <td>
                    <span className="badge badge-success">{tx.status.toUpperCase()}</span>
                  </td>
                  <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                    {new Date(tx.created_at).toLocaleString()}
                  </td>
                  <td>
                    <a 
                      href={tx.invoice_url || '#'} 
                      target="_blank" 
                      rel="noreferrer"
                      className="btn btn-outline"
                      style={{ padding: '0.3rem 0.625rem', fontSize: '0.75rem' }}
                    >
                      <Download size={12} /> Tax Invoice PDF
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Funds Modal */}
      {showAddFunds && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem' }}>Instant Ad Wallet Recharge</h2>
            <form onSubmit={handleAddFunds}>
              <div className="input-group">
                <label>Enter Amount (INR ₹)</label>
                <input 
                  type="number" 
                  className="form-control" 
                  value={amount} 
                  onChange={(e) => setAmount(Number(e.target.value))}
                  min={500}
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginBottom: '1.5rem' }}>
                {[2000, 5000, 10000].map((amt) => (
                  <button 
                    key={amt} 
                    type="button" 
                    className="btn btn-outline"
                    onClick={() => setAmount(amt)}
                    style={{ fontSize: '0.8125rem' }}
                  >
                    + ₹{amt.toLocaleString()}
                  </button>
                ))}
              </div>

              <div style={{ padding: '0.875rem', background: 'var(--primary-50)', borderRadius: 'var(--border-radius-sm)', fontSize: '0.8125rem', color: 'var(--primary-700)', marginBottom: '1.5rem' }}>
                💳 Supports Google Pay, PhonePe, Paytm, Razorpay UPI, Net Banking & Credit Cards.
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowAddFunds(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Processing...' : `Pay ₹${amount.toLocaleString()} via UPI`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
