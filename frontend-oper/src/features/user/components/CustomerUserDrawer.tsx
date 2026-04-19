import React, { useState, useEffect } from 'react';
import { Operator, Team } from '../../operator/types';
import { customerApi } from '../api/customerApi';

interface CustomerUserDrawerProps {
  user?: Operator;
  tenantId: string;
  teams: Team[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const CustomerUserDrawer: React.FC<CustomerUserDrawerProps> = ({
  user,
  tenantId,
  teams,
  isOpen,
  onClose,
  onSuccess
}) => {
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    teamId: null as number | null,
    isActive: true
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        username: user.username,
        email: user.email,
        password: '', // Don't show password
        teamId: user.teamId,
        isActive: user.isActive
      });
    } else {
      setFormData({
        username: '',
        email: '',
        password: '',
        teamId: teams.length > 0 ? teams[0].teamId : null,
        isActive: true
      });
    }
  }, [user, teams]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const payload = {
          ...formData,
          tenantId: tenantId,
          roleId: 'ROLE_USER'
      };
      
      if (user) {
          // Implement update API in CustomerManagementService/Controller if needed
          alert('Update User feature to be implemented.');
      } else {
          await customerApi.createUser(payload);
      }
      onSuccess();
    } catch (error) {
      alert('Failed to save user');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`drawer-overlay ${isOpen ? 'open' : ''}`} onClick={onClose}>
      <div className={`drawer-content ${isOpen ? 'open' : ''}`} onClick={e => e.stopPropagation()}>
        <header className="drawer-header">
          <h2>{user ? 'Edit Customer User' : 'Register Customer User'}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </header>

        <form onSubmit={handleSubmit} className="drawer-form">
          <div className="form-group">
            <label className="form-label">Username</label>
            <input 
              className="form-input"
              value={formData.username}
              onChange={e => setFormData({...formData, username: e.target.value})}
              disabled={!!user}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Email</label>
            <input 
              className="form-input"
              type="email"
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              required
            />
          </div>

          {!user && (
            <div className="form-group">
              <label className="form-label">Password</label>
              <input 
                className="form-input"
                type="password"
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                required={!user}
              />
            </div>
          )}

          <div className="form-group">
            <label className="form-label">Customer Team</label>
            <select 
              className="form-input"
              value={formData.teamId || ''}
              onChange={e => setFormData({...formData, teamId: Number(e.target.value)})}
            >
              <option value="">No Team</option>
              {teams.map(t => <option key={t.teamId} value={t.teamId}>{t.name}</option>)}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Account Status</label>
            <div className="status-toggle">
              <button 
                type="button"
                className={`toggle-btn ${formData.isActive ? 'active' : ''}`}
                onClick={() => setFormData({...formData, isActive: true})}
              >
                Enabled
              </button>
              <button 
                type="button"
                className={`toggle-btn ${!formData.isActive ? 'active' : ''}`}
                onClick={() => setFormData({...formData, isActive: false})}
              >
                Disabled
              </button>
            </div>
          </div>

          <div className="drawer-footer">
            <button type="button" className="btn-cancel" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (user ? 'Save Changes' : 'Register User')}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .drawer-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.5); backdrop-filter: blur(4px); opacity: 0; visibility: hidden; transition: all 0.3s; z-index: 4000; }
        .drawer-overlay.open { opacity: 1; visibility: visible; }
        .drawer-content { position: fixed; right: -500px; top: 0; bottom: 0; width: 450px; background: #0f172a; border-left: 1px solid var(--glass-border); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); padding: 40px; }
        .drawer-content.open { right: 0; }
        
        .drawer-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
        .drawer-header h2 { margin: 0; font-size: 1.5rem; color: #fff; }
        .close-btn { background: transparent; border: none; color: #94a3b8; font-size: 2rem; cursor: pointer; }
        
        .drawer-form { display: flex; flex-direction: column; gap: 24px; }
        .form-group { display: flex; flex-direction: column; gap: 8px; }
        .form-label { font-size: 0.85rem; font-weight: 700; color: #94a3b8; text-transform: uppercase; }
        .form-input { padding: 12px 16px; background: rgba(255, 255, 255, 0.04); border: 1px solid var(--glass-border); border-radius: 12px; color: #fff; outline: none; }
        .form-input:focus { border-color: #3b82f6; background: rgba(255, 255, 255, 0.08); }
        
        .status-toggle { display: flex; gap: 8px; }
        .toggle-btn { flex: 1; padding: 10px; border-radius: 10px; border: 1px solid var(--glass-border); background: transparent; color: #94a3b8; cursor: pointer; font-size: 13px; font-weight: 600; }
        .toggle-btn.active { background: rgba(59, 130, 246, 0.1); border-color: #3b82f6; color: #3b82f6; }
        
        .drawer-footer { display: flex; gap: 12px; margin-top: 40px; }
        .btn-cancel { flex: 1; padding: 14px; background: rgba(255, 255, 255, 0.05); border: 1px solid var(--glass-border); border-radius: 12px; color: #fff; font-weight: 700; cursor: pointer; }
        .btn-submit { flex: 2; padding: 14px; background: var(--primary-gradient); border: none; border-radius: 12px; color: #fff; font-weight: 700; cursor: pointer; }
      `}</style>
    </div>
  );
};

export default CustomerUserDrawer;
