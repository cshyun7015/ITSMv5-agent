import React from 'react';
import { dashboardApi, DashboardSummary } from '../api/dashboardApi';
import { Activity, AlertTriangle, ClipboardCheck, ClipboardSignature, Info } from 'lucide-react';

const DashboardPage: React.FC = () => {
  const [summary, setSummary] = React.useState<DashboardSummary | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await dashboardApi.getSummary();
      setSummary(data);
      // Brand color remains blue as requested
      // document.documentElement.style.setProperty('--color-primary', data.brandColor);
    } catch (error) {
      console.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (!summary) return <div className="error-state">Failed to load system status.</div>;

  return (
    <div className="dashboard">
      <section className="status-hero premium-card">
        <div className={`status-indicator ${summary.serviceStatus.toLowerCase()}`}>
          <div className="status-visual">
            <div className="status-glow"></div>
            <div className="status-main-icon">
              {summary.serviceStatus === 'GREEN' ? <Activity size={32} /> : 
               summary.serviceStatus === 'YELLOW' ? <AlertTriangle size={32} /> : <AlertTriangle size={32} />}
            </div>
          </div>
          <div className="status-text">
            <h2>{summary.serviceStatus === 'GREEN' ? 'System Fully Operational' : 
                 summary.serviceStatus === 'YELLOW' ? 'Service Performance Degraded' : 'Major service interruption'}</h2>
            <div className="availability-row">
              <span className="availability-label">Current Service Availability</span>
              <span className="availability-value">{summary.availability.toFixed(4)}%</span>
            </div>
          </div>
        </div>
      </section>

      <div className="widgets-grid">
        <div className="widget-card premium-card">
          <div className="widget-icon inc"><AlertTriangle size={24} /></div>
          <div className="widget-info">
            <span className="label">Active Incidents</span>
            <span className="value">{summary.activeIncidents}</span>
            <span className={`sub-status ${summary.highPriorityIncidents > 0 ? 'critical' : ''}`}>
               {summary.highPriorityIncidents > 0 ? (
                 <><div className="dot" /> {summary.highPriorityIncidents} High Priority</>
               ) : (
                 'No critical issues'
               )}
            </span>
          </div>
        </div>

        <div className="widget-card premium-card">
          <div className="widget-icon req"><ClipboardSignature size={24} /></div>
          <div className="widget-info">
            <span className="label">Open Requests</span>
            <span className="value">{summary.inProgressRequests}</span>
            <span className="sub-status">Awaiting fulfillment</span>
          </div>
        </div>

        <div className="widget-card premium-card">
          <div className="widget-icon app"><ClipboardCheck size={24} /></div>
          <div className="widget-info">
            <span className="label">Pending My Approvals</span>
            <span className="value">{summary.pendingApprovals}</span>
            <span className="sub-status">Needs your attention</span>
          </div>
        </div>
      </div>

      <style>{`
        .dashboard { animation: fadeIn 0.6s cubic-bezier(0.4, 0, 0.2, 1); }
        
        .status-hero {
          padding: 40px;
          margin-bottom: 32px;
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
        }
        
        .status-indicator { display: flex; align-items: center; gap: 32px; }
        
        .status-visual { position: relative; width: 80px; height: 80px; display: flex; align-items: center; justify-content: center; }
        .status-main-icon { 
          width: 80px; height: 80px; border-radius: 20px; display: flex; align-items: center; justify-content: center;
          color: #fff; position: relative; z-index: 2;
        }
        .status-glow { 
          position: absolute; inset: -10px; border-radius: 30px; opacity: 0.15; z-index: 1;
          animation: pulse 2s infinite ease-in-out;
        }

        .green .status-main-icon { background: var(--status-active); box-shadow: 0 10px 20px rgba(16, 185, 129, 0.2); }
        .green .status-glow { background: var(--status-active); }
        .yellow .status-main-icon { background: var(--status-pending); box-shadow: 0 10px 20px rgba(245, 158, 11, 0.2); }
        .yellow .status-glow { background: var(--status-pending); }
        .red .status-main-icon { background: #ef4444; box-shadow: 0 10px 20px rgba(239, 68, 68, 0.2); }
        .red .status-glow { background: #ef4444; }

        @keyframes pulse { 0% { transform: scale(1); opacity: 0.15; } 50% { transform: scale(1.15); opacity: 0.05; } 100% { transform: scale(1); opacity: 0.15; } }

        .status-text h2 { font-size: 28px; font-weight: 800; margin-bottom: 8px; color: var(--color-text-main); letter-spacing: -0.5px; }
        .availability-row { display: flex; align-items: center; gap: 12px; }
        .availability-label { color: var(--color-text-dim); font-size: 15px; font-weight: 500; }
        .availability-value { 
          background: var(--color-surface-soft); color: var(--color-text-sub); 
          padding: 4px 12px; border-radius: 20px; font-weight: 700; font-size: 14px; 
          border: 1px solid var(--color-border);
        }

        .widgets-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 28px; }
        .widget-card { padding: 32px; display: flex; align-items: center; gap: 24px; position: relative; }
        
        .widget-icon { 
          width: 60px; height: 60px; border-radius: 16px; display: flex; align-items: center; justify-content: center;
          background: var(--color-surface-soft); color: var(--color-text-dim); transition: var(--transition);
        }
        .widget-card:hover .widget-icon { background: var(--color-primary-soft); color: var(--color-primary); transform: scale(1.1); }
        .widget-icon.inc { color: #f59e0b; background: rgba(245, 158, 11, 0.05); }
        .widget-icon.req { color: var(--color-primary); background: rgba(59, 130, 246, 0.05); }
        .widget-icon.app { color: var(--color-secondary); background: rgba(13, 148, 136, 0.05); }

        .widget-info { display: flex; flex-direction: column; gap: 4px; }
        .widget-info .label { font-size: 14px; color: var(--color-text-dim); font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; }
        .widget-info .value { font-size: 36px; font-weight: 800; color: var(--color-text-main); line-height: 1; margin: 4px 0; }
        .widget-info .sub-status { font-size: 13px; color: var(--color-text-sub); display: flex; align-items: center; gap: 6px; }
        .widget-info .sub-status.critical { color: #ef4444; font-weight: 700; }
        .sub-status .dot { width: 6px; height: 6px; border-radius: 50%; background: #ef4444; animation: blink 1.5s infinite; }
        @keyframes blink { 0% { opacity: 1; } 50% { opacity: 0.3; } 100% { opacity: 1; } }

        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        .loading { padding: 80px; text-align: center; color: var(--color-text-dim); font-size: 18px; font-weight: 600; }
        .error-state { padding: 80px; text-align: center; color: #ef4444; font-weight: 600; }
      `}</style>
    </div>
  );
};

export default DashboardPage;
