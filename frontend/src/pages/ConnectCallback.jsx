import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle2, RefreshCw } from 'lucide-react';
import api from '../services/api';

export default function ConnectCallback() {
  const { platform } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState('Linking ad account credentials...');

  useEffect(() => {
    confirmConnect();
  }, [platform]);

  const confirmConnect = async () => {
    try {
      await api.post('/oauth/connect', {
        platform: platform || 'meta',
        account_name: `${(platform || 'meta').toUpperCase()} Verified Business Ad Account`
      });
      setStatus(`Successfully connected your ${platform?.toUpperCase()} Ad Account!`);
      setTimeout(() => {
        navigate('/dashboard');
      }, 1500);
    } catch (err) {
      setStatus('Failed to connect ad account.');
    }
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="card" style={{ maxWidth: '450px', textAlign: 'center', padding: '2.5rem' }}>
        <div style={{ color: 'var(--accent-emerald)', marginBottom: '1rem' }}>
          <CheckCircle2 size={48} style={{ margin: '0 auto' }} />
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>OAuth Authorization Confirmed</h2>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{status}</p>
      </div>
    </div>
  );
}
