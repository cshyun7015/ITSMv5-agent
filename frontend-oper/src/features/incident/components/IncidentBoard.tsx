import React, { useEffect, useState } from 'react';
import { incidentApi } from '../api/incidentApi';
import { Incident } from '../types';
import IncidentFormModal from './IncidentFormModal';

interface IncidentBoardProps {
  onSelectIncident: (id: number) => void;
}

const IncidentBoard: React.FC<IncidentBoardProps> = ({ onSelectIncident }) => {
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [filterTenant, setFilterTenant] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [filterPriority, setFilterPriority] = useState('');

  useEffect(() => {
    loadIncidents();
    const interval = setInterval(loadIncidents, 10000); // 10초마다 갱신
    return () => clearInterval(interval);
  }, []);

  const loadIncidents = async () => {
    try {
      const data = await incidentApi.getAllIncidents();
      setIncidents(data);
    } catch (error) {
      console.error('Failed to load incidents', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPriorityClass = (priority: string, status: string) => {
    const isActive = !['RESOLVED', 'CLOSED'].includes(status);
    switch (priority) {
      case 'P1': return `priority-p1 ${isActive ? 'blinking' : ''}`;
      case 'P2': return 'priority-p2';
      case 'P3': return 'priority-p3';
      default: return 'priority-p4';
    }
  };

  if (isLoading) return <div className="loading">Initializing Mission Control...</div>;

  const filteredIncidents = incidents.filter(i => {
    if (filterTenant && i.tenantId !== filterTenant) return false;
    if (filterStatus && i.status !== filterStatus) return false;
    if (filterPriority && i.priority !== filterPriority) return false;
    return i.status !== 'CLOSED';
  });

  const tenants = Array.from(new Set(incidents.map(i => i.tenantId)));

  return (
    <div className="incident-board">
      <div className="board-header">
        <div className="title-area">
          <h2>Active Incidents</h2>
          <span className="count-badge">{filteredIncidents.length} Issues</span>
        </div>
        <div className="board-actions">
          <div className="stats-box">
            <div className="stat critical">P1: {incidents.filter(i => i.priority === 'P1' && i.status !== 'CLOSED').length}</div>
            <div className="stat high">P2: {incidents.filter(i => i.priority === 'P2' && i.status !== 'CLOSED').length}</div>
          </div>
          <button className="btn-register" onClick={() => setIsModalOpen(true)}>
            + Register Incident
          </button>
        </div>
      </div>

      <div className="filter-bar">
        <div className="filter-group">
          <label>Tenant</label>
          <select value={filterTenant} onChange={e => setFilterTenant(e.target.value)}>
            <option value="">All Tenants</option>
            {tenants.map(t => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <label>Status</label>
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="">All Status</option>
            <option value="NEW">New</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>
        </div>
        <div className="filter-group">
          <label>Priority</label>
          <select value={filterPriority} onChange={e => setFilterPriority(e.target.value)}>
            <option value="">All Priority</option>
            <option value="P1">P1 - Critical</option>
            <option value="P2">P2 - High</option>
            <option value="P3">P3 - Medium</option>
            <option value="P4">P4 - Low</option>
          </select>
        </div>
        {(filterTenant || filterStatus || filterPriority) && (
          <button className="btn-clear-filters" onClick={() => {
            setFilterTenant('');
            setFilterStatus('');
            setFilterPriority('');
          }}>Reset</button>
        )}
      </div>

      <div className="incident-list">
        {filteredIncidents.map(incident => (
          <div 
            key={incident.incidentId} 
            className={`incident-item ${getPriorityClass(incident.priority, incident.status)}`}
            onClick={() => onSelectIncident(incident.incidentId)}
          >
            <div className="item-main">
              <div className="id-tag">#{incident.incidentId}</div>
              <div className="title-row">
                <h3>{incident.title}</h3>
                <span className={`status-pill ${incident.status}`}>{incident.status}</span>
              </div>
              <div className="meta-row">
                <span className="tenant">🏢 {incident.tenantId}</span>
                <span className="source">📡 {incident.source}</span>
                <span className="time">⏳ SLA: {new Date(incident.slaDeadline).toLocaleTimeString()}</span>
              </div>
            </div>
            <div className="priority-side">
              {incident.priority}
            </div>
          </div>
        ))}

        {filteredIncidents.length === 0 && (
          <div className="all-clear">
            <div className="icon">✅</div>
            <h3>All Systems Operational</h3>
            <p>No active incidents detected for current filters.</p>
          </div>
        )}
      </div>

      <style>{`
        .incident-board { width: 100%; }
        .board-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .title-area { display: flex; align-items: center; gap: 12px; }
        .count-badge { background: rgba(255,255,255,0.1); padding: 4px 10px; border-radius: 20px; font-size: 14px; color: #94a3b8; }
        
        .stats-box { display: flex; gap: 12px; align-items: center; }
        .stat { padding: 5px 12px; border-radius: 6px; font-weight: 700; font-size: 12px; letter-spacing: 0.5px; }
        .stat.critical { background: rgba(239, 68, 68, 0.15); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }
        .stat.high { background: rgba(245, 158, 11, 0.15); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }

        .board-actions { display: flex; align-items: center; gap: 20px; }
        .btn-register {
          background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
          color: white; border: none; padding: 8px 18px; border-radius: 8px;
          font-weight: 700; font-size: 13px; cursor: pointer;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
          display: flex; align-items: center; gap: 8px;
        }
        .btn-register:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.4);
          filter: brightness(1.1);
        }
        .btn-register:active { transform: translateY(0); }

        .filter-bar {
          display: flex; gap: 20px; align-items: flex-end; margin-bottom: 24px;
          padding: 16px; background: rgba(255,255,255,0.03); border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.05);
        }
        .filter-group { display: flex; flex-direction: column; gap: 6px; }
        .filter-group label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; }
        .filter-group select {
          background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.1);
          color: white; padding: 6px 12px; border-radius: 6px; font-size: 13px; min-width: 140px;
        }
        .btn-clear-filters {
          padding: 6px 12px; background: transparent; border: 1px solid rgba(255,255,255,0.1);
          color: #94a3b8; border-radius: 6px; font-size: 12px; cursor: pointer; transition: all 0.2s;
        }
        .btn-clear-filters:hover { background: rgba(255,255,255,0.05); color: white; }

        .incident-list { display: flex; flex-direction: column; gap: 12px; }
        .incident-item { 
          display: flex; 
          background: rgba(255, 255, 255, 0.03); 
          border-left: 4px solid #475569; 
          border-radius: 8px; 
          overflow: hidden;
          cursor: pointer;
          transition: all 0.2s;
        }
        .incident-item:hover { background: rgba(255, 255, 255, 0.05); transform: translateX(4px); }
        
        .item-main { flex: 1; padding: 16px; }
        .id-tag { font-size: 12px; color: #64748b; font-family: monospace; margin-bottom: 4px; }
        .title-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
        .title-row h3 { margin: 0; font-size: 16px; color: #e2e8f0; }
        .status-pill { font-size: 11px; padding: 2px 8px; border-radius: 4px; font-weight: 700; }
        .status-pill.NEW { background: #3b82f6; color: white; }
        .status-pill.IN_PROGRESS { background: #f59e0b; color: white; }
        .status-pill.RESOLVED { background: #10b981; color: white; }

        .meta-row { display: flex; gap: 16px; font-size: 12px; color: #94a3b8; }
        
        .priority-side { 
          width: 60px; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          font-weight: 800; 
          font-size: 20px; 
          background: rgba(255,255,255,0.02);
        }

        .priority-p1 { border-left-color: #ef4444; }
        .priority-p1 .priority-side { color: #f87171; background: rgba(239, 68, 68, 0.05); }
        .priority-p2 { border-left-color: #f59e0b; }
        .priority-p2 .priority-side { color: #fbbf24; }
        
        @keyframes blink { 
          0%, 100% { background: rgba(239, 68, 68, 0.05); }
          50% { background: rgba(239, 68, 68, 0.15); }
        }
        .blinking { animation: blink 1.5s infinite; }
      `}</style>

      {isModalOpen && (
        <IncidentFormModal 
          onClose={() => setIsModalOpen(false)} 
          onSuccess={loadIncidents} 
        />
      )}
    </div>
  );
};

export default IncidentBoard;
