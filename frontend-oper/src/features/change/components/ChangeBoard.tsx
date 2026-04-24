import React, { useEffect, useState } from 'react';
import { changeApi } from '../api/changeApi';
import { ChangeRequest } from '../types';
import ChangeFormModal from './ChangeFormModal';
import { useAuth } from '../../auth/context/AuthContext';

const ChangeBoard: React.FC = () => {
  const { user } = useAuth();
  const [changes, setChanges] = useState<ChangeRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedChange, setSelectedChange] = useState<ChangeRequest | undefined>(undefined);

  useEffect(() => {
    loadChanges();
    const interval = setInterval(loadChanges, 10000); // 10초마다 갱신 (표준)
    return () => clearInterval(interval);
  }, [user]);

  const loadChanges = async () => {
    if (!user?.tenantId) return;
    try {
      const data = await changeApi.getChanges(user.tenantId);
      setChanges(data);
    } catch (error) {
      console.error('Failed to load changes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenModal = (change?: ChangeRequest) => {
    setSelectedChange(change);
    setIsModalOpen(true);
  };

  const getPriorityClass = (priority: string) => {
    switch (priority) {
      case 'P1': return 'priority-p1';
      case 'P2': return 'priority-p2';
      case 'P3': return 'priority-p3';
      default: return 'priority-p4';
    }
  };

  if (isLoading) return <div className="loading">Initializing Change Control...</div>;

  return (
    <div className="change-board">
      <div className="board-header">
        <div className="title-area">
          <h2>Change Management</h2>
          <span className="count-badge">{changes.length} RFCs</span>
        </div>
        <div className="board-actions">
          <div className="stats-box">
            <div className="stat critical">P1: {changes.filter(c => c.priorityCode === 'P1').length}</div>
            <div className="stat high">P2: {changes.filter(c => c.priorityCode === 'P2').length}</div>
          </div>
          <button className="btn-register" onClick={() => handleOpenModal()}>
            + Create RFC
          </button>
        </div>
      </div>

      <div className="change-list">
        {changes.map(change => (
          <div 
            key={change.changeId} 
            className={`change-item ${getPriorityClass(change.priorityCode)}`}
            onClick={() => handleOpenModal(change)}
          >
            <div className="item-main">
              <div className="id-tag">#{change.changeId}</div>
              <div className="title-row">
                <h3>{change.title} {change.statusCode === 'DRAFT' && <span className="draft-mark">[DRAFT]</span>}</h3>
                <span className={`status-pill ${change.statusCode}`}>{change.statusCode}</span>
              </div>
              <div className="meta-row">
                <span className="tenant">🏢 {change.tenantId}</span>
                <span className="type">📂 {change.typeCode}</span>
                <span className="time">📅 {change.plannedStartDate ? new Date(change.plannedStartDate).toLocaleDateString() : 'TBD'}</span>
                <span className="requester">👤 {change.requesterName}</span>
              </div>
            </div>
            <div className="priority-side">
              {change.priorityCode}
            </div>
          </div>
        ))}

        {changes.length === 0 && (
          <div className="all-clear">
            <div className="icon">✅</div>
            <h3>No Active Changes</h3>
            <p>The system is currently stable with no pending change requests.</p>
          </div>
        )}
      </div>

      <style>{`
        .change-board { width: 100%; }
        .board-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .title-area { display: flex; align-items: center; gap: 12px; }
        .title-area h2 { margin: 0; font-size: 22px; font-weight: 800; color: #fff; }
        .count-badge { background: rgba(255,255,255,0.1); padding: 4px 10px; border-radius: 20px; font-size: 14px; color: #94a3b8; }
        
        .board-actions { display: flex; align-items: center; gap: 20px; }
        .stats-box { display: flex; gap: 16px; }
        .stat { padding: 4px 12px; border-radius: 6px; font-weight: 700; font-size: 13px; }
        .stat.critical { background: rgba(239, 68, 68, 0.2); color: #f87171; border: 1px solid rgba(239, 68, 68, 0.3); }
        .stat.high { background: rgba(245, 158, 11, 0.2); color: #fbbf24; border: 1px solid rgba(245, 158, 11, 0.3); }

        .btn-register { 
          background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; border: none; 
          padding: 10px 18px; border-radius: 10px; font-weight: 700; font-size: 14px; 
          cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }
        .btn-register:hover { transform: translateY(-2px); box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4); }

        .change-list { display: flex; flex-direction: column; gap: 12px; }
        .change-item { 
          display: flex; 
          background: rgba(255, 255, 255, 0.03); 
          border-left: 4px solid #475569; 
          border-radius: 8px; 
          overflow: hidden;
          cursor: pointer;
          transition: all 0.2s;
        }
        .change-item:hover { background: rgba(255, 255, 255, 0.05); transform: translateX(4px); }
        
        .item-main { flex: 1; padding: 16px; }
        .id-tag { font-size: 12px; color: #64748b; font-family: monospace; margin-bottom: 4px; }
        .title-row { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 8px; }
        .title-row h3 { margin: 0; font-size: 16px; color: #e2e8f0; }
        
        .status-pill { font-size: 11px; padding: 2px 8px; border-radius: 4px; font-weight: 700; text-transform: uppercase; }
        .status-pill.DRAFT { background: #64748b; color: white; }
        .status-pill.RFC { background: #3b82f6; color: white; }
        .status-pill.CAB_APPROVAL { background: #8b5cf6; color: white; }
        .status-pill.SCHEDULED { background: #06b6d4; color: white; }
        .status-pill.IMPLEMENTING { background: #f59e0b; color: white; }
        .status-pill.CLOSED { background: #10b981; color: white; }

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
        .priority-p3 { border-left-color: #3b82f6; }
        .priority-p3 .priority-side { color: #60a5fa; }
        
        .all-clear { padding: 60px; text-align: center; color: #64748b; }
        .all-clear .icon { font-size: 48px; margin-bottom: 16px; }
        .loading { padding: 80px; text-align: center; color: #64748b; font-weight: 700; }
        .draft-mark { background: rgba(245, 158, 11, 0.1); color: #fbbf24; padding: 1px 6px; border-radius: 4px; font-size: 11px; margin-left: 8px; font-weight: 800; border: 1px solid rgba(245, 158, 11, 0.2); }
      `}</style>

      {isModalOpen && (
        <ChangeFormModal 
          change={selectedChange}
          onClose={() => setIsModalOpen(false)} 
          onSuccess={loadChanges} 
        />
      )}
    </div>
  );
};

export default ChangeBoard;
