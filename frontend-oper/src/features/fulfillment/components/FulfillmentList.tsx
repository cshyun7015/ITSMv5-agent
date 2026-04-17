import React, { useEffect, useState } from 'react';
import { fulfillmentApi } from '../api/fulfillmentApi';
import { ServiceRequest } from '../types';
import RequestFormModal from './RequestFormModal';

interface FulfillmentListProps {
  onSelectRequest: (id: number) => void;
}

const FulfillmentList: React.FC<FulfillmentListProps> = ({ onSelectRequest }) => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterTenant, setFilterTenant] = useState<string>('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setIsLoading(true);
    try {
      const [reqData, tenantData] = await Promise.all([
        fulfillmentApi.getAllRequests(),
        fulfillmentApi.getTenants()
      ]);
      setRequests(reqData);
      setTenants(tenantData);
    } catch (error) {
      console.error('Failed to load board data', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickAssign = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    try {
      await fulfillmentApi.assignToMe(id);
      loadInitialData();
    } catch (error) {
      alert('Assignment failed');
    }
  };

  const filteredRequests = requests.filter(req => 
    (filterStatus === 'ALL' || req.status === filterStatus) &&
    (filterTenant === 'ALL' || req.tenantId === filterTenant)
  );

  const openCount = requests.filter(r => r.status === 'OPEN').length;
  const inProgressCount = requests.filter(r => r.status === 'IN_PROGRESS').length;

  const getSlaInfo = (deadline: string | null | undefined) => {
    if (!deadline) return { text: 'No SLA', class: '' };
    const diff = new Date(deadline).getTime() - new Date().getTime();
    if (diff < 0) return { text: 'SLA Overdue', class: 'overdue' };
    if (diff < 7200000) return { text: 'Due Soon', class: 'urgent' }; // < 2h
    return { text: new Date(deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), class: '' };
  };

  if (isLoading) return <div className="loading">Initializing Operations Center...</div>;

  return (
    <div className="fulfillment-board">
      <div className="board-summary">
        <div className="summary-item">
          <span className="dot open"></span>
          <span className="label">Open Requests</span>
          <span className="value">{openCount}</span>
        </div>
        <div className="summary-item">
          <span className="dot progress"></span>
          <span className="label">Working</span>
          <span className="value">{inProgressCount}</span>
        </div>
      </div>

      <div className="fulfillment-header">
        <div className="title-section">
          <h2>Tactical Fulfillment Board</h2>
          <div className="subtitle">Managing {requests.length} total across {tenants.length} tenants</div>
          <button className="btn-manual-reg" onClick={() => setShowCreateModal(true)}>
            + Register Manual Request
          </button>
        </div>
        
        <div className="filter-controls">
          <div className="filter-group">
            <span className="group-label">Customer:</span>
            <select value={filterTenant} onChange={(e) => setFilterTenant(e.target.value)} className="modern-select">
              <option value="ALL">All Tenants</option>
              {tenants.map(t => (
                <option key={t.tenantId} value={t.tenantId}>{t.name}</option>
              ))}
            </select>
          </div>
          <div className="filter-group">
            <span className="group-label">Status:</span>
            <div className="status-pills">
              {['ALL', 'OPEN', 'IN_PROGRESS', 'RESOLVED'].map(status => (
                <button 
                  key={status}
                  className={`pill-btn ${filterStatus === status ? 'active' : ''}`}
                  onClick={() => setFilterStatus(status)}
                >
                  {status}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="ticket-list">
        {filteredRequests.map(req => {
          const sla = getSlaInfo(req.slaDeadline);
          const tenant = tenants.find(t => t.tenantId === req.tenantId);
          
          return (
            <div key={req.requestId} className={`tactical-card ${sla.class}`} onClick={() => onSelectRequest(req.requestId)}>
              <div className="card-accent" style={{ background: tenant?.brandColor || '#3b82f6' }}></div>
              
              <div className="card-top">
                <div className="req-meta">
                  <span className="req-id">#{req.requestId}</span>
                  <span className="req-tenant">{tenant?.name || req.tenantId}</span>
                </div>
                <div className={`req-status ${req.status}`}>{req.status}</div>
              </div>

              <h3 className="req-title">{req.title}</h3>

              <div className="card-footer">
                <div className="left">
                   <span className="requester">👤 {req.requesterName}</span>
                   <span className={`sla-tag ${sla.class}`}>⏰ {sla.text}</span>
                </div>
                <div className="right">
                  {req.status === 'OPEN' && (
                    <button className="quick-assign" onClick={(e) => handleQuickAssign(e, req.requestId)}>
                      Assign
                    </button>
                  )}
                  {req.assigneeName && <span className="assignee">assigned to {req.assigneeName}</span>}
                </div>
              </div>
            </div>
          );
        })}
      </div>


      {filteredRequests.length === 0 && (
        <div className="empty-state">No matching requests found in the current tactical scope.</div>
      )}

      {showCreateModal && (
        <RequestFormModal 
          onClose={() => setShowCreateModal(false)}
          onSuccess={loadInitialData}
        />
      )}

      <style>{`
        .fulfillment-board { color: #f1f5f9; }
        
        .board-summary {
          display: flex;
          gap: 32px;
          margin-bottom: 24px;
          padding: 16px 24px;
          background: rgba(255, 255, 255, 0.03);
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .summary-item { display: flex; align-items: center; gap: 12px; }
        .summary-item .dot { width: 8px; height: 8px; border-radius: 50%; }
        .summary-item .dot.open { background: #3b82f6; box-shadow: 0 0 10px #3b82f6; }
        .summary-item .dot.progress { background: #f59e0b; box-shadow: 0 0 10px #f59e0b; }
        .summary-item .label { font-size: 13px; color: #94a3b8; }
        .summary-item .value { font-size: 20px; font-weight: 700; color: #fff; }

        .fulfillment-header { 
          display: flex; 
          justify-content: space-between; 
          align-items: flex-end; 
          margin-bottom: 24px; 
          padding-bottom: 20px;
          border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        }
        .title-section h2 { margin: 0; font-size: 20px; }
        .title-section .subtitle { font-size: 12px; color: #64748b; margin-top: 4px; margin-bottom: 12px; }
        
        .btn-manual-reg {
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          color: #fff;
          border: none;
          padding: 8px 16px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s;
          box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
        }
        .btn-manual-reg:hover { transform: translateY(-1px); box-shadow: 0 6px 15px rgba(37, 99, 235, 0.4); }
        
        .filter-controls { display: flex; gap: 24px; align-items: flex-end; }
        .filter-group { display: flex; flex-direction: column; gap: 8px; }
        .group-label { font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; }

        .modern-select {
          background: #0f172a;
          border: 1px solid #334155;
          color: #fff;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 13px;
          outline: none;
        }

        .status-pills { display: flex; gap: 4px; background: rgba(0,0,0,0.2); padding: 4px; border-radius: 8px; }
        .pill-btn {
          border: none;
          background: transparent;
          color: #94a3b8;
          padding: 6px 16px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }
        .pill-btn.active { background: rgba(255, 255, 255, 0.1); color: #fff; }

        .ticket-list { 
          display: grid; 
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr)); 
          gap: 20px; 
        }

        .tactical-card {
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 12px;
          padding: 20px;
          position: relative;
          cursor: pointer;
          transition: all 0.2s;
        }
        .tactical-card:hover { 
          background: rgba(255, 255, 255, 0.05); 
          transform: translateY(-2px);
          border-color: rgba(255, 255, 255, 0.1);
        }
        .card-accent { position: absolute; left: 0; top: 20px; bottom: 20px; width: 4px; border-radius: 0 2px 2px 0; }

        .card-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; }
        .req-meta { display: flex; flex-direction: column; }
        .req-id { font-size: 11px; color: #64748b; font-family: monospace; }
        .req-tenant { font-size: 13px; font-weight: 700; color: #fff; }

        .req-status { font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 4px; letter-spacing: 0.5px; }
        .req-status.OPEN { background: rgba(59, 130, 246, 0.15); color: #60a5fa; }
        .req-status.IN_PROGRESS { background: rgba(245, 158, 11, 0.15); color: #fbbf24; }

        .req-title { margin: 0 0 16px 0; font-size: 15px; line-height: 1.4; color: #e2e8f0; }

        .card-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 16px; }
        .card-footer .left { display: flex; flex-direction: column; gap: 4px; }
        .requester { font-size: 12px; color: #94a3b8; }
        .sla-tag { font-size: 12px; color: #94a3b8; }
        .sla-tag.urgent { color: #f87171; font-weight: 700; }
        .sla-tag.overdue { color: #ef4444; font-weight: 700; text-decoration: underline; }

        .tactical-card.urgent { border-color: #ef4444; box-shadow: 0 0 15px rgba(239, 68, 68, 0.1); }
        .tactical-card.urgent .req-status { animation: pulse 1.5s infinite; }
        @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.6; } 100% { opacity: 1; } }

        .quick-assign {
          background: #3b82f6;
          color: #fff;
          border: none;
          padding: 6px 12px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          cursor: pointer;
        }
        .assignee { font-size: 11px; color: #475569; font-style: italic; }

        .loading { padding: 80px; text-align: center; color: #64748b; }
      `}</style>
    </div>
  );
};

export default FulfillmentList;
