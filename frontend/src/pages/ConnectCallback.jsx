import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle2, AlertCircle, Loader2, ArrowLeft } from 'lucide-react';
import api from '../services/api';

export default function ConnectCallback() {
  const { platform } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    handleOAuthCallback();
  }, [platform]);

  const handleOAuthCallback = async () => {
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    if (error) {
      setLoading(false);
      setErrorMsg(errorDescription || `Authorization was declined by ${platform?.toUpperCase() || 'OAuth'}.`);
      return;
    }

    if (platform === 'meta') {
      if (!code) {
        setLoading(false);
        setErrorMsg('No authorization code was received from Facebook.');
        return;
      }

      try {
        const redirectUri = `${window.location.origin}/connect-callback/meta`;
        const res = await api.post('/oauth/meta/callback', {
          code: code,
          redirect_uri: redirectUri
        });

        setLoading(false);
        setSuccessMsg(res.data.message || `Successfully connected Facebook Page: ${res.data.page_name}!`);

        setTimeout(() => {
          navigate('/dashboard');
        }, 2200);
      } catch (err) {
        setLoading(false);
        setErrorMsg(err.response?.data?.detail || 'Failed to exchange authorization code with Meta Graph API.');
      }
      return;
    }

    // Generic sandbox callback for other platforms
    try {
      await api.post('/oauth/connect', {
        platform: platform || 'meta',
        account_name: `${(platform || 'meta').toUpperCase()} Verified Business Account`
      });
      setLoading(false);
      setSuccessMsg(`Successfully connected your ${platform?.toUpperCase()} account!`);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setLoading(false);
      setErrorMsg('Failed to complete ad account connection.');
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
      <div className="card" style={{ maxWidth: '480px', width: '100%', textAlign: 'center', padding: '2.5rem' }}>
        
        {loading ? (
          <div>
            <div style={{ color: '#1877F2', marginBottom: '1.25rem', display: 'flex', justifyContent: 'center' }}>
              <Loader2 size={44} className="spin" style={{ animation: 'spin 1s linear infinite' }} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Connecting to {platform?.toUpperCase()}...
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
              Verifying permissions and establishing secure connection with Facebook Graph API.
            </p>
          </div>
        ) : errorMsg ? (
          <div>
            <div style={{ color: '#dc2626', marginBottom: '1.25rem' }}>
              <AlertCircle size={48} style={{ margin: '0 auto' }} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem', color: '#991b1b' }}>
              Connection Failed
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#7f1d1d', background: '#fef2f2', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', lineHeight: 1.5 }}>
              {errorMsg}
            </p>
            <button 
              className="btn btn-outline" 
              onClick={() => navigate('/dashboard')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <ArrowLeft size={14} /> Return to Dashboard
            </button>
          </div>
        ) : (
          <div>
            <div style={{ color: 'var(--accent-emerald)', marginBottom: '1.25rem' }}>
              <CheckCircle2 size={48} style={{ margin: '0 auto' }} />
            </div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem', color: '#14532d' }}>
              Meta Authorization Confirmed!
            </h2>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
              {successMsg}
            </p>
            <p style={{ fontSize: '0.75rem', color: '#6b7280' }}>
              Redirecting you back to dashboard in a moment...
            </p>
          </div>
        )}

      </div>
    </div>
  );
}
