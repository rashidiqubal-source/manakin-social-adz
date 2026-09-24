import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Smartphone, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import api from '../services/api';

export default function Login() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('9876543210');
  const [otpSent, setOtpSent] = useState(false);
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      await api.post('/auth/send-otp', { phone });
      setOtpSent(true);
    } catch (err) {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/auth/verify-otp', { phone, otp: otp || '123456' });
      localStorage.setItem('token', res.data.access_token);
      localStorage.setItem('user_id', res.data.user_id);
      if (res.data.onboarding_completed) {
        navigate('/dashboard');
      } else {
        navigate('/profile-setup');
      }
    } catch (err) {
      setError('Invalid OTP code. Please use 123456 for demo bypass.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f8fafc 0%, #edf2f7 100%)',
      padding: '1.5rem'
    }}>
      <div style={{
        maxWidth: '440px',
        width: '100%',
        background: '#ffffff',
        borderRadius: 'var(--border-radius-lg)',
        padding: '2.5rem',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border-color)',
        textAlign: 'center'
      }}>
        {/* Brand Icon */}
        <div style={{
          width: '56px',
          height: '56px',
          borderRadius: '16px',
          background: 'linear-gradient(135deg, #4f46e5, #8b5cf6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontWeight: 800,
          fontSize: '1.75rem',
          margin: '0 auto 1.25rem',
          boxShadow: '0 8px 20px rgba(79, 70, 229, 0.3)'
        }}>
          S
        </div>

        <h1 style={{ fontSize: '1.5rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
          Welcome to Social Adz
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '2rem' }}>
          Log in with your 10-digit mobile number to access your multi-channel ad suite.
        </p>

        {error && (
          <div style={{ padding: '0.75rem', background: '#ffe4e6', color: '#be123c', borderRadius: 'var(--border-radius-sm)', fontSize: '0.8125rem', marginBottom: '1.25rem', fontWeight: 600 }}>
            {error}
          </div>
        )}

        {!otpSent ? (
          <form onSubmit={handleSendOTP}>
            <div className="input-group" style={{ textAlign: 'left' }}>
              <label>Mobile Number</label>
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <span style={{ padding: '0.75rem 0.875rem', background: 'var(--bg-main)', border: '1px solid var(--border-color)', borderRadius: 'var(--border-radius-sm)', fontWeight: 700, fontSize: '0.875rem' }}>+91</span>
                <input 
                  type="text" 
                  className="form-control" 
                  value={phone} 
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="Enter 10-digit phone"
                  required
                />
              </div>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.875rem', marginTop: '0.5rem' }} disabled={loading}>
              {loading ? 'Sending OTP...' : <>Get Verification Code <ArrowRight size={16} /></>}
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP}>
            <div style={{ padding: '0.75rem', background: 'var(--primary-50)', borderRadius: 'var(--border-radius-sm)', fontSize: '0.8125rem', color: 'var(--primary-700)', marginBottom: '1.25rem', fontWeight: 600 }}>
              <ShieldCheck size={16} style={{ display: 'inline', marginRight: '0.375rem' }} />
              OTP sent to +91 {phone}. Demo verification code: <strong>123456</strong>
            </div>

            <div className="input-group" style={{ textAlign: 'left' }}>
              <label>Enter 6-Digit OTP</label>
              <input 
                type="text" 
                className="form-control" 
                value={otp} 
                onChange={(e) => setOtp(e.target.value)}
                placeholder="123456"
                maxLength={6}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.875rem', marginTop: '0.5rem' }} disabled={loading}>
              {loading ? 'Verifying...' : 'Verify & Enter Dashboard'}
            </button>
          </form>
        )}

        <div style={{ marginTop: '2rem', paddingTop: '1.25rem', borderTop: '1px solid var(--border-color)', fontSize: '0.75rem', color: 'var(--text-light)' }}>
          By continuing, you agree to Social Adz Terms of Service & Privacy Policy.
        </div>
      </div>
    </div>
  );
}
