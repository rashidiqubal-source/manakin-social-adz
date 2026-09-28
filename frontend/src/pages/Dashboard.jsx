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
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Send,
  Unlink,
  BookOpen
} from 'lucide-react';
import api from '../services/api';

export default function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    active_campaigns_count: 3,
    total_spend: 18500,
    total_leads: 5,
    avg_cpl: 3700.0,
    connected_platforms: [],
    wallet_balance: 12550
  });

  // Meta specific connection details
  const [metaStatus, setMetaStatus] = useState({
    is_connected: false,
    page_name: null,
    page_id: null,
    app_id_configured: false,
    meta_app_id: null
  });

  const [showMetaModal, setShowMetaModal] = useState(false);
  const [metaModalTab, setMetaModalTab] = useState('oauth'); // 'oauth' | 'manual' | 'guide'
  const [manualForm, setManualForm] = useState({ page_id: '', page_name: '', access_token: '' });
  const [metaLoading, setMetaLoading] = useState(false);
  const [metaFeedback, setMetaFeedback] = useState({ type: '', text: '' });
  const [showTutorial, setShowTutorial] = useState(true);

  useEffect(() => {
    fetchStats();
    fetchMetaStatus();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      setStats(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMetaStatus = async () => {
    try {
      const res = await api.get('/oauth/meta/status');
      setMetaStatus(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleConnectOAuth = async (platform) => {
    if (platform === 'meta') {
      setMetaFeedback({ type: '', text: '' });
      setShowMetaModal(true);
      return;
    }

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

  // Trigger Facebook OAuth Redirect
  const handleInitiateFacebookOAuth = async () => {
    setMetaLoading(true);
    setMetaFeedback({ type: '', text: '' });
    try {
      const res = await api.get('/oauth/meta/auth-url');
      if (!res.data.app_id_configured) {
        setMetaFeedback({
          type: 'warning',
          text: 'Meta App ID is currently set to a placeholder in backend/.env. Please configure your META_APP_ID & META_APP_SECRET in backend/.env, or use the "Manual Page Token" tab to connect immediately using a token from Meta Graph API Explorer.'
        });
        setMetaLoading(false);
        return;
      }
      // Redirect to official Facebook OAuth Dialog
      window.location.href = res.data.auth_url;
    } catch (err) {
      setMetaFeedback({
        type: 'error',
        text: err.response?.data?.detail || 'Failed to start Facebook OAuth flow.'
      });
      setMetaLoading(false);
    }
  };

  // Manual Page Connection (Graph API Explorer token)
  const handleManualMetaConnect = async (e) => {
    e.preventDefault();
    if (!manualForm.page_id || !manualForm.access_token) {
      setMetaFeedback({ type: 'error', text: 'Please provide both Facebook Page ID and Page Access Token.' });
      return;
    }

    setMetaLoading(true);
    setMetaFeedback({ type: '', text: '' });
    try {
      const res = await api.post('/oauth/meta/connect-manual', manualForm);
      setMetaFeedback({ type: 'success', text: res.data.message });
      fetchMetaStatus();
      fetchStats();
      setTimeout(() => {
        setShowMetaModal(false);
      }, 1500);
    } catch (err) {
      setMetaFeedback({
        type: 'error',
        text: err.response?.data?.detail || 'Failed to connect Facebook Page. Check Page ID and Token permissions.'
      });
    } finally {
      setMetaLoading(false);
    }
  };

  // Disconnect Meta Account
  const handleDisconnectMeta = async () => {
    if (!window.confirm('Are you sure you want to disconnect your Meta Facebook Page?')) return;
    setMetaLoading(true);
    try {
      await api.post('/oauth/meta/disconnect');
      await fetchMetaStatus();
      await fetchStats();
      setShowMetaModal(false);
      alert('Meta account disconnected successfully.');
    } catch (err) {
      alert('Failed to disconnect Meta account.');
    } finally {
      setMetaLoading(false);
    }
  };

  // Send Live Test Post to Facebook Page
  const handleTestPost = async () => {
    setMetaLoading(true);
    setMetaFeedback({ type: '', text: '' });
    try {
      const res = await api.post('/oauth/meta/test-post', {
        message: '🚀 Test post from Manakin Social Adz! Verified Facebook Page connection is active.'
      });
      setMetaFeedback({
        type: 'success',
        text: `Post successfully published to Facebook Page! Meta Post ID: ${res.data.post_id}`
      });
    } catch (err) {
      setMetaFeedback({
        type: 'error',
        text: err.response?.data?.detail || 'Could not publish test post. Ensure pages_manage_posts permission is granted.'
      });
    } finally {
      setMetaLoading(false);
    }
  };

  const isMetaConnected = metaStatus.is_connected;

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
          <button className="btn btn-outline" onClick={() => { fetchStats(); fetchMetaStatus(); }}>
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
            <ArrowUpRight size={12} /> Active & tracked
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
            Across Connected Channels
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
            <ArrowUpRight size={12} /> Live Sync Active
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
            Industry Optimized
          </span>
        </div>
      </div>

      {/* Connect Ad Accounts Section Card */}
      <div className="card" style={{ marginBottom: '2rem', padding: '1.5rem', background: 'linear-gradient(180deg, #ffffff 0%, #f8fafc 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)' }}>
              Connect your ad accounts
            </h3>
            <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
              Link your ad network credentials to launch multi-channel campaigns and publish on Facebook & Instagram.
            </p>
          </div>
          <span className={`badge ${isMetaConnected ? 'badge-purple' : 'badge-warning'}`}>
            {isMetaConnected ? 'Meta Active • Ready to Post' : 'Meta Setup Required'}
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '1rem' }}>
          {[
            { id: 'meta', name: 'Meta (FB & IG)', icon: '🔵', desc: 'Facebook & Instagram ads & pages' },
            { id: 'google', name: 'Google Ads', icon: '🔴', desc: 'Search & YouTube video' },
            { id: 'whatsapp', name: 'WhatsApp API', icon: '🟢', desc: 'Direct WhatsApp leads' },
            { id: 'snapchat', name: 'Snapchat Ads', icon: '🟡', desc: 'Story & Spotlight ads' },
            { id: 'twitter', name: 'X (Twitter)', icon: '⚫', desc: 'X Ads & Promoted Tweets' }
          ].map((plat) => {
            const isConnected = plat.id === 'meta' 
              ? isMetaConnected 
              : stats.connected_platforms.includes(plat.id);

            return (
              <div 
                key={plat.id}
                style={{
                  background: '#ffffff',
                  border: isConnected ? '1.5px solid #86efac' : '1px solid var(--border-color)',
                  borderRadius: 'var(--border-radius-md)',
                  padding: '1.1rem',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  boxShadow: isConnected ? '0 4px 12px rgba(34, 197, 94, 0.08)' : 'var(--shadow-sm)',
                  transition: 'all 0.2s'
                }}
              >
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>{plat.icon}</span>
                    {isConnected ? (
                      <span className="badge badge-success" style={{ background: '#dcfce7', color: '#15803d', fontWeight: 700 }}>
                        <CheckCircle2 size={11} style={{ marginRight: '3px' }} />
                        {plat.id === 'meta' ? 'Meta Connected' : 'Connected'}
                      </span>
                    ) : (
                      <span className="badge badge-warning" style={{ background: '#fef3c7', color: '#b45309' }}>
                        Action Required
                      </span>
                    )}
                  </div>
                  <h4 style={{ fontSize: '0.875rem', fontWeight: 700, color: 'var(--text-main)' }}>{plat.name}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.5rem' }}>{plat.desc}</p>
                  
                  {/* If Meta is connected, show page name preview */}
                  {plat.id === 'meta' && isConnected && (
                    <div style={{ 
                      fontSize: '0.7rem', 
                      color: '#047857', 
                      background: '#f0fdf4', 
                      padding: '0.3rem 0.5rem', 
                      borderRadius: '4px',
                      fontWeight: 600,
                      marginBottom: '0.75rem',
                      whiteSpace: 'nowrap',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis'
                    }}>
                      📄 {metaStatus.page_name || 'Facebook Page'}
                    </div>
                  )}
                </div>

                {plat.id === 'meta' ? (
                  <button 
                    onClick={() => handleConnectOAuth('meta')}
                    style={{
                      width: '100%',
                      padding: '0.45rem 0.75rem',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      borderRadius: 'var(--border-radius-sm)',
                      cursor: 'pointer',
                      border: 'none',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.35rem',
                      ...(isConnected 
                        ? { background: '#f0fdf4', color: '#15803d', border: '1px solid #86efac' }
                        : { background: '#1877F2', color: '#ffffff', boxShadow: '0 2px 6px rgba(24, 119, 242, 0.3)' }
                      )
                    }}
                  >
                    {isConnected ? (
                      <>
                        <CheckCircle2 size={13} /> Meta Connected
                      </>
                    ) : (
                      <>
                        Connect to Meta
                      </>
                    )}
                  </button>
                ) : (
                  <button 
                    className={isConnected ? "btn btn-outline" : "btn btn-primary"}
                    onClick={() => handleConnectOAuth(plat.id)}
                    style={{ width: '100%', padding: '0.45rem 0.75rem', fontSize: '0.75rem' }}
                  >
                    {isConnected ? 'Manage Credentials' : 'Connect Account'}
                  </button>
                )}
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
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Publish directly to connected Facebook Page on behalf of user.</p>
            </div>
          </div>
        </div>

        {/* Tutorial Banner */}
        {showTutorial && (
          <div className="card" style={{ background: 'linear-gradient(135deg, #1877F2, #4f46e5)', color: '#ffffff', position: 'relative' }}>
            <button 
              onClick={() => setShowTutorial(false)}
              style={{ position: 'absolute', top: '12px', right: '12px', background: 'transparent', border: 'none', color: '#ffffff', cursor: 'pointer', opacity: 0.8 }}
            >
              ✕
            </button>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              <ShieldCheck size={18} /> Meta Page Integration
            </div>
            <p style={{ fontSize: '0.8125rem', lineHeight: 1.5, opacity: 0.95, marginBottom: '1.25rem' }}>
              Connect your Facebook Business Page to publish posts and launch conversion ads with Meta Graph API.
            </p>
            <button
              onClick={() => { setShowMetaModal(true); setMetaModalTab('guide'); }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.375rem',
                padding: '0.5rem 1rem',
                background: '#ffffff',
                color: '#1877F2',
                borderRadius: 'var(--border-radius-sm)',
                fontWeight: 700,
                fontSize: '0.8125rem',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              View Setup Steps <BookOpen size={14} />
            </button>
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* META CONNECTION MODAL                                          */}
      {/* ============================================================== */}
      {showMetaModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '580px', width: '90%' }}>
            
            {/* Modal Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ 
                  width: '38px', 
                  height: '38px', 
                  borderRadius: '10px', 
                  background: '#1877F2', 
                  color: '#ffffff', 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  fontWeight: 900,
                  fontSize: '1.25rem'
                }}>
                  f
                </div>
                <div>
                  <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0 }}>
                    {isMetaConnected ? 'Meta (Facebook) Account Connected' : 'Connect to Meta (Facebook)'}
                  </h2>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', margin: 0 }}>
                    {isMetaConnected ? 'Manage your connected Facebook Page and permissions' : 'Publish posts to your Facebook Page on behalf of your account'}
                  </p>
                </div>
              </div>
              <button 
                onClick={() => setShowMetaModal(false)}
                style={{ background: 'transparent', border: 'none', fontSize: '1.25rem', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                ✕
              </button>
            </div>

            {/* Alert Messages */}
            {metaFeedback.text && (
              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                fontSize: '0.8125rem',
                lineHeight: 1.4,
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
                background: metaFeedback.type === 'error' ? '#fef2f2' : metaFeedback.type === 'warning' ? '#fffbeb' : '#f0fdf4',
                color: metaFeedback.type === 'error' ? '#991b1b' : metaFeedback.type === 'warning' ? '#92400e' : '#166534',
                border: `1px solid ${metaFeedback.type === 'error' ? '#fecaca' : metaFeedback.type === 'warning' ? '#fde68a' : '#bbf7d0'}`
              }}>
                {metaFeedback.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle2 size={16} />}
                <div>{metaFeedback.text}</div>
              </div>
            )}

            {/* ================= IF ALREADY CONNECTED ================= */}
            {isMetaConnected ? (
              <div>
                <div style={{ 
                  background: '#f8fafc', 
                  border: '1px solid #e2e8f0', 
                  borderRadius: '10px', 
                  padding: '1.25rem', 
                  marginBottom: '1.25rem' 
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Active Facebook Page
                    </span>
                    <span className="badge badge-success" style={{ background: '#dcfce7', color: '#15803d' }}>
                      <CheckCircle2 size={11} style={{ marginRight: '4px' }} /> Meta Connected
                    </span>
                  </div>

                  <div style={{ fontSize: '1.1rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.25rem' }}>
                    {metaStatus.page_name || 'Facebook Business Page'}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontFamily: 'monospace' }}>
                    Page ID: {metaStatus.page_id}
                  </div>

                  <div style={{ marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px dashed #cbd5e1', fontSize: '0.75rem', color: '#475569' }}>
                    <strong>Granted Permissions:</strong> <code>pages_show_list</code>, <code>pages_manage_posts</code>, <code>pages_read_engagement</code>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <button 
                    onClick={handleTestPost}
                    disabled={metaLoading}
                    className="btn btn-primary"
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', width: '100%' }}
                  >
                    <Send size={15} />
                    {metaLoading ? 'Sending test post to Meta...' : 'Send Live Test Post to Facebook Page'}
                  </button>

                  <button 
                    onClick={handleDisconnectMeta}
                    disabled={metaLoading}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      width: '100%',
                      padding: '0.6rem',
                      background: '#fff',
                      color: '#dc2626',
                      border: '1px solid #fecaca',
                      borderRadius: 'var(--border-radius-sm)',
                      fontSize: '0.8125rem',
                      fontWeight: 600,
                      cursor: 'pointer'
                    }}
                  >
                    <Unlink size={14} /> Disconnect Meta Account
                  </button>
                </div>
              </div>
            ) : (
              /* ================= IF NOT CONNECTED ================= */
              <div>
                {/* Tabs */}
                <div style={{ display: 'flex', gap: '0.5rem', borderBottom: '1px solid #e2e8f0', marginBottom: '1.25rem' }}>
                  <button
                    onClick={() => { setMetaModalTab('oauth'); setMetaFeedback({ type: '', text: '' }); }}
                    style={{
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.8125rem',
                      fontWeight: metaModalTab === 'oauth' ? 700 : 500,
                      color: metaModalTab === 'oauth' ? '#1877F2' : 'var(--text-muted)',
                      border: 'none',
                      borderBottom: metaModalTab === 'oauth' ? '2px solid #1877F2' : '2px solid transparent',
                      background: 'transparent',
                      cursor: 'pointer'
                    }}
                  >
                    Facebook Login (OAuth)
                  </button>

                  <button
                    onClick={() => { setMetaModalTab('manual'); setMetaFeedback({ type: '', text: '' }); }}
                    style={{
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.8125rem',
                      fontWeight: metaModalTab === 'manual' ? 700 : 500,
                      color: metaModalTab === 'manual' ? '#1877F2' : 'var(--text-muted)',
                      border: 'none',
                      borderBottom: metaModalTab === 'manual' ? '2px solid #1877F2' : '2px solid transparent',
                      background: 'transparent',
                      cursor: 'pointer'
                    }}
                  >
                    Manual Page Token
                  </button>

                  <button
                    onClick={() => { setMetaModalTab('guide'); setMetaFeedback({ type: '', text: '' }); }}
                    style={{
                      padding: '0.5rem 0.75rem',
                      fontSize: '0.8125rem',
                      fontWeight: metaModalTab === 'guide' ? 700 : 500,
                      color: metaModalTab === 'guide' ? '#1877F2' : 'var(--text-muted)',
                      border: 'none',
                      borderBottom: metaModalTab === 'guide' ? '2px solid #1877F2' : '2px solid transparent',
                      background: 'transparent',
                      cursor: 'pointer'
                    }}
                  >
                    Setup Guide
                  </button>
                </div>

                {/* Tab 1: Facebook OAuth */}
                {metaModalTab === 'oauth' && (
                  <div>
                    <div style={{ 
                      background: '#f8fafc', 
                      borderRadius: '8px', 
                      padding: '1rem', 
                      marginBottom: '1.25rem', 
                      border: '1px solid #e2e8f0',
                      fontSize: '0.8125rem',
                      color: 'var(--text-main)',
                      lineHeight: 1.5
                    }}>
                      <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Requested Meta Scopes:</div>
                      <ul style={{ margin: '0.25rem 0 0 1.25rem', padding: 0, color: 'var(--text-muted)' }}>
                        <li><code>pages_show_list</code>: View your managed Facebook Pages</li>
                        <li><code>pages_manage_posts</code>: Post and edit on behalf of the Page</li>
                        <li><code>pages_read_engagement</code>: Read reactions, comments, and engagement</li>
                        <li><code>public_profile</code>: Verify account identity</li>
                      </ul>
                    </div>

                    <button 
                      onClick={handleInitiateFacebookOAuth}
                      disabled={metaLoading}
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        background: '#1877F2',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: 'var(--border-radius-sm)',
                        fontSize: '0.875rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        boxShadow: '0 4px 12px rgba(24, 119, 242, 0.25)'
                      }}
                    >
                      <span style={{ fontSize: '1.1rem', fontWeight: 900 }}>f</span>
                      {metaLoading ? 'Connecting to Facebook...' : 'Log in with Facebook to Grant Permission'}
                    </button>
                    
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textAlign: 'center', marginTop: '0.75rem' }}>
                      Redirects to official Facebook OAuth dialog. Requires <code>META_APP_ID</code> in <code>backend/.env</code>.
                    </p>
                  </div>
                )}

                {/* Tab 2: Manual Page Token */}
                {metaModalTab === 'manual' && (
                  <form onSubmit={handleManualMetaConnect}>
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                      Quick testing with a Page Access Token generated from <strong>Meta Graph API Explorer</strong>.
                    </p>

                    <div className="input-group">
                      <label style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Facebook Page ID *</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="e.g. 104829104928"
                        value={manualForm.page_id}
                        onChange={(e) => setManualForm({ ...manualForm, page_id: e.target.value })}
                        required
                      />
                    </div>

                    <div className="input-group">
                      <label style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Facebook Page Name (Optional)</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="e.g. My Business Brand"
                        value={manualForm.page_name}
                        onChange={(e) => setManualForm({ ...manualForm, page_name: e.target.value })}
                      />
                    </div>

                    <div className="input-group">
                      <label style={{ fontSize: '0.8125rem', fontWeight: 600 }}>Page Access Token (starts with EAA...) *</label>
                      <textarea 
                        className="form-control" 
                        rows={3}
                        placeholder="Paste your Page Access Token here..."
                        value={manualForm.access_token}
                        onChange={(e) => setManualForm({ ...manualForm, access_token: e.target.value })}
                        required
                      />
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.25rem' }}>
                      <button 
                        type="button" 
                        className="btn btn-outline" 
                        onClick={() => setShowMetaModal(false)}
                      >
                        Cancel
                      </button>
                      <button 
                        type="submit" 
                        className="btn btn-primary"
                        disabled={metaLoading}
                      >
                        {metaLoading ? 'Verifying...' : 'Verify & Connect Facebook Page'}
                      </button>
                    </div>
                  </form>
                )}

                {/* Tab 3: Setup Guide */}
                {metaModalTab === 'guide' && (
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-main)', lineHeight: 1.6, maxHeight: '350px', overflowY: 'auto', paddingRight: '0.5rem' }}>
                    <h4 style={{ fontWeight: 800, marginBottom: '0.5rem' }}>How to create a Meta App for Page Posting</h4>
                    <ol style={{ paddingLeft: '1.25rem', margin: '0 0 1rem 0' }}>
                      <li>Go to <a href="https://developers.facebook.com" target="_blank" rel="noreferrer" style={{ color: '#1877F2', fontWeight: 600 }}>developers.facebook.com</a> and sign in.</li>
                      <li>Click <strong>My Apps</strong> &rarr; <strong>Create App</strong>.</li>
                      <li>Select <strong>Other</strong> &rarr; Choose <strong>Business</strong> type.</li>
                      <li>Add the product <strong>Facebook Login for Business</strong>.</li>
                      <li>In Facebook Login settings, add Redirect URI: <br/><code>http://localhost:5173/connect-callback/meta</code></li>
                      <li>Add required permissions: <code>pages_show_list</code>, <code>pages_manage_posts</code>, <code>pages_read_engagement</code>.</li>
                      <li>Go to <strong>App Settings</strong> &rarr; <strong>Basic</strong>, copy <strong>App ID</strong> & <strong>App Secret</strong> into <code>backend/.env</code>.</li>
                    </ol>

                    <h4 style={{ fontWeight: 800, marginBottom: '0.5rem' }}>Quick Token via Graph API Explorer</h4>
                    <ol style={{ paddingLeft: '1.25rem', margin: 0 }}>
                      <li>Visit <a href="https://developers.facebook.com/tools/explorer" target="_blank" rel="noreferrer" style={{ color: '#1877F2', fontWeight: 600 }}>Graph API Explorer</a>.</li>
                      <li>Under Permissions, add <code>pages_show_list</code> and <code>pages_manage_posts</code>.</li>
                      <li>Click <strong>Generate Access Token</strong> and select your Page from the User or Page dropdown.</li>
                      <li>Copy the Page ID and Page Access Token into the <strong>Manual Page Token</strong> tab above!</li>
                    </ol>
                  </div>
                )}
              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
