import React from 'react';
import { dashboardApi, DashboardSummary } from '../api/dashboardApi';

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
      // Apply brand color to CSS variable
      document.documentElement.style.setProperty('--color-primary', data.brandColor);
    } catch (error) {
      console.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (!summary) return <div className="error">Failed to load system status.</div>;

  return (
    <div className="dashboard">
      <section className="status-hero">
        <div className={`status-indicator ${summary.serviceStatus.toLowerCase()}`}>
          <div className="status-dot"></div>
          <div className="status-text">
            <h2>{summary.serviceStatus === 'GREEN' ? 'System Healthy' : 
                 summary.serviceStatus === 'YELLOW' ? 'Service Degraded' : 'Service Interruption'}</h2>
            <p>Current Service Availability: <strong>{summary.availability.toFixed(2)}%</strong></p>
          </div>
        </div>
      </section>

      <div className="widgets-grid">
        <div className="widget-card">
          <div className="widget-icon inc">⚠️</div>
          <div className="widget-info">
            <span className="label">Active Incidents</span>
            <span className="value">{summary.activeIncidents}</span>
            <span className={`sub ${summary.highPriorityIncidents > 0 ? 'alert' : ''}`}>
              {summary.highPriorityIncidents} High Priority
            </span>
          </div>
        </div>

        <div className="widget-card">
          <div className="widget-icon req">📋</div>
          <div className="widget-info">
            <span className="label">In Progress Requests</span>
            <span className="value">{summary.inProgressRequests}</span>
            <span className="sub">Moving towards resolution</span>
          </div>
        </div>

        <div className="widget-card">
          <div className="widget-icon app">✅</div>
          <div className="widget-info">
            <span className="label">Pending Approvals</span>
            <span className="value">{summary.pendingApprovals}</span>
            <span className="sub">Action required by your team</span>
          </div>
        </div>
      </div>

      <style>{`
        .dashboard {
          animation: fadeIn 0.5s ease-out;
        }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        
        .status-hero {
          background: #fff;
          border-radius: 16px;
          padding: 32px;
          margin-bottom: 32px;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          border: 1px solid #e2e8f0;
        }
        
        .status-indicator {
          display: flex;
          align-items: center;
          gap: 24px;
        }
        
        .status-dot {
          width: 64px;
          height: 64px;
          border-radius: 50%;
          position: relative;
        }
        
        .status-dot::after {
          content: '';
          position: absolute;
          inset: -8px;
          border-radius: 50%;
          opacity: 0.2;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0% { transform: scale(1); opacity: 0.4; }
          70% { transform: scale(1.5); opacity: 0; }
          100% { transform: scale(1); opacity: 0; }
        }

        .green .status-dot { background: #10b981; }
        .green .status-dot::after { background: #10b981; }
        .yellow .status-dot { background: #f59e0b; }
        .yellow .status-dot::after { background: #f59e0b; }
        .red .status-dot { background: #ef4444; }
        .red .status-dot::after { background: #ef4444; }

        .status-text h2 {
          font-size: 24px;
          font-weight: 700;
          margin-bottom: 4px;
          color: #1e293b;
        }
        .status-text p {
          color: #64748b;
          font-size: 16px;
        }

        .widgets-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .widget-card {
          background: #fff;
          border-radius: 16px;
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 20px;
          border: 1px solid #e2e8f0;
          transition: transform 0.2s;
        }
        .widget-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1);
        }

        .widget-icon {
          width: 56px;
          height: 56px;
          background: #f8fafc;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
        }

        .widget-info {
          display: flex;
          flex-direction: column;
        }
        .widget-info .label {
          font-size: 14px;
          color: #64748b;
          font-weight: 500;
        }
        .widget-info .value {
          font-size: 32px;
          font-weight: 700;
          color: #1e293b;
          line-height: 1.2;
        }
        .widget-info .sub {
          font-size: 12px;
          color: #94a3b8;
          margin-top: 4px;
        }
        .widget-info .sub.alert {
          color: #ef4444;
          font-weight: 600;
        }

        .loading {
          padding: 40px;
          text-align: center;
          color: #64748b;
        }
      `}</style>
    </div>
  );
};

export default DashboardPage;
