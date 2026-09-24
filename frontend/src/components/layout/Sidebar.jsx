import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  UserCheck, 
  Megaphone, 
  Share2, 
  Users, 
  BarChart3, 
  CreditCard,
  Sparkles,
  ExternalLink
} from 'lucide-react';

export default function Sidebar() {
  const navItems = [
    { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { label: 'Profile Setup', path: '/profile-setup', icon: UserCheck },
    { label: 'Campaigns', path: '/campaigns', icon: Megaphone },
    { label: 'Posts Hub', path: '/posts', icon: Share2 },
    { label: 'Leads CRM', path: '/leads', icon: Users },
    { label: 'Analytics', path: '/analytics', icon: BarChart3 },
    { label: 'Billing & Wallet', path: '/billing', icon: CreditCard },
  ];

  return (
    <aside style={{
      width: '260px',
      background: 'var(--bg-sidebar)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      {/* Brand Header */}
      <div style={{ padding: '1.5rem 1.25rem', borderBottom: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '10px',
          background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontWeight: 'bold',
          fontSize: '1.25rem',
          boxShadow: '0 4px 12px rgba(79, 70, 229, 0.3)'
        }}>
          S
        </div>
        <div>
          <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', lineHeight: 1.2 }}>Social Adz</h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Multi-Channel Ad Suite</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav style={{ padding: '1.25rem 0.875rem', flex: 1, display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderRadius: 'var(--border-radius-sm)',
                textDecoration: 'none',
                fontWeight: 600,
                fontSize: '0.875rem',
                color: isActive ? 'var(--primary-600)' : 'var(--text-muted)',
                background: isActive ? 'var(--primary-50)' : 'transparent',
                transition: 'all 0.15s ease'
              })}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* AI Pro Badge Banner */}
      <div style={{ padding: '1rem', borderTop: '1px solid var(--border-color)' }}>
        <div style={{
          background: 'linear-gradient(135deg, #f0f5ff, #f3e8ff)',
          border: '1px solid #e0eafe',
          borderRadius: 'var(--border-radius-md)',
          padding: '1rem',
          textAlign: 'center'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.375rem', color: '#4f46e5', fontWeight: 700, fontSize: '0.85rem', marginBottom: '0.375rem' }}>
            <Sparkles size={16} /> AI Optimization Engine
          </div>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
            Auto-shifts budget to top converting ad channels.
          </p>
          <a href="https://socialadz.co/learn" target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', fontWeight: 700, color: '#4f46e5', textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
            Learn Strategy <ExternalLink size={12} />
          </a>
        </div>
      </div>
    </aside>
  );
}
