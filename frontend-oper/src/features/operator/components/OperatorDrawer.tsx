import React, { useState, useEffect } from 'react';
import { operatorApi } from '../api/operatorApi';
import { Operator, OperatorRequest, Team } from '../types';

interface Organization {
  orgId: number;
  name: string;
}

interface OperatorDrawerProps {
  operator?: Operator;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  allTeams: Team[];
  organizations: Organization[];
}

const OperatorDrawer: React.FC<OperatorDrawerProps> = ({ 
  operator, 
  isOpen, 
  onClose, 
  onSuccess,
  allTeams,
  organizations
}) => {
  const isEdit = !!operator;
  
  const [formState, setFormState] = useState<OperatorRequest>({
    username: '',
    email: '',
    roleId: 'ROLE_OPERATOR',
    teamId: null,
    password: '',
    isActive: true
  });
  
  const [orgId, setOrgId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
        if (operator) {
            setFormState({
                username: operator.username,
                email: operator.email,
                roleId: operator.roleId,
                teamId: operator.teamId,
                isActive: operator.isActive,
                password: ''
            });
            const currentTeam = allTeams.find(t => t.teamId === operator.teamId);
            if (currentTeam) setOrgId(currentTeam.orgId);
        } else {
            setFormState({
                username: '',
                email: '',
                roleId: 'ROLE_OPERATOR',
                teamId: null,
                isActive: true,
                password: ''
            });
            setOrgId(null);
        }
    }
  }, [isOpen, operator, allTeams]);

  const filteredTeams = orgId ? allTeams.filter(t => t.orgId === orgId) : allTeams;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormState(prev => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e?: React.SyntheticEvent) => {
    e?.preventDefault();
    setIsSubmitting(true);
    try {
      const payload: OperatorRequest = {
        ...formState,
        username: isEdit ? undefined : formState.username,
        password: formState.password || undefined
      };

      if (isEdit && operator) {
        await operatorApi.updateOperator(operator.memberId, payload);
      } else {
        await operatorApi.createOperator(payload);
      }
      onSuccess();
    } catch (error) {
      alert('Failed to save operator data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer-content glass-panel" onClick={(e) => e.stopPropagation()}>
        <header className="drawer-header">
          <h2 className="drawer-header__title">
            {isEdit ? 'Edit Operator Profile' : 'Register New Member'}
          </h2>
          <button className="btn-close" onClick={onClose}>&times;</button>
        </header>

        <div className="drawer-form">
          <div className="form-group">
            <label className="form-label" htmlFor="username">Operator ID / Username</label>
            <input 
              id="username"
              name="username"
              className="form-input" 
              required 
              disabled={isEdit}
              value={formState.username}
              onChange={handleInputChange}
              placeholder="e.g. operator_dev" 
            />
            {isEdit && <span className="helper-text">Username identifier is permanent.</span>}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="email">Email Address</label>
            <input 
              id="email"
              name="email"
              type="email"
              className="form-input" 
              required
              value={formState.email}
              onChange={handleInputChange}
              placeholder="operator@company.com" 
            />
          </div>

          {organizations.length > 1 && (
            <div className="form-group">
                <label className="form-label" htmlFor="orgId">Organization (Tenant)</label>
                <select 
                    id="orgId"
                    className="form-input"
                    required
                    value={orgId || ''}
                    onChange={e => {
                        setOrgId(Number(e.target.value));
                        setFormState(prev => ({ ...prev, teamId: null }));
                    }}
                >
                    <option value="">Select Organization</option>
                    {organizations.map(org => (
                        <option key={org.orgId} value={org.orgId}>{org.name}</option>
                    ))}
                </select>
            </div>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="teamId">Assigned Team</label>
            <select 
              id="teamId"
              name="teamId"
              className="form-input"
              value={formState.teamId || ''}
              onChange={e => setFormState(prev => ({ ...prev, teamId: e.target.value ? Number(e.target.value) : null }))}
              disabled={organizations.length > 1 && !orgId}
            >
              <option value="">Not Assigned</option>
              {filteredTeams.map(team => (
                <option key={team.teamId} value={team.teamId}>
                  {team.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label">Security Role</label>
            <div className="role-grid">
                <label className={`role-card ${formState.roleId === 'ROLE_OPERATOR' ? 'active' : ''}`}>
                    <input type="radio" name="roleId" value="ROLE_OPERATOR" checked={formState.roleId === 'ROLE_OPERATOR'} onChange={handleInputChange} />
                    <span className="name">Operator</span>
                </label>
                <label className={`role-card ${formState.roleId === 'ROLE_ADMIN' ? 'active' : ''}`}>
                    <input type="radio" name="roleId" value="ROLE_ADMIN" checked={formState.roleId === 'ROLE_ADMIN'} onChange={handleInputChange} />
                    <span className="name">Admin</span>
                </label>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="password">{isEdit ? 'Update Password' : 'Initial Password'}</label>
            <input 
              id="password"
              name="password"
              type="password"
              className="form-input" 
              required={!isEdit}
              value={formState.password}
              onChange={handleInputChange}
              placeholder={isEdit ? 'Leave blank to keep current' : 'Enter login password'} 
            />
          </div>

          <div className="form-group checkbox">
            <label className="checkbox-label" htmlFor="isActive">
              <input 
                id="isActive"
                name="isActive"
                type="checkbox" 
                checked={formState.isActive}
                onChange={handleCheckboxChange}
              />
              Active Account Status
            </label>
          </div>
          
          <div className="drawer-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="button" className="btn-primary" disabled={isSubmitting} onClick={handleSubmit}>
              {isSubmitting ? 'Saving...' : (isEdit ? 'Save Changes' : 'Create Account')}
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .drawer-overlay {
          position: fixed; inset: 0; background: rgba(0, 0, 0, 0.4); backdrop-filter: blur(4px);
          display: flex; justify-content: flex-end; z-index: 2000; animation: fadeIn 0.3s ease-out;
        }
        .drawer-content {
          width: 480px; height: 100%; border-radius: 24px 0 0 24px; border-right: none;
          transform: translateX(0); animation: slideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          display: flex; flex-direction: column; padding: 32px;
        }
        .drawer-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
        .drawer-header__title {
          font-size: 1.5rem; margin: 0; font-weight: 800;
          background: linear-gradient(to right, #fff, #94a3b8);
          -webkit-background-clip: text; -webkit-text-fill-color: transparent;
        }
        .btn-close { background: transparent; border: none; color: white; font-size: 2rem; cursor: pointer; }

        .drawer-form { flex: 1; display: flex; flex-direction: column; overflow-y: auto; }
        .form-group { margin-bottom: 20px; }
        .form-label { display: block; margin-bottom: 8px; color: #94a3b8; font-size: 0.85rem; font-weight: 700; }
        .form-input {
          width: 100%; padding: 12px 16px; background: rgba(255, 255, 255, 0.04);
          border: 1px solid var(--glass-border); border-radius: 12px; color: white; outline: none; transition: all 0.2s;
        }
        .form-input:focus { border-color: var(--primary); background: rgba(255, 255, 255, 0.08); }
        .form-input:disabled { opacity: 0.5; cursor: not-allowed; }

        .role-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .role-card { 
            background: rgba(255,255,255,0.02); border: 1px solid var(--glass-border); padding: 12px; border-radius: 12px;
            display: flex; align-items: center; gap: 10px; cursor: pointer; transition: all 0.2s;
        }
        .role-card.active { background: rgba(59, 130, 246, 0.1); border-color: var(--primary); }
        .role-card .name { font-size: 14px; font-weight: 600; color: #fff; }

        .checkbox-label { display: flex; align-items: center; gap: 10px; color: #f1f5f9; font-size: 14px; cursor: pointer; }
        .helper-text { font-size: 11px; color: #64748b; margin-top: 4px; display: block; }

        .drawer-actions { margin-top: auto; display: flex; gap: 12px; padding-top: 32px; }
        
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
      `}</style>
    </div>
  );
};

export default OperatorDrawer;
