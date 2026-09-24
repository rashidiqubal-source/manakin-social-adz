import React, { useEffect, useState } from 'react';
import { Download, RefreshCw, Users, Phone, Mail, MapPin, CheckCircle, Clock } from 'lucide-react';
import api from '../services/api';

export default function Leads() {
  const [leads, setLeads] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    fetchLeads();
  }, [statusFilter]);

  const fetchLeads = async () => {
    try {
      const res = await api.get(`/leads?status=${statusFilter}`);
      setLeads(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleStatusChange = async (leadId, newStatus) => {
    try {
      await api.put(`/leads/${leadId}/status`, { status: newStatus });
      fetchLeads();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSyncLeads = async () => {
    setSyncing(true);
    try {
      const res = await api.post('/leads/sync');
      alert(res.data.message);
      fetchLeads();
    } catch (err) {
      console.error(err);
    } finally {
      setSyncing(false);
    }
  };

  const handleExportCSV = () => {
    window.open('http://localhost:8000/api/v1/leads/export', '_blank');
  };

  return (
    <div className="page-wrapper">
      {/* Title Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Unified Leads CRM Pipeline
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Automated lead capture & WhatsApp CRM from Facebook, Instagram, Google Ads & Snapchat.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-outline" onClick={handleExportCSV}>
            <Download size={16} /> Export CSV
          </button>
          <button className="btn btn-primary" onClick={handleSyncLeads} disabled={syncing}>
            <RefreshCw size={16} className={syncing ? "spin" : ""} /> {syncing ? 'Syncing...' : 'Sync Leads Now'}
          </button>
        </div>
      </div>

      {/* Pipeline Filter Bar */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
        {['all', 'new', 'contacted', 'converted', 'closed'].map((st) => (
          <button 
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`btn ${statusFilter === st ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '0.8125rem', padding: '0.4rem 1rem', textTransform: 'capitalize' }}
          >
            {st} Pipeline
          </button>
        ))}
      </div>

      {/* Leads Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Lead Name</th>
              <th>Contact Details</th>
              <th>Location</th>
              <th>Channel Source</th>
              <th>Lead Status</th>
              <th>Captured Date</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{lead.full_name}</div>
                </td>
                <td>
                  <div style={{ fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Phone size={12} color="var(--text-muted)" /> {lead.phone || 'N/A'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '0.375rem' }}>
                    <Mail size={12} /> {lead.email || 'N/A'}
                  </div>
                </td>
                <td>
                  <span style={{ fontSize: '0.8125rem', color: 'var(--text-main)', display: 'inline-flex', alignItems: 'center', gap: '0.25rem' }}>
                    <MapPin size={12} color="var(--text-muted)" /> {lead.city || 'Mumbai'}
                  </span>
                </td>
                <td>
                  <span className={`badge ${lead.platform === 'meta' ? 'badge-info' : lead.platform === 'google' ? 'badge-danger' : 'badge-purple'}`}>
                    {lead.source}
                  </span>
                </td>
                <td>
                  <select 
                    value={lead.status}
                    onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                    style={{
                      padding: '0.375rem 0.625rem',
                      borderRadius: 'var(--border-radius-sm)',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      border: '1px solid var(--border-color)',
                      background: lead.status === 'new' ? '#fef3c7' : lead.status === 'converted' ? '#dcfce7' : '#f8fafc',
                      color: lead.status === 'new' ? '#b45309' : lead.status === 'converted' ? '#15803d' : '#0f172a',
                      cursor: 'pointer'
                    }}
                  >
                    <option value="new">🆕 NEW</option>
                    <option value="contacted">📞 CONTACTED</option>
                    <option value="converted">✅ CONVERTED</option>
                    <option value="closed">❌ CLOSED</option>
                  </select>
                </td>
                <td style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {new Date(lead.created_at).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
