import React, { useState } from 'react';
import { Bell, Wallet, Plus, ChevronDown, CheckCircle2, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const [walletBalance] = useState('₹12,550.00');

  return (
    <header style={{
      height: '68px',
      background: 'var(--bg-header)',
      backdropFilter: 'blur(8px)',
      borderBottom: '1px solid var(--border-color)',
      padding: '0 2rem',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      position: 'sticky',
      top: 0,
      zIndex: 90
    }}>
      {/* Left Active Store / Account Selector */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.625rem',
          padding: '0.5rem 0.875rem',
          background: '#ffffff',
          border: '1px solid var(--border-color)',
          borderRadius: 'var(--border-radius-sm)',
          cursor: 'pointer',
          boxShadow: 'var(--shadow-sm)'
        }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent-emerald)' }}></div>
          <span style={{ fontWeight: 700, fontSize: '0.875rem', color: 'var(--text-main)' }}>Manakin Social Adz Store</span>
          <ChevronDown size={14} color="var(--text-muted)" />
        </div>
        <span className="badge badge-success">
          <CheckCircle2 size={12} /> Accounts Verified
        </span>
      </div>

      {/* Right Header Controls */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        {/* Wallet Balance Widget */}
        <div 
          onClick={() => navigate('/billing')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.5rem 0.875rem',
            background: 'var(--primary-50)',
            border: '1px solid #e0eafe',
            borderRadius: 'var(--border-radius-sm)',
            cursor: 'pointer'
          }}
        >
          <Wallet size={16} color="var(--primary-600)" />
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 500 }}>Ad Wallet:</span>
          <span style={{ fontSize: '0.875rem', fontWeight: 800, color: 'var(--primary-700)' }}>{walletBalance}</span>
        </div>

        {/* Quick Launch Campaign Button */}
        <button className="btn btn-primary" onClick={() => navigate('/campaigns')}>
          <Plus size={16} /> Launch Campaign
        </button>

        {/* Notification Bell */}
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: 'var(--border-radius-sm)',
          border: '1px solid var(--border-color)',
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          position: 'relative'
        }}>
          <Bell size={18} color="var(--text-muted)" />
          <span style={{ position: 'absolute', top: '8px', right: '8px', width: '6px', height: '6px', borderRadius: '50%', background: 'var(--accent-rose)' }}></span>
        </div>

        {/* Profile Avatar */}
        <div 
          onClick={() => navigate('/profile-setup')}
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '50%',
            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#ffffff',
            fontWeight: 700,
            cursor: 'pointer'
          }}
        >
          RI
        </div>
      </div>
    </header>
  );
}
