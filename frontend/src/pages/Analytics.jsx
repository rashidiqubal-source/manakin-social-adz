import React, { useEffect, useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid, BarChart, Bar } from 'recharts';
import { BarChart3, TrendingUp, Eye, MousePointer, DollarSign, Target } from 'lucide-react';
import api from '../services/api';

export default function Analytics() {
  const [data, setData] = useState(null);
  const [period, setPeriod] = useState('7d');

  useEffect(() => {
    fetchAnalytics();
  }, [period]);

  const fetchAnalytics = async () => {
    try {
      const res = await api.get(`/analytics/overview?period=${period}`);
      setData(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  if (!data) return <div className="page-wrapper">Loading Analytics...</div>;

  return (
    <div className="page-wrapper">
      {/* Title Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Cross-Platform Performance Analytics
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Unified view of daily ad performance, impressions, CTR, leads, & ROAS across Meta, Google, Snapchat & X.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {['7d', '30d', '90d'].map((p) => (
            <button 
              key={p} 
              onClick={() => setPeriod(p)}
              className={`btn ${period === p ? 'btn-primary' : 'btn-outline'}`}
              style={{ fontSize: '0.8125rem', padding: '0.4rem 0.875rem' }}
            >
              Last {p}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.25rem', marginBottom: '2rem' }}>
        <div className="card">
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Impressions</span>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.25rem 0' }}>{data.metrics_summary.total_impressions.toLocaleString()}</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 700 }}>+24% vs last period</span>
        </div>

        <div className="card">
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Clicks</span>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.25rem 0' }}>{data.metrics_summary.total_clicks.toLocaleString()}</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 700 }}>CTR: {data.metrics_summary.ctr}</span>
        </div>

        <div className="card">
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>Total Ad Spend</span>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.25rem 0' }}>₹{data.metrics_summary.total_spend.toLocaleString()}</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 500 }}>Budget auto-managed</span>
        </div>

        <div className="card">
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', fontWeight: 600 }}>Average ROAS</span>
          <h3 style={{ fontSize: '1.5rem', fontWeight: 800, margin: '0.25rem 0', color: 'var(--primary-600)' }}>{data.metrics_summary.avg_roas}X</h3>
          <span style={{ fontSize: '0.75rem', color: 'var(--accent-emerald)', fontWeight: 700 }}>₹4.10 return per ₹1 spent</span>
        </div>
      </div>

      {/* Main Performance Area Chart */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.25rem' }}>Daily Impression & Lead Acquisition Trend</h3>
        <div style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer>
            <AreaChart data={data.trend_data}>
              <defs>
                <linearGradient id="colorSpend" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorLeads" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
              <XAxis dataKey="date" stroke="#64748b" />
              <YAxis stroke="#64748b" />
              <Tooltip />
              <Area type="monotone" dataKey="spend" stroke="#4f46e5" fillOpacity={1} fill="url(#colorSpend)" name="Ad Spend (₹)" />
              <Area type="monotone" dataKey="leads" stroke="#10b981" fillOpacity={1} fill="url(#colorLeads)" name="Leads Count" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Channel Share Breakdown */}
      <div className="card">
        <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '1.25rem' }}>Spend & Lead Distribution by Ad Network</h3>
        <div className="table-container">
          <table className="custom-table">
            <thead>
              <tr>
                <th>Ad Network Platform</th>
                <th>Spend (INR ₹)</th>
                <th>Leads Generated</th>
                <th>Platform Share</th>
              </tr>
            </thead>
            <tbody>
              {data.platform_breakdown.map((plat) => (
                <tr key={plat.name}>
                  <td style={{ fontWeight: 700 }}>{plat.name}</td>
                  <td>₹{plat.spend.toLocaleString()}</td>
                  <td style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>{plat.leads}</td>
                  <td>
                    <span className="badge badge-purple">{plat.share}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
