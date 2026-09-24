import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Megaphone, 
  TrendingUp, 
  Users, 
  DollarSign, 
  CheckCircle2, 
  PlusCircle, 
  Share2, 
  RefreshCw, 
  ArrowUpRight, 
  Sparkles,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import api from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    active_campaigns_count: 4,
    total_spend: 24500,
    total_leads: 148,
    avg_cpl: 165.5,
    connected_platforms: ['meta', 'google', 'whatsapp', 'snapchat', 'twitter'],
    wallet_balance: 12550
  });

  const [showTutorial, setShowTutorial] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleConnectOAuth = async (platform) => {
    try {
      await api.post('/oauth/connect', {
        platform: platform,
        account_name: `Connected ${platform.toUpperCase()} Ad Account`
      });
      fetchStats();
      alert(`Successfully linked your ${platform.toUpperCase()} ad account!`);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-wrapper">
      {/* Title Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Campaign Dashboard Overview
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Real-time cross-platform metrics across Facebook, Instagram, WhatsApp, Google, Snapchat & X.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-outline" onClick={fetchStats}>
            <RefreshCw size={14} /> Refresh Data
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/campaigns')}>
            <PlusCircle size={16} /> Create Campaign
          </button>
        </div>
      </div>

      {/* Metrics Header Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="card card-hover">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>Active Campaigns</span>
            <div style={{ padding: '0.5rem', borderRadius: '8px', background: 'var(--primary-50)', color: 'var(--primary-600)' }}>
              <Megaphone size={18} />
            </div>
          </div>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
            {stats.active_campaigns_count}
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <ArrowUpRight size={12} /> +2 Launched this week
          </span>
        </div>

        <div className="card card-hover">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>Total Ad Spend</span>
            <div style={{ padding: '0.5rem', borderRadius: '8px', background: '#e0f2fe', color: '#0369a1' }}>
              <DollarSign size={18} />
            </div>
          </div>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
            ₹{stats.total_spend.toLocaleString('en-IN')}
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>
            Across Meta & Google
          </span>
        </div>

        <div className="card card-hover">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>Leads Captured</span>
            <div style={{ padding: '0.5rem', borderRadius: '8px', background: '#dcfce7', color: '#15803d' }}>
              <Users size={18} />
            </div>
          </div>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
            {stats.total_leads}
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <ArrowUpRight size={12} /> +18 Syncs today
          </span>
        </div>

        <div className="card card-hover">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--text-muted)' }}>Avg. Cost Per Lead (CPL)</span>
            <div style={{ padding: '0.5rem', borderRadius: '8px', background: '#f3e8ff', color: '#6b21a8' }}>
              <TrendingUp size={18} />
            </div>
          </div>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
            ₹{stats.avg_cpl}
          </h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 700 }}>
            15% lower than industry avg
          </span>
        </div>
      </div>

      {/* Connect Ad Accounts Section Card (Matching User Screenshot) */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem', background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Connect your ad accounts
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Link your ad network credentials to launch multi-channel campaigns and retrieve leads automatically.
            </p>
          </div>
          <span className="badge badge-purple">Setup • All Platforms Active</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
          {[
            { id: 'meta', name: 'Meta (FB & IG)', icon: '🔵', desc: 'Facebook & Instagram ads' },
            { id: 'google', name: 'Google Ads', icon: '🔴', desc: 'Search & YouTube video' },
            { id: 'whatsapp', name: 'WhatsApp API', icon: '🟢', desc: 'Direct WhatsApp leads' },
            { id: 'snapchat', name: 'Snapchat Ads', icon: '🟡', desc: 'Story & Spotlight ads' },
            { id: 'twitter', name: 'X (Twitter)', icon: '⚫', desc: 'X Ads & Promoted Tweets' }
          ].map((plat) => {
            const isConnected = stats.connected_platforms.includes(plat.id);
            return (
              <div 
                key={plat.id}
                style={{
                  background: '#ffffff',
                  border: isConnected ? '1px solid #c7d2fe' : '1px solid var(--border-color)',
                  borderRadius: 'var(--border-radius-md)',
                  padding: '1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: 'var(--shadow-sm)'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{plat.icon}</span>
                    {isConnected ? (
                      <span className="badge badge-success"><CheckCircle2 size={10} /> Connected</span>
                    ) : (
                      <span className="badge badge-warning">Action Required</span>
                    )}
                  </div>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>{plat.name}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>{plat.desc}</p>
                </div>

                <button 
                  className={isConnected ? "btn btn-outline" : "btn btn-primary"}
                  onClick={() => handleConnectOAuth(plat.id)}
                  style={{ width: '100%', padding: '0.4rem 0.75rem', fontSize: '0.75rem' }}
                >
                  {isConnected ? 'Manage Credentials' : 'Connect Account'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quick Action Hub & Tutorial Tip Banner */}
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1.5rem' }}>
        {/* Quick Launch Actions */}
        <div className="card">
          <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '1rem' }}>
            Quick Workspace Actions
          </h3>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div 
              onClick={() => navigate('/campaigns')}
              style={{
                padding: '1.25rem',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius-md)',
                cursor: 'pointer',
                background: 'var(--primary-50)',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ color: 'var(--primary-600)', marginBottom: '0.5rem' }}>
                <Megaphone size={24} />
              </div>
              <h4 style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '0.25rem' }}>Launch New Ad Campaign</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Use AI target audience wizard to deploy Meta or Google ads.</p>
            </div>

            <div 
              onClick={() => navigate('/posts')}
              style={{
                padding: '1.25rem',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--border-radius-md)',
                cursor: 'pointer',
                background: '#f3e8ff',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ color: '#6b21a8', marginBottom: '0.5rem' }}>
                <Share2 size={24} />
              </div>
              <h4 style={{ fontWeight: 700, fontSize: '0.9375rem', marginBottom: '0.25rem' }}>Create Social Post</h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Publish directly to connected Facebook & Instagram pages.</p>
            </div>
          </div>
        </div>

        {/* Tutorial Banner */}
        {showTutorial && (
          <div className="card" style={{ background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)', color: '#ffffff', position: 'relative' }}>
            <button 
              onClick={() => setShowTutorial(false)}
              style={{ position: 'absolute', top: '12px', right: '12px', background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', opacity: 0.8 }}
            >
              ✕
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              <Sparkles size={18} /> Getting Started Guide
            </div>
            <p style={{ fontSize: '0.8125rem', lineHeight: 1.5, opacity: 0.9, marginBottom: '1.25rem' }}>
              Watch our 2-minute tutorial on how to set up lead retargeting rules and automated WhatsApp lead sync.
            </p>
            <a 
              href="https://socialadz.co/learn" 
              target="_blank" 
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.5rem 1rem',
                background: '#ffffff',
                color: '#4f46e5',
                borderRadius: 'var(--border-radius-sm)',
                fontWeight: 700,
                fontSize: '0.8125rem',
                textDecoration: 'none'
              }}
            >
              Watch Video <ExternalLink size={14} />
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
