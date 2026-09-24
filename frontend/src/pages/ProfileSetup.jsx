import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Building2, Rocket, Check, ArrowRight, ArrowLeft } from 'lucide-react';
import api from '../services/api';

export default function ProfileSetup() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    first_name: 'Rashid',
    last_name: 'Iqubal',
    email: 'mdrashidiqubal@socialadz.co',
    name: 'Manakin Social Adz Store',
    category: 'E-Commerce & Retail',
    monthly_budget: '₹25,000 - ₹50,000',
    description: 'Leading digital apparel and lifestyle brand in India.',
    gst_number: '27AAAAA0000A1Z5',
    website: 'https://socialadz.co',
    city: 'Mumbai',
    preferred_platform: 'both'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNextStep1 = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/onboarding/step1', {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email
      });
      setCurrentStep(2);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleNextStep2 = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/onboarding/step2', {
        name: formData.name,
        category: formData.category,
        monthly_budget: formData.monthly_budget,
        description: formData.description,
        gst_number: formData.gst_number,
        website: formData.website,
        city: formData.city
      });
      setCurrentStep(3);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleFinishOnboarding = async () => {
    setLoading(true);
    try {
      await api.post('/onboarding/step3', {
        preferred_platform: formData.preferred_platform
      });
      navigate('/dashboard');
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper" style={{ maxWidth: '800px', margin: '2rem auto' }}>
      {/* Header Stepper Banner */}
      <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)', marginBottom: '0.5rem' }}>
          Complete Business Setup
        </h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
          Setup your business profile to activate multi-channel ad launching & AI budget allocation.
        </p>
      </div>

      {/* Visual 3-Step Wizard Progress Bar */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'between', marginBottom: '2.5rem', position: 'relative' }}>
        <div style={{ position: 'absolute', top: '20px', left: '15%', right: '15%', height: '2px', background: 'var(--border-color)', zIndex: 1 }}>
          <div style={{
            height: '100%',
            background: 'var(--primary-500)',
            width: currentStep === 1 ? '0%' : currentStep === 2 ? '50%' : '100%',
            transition: 'width 0.3s ease'
          }}></div>
        </div>

        {[
          { num: 1, title: 'About You', icon: User },
          { num: 2, title: 'Business Details', icon: Building2 },
          { num: 3, title: 'Get Started', icon: Rocket }
        ].map((step) => {
          const Icon = step.icon;
          const isDone = currentStep > step.num;
          const isCurrent = currentStep === step.num;

          return (
            <div key={step.num} style={{ flex: 1, textAlign: 'center', position: 'relative', zIndex: 2 }}>
              <div style={{
                width: '42px',
                height: '42px',
                borderRadius: '50%',
                background: isDone ? 'var(--accent-emerald)' : isCurrent ? 'var(--primary-500)' : '#ffffff',
                color: isDone || isCurrent ? '#ffffff' : 'var(--text-muted)',
                border: isDone || isCurrent ? 'none' : '2px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                margin: '0 auto 0.5rem',
                boxShadow: isCurrent ? '0 0 15px rgba(79, 70, 229, 0.4)' : 'none',
                transition: 'all 0.2s'
              }}>
                {isDone ? <Check size={20} /> : <Icon size={20} />}
              </div>
              <span style={{ fontSize: '0.8125rem', fontWeight: isCurrent ? 700 : 500, color: isCurrent ? 'var(--primary-600)' : 'var(--text-muted)' }}>
                Step {step.num}: {step.title}
              </span>
            </div>
          );
        })}
      </div>

      {/* Step Content Container */}
      <div className="card" style={{ padding: '2.5rem' }}>
        {currentStep === 1 && (
          <form onSubmit={handleNextStep1}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              Step 1: Personal Information
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label>First Name</label>
                <input type="text" name="first_name" className="form-control" value={formData.first_name} onChange={handleChange} required />
              </div>
              <div className="input-group">
                <label>Last Name</label>
                <input type="text" name="last_name" className="form-control" value={formData.last_name} onChange={handleChange} required />
              </div>
            </div>

            <div className="input-group">
              <label>Work Email Address</label>
              <input type="email" name="email" className="form-control" value={formData.email} onChange={handleChange} required />
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '2rem' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                Continue to Business Details <ArrowRight size={16} />
              </button>
            </div>
          </form>
        )}

        {currentStep === 2 && (
          <form onSubmit={handleNextStep2}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              Step 2: Business & Ad Preferences
            </h3>

            <div className="input-group">
              <label>Business Name</label>
              <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} required />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label>Industry Category</label>
                <select name="category" className="form-control" value={formData.category} onChange={handleChange}>
                  <option value="E-Commerce & Retail">E-Commerce & Retail</option>
                  <option value="Local Services & Business">Local Services & Business</option>
                  <option value="Education & Coaching">Education & Coaching</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Health & Beauty">Health & Beauty</option>
                  <option value="Food & Restaurants">Food & Restaurants</option>
                </select>
              </div>

              <div className="input-group">
                <label>Monthly Ad Budget</label>
                <select name="monthly_budget" className="form-control" value={formData.monthly_budget} onChange={handleChange}>
                  <option value="₹5,000 - ₹10,000">₹5,000 - ₹10,000</option>
                  <option value="₹10,000 - ₹25,000">₹10,000 - ₹25,000</option>
                  <option value="₹25,000 - ₹50,000">₹25,000 - ₹50,000</option>
                  <option value="₹50,000 - ₹1,000,000+">₹50,000 - ₹1,000,000+</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="input-group">
                <label>City / Location</label>
                <input type="text" name="city" className="form-control" value={formData.city} onChange={handleChange} />
              </div>

              <div className="input-group">
                <label>Website URL (Optional)</label>
                <input type="text" name="website" className="form-control" value={formData.website} onChange={handleChange} />
              </div>
            </div>

            <div className="input-group">
              <label>Business Description</label>
              <textarea name="description" className="form-control" rows={3} value={formData.description} onChange={handleChange}></textarea>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
              <button type="button" className="btn btn-outline" onClick={() => setCurrentStep(1)}>
                <ArrowLeft size={16} /> Back
              </button>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                Continue to Platform Selection <ArrowRight size={16} />
              </button>
            </div>
          </form>
        )}

        {currentStep === 3 && (
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.75rem' }}>
              Step 3: Choose Primary Advertising Channels
            </h3>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
              {[
                { id: 'meta', title: 'Meta Ads', desc: 'Facebook & Instagram Visual Ads', icon: '🔵' },
                { id: 'google', title: 'Google Ads', desc: 'Google Search & YouTube Video', icon: '🔴' },
                { id: 'both', title: 'Meta + Google', desc: 'All-in-One Multi-Channel Suite', icon: '⚡' }
              ].map((plat) => (
                <div 
                  key={plat.id}
                  onClick={() => setFormData({ ...formData, preferred_platform: plat.id })}
                  style={{
                    padding: '1.5rem',
                    borderRadius: 'var(--border-radius-md)',
                    border: formData.preferred_platform === plat.id ? '2px solid var(--primary-500)' : '1px solid var(--border-color)',
                    background: formData.preferred_platform === plat.id ? 'var(--primary-50)' : '#ffffff',
                    cursor: 'pointer',
                    textAlign: 'center',
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>{plat.icon}</div>
                  <h4 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)', marginBottom: '0.25rem' }}>{plat.title}</h4>
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{plat.desc}</p>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
              <button type="button" className="btn btn-outline" onClick={() => setCurrentStep(2)}>
                <ArrowLeft size={16} /> Back
              </button>
              <button type="button" className="btn btn-primary" onClick={handleFinishOnboarding} disabled={loading}>
                {loading ? 'Activating Profile...' : 'Complete & Open Dashboard 🎉'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
