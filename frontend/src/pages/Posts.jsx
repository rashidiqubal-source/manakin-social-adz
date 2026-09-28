import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Plus, 
  Share2, 
  Image, 
  Calendar, 
  CheckCircle2, 
  AlertCircle, 
  ShieldCheck, 
  ExternalLink,
  Send,
  Loader2 
} from 'lucide-react';
import api from '../services/api';

export default function Posts() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  
  const [metaStatus, setMetaStatus] = useState({
    is_connected: false,
    page_name: null,
    page_id: null
  });

  const [newPost, setNewPost] = useState({
    platform: 'facebook',
    caption: '🔥 Exciting update! Launch your multi-channel marketing campaigns in minutes with Social Adz.',
    media_url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=60',
    status: 'published',
    publish_to_meta: true
  });

  useEffect(() => {
    fetchPosts();
    fetchMetaStatus();
  }, [activeTab]);

  const fetchPosts = async () => {
    try {
      const res = await api.get(`/posts?status=${activeTab}`);
      setPosts(res.data);
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

  const handleCreatePost = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');

    try {
      const res = await api.post('/posts', newPost);
      setIsSubmitting(false);

      if (res.data.status === 'failed' && res.data.error_message) {
        setFormError(res.data.error_message);
        fetchPosts();
      } else {
        setShowModal(false);
        fetchPosts();
        if (res.data.meta_post_id) {
          alert(`Post successfully published to Facebook Page! Meta Post ID: ${res.data.meta_post_id}`);
        }
      }
    } catch (err) {
      setIsSubmitting(false);
      setFormError(err.response?.data?.detail || 'Failed to create and publish post.');
    }
  };

  return (
    <div className="page-wrapper">
      {/* Title Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Social Posts Hub
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Publish & schedule posts directly to your connected Facebook Page on behalf of your connected user.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => { setShowModal(true); setFormError(''); }}>
          <Plus size={16} /> Create New Post
        </button>
      </div>

      {/* Meta Connection Status Alert Bar */}
      <div style={{ 
        marginBottom: '1.5rem', 
        padding: '0.9rem 1.25rem', 
        borderRadius: 'var(--border-radius-md)', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        background: metaStatus.is_connected ? '#f0fdf4' : '#fffbeb',
        border: `1px solid ${metaStatus.is_connected ? '#bbf7d0' : '#fde68a'}`,
        color: metaStatus.is_connected ? '#166534' : '#92400e'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {metaStatus.is_connected ? <CheckCircle2 size={18} /> : <AlertCircle size={18} />}
          <div>
            <div style={{ fontSize: '0.875rem', fontWeight: 700 }}>
              {metaStatus.is_connected 
                ? `Meta Connected: Active Page "${metaStatus.page_name || 'Facebook Page'}"`
                : 'Meta is Not Connected'}
            </div>
            <div style={{ fontSize: '0.75rem', opacity: 0.9 }}>
              {metaStatus.is_connected
                ? `Page ID: ${metaStatus.page_id} • Posts selected for Facebook will publish directly to this page.`
                : 'Connect your Facebook Page from the Dashboard to enable automated publishing on behalf of your user.'}
            </div>
          </div>
        </div>

        {!metaStatus.is_connected && (
          <button 
            className="btn btn-outline"
            onClick={() => navigate('/dashboard')}
            style={{ fontSize: '0.75rem', padding: '0.4rem 0.75rem', background: '#fff' }}
          >
            Connect to Meta
          </button>
        )}
      </div>

      {/* Filter Tabs */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
        {['all', 'published', 'scheduled', 'draft', 'failed'].map((tab) => (
          <button 
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`btn ${activeTab === tab ? 'btn-primary' : 'btn-outline'}`}
            style={{ fontSize: '0.8125rem', padding: '0.4rem 1rem', textTransform: 'capitalize' }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Posts Grid Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem' }}>
        {posts.map((post) => (
          <div key={post.id} className="card card-hover" style={{ padding: '0', overflow: 'hidden' }}>
            <div style={{ height: '190px', background: '#f1f5f9', position: 'relative' }}>
              <img 
                src={post.media_url} 
                alt="Post Media" 
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
              />
              <span 
                className={`badge ${post.platform === 'instagram' ? 'badge-purple' : 'badge-info'}`}
                style={{ position: 'absolute', top: '12px', left: '12px' }}
              >
                {post.platform.toUpperCase()}
              </span>

              {post.meta_post_id && (
                <span 
                  className="badge badge-success"
                  style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(21, 128, 61, 0.9)', color: '#fff' }}
                >
                  Meta Live 🚀
                </span>
              )}
            </div>

            <div style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span className={`badge ${
                  post.status === 'published' 
                    ? 'badge-success' 
                    : post.status === 'failed' 
                    ? 'badge-warning' 
                    : 'badge-purple'
                }`}>
                  {post.status.toUpperCase()}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
              </div>

              <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', marginBottom: '0.75rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {post.caption}
              </p>

              {post.meta_post_id && (
                <div style={{ fontSize: '0.7rem', color: '#15803d', fontFamily: 'monospace', background: '#f0fdf4', padding: '0.3rem 0.5rem', borderRadius: '4px' }}>
                  Meta Post ID: {post.meta_post_id}
                </div>
              )}

              {post.error_message && (
                <div style={{ fontSize: '0.7rem', color: '#b91c1c', background: '#fef2f2', padding: '0.4rem 0.5rem', borderRadius: '4px', marginTop: '0.5rem', lineHeight: 1.3 }}>
                  <strong>Error:</strong> {post.error_message}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Create Post Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '520px', width: '90%' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>Create Social Post</h2>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '1.25rem' }}>
              Publish live to your Facebook Page or schedule for your marketing audience.
            </p>

            {formError && (
              <div style={{
                padding: '0.75rem',
                borderRadius: '8px',
                marginBottom: '1rem',
                background: '#fef2f2',
                border: '1px solid #fecaca',
                color: '#991b1b',
                fontSize: '0.8125rem'
              }}>
                <div style={{ fontWeight: 700, marginBottom: '0.25rem' }}>Publishing Notice</div>
                <div>{formError}</div>
              </div>
            )}

            <form onSubmit={handleCreatePost}>
              <div className="input-group">
                <label>Select Target Platform</label>
                <select 
                  className="form-control" 
                  value={newPost.platform}
                  onChange={(e) => setNewPost({ ...newPost, platform: e.target.value })}
                >
                  <option value="facebook">Facebook Page (Meta Graph API)</option>
                  <option value="instagram">Instagram Page</option>
                </select>
              </div>

              {newPost.platform === 'facebook' && (
                <div style={{ 
                  marginBottom: '1rem', 
                  padding: '0.75rem', 
                  borderRadius: '6px', 
                  fontSize: '0.75rem',
                  background: metaStatus.is_connected ? '#f0fdf4' : '#fffbeb',
                  border: `1px solid ${metaStatus.is_connected ? '#bbf7d0' : '#fde68a'}`,
                  color: metaStatus.is_connected ? '#166534' : '#92400e'
                }}>
                  {metaStatus.is_connected ? (
                    <div>
                      ✅ Will publish live to <strong>{metaStatus.page_name || 'Facebook Page'}</strong>
                    </div>
                  ) : (
                    <div>
                      ⚠️ Meta account is not connected. Connect in Dashboard to publish live on Facebook.
                    </div>
                  )}
                </div>
              )}

              <div className="input-group">
                <label>Post Caption *</label>
                <textarea 
                  className="form-control" 
                  rows={4} 
                  value={newPost.caption}
                  onChange={(e) => setNewPost({ ...newPost, caption: e.target.value })}
                  placeholder="Write your post content..."
                  required 
                />
              </div>

              <div className="input-group">
                <label>Media Image URL (Optional)</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={newPost.media_url}
                  onChange={(e) => setNewPost({ ...newPost, media_url: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                <input 
                  type="checkbox" 
                  id="publishMeta"
                  checked={newPost.publish_to_meta}
                  onChange={(e) => setNewPost({ ...newPost, publish_to_meta: e.target.checked })}
                />
                <label htmlFor="publishMeta" style={{ fontSize: '0.8125rem', color: 'var(--text-main)', cursor: 'pointer' }}>
                  Publish directly to connected Meta Facebook Page via Graph API
                </label>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button 
                  type="button" 
                  className="btn btn-outline" 
                  onClick={() => setShowModal(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="btn btn-primary"
                  disabled={isSubmitting}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={14} className="spin" /> Publishing to Meta...
                    </>
                  ) : (
                    <>
                      <Send size={14} /> Publish Now
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
