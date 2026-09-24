import React, { useEffect, useState } from 'react';
import { Plus, Megaphone, Sparkles, Filter, CheckCircle2, Play, Pause, RefreshCw } from 'lucide-react';
import api from '../services/api';

export default function Campaigns() {
  const [campaigns, setCampaigns] = useState([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAiModal, setShowAiModal] = useState(false);
  const [loading, setLoading] = useState(false);

  // New Campaign Form
  const [newCamp, setNewCamp] = useState({
    platform: 'meta',
    title: 'Festive Season Leads Campaign 2026',
    objective: 'Lead Generation',
    daily_budget: 800,
    total_budget: 15000
  });

  // AI Objective Wizard Form
  const [aiForm, setAiForm] = useState({
    business_description: 'High quality festive apparel and traditional wear store offering 20% discount.',
    target_city: 'Mumbai & Delhi NCR',
    target_goal: 'Leads & Direct WhatsApp Messages'
  });
  const [aiResult, setAiResult] = useState(null);
  const [aiAnalyzing, setAiAnalyzing] = useState(false);

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await api.get('/campaigns');
      setCampaigns(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateCampaign = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/campaigns', newCamp);
      setShowCreateModal(false);
      fetchCampaigns();
      alert('New ad campaign successfully created!');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRunAiAnalysis = async (e) => {
    e.preventDefault();
    setAiAnalyzing(true);
    try {
      const res = await api.post('/campaigns/ai-analyze', aiForm);
      setAiResult(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setAiAnalyzing(false);
    }
  };

  return (
    <div className="page-wrapper">
      {/* Title & Top Action Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Ad Campaigns Manager
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Launch and monitor campaigns across Meta (FB/IG), Google Ads, Snapchat, & X.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={() => setShowAiModal(true)}>
            <Sparkles size={16} /> AI Objective Wizard
          </button>
          <button className="btn btn-primary" onClick={() => setShowCreateModal(true)}>
            <Plus size={16} /> Create Campaign
          </button>
        </div>
      </div>

      {/* Campaigns Table */}
      <div className="table-container">
        <table className="custom-table">
          <thead>
            <tr>
              <th>Campaign Name</th>
              <th>Platform</th>
              <th>Status</th>
              <th>Daily Budget</th>
              <th>Impressions</th>
              <th>Clicks</th>
              <th>Leads</th>
              <th>Spend</th>
              <th>ROAS</th>
            </tr>
          </thead>
          <tbody>
            {campaigns.map((camp) => (
              <tr key={camp.id}>
                <td>
                  <div style={{ fontWeight: 700, color: 'var(--text-main)' }}>{camp.title}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{camp.objective}</div>
                </td>
                <td>
                  <span className={`badge ${camp.platform === 'meta' ? 'badge-info' : camp.platform === 'google' ? 'badge-danger' : 'badge-purple'}`}>
                    {camp.platform.toUpperCase()}
                  </span>
                </td>
                <td>
                  <span className={`badge ${camp.status === 'active' ? 'badge-success' : 'badge-warning'}`}>
                    {camp.status === 'active' ? <Play size={10} /> : <Pause size={10} />}
                    {camp.status.toUpperCase()}
                  </span>
                </td>
                <td style={{ fontWeight: 600 }}>₹{camp.daily_budget}/day</td>
                <td>{camp.impressions.toLocaleString()}</td>
                <td>{camp.clicks.toLocaleString()}</td>
                <td style={{ fontWeight: 700, color: 'var(--accent-emerald)' }}>{camp.leads_count}</td>
                <td style={{ fontWeight: 600 }}>₹{camp.spend.toLocaleString()}</td>
                <td>
                  <span className="badge badge-success">{camp.roas}X</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Create Campaign Modal */}
      {showCreateModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem' }}>Create Ad Campaign</h2>
            
            <form onSubmit={handleCreateCampaign}>
              <div className="input-group">
                <label>Campaign Title</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={newCamp.title} 
                  onChange={(e) => setNewCamp({ ...newCamp, title: e.target.value })}
                  required 
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label>Ad Platform</label>
                  <select 
                    className="form-control" 
                    value={newCamp.platform}
                    onChange={(e) => setNewCamp({ ...newCamp, platform: e.target.value })}
                  >
                    <option value="meta">Meta (Facebook & Instagram)</option>
                    <option value="google">Google Search & YouTube</option>
                    <option value="snapchat">Snapchat Ads</option>
                    <option value="twitter">X (Twitter) Ads</option>
                  </select>
                </div>

                <div className="input-group">
                  <label>Campaign Objective</label>
                  <select 
                    className="form-control" 
                    value={newCamp.objective}
                    onChange={(e) => setNewCamp({ ...newCamp, objective: e.target.value })}
                  >
                    <option value="Lead Generation">Lead Generation & WhatsApp</option>
                    <option value="Catalog Sales">Catalog & Website Conversions</option>
                    <option value="Brand Awareness">Brand Awareness & Reach</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label>Daily Budget (INR ₹)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={newCamp.daily_budget} 
                    onChange={(e) => setNewCamp({ ...newCamp, daily_budget: Number(e.target.value) })}
                    required 
                  />
                </div>

                <div className="input-group">
                  <label>Total Budget Limit (INR ₹)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    value={newCamp.total_budget} 
                    onChange={(e) => setNewCamp({ ...newCamp, total_budget: Number(e.target.value) })}
                    required 
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowCreateModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? 'Publishing...' : 'Publish Campaign'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* AI Business Objective Wizard Modal */}
      {showAiModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '650px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
              <Sparkles color="var(--primary-600)" size={24} />
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>AI Business Objective Analyzer</h2>
            </div>

            <form onSubmit={handleRunAiAnalysis}>
              <div className="input-group">
                <label>Business / Offer Description</label>
                <textarea 
                  className="form-control" 
                  rows={3} 
                  value={aiForm.business_description}
                  onChange={(e) => setAiForm({ ...aiForm, business_description: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label>Target Location / Cities</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={aiForm.target_city}
                    onChange={(e) => setAiForm({ ...aiForm, target_city: e.target.value })}
                  />
                </div>
                <div className="input-group">
                  <label>Primary Result</label>
                  <input 
                    type="text" 
                    className="form-control" 
                    value={aiForm.target_goal}
                    onChange={(e) => setAiForm({ ...aiForm, target_goal: e.target.value })}
                  />
                </div>
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.5rem' }} disabled={aiAnalyzing}>
                {aiAnalyzing ? 'Analyzing Audience Data...' : 'Generate Audience Recommendation'}
              </button>
            </form>

            {aiResult && (
              <div style={{ marginTop: '1.5rem', padding: '1.25rem', background: 'var(--primary-50)', borderRadius: 'var(--border-radius-md)', border: '1px solid #c7d2fe' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <span style={{ fontWeight: 800, color: 'var(--primary-700)', fontSize: '0.9375rem' }}>Optimization Score</span>
                  <span className="badge badge-success">{aiResult.score}% Match</span>
                </div>

                <p style={{ fontSize: '0.8125rem', color: 'var(--text-main)', marginBottom: '1rem', fontWeight: 600 }}>
                  {aiResult.ai_recommendation}
                </p>

                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  <strong>Target Audiences:</strong> {aiResult.suggested_audience.join(', ')}
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
              <button className="btn btn-outline" onClick={() => setShowAiModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
