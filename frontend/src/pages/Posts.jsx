import React, { useEffect, useState } from 'react';
import { Plus, Share2, Image, Calendar, CheckCircle2, AlertCircle } from 'lucide-react';
import api from '../services/api';

export default function Posts() {
  const [posts, setPosts] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [newPost, setNewPost] = useState({
    platform: 'instagram',
    caption: '🔥 Special offer announcement! Launch your ad campaigns in minutes.',
    media_url: 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=60',
    status: 'published'
  });

  useEffect(() => {
    fetchPosts();
  }, [activeTab]);

  const fetchPosts = async () => {
    try {
      const res = await api.get(`/posts?status=${activeTab}`);
      setPosts(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePost = async (e) => {
    e.preventDefault();
    try {
      await api.post('/posts', newPost);
      setShowModal(false);
      fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="page-wrapper">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.75rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
            Social Posts Hub
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Publish & schedule posts directly to your connected Facebook & Instagram accounts.
          </p>
        </div>

        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Create New Post
        </button>
      </div>

      {/* Filter Tabs matching Screenshot (Draft, Scheduled, Published, Failed) */}
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
            <div style={{ height: '200px', background: '#f1f5f9', position: 'relative' }}>
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
            </div>

            <div style={{ padding: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                <span className={`badge ${post.status === 'published' ? 'badge-success' : 'badge-warning'}`}>
                  {post.status.toUpperCase()}
                </span>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {new Date(post.created_at).toLocaleDateString()}
                </span>
              </div>

              <p style={{ fontSize: '0.875rem', color: 'var(--text-main)', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {post.caption}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Create Post Modal */}
      {showModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem' }}>Create Social Post</h2>
            <form onSubmit={handleCreatePost}>
              <div className="input-group">
                <label>Select Platform</label>
                <select 
                  className="form-control" 
                  value={newPost.platform}
                  onChange={(e) => setNewPost({ ...newPost, platform: e.target.value })}
                >
                  <option value="instagram">Instagram Page</option>
                  <option value="facebook">Facebook Page</option>
                </select>
              </div>

              <div className="input-group">
                <label>Post Caption</label>
                <textarea 
                  className="form-control" 
                  rows={4} 
                  value={newPost.caption}
                  onChange={(e) => setNewPost({ ...newPost, caption: e.target.value })}
                  required 
                />
              </div>

              <div className="input-group">
                <label>Media Image URL</label>
                <input 
                  type="text" 
                  className="form-control" 
                  value={newPost.media_url}
                  onChange={(e) => setNewPost({ ...newPost, media_url: e.target.value })}
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Publish Now</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
