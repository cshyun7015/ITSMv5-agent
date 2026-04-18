import React from 'react';
import { dashboardApi, OperatorDashboardSummary } from '../api/dashboardApi';

const DashboardPage: React.FC = () => {
  const [summary, setSummary] = React.useState<OperatorDashboardSummary | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadDashboard();
    const interval = setInterval(loadDashboard, 10000); // Poll every 10s
    return () => clearInterval(interval);
  }, []);

  const loadDashboard = async () => {
    try {
      const data = await dashboardApi.getSummary();
      setSummary(data);
    } catch (error) {
      console.error('Failed to load operator dashboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading Operational Data...</div>;
  if (!summary) return <div className="error">Access Denied or System Offline.</div>;

  return (
    <div className="op-dashboard">
      <header className="op-header">
        <h1>Global Operations Center</h1>
        <div className="refresh-status">Live Updates Active</div>
      </header>

      <section className="stats-section">
        <div className="stat-card tenants">
          <div className="stat-header">
            <span className="icon">🏢</span>
            <span className="label">Managed Tenants</span>
          </div>
          <span className="value">{summary.totalTenants}</span>
        </div>
        <div className="stat-card catalogs">
          <div className="stat-header">
            <span className="icon">📋</span>
            <span className="label">Service Catalogs</span>
          </div>
          <span className="value">{summary.totalCatalogs}</span>
        </div>
        <div className={`stat-card requests ${summary.totalActiveRequests > 0 ? 'active' : ''}`}>
          <div className="stat-header">
            <span className="icon">📩</span>
            <span className="label">Active Requests</span>
          </div>
          <span className="value">{summary.totalActiveRequests}</span>
        </div>
        <div className={`stat-card incidents ${summary.totalActiveIncidents > 0 ? 'risk' : ''}`}>
          <div className="stat-header">
            <span className="icon">⚠️</span>
            <span className="label">Active Incidents</span>
          </div>
          <span className="value">{summary.totalActiveIncidents}</span>
        </div>
        <div className={`stat-card changes ${summary.totalActiveChanges > 0 ? 'process' : ''}`}>
          <div className="stat-header">
            <span className="icon">🔄</span>
            <span className="label">Active Changes</span>
          </div>
          <span className="value">{summary.totalActiveChanges}</span>
        </div>
        <div className="stat-card cis">
          <div className="stat-header">
            <span className="icon">📦</span>
            <span className="label">Active CI (Assets)</span>
          </div>
          <span className="value">{summary.totalActiveCIs}</span>
        </div>
      </section>

      <div className="dashboard-grid">
        <div className="grid-left">
          <section className="tenant-status">
            <h3>Tenant Health Monitor</h3>
            <div className="tenant-list">
              {summary.tenantSummaries.map(tenant => (
                <div key={tenant.tenantId.toString()} className="tenant-item">
                  <div className="tenant-info">
                    <span className="tenant-color" style={{ background: tenant.brandColor }}></span>
                    <span className="tenant-name">{tenant.tenantName}</span>
                  </div>
                  <div className="tenant-metrics">
                    <span className="inc-count">{tenant.incidentCount} active</span>
                    <span className={`status-pill ${tenant.serviceStatus.toLowerCase()}`}>
                      {tenant.serviceStatus}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="resource-monitor">
            <h3>System Resource (Grafana)</h3>
            <div className="iframe-container">
                {/* Embed System Overview Dashboard */}
                <iframe 
                    src="http://localhost:3001/d-solo/system_overview/system-overview?orgId=1&panelId=2" 
                    width="100%" 
                    height="200" 
                    frameBorder="0"
                ></iframe>
                <iframe 
                    src="http://localhost:3001/d-solo/system_overview/system-overview?orgId=1&panelId=4" 
                    width="100%" 
                    height="200" 
                    frameBorder="0"
                ></iframe>
            </div>
          </section>
        </div>

        <div className="grid-right">
            <section className="log-monitor">
                <h3>Centralized Service Logs</h3>
                <div className="log-viewport">
                    <div className="empty-logs">Waiting for log stream connection...</div>
                </div>
            </section>
        </div>
      </div>

      <style>{`
        .op-dashboard {
          color: #f1f5f9;
          width: 100%;
        }
        .op-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
        }
        .op-header h1 { font-size: 24px; font-weight: 800; color: #fff; letter-spacing: -0.5px; }
        .refresh-status { 
          font-size: 11px; 
          color: #10b981; 
          background: rgba(16, 185, 129, 0.1);
          padding: 4px 10px;
          border-radius: 20px;
          border: 1px solid rgba(16, 185, 129, 0.2);
          text-transform: uppercase;
          font-weight: 700;
        }

        .stats-section {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          grid-template-rows: repeat(2, auto);
          gap: 16px;
          margin-bottom: 32px;
        }

        .stat-card {
          background: rgba(30, 41, 59, 0.7);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 24px;
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          transition: transform 0.2s, box-shadow 0.2s;
        }
        .stat-card:hover {
          transform: translateY(-4px);
          background: rgba(30, 41, 59, 0.9);
          box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
        }

        .stat-header {
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .stat-header .icon {
          font-size: 20px;
          background: rgba(255, 255, 255, 0.03);
          width: 36px;
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 10px;
        }

        .stat-card .label { font-size: 13px; color: #94a3b8; font-weight: 600; }
        .stat-card .value { font-size: 32px; font-weight: 800; color: #fff; }

        /* KPI Specific Accents */
        .stat-card.tenants .icon { background: rgba(59, 130, 246, 0.1); }
        .stat-card.catalogs .icon { background: rgba(139, 92, 246, 0.1); }
        .stat-card.requests.active { border-color: rgba(16, 185, 129, 0.3); }
        .stat-card.requests.active .icon { background: rgba(16, 185, 129, 0.1); color: #10b981; }
        
        .stat-card.incidents.risk {
          border-color: rgba(239, 68, 68, 0.3);
          box-shadow: 0 0 15px rgba(239, 68, 68, 0.1);
        }
        .stat-card.incidents .icon { background: rgba(239, 68, 68, 0.1); }
        
        .stat-card.changes.process { border-color: rgba(245, 158, 11, 0.3); }
        .stat-card.changes .icon { background: rgba(245, 158, 11, 0.1); }
        
        .stat-card.cis .icon { background: rgba(148, 163, 184, 0.1); }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 24px;
        }

        .grid-left { display: flex; flex-direction: column; gap: 24px; }

        .tenant-status, .resource-monitor, .log-monitor {
          background: rgba(30, 41, 59, 0.4);
          backdrop-filter: blur(10px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          padding: 24px;
        }
        .tenant-status h3, .resource-monitor h3, .log-monitor h3 {
          font-size: 16px;
          margin-bottom: 20px;
          color: #94a3b8;
          font-weight: 700;
        }

        .tenant-list { display: flex; flex-direction: column; gap: 12px; }
        .tenant-item {
          display: flex;
          justify-content: space-between;
          padding: 14px;
          background: rgba(15, 23, 42, 0.3);
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.02);
        }
        .tenant-info { display: flex; align-items: center; gap: 12px; }
        .tenant-color { width: 4px; height: 16px; border-radius: 2px; }
        .tenant-name { font-weight: 600; font-size: 14px; color: #e2e8f0; }

        .tenant-metrics { display: flex; align-items: center; gap: 16px; }
        .inc-count { font-size: 12px; color: #64748b; }

        .status-pill {
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 10px;
          font-weight: 800;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .status-pill.green { background: rgba(6, 78, 59, 0.4); color: #34d399; border: 1px solid rgba(52, 211, 153, 0.2); }
        .status-pill.yellow { background: rgba(69, 26, 3, 0.4); color: #fbbf24; border: 1px solid rgba(251, 191, 36, 0.2); }
        .status-pill.red { background: rgba(69, 10, 10, 0.4); color: #f87171; border: 1px solid rgba(248, 113, 113, 0.2); }

        .iframe-container { display: flex; flex-direction: column; gap: 12px; }
        .iframe-container iframe { border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.05); }
        
        .log-viewport {
          background: #020617;
          border-radius: 12px;
          padding: 16px;
          height: 380px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          overflow-y: auto;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1px solid rgba(255, 255, 255, 0.05);
        }
        .empty-logs { color: #334155; font-style: italic; }
        .loading { padding: 40px; text-align: center; color: #64748b; }
      `}</style>
    </div>
  );
};

export default DashboardPage;
