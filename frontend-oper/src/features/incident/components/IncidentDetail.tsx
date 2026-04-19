import React, { useEffect, useState } from 'react';
import { incidentApi } from '../api/incidentApi';
import { Incident } from '../types';
import IncidentFormModal from './IncidentFormModal';
import ConfirmDialog from '../../../components/common/ConfirmDialog';

interface IncidentDetailProps {
  incidentId: number;
  onBack: () => void;
  onUpdated: () => void;
}

const IncidentDetail: React.FC<IncidentDetailProps> = ({ incidentId, onBack, onUpdated }) => {
  const [incident, setIncident] = useState<Incident | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [resolution, setResolution] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [workNote, setWorkNote] = useState('');

  useEffect(() => {
    loadIncident();
    loadHistory();
  }, [incidentId]);

  const loadIncident = async () => {
    setIsLoading(true);
    try {
      const data = await incidentApi.getIncident(incidentId);
      setIncident(data);
      setResolution(data.resolution || '');
    } catch (error) {
      console.error('Failed to load incident details', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadHistory = async () => {
    try {
      const data = await incidentApi.getHistory(incidentId);
      setHistory(data);
    } catch (error) {
      console.error('Failed to load history', error);
    }
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!workNote.trim()) return;
    setIsSubmitting(true);
    try {
      // Backend now returns the updated incident — use it directly to avoid race condition
      const updatedIncident = await incidentApi.addWorkNote(incidentId, workNote);
      setIncident(updatedIncident);
      setWorkNote('');
      await loadHistory();
    } catch (error) {
      alert('Failed to add note');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssign = async () => {
    setIsSubmitting(true);
    try {
      await incidentApi.assign(incidentId);
      await Promise.all([loadIncident(), loadHistory()]);
      onUpdated();
    } catch (error) {
      alert('Failed to assign incident');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResolve = async () => {
    if (!resolution.trim()) {
      alert('Resolution summary is required');
      return;
    }
    setIsSubmitting(true);
    try {
      await incidentApi.resolve(incidentId, resolution);
      await Promise.all([loadIncident(), loadHistory()]);
      onUpdated();
    } catch (error) {
      alert('Failed to resolve incident');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = async () => {
    setIsSubmitting(true);
    try {
      await incidentApi.close(incidentId);
      await Promise.all([loadIncident(), loadHistory()]);
      onUpdated();
    } catch (error) {
      alert('Failed to close incident');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    try {
      await incidentApi.deleteIncident(incidentId);
      onUpdated();
      onBack();
    } catch (error) {
      alert('Failed to delete incident');
    }
  };

  if (isLoading) return <div className="loading">Retrieving telemetry data...</div>;
  if (!incident) return <div className="loading">Incident not found.</div>;

  const getHistoryIcon = (type: string) => {
    switch (type) {
      case 'STATUS_CHANGE': return '🔄';
      case 'ASSIGNMENT': return '👤';
      case 'WORK_NOTE': return '📝';
      case 'SYSTEM_LOG': return '🤖';
      default: return '📍';
    }
  };

  return (
    <div className="incident-detail">
      <div className="detail-nav">
        <button className="back-link" onClick={onBack}>← Back to Board</button>
        <div className="detail-header-row">
          <div className="incident-title-block">
            <span className={`priority-indicator ${incident.priority}`}>{incident.priority}</span>
            <h1>{incident.title}</h1>
          </div>
          <div className="header-actions">
            <button className="btn-edit-action" onClick={() => setIsEditModalOpen(true)}>Edit</button>
            <button className="btn-delete-action" onClick={() => setIsDeleteConfirmOpen(true)}>Delete</button>
          </div>
        </div>
      </div>

      <div className="detail-layout">
        <div className="incident-main">
          <section className="detail-section">
            <div className="section-header">
              <h3>Description</h3>
              <span className="source-tag">Source: {incident.source}</span>
            </div>
            <div className="description-box">{incident.description}</div>
          </section>

          <section className="detail-section">
            <div className="section-header">
              <h3>Diagnosis & Resolution</h3>
            </div>
            {incident.status !== 'RESOLVED' && incident.status !== 'CLOSED' ? (
              <textarea 
                className="resolution-textarea"
                placeholder="Diagnostic steps, root cause, and workaround applied..."
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                disabled={isSubmitting || incident.status === 'NEW'}
              />
            ) : (
              <div className="resolution-view">{incident.resolution}</div>
            )}
          </section>

          <section className="history-section">
            <div className="section-header">
              <h3>Collaboration & Audit Trail</h3>
            </div>
            
            <form onSubmit={handleAddNote} className="work-note-form">
              <textarea 
                placeholder="Add a work note for other operators..."
                value={workNote}
                onChange={e => setWorkNote(e.target.value)}
                disabled={isSubmitting}
              />
              <button type="submit" className="btn-add-note" disabled={isSubmitting || !workNote.trim()}>
                Post Note
              </button>
            </form>

            <div className="timeline-container">
              {history.map((h) => (
                <div key={h.id} className={`timeline-item ${h.type.toLowerCase()}`}>
                  <div className="timeline-icon">{getHistoryIcon(h.type)}</div>
                  <div className="timeline-content">
                    <div className="timeline-meta">
                      <span className="author">{h.authorName}</span>
                      <span className="dot">•</span>
                      <span className="time">{new Date(h.createdAt).toLocaleString()}</span>
                    </div>
                    <div className="timeline-note">{h.note}</div>
                    {(h.oldValue || h.newValue) && (
                      <div className="timeline-values">
                        <span className="old">{h.oldValue || 'None'}</span>
                        <span className="arrow">→</span>
                        <span className="new">{h.newValue}</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <div className="incident-sidebar">
          <div className="info-card">
            <h4>Incident Properties</h4>
            <div className="info-row">
              <span className="label">Status</span>
              <span className={`value-badge ${incident.status}`}>{incident.status}</span>
            </div>
            {incident.isMajor && (
              <div className="info-row major-alert">
                <span className="label">Type</span>
                <span className="value critical">🚨 MAJOR INCIDENT</span>
              </div>
            )}
            <div className="info-row">
              <span className="label">Affected Service</span>
              <span className="value">{incident.affectedService || 'N/A'}</span>
            </div>
            <div className="info-row">
              <span className="label">Tenant Org</span>
              <span className="value">{incident.tenantId}</span>
            </div>
            <div className="info-row">
              <span className="label">Category</span>
              <span className="value">{incident.category}</span>
            </div>
            <div className="info-row">
              <span className="label">Impact</span>
              <span className="value">{incident.impact}</span>
            </div>
            <div className="info-row">
              <span className="label">Urgency</span>
              <span className="value">{incident.urgency}</span>
            </div>
            <div className="info-row">
              <span className="label">Reporter</span>
              <span className="value">{incident.reporterName}</span>
            </div>
            <div className="info-row">
              <span className="label">Assignee</span>
              <span className="value">{incident.assigneeName || 'Waiting...'}</span>
            </div>
            <div className="info-row sla">
              <span className="label">RTO Deadline</span>
              <span className="value highlight">{new Date(incident.slaDeadline).toLocaleString()}</span>
            </div>
          </div>

          <div className="action-buttons">
            {incident.status === 'NEW' && (
              <button className="btn-assign" onClick={handleAssign} disabled={isSubmitting}>
                Accept Incident
              </button>
            )}
            {(incident.status === 'ASSIGNED' || incident.status === 'IN_PROGRESS') && (
              <button className="btn-resolve" onClick={handleResolve} disabled={isSubmitting}>
                Complete Resolution
              </button>
            )}
            {incident.status === 'RESOLVED' && (
              <button className="btn-close-action" onClick={handleClose} disabled={isSubmitting}>
                Close Incident
              </button>
            )}
          </div>
        </div>
      </div>

      {isEditModalOpen && (
        <IncidentFormModal 
          incident={incident} 
          onClose={() => setIsEditModalOpen(false)} 
          onSuccess={() => { loadIncident(); onUpdated(); }} 
        />
      )}

      <ConfirmDialog 
        isOpen={isDeleteConfirmOpen}
        title="Delete Incident"
        message="Are you sure you want to delete this incident? This action cannot be undone."
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteConfirmOpen(false)}
      />

      <style>{`
        .incident-detail { padding: 10px; }
        .detail-nav { margin-bottom: 32px; }
        .detail-header-row { display: flex; justify-content: space-between; align-items: center; }
        .header-actions { display: flex; gap: 12px; }
        .back-link { background: none; border: none; color: #3b82f6; cursor: pointer; padding: 0; margin-bottom: 12px; font-weight: 500; }
        .incident-title-block { display: flex; align-items: center; gap: 16px; }

        .btn-edit-action, .btn-delete-action {
          background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1);
          color: #94a3b8; padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 600;
          cursor: pointer; transition: all 0.2s;
        }
        .btn-edit-action:hover { background: rgba(59, 130, 246, 0.1); color: #60a5fa; border-color: rgba(59, 130, 246, 0.2); }
        .btn-delete-action:hover { background: rgba(239, 68, 68, 0.1); color: #f87171; border-color: rgba(239, 68, 68, 0.2); }
        .priority-indicator { padding: 4px 12px; border-radius: 4px; font-weight: 800; font-size: 18px; }
        .priority-indicator.P1 { background: #ef4444; color: white; box-shadow: 0 0 15px rgba(239, 68, 68, 0.4); }
        .priority-indicator.P2 { background: #f59e0b; color: white; }
        .priority-indicator.P3 { background: #3b82f6; color: white; }
        .priority-indicator.P4 { background: #64748b; color: white; }
        
        .detail-layout { display: grid; grid-template-columns: 2fr 1fr; gap: 32px; }
        .detail-section { background: rgba(25,25,35,0.4); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 24px; margin-bottom: 24px; }
        .section-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; }
        .source-tag { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; background: rgba(255,255,255,0.05); padding: 2px 8px; border-radius: 4px; }
        .description-box { color: #cbd5e1; line-height: 1.7; white-space: pre-wrap; }

        .resolution-textarea { width: 100%; min-height: 200px; background: rgba(0,0,0,0.2); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; color: white; padding: 16px; font-family: inherit; line-height: 1.6; }
        .resolution-textarea:focus { outline: none; border-color: #3b82f6; }
        .resolution-textarea:disabled { opacity: 0.5; cursor: not-allowed; }
        .resolution-view { background: rgba(16, 185, 129, 0.1); border: 1px solid rgba(16, 185, 129, 0.2); padding: 16px; border-radius: 8px; color: #10b981; white-space: pre-wrap; }

        .info-card { background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; padding: 20px; }
        .info-card h4 { margin: 0 0 20px 0; font-size: 14px; text-transform: uppercase; color: #64748b; letter-spacing: 0.05em; }
        .info-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; padding-bottom: 12px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .info-row:last-child { border-bottom: none; margin-bottom: 0; padding-bottom: 0; }
        .info-row .label { font-size: 13px; color: #94a3b8; }
        .info-row .value { font-size: 14px; color: #f1f5f9; font-weight: 500; }
        .value-badge { font-size: 11px; font-weight: 700; padding: 2px 8px; border-radius: 4px; }
        .value-badge.NEW { background: #3b82f6; color: white; }
        .value-badge.RESOLVED { background: #10b981; color: white; }
        .info-row.sla { margin-top: 8px; background: rgba(255,255,255,0.02); padding: 12px; border-radius: 8px; border-bottom: none; flex-direction: column; align-items: flex-start; gap: 4px; }
        .info-row.sla .value.highlight { color: #f87171; font-weight: 800; font-family: monospace; }
        
        .major-alert { background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); padding: 12px; border-radius: 8px; border-bottom: none !important; margin-bottom: 20px !important; }
        .major-alert .label { color: #f87171 !important; font-weight: 800 !important; }
        .value.critical { color: #f87171; font-weight: 900; letter-spacing: 0.05em; }

        .action-buttons { margin-top: 24px; }
        .action-buttons button { width: 100%; padding: 14px; border-radius: 8px; font-weight: 700; font-size: 15px; border: none; cursor: pointer; transition: all 0.2s; }
        .btn-assign { background: #3b82f6; color: white; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.3); }
        .btn-assign:hover { background: #2563eb; transform: translateY(-2px); }
        .btn-resolve { background: #10b981; color: white; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3); }
        .btn-resolve:hover { background: #059669; transform: translateY(-2px); }
        .btn-close-action { background: #475569; color: white; box-shadow: 0 4px 15px rgba(71, 85, 105, 0.3); }
        .btn-close-action:hover { background: #334155; transform: translateY(-2px); }

        .value-badge.IN_PROGRESS { background: #f59e0b; color: white; }
        .value-badge.CLOSED { background: #1e293b; color: #94a3b8; border: 1px solid rgba(255,255,255,0.1); }

        /* History & Timeline Styles */
        .history-section { margin-top: 32px; border-top: 1px solid rgba(255,255,255,0.05); padding-top: 32px; }
        .work-note-form { margin-bottom: 32px; display: flex; flex-direction: column; gap: 12px; }
        .work-note-form textarea {
          width: 100%; min-height: 80px; background: rgba(15, 23, 42, 0.5); border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px; color: white; padding: 12px; font-size: 14px; resize: vertical;
        }
        .btn-add-note { align-self: flex-end; padding: 8px 20px; background: #6366f1; color: white; border: none; border-radius: 6px; font-weight: 600; cursor: pointer; }
        .btn-add-note:disabled { background: #334155; cursor: not-allowed; }

        .timeline-container { display: flex; flex-direction: column; gap: 24px; padding-left: 12px; }
        .timeline-item { display: flex; gap: 20px; position: relative; }
        .timeline-item::before {
          content: ''; position: absolute; left: 14px; top: 30px; bottom: -24px;
          width: 2px; background: rgba(255,255,255,0.03);
        }
        .timeline-item:last-child::before { display: none; }
        
        .timeline-icon {
          width: 30px; height: 30px; border-radius: 50%; background: #1e293b;
          display: flex; align-items: center; justify-content: center; font-size: 14px;
          border: 1px solid rgba(255,255,255,0.05); z-index: 1;
        }
        .timeline-content { flex: 1; min-width: 0; }
        .timeline-meta { display: flex; align-items: center; gap: 8px; margin-bottom: 6px; }
        .timeline-meta .author { font-size: 13px; font-weight: 700; color: #e2e8f0; }
        .timeline-meta .dot { color: #475569; }
        .timeline-meta .time { font-size: 11px; color: #64748b; }
        
        .timeline-note { font-size: 14px; color: #cbd5e1; line-height: 1.5; white-space: pre-wrap; }
        
        .timeline-values {
          margin-top: 8px; display: flex; align-items: center; gap: 12px;
          background: rgba(0,0,0,0.2); padding: 6px 12px; border-radius: 6px;
          font-family: monospace; font-size: 12px; width: fit-content;
        }
        .timeline-values .old { color: #94a3b8; text-decoration: line-through; }
        .timeline-values .arrow { color: #475569; }
        .timeline-values .new { color: #3b82f6; font-weight: 700; }

        /* Color Coding for Timeline */
        .timeline-item.status_change .timeline-icon { border-color: #fbbf24; }
        .timeline-item.assignment .timeline-icon { border-color: #3b82f6; }
        .timeline-item.work_note .timeline-content { background: rgba(99, 102, 241, 0.03); padding: 12px; border-radius: 8px; border: 1px solid rgba(99, 102, 241, 0.1); }
      `}</style>
    </div>
  );
};

export default IncidentDetail;
