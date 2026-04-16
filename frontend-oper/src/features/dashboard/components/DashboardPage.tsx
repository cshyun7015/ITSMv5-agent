import React from 'react';
import { dashboardApi, OperatorDashboardSummary } from '../api/dashboardApi';

const DashboardPage: React.FC = () => {
  const [summary, setSummary] = React.useState<OperatorDashboardSummary | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadDashboard();
    const interval = setInterval(loadDashboard, 30000); // Poll every 30s
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
        <div className="stat-card">
          <span className="label">Managed Tenants</span>
          <span className="value">{summary.tenantSummaries.length}</span>
        </div>
        <div className={`stat-card ${summary.totalActiveIncidents > 0 ? 'active' : ''}`}>
          <span className="label">Total Active Incidents</span>
          <span className="value">{summary.totalActiveIncidents}</span>
        </div>
        <div className={`stat-card ${summary.slaRiskCount > 0 ? 'risk-blink' : ''}`}>
          <span className="label">SLA at Risk</span>
          <span className="value">{summary.slaRiskCount}</span>
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
        .op-header h1 { font-size: 24px; font-weight: 700; color: #fff; }
        .refresh-status { font-size: 12px; color: #10b981; }

        .stats-section {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 24px;
        }
        .stat-card {
          background: #1e293b;
          border: 1px solid #334155;
          padding: 20px;
          border-radius: 12px;
          display: flex;
          flex-direction: column;
        }
        .stat-card.active { border-color: #3b82f6; }
        .stat-card.risk-blink {
          border-color: #ef4444;
          box-shadow: 0 0 15px rgba(239, 68, 68, 0.4);
          animation: blink-border 1s infinite alternate;
        }
        @keyframes blink-border {
          from { border-color: #ef4444; }
          to { border-color: #7f1d1d; }
        }

        .stat-card .label { font-size: 13px; color: #94a3b8; margin-bottom: 8px; }
        .stat-card .value { font-size: 36px; font-weight: 800; }

        .dashboard-grid {
          display: grid;
          grid-template-columns: 1.5fr 1fr;
          gap: 24px;
        }

        .grid-left { display: flex; flex-direction: column; gap: 24px; }

        .tenant-status, .resource-monitor, .log-monitor {
          background: #1e293b;
          border: 1px solid #334155;
          border-radius: 12px;
          padding: 20px;
        }
        .tenant-status h3, .resource-monitor h3, .log-monitor h3 {
          font-size: 16px;
          margin-bottom: 16px;
          color: #94a3b8;
        }

        .tenant-list { display: flex; flex-direction: column; gap: 12px; }
        .tenant-item {
          display: flex;
          justify-content: space-between;
          padding: 12px;
          background: #0f172a;
          border-radius: 8px;
        }
        .tenant-info { display: flex; align-items: center; gap: 12px; }
        .tenant-color { width: 4px; height: 16px; border-radius: 2px; }
        .tenant-name { font-weight: 500; font-size: 14px; }

        .tenant-metrics { display: flex; align-items: center; gap: 16px; }
        .inc-count { font-size: 12px; color: #94a3b8; }

        .status-pill {
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 10px;
          font-weight: 700;
          text-transform: uppercase;
        }
        .status-pill.green { background: #064e3b; color: #34d399; }
        .status-pill.yellow { background: #451a03; color: #fbbf24; }
        .status-pill.red { background: #450a0a; color: #f87171; }

        .iframe-container { display: flex; flex-direction: column; gap: 12px; }
        
        .log-viewport {
          background: #020617;
          border-radius: 8px;
          padding: 16px;
          height: 380px;
          font-family: 'JetBrains Mono', monospace;
          font-size: 12px;
          overflow-y: auto;
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .empty-logs { color: #475569; font-style: italic; }
        .log-line { margin-bottom: 6px; color: #cbd5e1; width: 100%; }
        .log-line span { color: #64748b; margin-right: 8px; }

        .loading { padding: 40px; text-align: center; color: #94a3b8; }
      `}</style>
    </div>
  );
};

export default DashboardPage;
