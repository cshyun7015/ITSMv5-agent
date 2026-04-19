import React from 'react';
import { dashboardApi, OperatorDashboardSummary, TenantSummary, RecentActivity } from '../api/dashboardApi';

interface OperatorDashboardProps {
  onNavigate?: (tab: string) => void;
}

const OperatorDashboard: React.FC<OperatorDashboardProps> = ({ onNavigate }) => {
  const [summary, setSummary] = React.useState<OperatorDashboardSummary | null>(null);
  const [loading, setLoading] = React.useState(true);
  const activityListRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    loadDashboard();
    const interval = setInterval(loadDashboard, 10000);
    return () => clearInterval(interval);
  }, []);

  React.useEffect(() => {
    if (activityListRef.current) {
      activityListRef.current.scrollTop = 0; // Newest on top, or scroll to bottom if needed
    }
  }, [summary?.recentActivities]);

  const loadDashboard = async () => {
    try {
      const data = await dashboardApi.getSummary();
      setSummary(data);
    } catch (error) {
      console.error('Failed to load GOC dashboard');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'INCIDENT_NEW': return '⚠️';
      case 'STATUS_CHANGE': return '🔄';
      case 'SLA_WARNING': return '🚨';
      default: return '📜';
    }
  };

  if (loading) return (
    <div className="loading-state">
      <div className="spinner"></div>
      <p>Syncing with Global Operations Center...</p>
    </div>
  );
  
  if (!summary) return <div className="error">Satellite Link Offline.</div>;

  const hasP1Record = summary.priorityP1Count > 0;

  return (
    <div className={`op-dashboard ${hasP1Record ? 'emergency' : ''}`}>
      <header className="op-header">
        <div className="title-block">
          <h1>Global Operations Center</h1>
          <div className="pulse-indicator"></div>
          <span className="live-tag">Live Stream Active</span>
        </div>
        <div className="sys-time">
          {new Date().toLocaleTimeString()} (UTC+9)
        </div>
      </header>

      <section className="kpi-grid">
        <div className="kpi-card tenants" onClick={() => onNavigate?.('opers')}>
          <div className="kpi-label">Tenants</div>
          <div className="kpi-value">{summary.totalTenants}</div>
          <div className="kpi-meta">Managed Entities</div>
        </div>
        <div className="kpi-card priority-radar">
          <div className="radar-header">Priority Distribution</div>
          <div className="radar-bars">
            <div className="bar-item p1" title="P1 - Critical">
                <span className="b-label">P1</span>
                <div className="b-track"><div className="b-fill" style={{ width: `${Math.min(100, (summary.priorityP1Count / (summary.totalActiveIncidents || 1)) * 100)}%` }}></div></div>
                <span className="b-val">{summary.priorityP1Count}</span>
            </div>
            <div className="bar-item p2" title="P2 - High">
                <span className="b-label">P2</span>
                <div className="b-track"><div className="b-fill" style={{ width: `${Math.min(100, (summary.priorityP2Count / (summary.totalActiveIncidents || 1)) * 100)}%` }}></div></div>
                <span className="b-val">{summary.priorityP2Count}</span>
            </div>
          </div>
        </div>
        <div className={`kpi-card incidents ${hasP1Record ? 'pulse-red' : ''}`} onClick={() => onNavigate?.('incidents')}>
          <div className="kpi-label">Active Incidents</div>
          <div className="kpi-value">{summary.totalActiveIncidents}</div>
          <div className="kpi-meta">
            {summary.priorityP1Count > 0 ? (
               <span className="urgent-flash">⚠️ {summary.priorityP1Count} CRITICAL</span>
            ) : "All Systems Green"}
          </div>
        </div>
        <div className={`kpi-card sla ${summary.slaRiskCount > 0 ? 'risk' : ''}`}>
          <div className="kpi-label">SLA Breach Risk</div>
          <div className="kpi-value">{summary.slaRiskCount}</div>
          <div className="kpi-meta">Due within 1 hour</div>
        </div>
      </section>

      <div className="dashboard-layout">
        <div className="layout-left">
          <section className="tenant-health">
            <h3>Tenant Operational Status</h3>
            <div className="tenant-scroller">
              {summary.tenantSummaries.map((t: TenantSummary) => (
                <div key={t.tenantId} className={`t-row ${t.serviceStatus}`}>
                  <div className="t-brand" style={{ background: t.brandColor }}></div>
                  <div className="t-name">{t.tenantName}</div>
                  <div className="t-metrics">
                    <span className="t-inc">{t.incidentCount} active</span>
                    <span className={`t-pill ${t.serviceStatus}`}>{t.serviceStatus}</span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="infra-monitor">
            <h3>Infrastructure Observability (M4 Node)</h3>
            <div className="monitor-grid">
              <iframe 
                src="http://localhost:3001/d-solo/system_overview/system-overview?orgId=1&panelId=2&refresh=5s" 
                width="100%" height="160" frameBorder="0"
              ></iframe>
              <iframe 
                src="http://localhost:3001/d-solo/system_overview/system-overview?orgId=1&panelId=4&refresh=5s" 
                width="100%" height="160" frameBorder="0"
              ></iframe>
            </div>
          </section>
        </div>

        <div className="layout-right">
          <section className="activity-center">
            <h3>Situational Activity Feed</h3>
            <div className="activity-list" ref={activityListRef}>
              {summary.recentActivities.map((act: RecentActivity, i: number) => (
                <div key={i} className={`act-item ${act.type}`}>
                  <div className="act-icon">{getActivityIcon(act.type)}</div>
                  <div className="act-content">
                    <div className="act-header">
                      <span className="act-tenant">{act.tenantId}</span>
                      <span className="act-time">{new Date(act.timestamp).toLocaleTimeString()}</span>
                    </div>
                    <div className="act-msg">{act.message}</div>
                  </div>
                </div>
              ))}
              {summary.recentActivities.length === 0 && (
                <div className="empty-feed">No recent activity detected.</div>
              )}
            </div>
          </section>
        </div>
      </div>

      <style>{`
        .op-dashboard { color: #e2e8f0; width: 100%; animation: fadeIn 0.5s ease-out; }
        
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .op-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 32px; padding-bottom: 16px; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .title-block { display: flex; align-items: center; gap: 16px; }
        .op-header h1 { font-size: 28px; font-weight: 900; background: linear-gradient(to right, #fff, #94a3b8); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
        
        .pulse-indicator { width: 10px; height: 10px; background: #10b981; border-radius: 50%; box-shadow: 0 0 10px #10b981; animation: pulse-green 2s infinite; }
        @keyframes pulse-green { 0% { transform: scale(1); opacity: 1; } 100% { transform: scale(2.5); opacity: 0; } }
        
        .live-tag { font-size: 10px; font-weight: 800; color: #10b981; text-transform: uppercase; letter-spacing: 1px; }
        .sys-time { font-family: monospace; color: #64748b; font-size: 14px; }

        /* KPI Grid */
        .kpi-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 32px; }
        .kpi-card { background: rgba(30, 41, 59, 0.4); backdrop-filter: blur(12px); border: 1px solid rgba(255,255,255,0.05); border-radius: 20px; padding: 24px; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); cursor: pointer; position: relative; overflow: hidden; }
        .kpi-card:hover { transform: translateY(-5px); background: rgba(30, 41, 59, 0.6); border-color: rgba(255,255,255,0.1); box-shadow: 0 12px 30px rgba(0,0,0,0.3); }
        
        .kpi-label { font-size: 12px; font-weight: 700; color: #94a3b8; text-transform: uppercase; margin-bottom: 8px; }
        .kpi-value { font-size: 36px; font-weight: 900; color: #fff; margin-bottom: 4px; }
        .kpi-meta { font-size: 12px; color: #64748b; }

        .pulse-red { border-color: rgba(239, 68, 68, 0.5); animation: red-glow 1.5s infinite alternate; }
        @keyframes red-glow { 0% { box-shadow: 0 0 5px rgba(239, 68, 68, 0.2); } 100% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.4); } }
        .urgent-flash { color: #f87171; font-weight: 800; animation: flash 1s infinite alternate; }
        @keyframes flash { from { opacity: 0.5; } to { opacity: 1; } }

        .risk { border-color: rgba(245, 158, 11, 0.5); }

        /* Priority Radar */
        .radar-bars { display: flex; flex-direction: column; gap: 8px; margin-top: 10px; }
        .bar-item { display: flex; align-items: center; gap: 8px; }
        .b-label { font-size: 10px; font-weight: 800; width: 20px; }
        .b-track { flex: 1; height: 6px; background: rgba(255,255,255,0.05); border-radius: 3px; overflow: hidden; }
        .b-fill { height: 100%; border-radius: 3px; transition: width 1s ease-out; }
        .p1 .b-fill { background: #ef4444; }
        .p2 .b-fill { background: #f59e0b; }
        .b-val { font-size: 10px; font-weight: 700; width: 15px; text-align: right; }

        /* Layout */
        .dashboard-layout { display: grid; grid-template-columns: 1fr 400px; gap: 24px; }
        .layout-left { display: flex; flex-direction: column; gap: 24px; }
        
        .tenant-health, .infra-monitor, .activity-center { background: rgba(15, 23, 42, 0.3); border-radius: 20px; padding: 24px; border: 1px solid rgba(255,255,255,0.03); }
        .tenant-health h3, .infra-monitor h3, .activity-center h3 { font-size: 14px; font-weight: 800; color: #94a3b8; margin-bottom: 20px; text-transform: uppercase; letter-spacing: 0.5px; }

        .tenant-scroller { display: flex; flex-direction: column; gap: 10px; max-height: 380px; overflow-y: auto; padding-right: 8px; }
        .t-row { display: flex; align-items: center; justify-content: space-between; padding: 12px 16px; background: rgba(255,255,255,0.02); border-radius: 12px; transition: background 0.2s; }
        .t-row:hover { background: rgba(255,255,255,0.05); }
        .t-brand { width: 4px; height: 18px; border-radius: 2px; }
        .t-name { flex: 1; margin-left:12px; font-weight: 600; font-size: 14px; }
        .t-metrics { display: flex; align-items: center; gap: 15px; }
        .t-inc { font-size: 12px; color: #64748b; }
        .t-pill { padding: 3px 8px; border-radius: 5px; font-size: 10px; font-weight: 800; }
        .t-pill.GREEN { color: #34d399; background: rgba(52, 211, 153, 0.1); }
        .t-pill.YELLOW { color: #fbbf24; background: rgba(251, 191, 36, 0.1); }
        .t-pill.RED { color: #f87171; background: rgba(248, 113, 113, 0.1); animation: urgent-blink 1s infinite; }
        @keyframes urgent-blink { 100% { opacity: 0.5; } }

        .monitor-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }

        /* Activity Feed */
        .activity-center { display: flex; flex-direction: column; height: 750px; }
        .activity-list { flex: 1; overflow-y: auto; display: flex; flex-direction: column; gap: 12px; padding-right: 5px; }
        .act-item { display: flex; gap: 12px; padding: 12px; background: rgba(255,255,255,0.02); border-radius: 12px; border-left: 2px solid transparent; }
        .act-item.INCIDENT_NEW { border-left-color: #ef4444; background: rgba(239, 68, 68, 0.05); }
        .act-item.STATUS_CHANGE { border-left-color: #3b82f6; }
        .act-item.SLA_WARNING { border-left-color: #f59e0b; background: rgba(245, 158, 11, 0.05); }
        
        .act-icon { font-size: 18px; width: 24px; height: 24px; display: flex; align-items: center; justify-content: center; }
        .act-content { flex: 1; }
        .act-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px; }
        .act-tenant { font-size: 11px; font-weight: 800; color: #3b82f6; text-transform: uppercase; }
        .act-time { font-size: 10px; color: #64748b; }
        .act-msg { font-size: 12px; color: #cbd5e1; line-height: 1.4; }

        .loading-state { height: 60vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 20px; color: #64748b; }
        .spinner { width: 40px; height: 40px; border: 3px solid rgba(59, 130, 246, 0.2); border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }

        .loading-state p { font-size: 14px; font-weight: 600; letter-spacing: 0.5px; }
      `}</style>
    </div>
  );
};

export default OperatorDashboard;
