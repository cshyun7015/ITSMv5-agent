import React, { useState } from 'react';
import { operatorApi } from '../api/operatorApi';
import { Operator, OperatorRequest, Team } from '../types';

interface Organization {
  orgId: number;
  name: string;
}

interface OperatorFormModalProps {
  operator?: Operator;
  onClose: () => void;
  onSuccess: () => void;
}

const OperatorFormModal: React.FC<OperatorFormModalProps> = ({ operator, onClose, onSuccess }) => {
  const isEdit = !!operator;
  const [username, setUsername] = useState(operator?.username || '');
  const [email, setEmail] = useState(operator?.email || '');
  const [roleId, setRoleId] = useState(operator?.roleId || 'ROLE_OPERATOR');
  const [teamId, setTeamId] = useState<number | null>(operator?.teamId || null);
  const [orgId, setOrgId] = useState<number | null>(null); // For ADMIN to pick tenant
  const [password, setPassword] = useState('');
  const [isActive, setIsActive] = useState(operator ? operator.isActive : true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [allTeams, setAllTeams] = useState<Team[]>([]);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [loadingMetadata, setLoadingMetadata] = useState(false);

  React.useEffect(() => {
    const fetchData = async () => {
      setLoadingMetadata(true);
      try {
        const teams = await operatorApi.getTeams();
        setAllTeams(teams);
        
        // Extract unique organizations from teams for ADMIN selection
        const orgsMap = new Map<number, Organization>();
        teams.forEach(t => {
            if (t.orgId) orgsMap.set(t.orgId, { orgId: t.orgId, name: t.orgName || 'Unknown Org' });
        });
        setOrganizations(Array.from(orgsMap.values()));

        if (operator?.teamId) {
            const currentTeam = teams.find(t => t.teamId === operator.teamId);
            if (currentTeam) setOrgId(currentTeam.orgId);
        }
      } catch (error) {
        console.error('Failed to fetch teams', error);
      } finally {
        setLoadingMetadata(false);
      }
    };
    fetchData();
  }, [operator]);

  // Filter teams based on selected organization
  const filteredTeams = orgId ? allTeams.filter(t => t.orgId === orgId) : allTeams;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const payload: OperatorRequest = {
        username: isEdit ? undefined : username,
        email,
        password: password || undefined,
        roleId,
        teamId,
        isActive
      };

      if (isEdit && operator) {
        await operatorApi.updateOperator(operator.memberId, payload);
      } else {
        await operatorApi.createOperator(payload);
      }
      onSuccess();
    } catch (error) {
      console.error('Failed to save operator', error);
      alert('Failed to save operator data.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content oper-form-modal">
        <header className="modal-header">
          <h2>{isEdit ? 'Update Operator Profile' : 'Register New Team Member'}</h2>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </header>

        <form onSubmit={handleSubmit} className="standard-form">
          <div className="form-section">
            <label>Operator ID / Username <span className="required-star">*</span></label>
            <input 
              value={username} 
              onChange={e => setUsername(e.target.value)} 
              className="modern-input" 
              required 
              disabled={isEdit}
              placeholder="e.g. operator_kim" 
            />
            {isEdit && <span className="helper-text">Username cannot be changed.</span>}
          </div>

          <div className="form-section">
            <label>Email Address <span className="required-star">*</span></label>
            <input 
              type="email"
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="modern-input" 
              required 
              placeholder="kim@example.com" 
            />
          </div>

          {organizations.length > 1 && (
            <div className="form-section">
                <label>Organization (Tenant) <span className="required-star">*</span></label>
                <select 
                    value={orgId || ''} 
                    onChange={e => {
                        const newOrgId = Number(e.target.value);
                        setOrgId(newOrgId);
                        setTeamId(null); // Reset team when org changes
                    }}
                    className="modern-input select-input"
                    required
                >
                    <option value="">Select Organization</option>
                    {organizations.map(org => (
                        <option key={org.orgId} value={org.orgId}>{org.name}</option>
                    ))}
                </select>
            </div>
          )}

          <div className="form-section">
            <label>Assigned Team</label>
            <select 
              value={teamId || ''} 
              onChange={e => setTeamId(e.target.value ? Number(e.target.value) : null)} 
              className="modern-input select-input"
              disabled={loadingMetadata || (organizations.length > 1 && !orgId)}
            >
              <option value="">Not Assigned</option>
              {filteredTeams.map(team => (
                <option key={team.teamId} value={team.teamId}>
                  {team.name} {organizations.length > 1 && !orgId ? `(${team.orgName})` : ''}
                </option>
              ))}
            </select>
            {loadingMetadata && <span className="helper-text">Loading teams...</span>}
          </div>

          <div className="form-section">
            <label>Access Role <span className="required-star">*</span></label>
            <div className="role-selector">
              <label className={`role-option ${roleId === 'ROLE_OPERATOR' ? 'selected' : ''}`}>
                <input 
                  type="radio" 
                  name="role" 
                  value="ROLE_OPERATOR" 
                  checked={roleId === 'ROLE_OPERATOR'} 
                  onChange={e => setRoleId(e.target.value)} 
                />
                <div className="role-info">
                  <span className="role-name">Standard Operator</span>
                  <span className="role-desc">General operation & member tasks</span>
                </div>
              </label>
              <label className={`role-option ${roleId === 'ROLE_ADMIN' ? 'selected' : ''}`}>
                <input 
                  type="radio" 
                  name="role" 
                  value="ROLE_ADMIN" 
                  checked={roleId === 'ROLE_ADMIN'} 
                  onChange={e => setRoleId(e.target.value)} 
                />
                <div className="role-info">
                  <span className="role-name">System Admin</span>
                  <span className="role-desc">Full system & security access</span>
                </div>
              </label>
            </div>
          </div>

          <div className="form-section">
            <label>{isEdit ? 'Change Password' : 'Password'} {!isEdit && <span className="required-star">*</span>}</label>
            <input 
              type="password"
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              className="modern-input" 
              required={!isEdit}
              placeholder={isEdit ? 'Leave blank to keep current' : 'Enter strong password'} 
            />
          </div>

          <div className="form-section checkbox-section">
            <label className="checkbox-container">
              <input 
                type="checkbox" 
                checked={isActive} 
                onChange={e => setIsActive(e.target.checked)} 
              />
              <span className="checkmark"></span>
              Active Account
            </label>
            <p className="helper-text">Inactive accounts cannot log in to the system.</p>
          </div>

          <div className="form-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn-primary" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : (isEdit ? 'Update Member' : 'Create Account')}
            </button>
          </div>
        </form>
      </div>

      <style>{`
        .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.8); backdrop-filter: blur(8px); display: flex; align-items: center; justify-content: center; z-index: 3000; }
        .modal-content.oper-form-modal { 
          background: #0f172a; width: 100%; max-width: 450px; border-radius: 20px; border: 1px solid rgba(255,255,255,0.1); 
          box-shadow: 0 30px 60px rgba(0,0,0,0.5); animation: zoomIn 0.3s ease-out;
        }
        @keyframes zoomIn { from { transform: scale(0.95); opacity: 0; } to { transform: scale(1); opacity: 1; } }

        .modal-header { padding: 24px 32px; border-bottom: 1px solid rgba(255,255,255,0.05); display: flex; justify-content: space-between; align-items: center; }
        .modal-header h2 { margin: 0; font-size: 20px; font-weight: 800; color: #fff; }
        .close-btn { background: none; border: none; color: #64748b; font-size: 32px; cursor: pointer; }

        .role-selector { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; }
        .role-option { 
          background: rgba(255,255,255,0.03); border: 1px solid #1e293b; border-radius: 12px; padding: 12px;
          cursor: pointer; transition: all 0.2s; display: flex; align-items: flex-start; gap: 10px;
        }
        .role-option:hover { background: rgba(255,255,255,0.05); border-color: #334155; }
        .role-option.selected { background: rgba(59, 130, 246, 0.1); border-color: #3b82f6; }
        .role-option input { margin-top: 4px; }
        .role-info { display: flex; flex-direction: column; }
        .role-name { font-size: 14px; font-weight: 700; color: #fff; }
        .role-desc { font-size: 11px; color: #64748b; margin-top: 2px; }

        .standard-form { padding: 32px; display: flex; flex-direction: column; gap: 24px; }
        .form-section { display: flex; flex-direction: column; gap: 8px; }
        .form-section label { font-size: 13px; font-weight: 700; color: #64748b; }
        .required-star { color: #f43f5e; }

        .modern-input {
          background: rgba(255,255,255,0.03); border: 1px solid #1e293b; border-radius: 12px; padding: 12px 16px;
          color: #fff; font-size: 14px; outline: none; transition: all 0.2s;
        }
        .select-input {
          appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2364748b'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E");
          background-repeat: no-repeat; background-position: right 12px center; background-size: 16px; padding-right: 40px;
        }
        .select-input option { background: #0f172a; color: #fff; }
        .modern-input:focus:not(:disabled) { border-color: #3b82f6; background: rgba(255,255,255,0.05); }
        .modern-input:disabled { opacity: 0.6; cursor: not-allowed; }

        .checkbox-section { 
          background: rgba(255,255,255,0.02); padding: 16px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);
        }
        .checkbox-container { display: flex; align-items: center; gap: 12px; cursor: pointer; user-select: none; color: #f8fafc !important; }
        .checkbox-container input { position: absolute; opacity: 0; cursor: pointer; }
        .checkmark { 
          width: 20px; height: 20px; background: #1e293b; border-radius: 6px; position: relative;
          transition: all 0.2s; border: 1px solid #334155;
        }
        .checkbox-container:hover input ~ .checkmark { border-color: #3b82f6; }
        .checkbox-container input:checked ~ .checkmark { background: #3b82f6; border-color: #3b82f6; }
        .checkmark:after {
          content: ""; position: absolute; display: none; left: 6px; top: 2px; width: 5px; height: 10px;
          border: solid white; border-width: 0 2px 2px 0; transform: rotate(45deg);
        }
        .checkbox-container input:checked ~ .checkmark:after { display: block; }

        .helper-text { font-size: 11px; color: #64748b; margin-top: 4px; }

        .form-actions { display: flex; justify-content: flex-end; gap: 16px; margin-top: 12px; }
        .btn-secondary { background: none; border: none; color: #94a3b8; font-weight: 700; cursor: pointer; }
        .btn-primary { 
          background: #3b82f6; color: #fff; border: none; padding: 12px 24px; border-radius: 12px; font-weight: 800;
          cursor: pointer; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4); transition: all 0.2s;
        }
        .btn-primary:hover:not(:disabled) { transform: translateY(-2px); background: #2563eb; }
      `}</style>
    </div>
  );
};

export default OperatorFormModal;
