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

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'P1': return 'priority-p1 blinking';
      case 'P2': return 'priority-p2';
      case 'P3': return 'priority-p3';
      default: return 'priority-p4';
    }
  };

  if (isLoading) return <div className="loading">Initializing Mission Control...</div>;

  const activeIncidents = incidents.filter(i => i.status !== 'CLOSED');

  return (
    <div className="incident-board">
      <div className="board-header">
        <div className="title-area">
          <h2>Active Incidents</h2>
          <span className="count-badge">{activeIncidents.length} Issues</span>
        </div>
        <div className="board-actions">
          <div className="stats-box">
            <div className="stat critical">P1: {incidents.filter(i => i.priority === 'P1').length}</div>
            <div className="stat high">P2: {incidents.filter(i => i.priority === 'P2').length}</div>
          </div>
          <button className="btn-register" onClick={() => setIsModalOpen(true)}>
            + Register Incident
          </button>
        </div>
      </div>

      <div className="incident-list">
        {activeIncidents.map(incident => (
          <div 
            key={incident.incidentId} 
            className={`incident-item ${getPriorityClass(incident.priority)}`}
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

        {activeIncidents.length === 0 && (
          <div className="all-clear">
            <div className="icon">✅</div>
            <h3>All Systems Operational</h3>
            <p>No active incidents detected in any tenant cluster.</p>
          </div>
        )}
      </div>

      <style>{`
        .incident-board { width: 100%; }
        .board-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .title-area { display: flex; align-items: center; gap: 12px; }
        .count-badge { background: rgba(255,255,255,0.1); padding: 4px 10px; border-radius: 20px; font-size: 14px; color: #94a3b8; }
        
        .stats-box { display: flex; gap: 16px; }
        .stat { padding: 4px 12px; border-radius: 6px; font-weight: 700; font-size: 13px; }
        .stat.critical { background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }
        .stat.high { background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }

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

      <style>{`
        .incident-board { width: 100%; }
        .board-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .title-area { display: flex; align-items: center; gap: 12px; }
        .count-badge { background: rgba(255,255,255,0.1); padding: 4px 10px; border-radius: 20px; font-size: 14px; color: #94a3b8; }
        
        .board-actions { display: flex; align-items: center; gap: 20px; }
        .btn-register { 
          background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; border: none; 
          padding: 10px 18px; border-radius: 10px; font-weight: 700; font-size: 14px; 
          cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }
        .btn-register:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4); }

        .stats-box { display: flex; gap: 16px; }
        .stat { padding: 4px 12px; border-radius: 6px; font-weight: 700; font-size: 13px; }
      `}</style>
    </div>
  );
};

export default IncidentBoard;
