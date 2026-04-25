import React, { useState, useEffect, useRef } from 'react';
import { dashboardApi, OperatorDashboardSummary, TenantSummary, RecentActivity } from '../api/dashboardApi';
import { Widget, AssetDonut } from './DashboardWidgets';

interface AdminDashboardProps {
  onNavigate?: (tab: string) => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigate }) => {
  const [summary, setSummary] = useState<OperatorDashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('30d'); // 30d, 90d, ytd
  const activityListRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadDashboard();
    const interval = setInterval(loadDashboard, 30000); // 30s for admin
    return () => clearInterval(interval);
  }, [period]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const now = new Date();
      let startDateStr = '';
      
      if (period === '30d') {
        const d = new Date();
        d.setDate(now.getDate() - 30);
        startDateStr = d.toISOString();
      } else if (period === '90d') {
        const d = new Date();
        d.setDate(now.getDate() - 90);
        startDateStr = d.toISOString();
      } else if (period === 'ytd') {
        const d = new Date(now.getFullYear(), 0, 1);
        startDateStr = d.toISOString();
      }

      const data = await dashboardApi.getSummary(startDateStr, now.toISOString());
      setSummary(data);
    } catch (error) {
      console.error('GOC Sync Failed', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading && !summary) return (
    <div className="goc-loading">
      <div className="radar"></div>
      <p>Establishing Secure GOC Uplink...</p>
    </div>
  );

  if (!summary) return <div className="goc-error">Uplink Interrupted. Check Admin Credentials.</div>;

  return (
    <div className="goc-container">
      <header className="goc-header">
        <div className="title-area">
          <div className="badge">ADMIN COMMAND</div>
          <h1>Global Operations Command Center</h1>
          <p className="subtitle">Governance & Situational Awareness across {summary.totalTenants} Tenants</p>
        </div>
        
        <div className="header-controls">
          <div className="period-selector">
            <button className={period === '30d' ? 'active' : ''} onClick={() => setPeriod('30d')}>30 Days</button>
            <button className={period === '90d' ? 'active' : ''} onClick={() => setPeriod('90d')}>90 Days</button>
            <button className={period === 'ytd' ? 'active' : ''} onClick={() => setPeriod('ytd')}>YTD</button>
          </div>
          <div className="sys-clock">
            {new Date().toLocaleTimeString()} <span>UTC+9</span>
          </div>
        </div>
      </header>

      <div className="goc-grid">
        {/* KPI Row */}
        <div className="kpi-row">
          <div className="mini-kpi">
            <span className="label">Managed Tenants</span>
            <span className="value">{summary.totalTenants}</span>
            <div className="trend">↑ Global Scale</div>
          </div>
          <div className="mini-kpi highlight">
            <span className="label">Active Incidents</span>
            <span className="value">{summary.totalActiveIncidents}</span>
            <div className="trend red">P1/P2: {summary.priorityP1Count + summary.priorityP2Count}</div>
          </div>
          <div className="mini-kpi">
            <span className="label">SLA Breach Risk</span>
            <span className="value">{summary.slaRiskCount}</span>
            <div className="trend orange">60m Window</div>
          </div>
          <div className="mini-kpi">
            <span className="label">Managed Assets</span>
            <span className="value">{summary.totalActiveCIs}</span>
            <div className="trend blue">Verified Stable</div>
          </div>
        </div>

        {/* Top Widgets */}
        <Widget title="Global Asset Portfolio" icon="📦" description="Cross-tenant infrastructure composition" className="asset-widget">
          <AssetDonut data={summary.ciDistribution} />
        </Widget>

        <Widget title="Tenant Performance Matrix" icon="📊" description={`Efficiency analysis for last ${period}`} className="perf-widget">
          <div className="perf-table-wrapper">
            <table className="perf-table">
              <thead>
                <tr>
                  <th>Tenant</th>
                  <th className="center">Status</th>
                  <th className="right">MTTR</th>
                  <th className="right">SLA Rate</th>
                </tr>
              </thead>
              <tbody>
                {(summary.tenantSummaries || []).map((t: TenantSummary) => (
                  <tr key={t.tenantId} onClick={() => onNavigate?.('incidents')}>
                    <td>
                      <div className="t-cell">
                        <div className="t-color" style={{ background: t.brandColor }}></div>
                        <span>{t.tenantName}</span>
                      </div>
                    </td>
                    <td className="center">
                      <span className={`status-tag ${t.serviceStatus}`}>{t.serviceStatus}</span>
                    </td>
                    <td className="right font-mono">{t.mttr}m</td>
                    <td className="right">
                      <div className="sla-progress">
                        <div className="sla-bar" style={{ width: `${t.slaComplianceRate}%`, background: t.slaComplianceRate > 95 ? '#10b981' : t.slaComplianceRate > 80 ? '#f59e0b' : '#ef4444' }}></div>
                        <span>{t.slaComplianceRate}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Widget>

        {/* Bottom Widgets */}
        <Widget title="Administrative Command Hub" icon="⚙️" description="Direct governance controls" className="command-widget">
          <div className="command-grid">
            <button className="cmd-btn" onClick={() => onNavigate?.('opers')}>
              <span className="icon">➕</span>
              <span className="label">Onboard New Tenant</span>
            </button>
            <button className="cmd-btn" onClick={() => onNavigate?.('catalog')}>
              <span className="icon">📋</span>
              <span className="label">Manage Catalog Tpl</span>
            </button>
            <button className="cmd-btn" onClick={() => onNavigate?.('users')}>
              <span className="icon">👥</span>
              <span className="label">Operator Audit</span>
            </button>
            <button className="cmd-btn active" onClick={() => onNavigate?.('dashboard')}>
              <span className="icon">📡</span>
              <span className="label">System Global Logs</span>
            </button>
          </div>
        </Widget>

        <Widget title="Situational Activity Feed" icon="📡" description="Real-time multi-tenant events" className="activity-widget">
           <div className="goc-activity-list">
              {(summary.recentActivities || []).map((act: RecentActivity, i: number) => (
                <div key={i} className="goc-act-item">
                  <div className="act-t-id">{act.tenantId}</div>
                  <div className="act-main">
                    <p>{act.message}</p>
                    <span>{new Date(act.timestamp).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
           </div>
        </Widget>
      </div>

      <style>{`
        .goc-container {
          color: #e2e8f0;
          animation: gocFadeIn 0.8s ease-out;
          padding-bottom: 40px;
        }
        @keyframes gocFadeIn { from { opacity: 0; transform: scale(0.98); } to { opacity: 1; transform: scale(1); } }

        .goc-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-end;
          margin-bottom: 40px;
        }
        .badge {
          display: inline-block;
          padding: 4px 12px;
          background: rgba(59, 130, 246, 0.2);
          border: 1px solid rgba(59, 130, 246, 0.3);
          color: #3b82f6;
          border-radius: 20px;
          font-size: 10px;
          font-weight: 900;
          letter-spacing: 1.5px;
          margin-bottom: 12px;
        }
        .goc-header h1 {
          margin: 0;
          font-size: 32px;
          font-weight: 950;
          letter-spacing: -0.8px;
          background: linear-gradient(135deg, #fff 0%, #94a3b8 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        .subtitle { margin: 8px 0 0; color: #64748b; font-size: 14px; font-weight: 500; }

        .header-controls { display: flex; align-items: center; gap: 24px; }
        .period-selector {
          background: rgba(15, 23, 42, 0.6);
          padding: 4px;
          border-radius: 12px;
          border: 1px solid rgba(255,255,255,0.05);
          display: flex;
        }
        .period-selector button {
          background: transparent;
          border: none;
          color: #64748b;
          padding: 6px 16px;
          font-size: 12px;
          font-weight: 800;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .period-selector button.active { background: #3b82f6; color: #fff; }
        .sys-clock { font-family: monospace; font-size: 14px; color: #94a3b8; }
        .sys-clock span { color: #475569; margin-left: 4px; }

        .goc-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }
        .kpi-row {
          grid-column: span 2;
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 24px;
        }
        .mini-kpi {
          background: rgba(30, 41, 59, 0.2);
          border: 1px solid rgba(255,255,255,0.03);
          border-radius: 20px;
          padding: 20px;
          display: flex;
          flex-direction: column;
        }
        .mini-kpi.highlight { border-color: rgba(239, 68, 68, 0.3); background: rgba(239, 68, 68, 0.02); }
        .mini-kpi .label { font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; margin-bottom: 8px; }
        .mini-kpi .value { font-size: 28px; font-weight: 900; color: #fff; }
        .mini-kpi .trend { font-size: 11px; font-weight: 700; margin-top: 4px; color: #10b981; }
        .mini-kpi .trend.red { color: #ef4444; }
        .mini-kpi .trend.orange { color: #f59e0b; }
        .mini-kpi .trend.blue { color: #3b82f6; }

        .perf-table-wrapper { overflow-x: auto; }
        .perf-table { width: 100%; border-collapse: collapse; }
        .perf-table th { padding: 12px; font-size: 11px; font-weight: 800; color: #475569; text-transform: uppercase; text-align: left; }
        .perf-table td { padding: 14px 12px; border-bottom: 1px solid rgba(255,255,255,0.02); color: #fff; font-size: 13px; font-weight: 600; }
        .perf-table tr:hover td { background: rgba(255,255,255,0.02); cursor: pointer; }
        .t-cell { display: flex; align-items: center; gap: 10px; }
        .t-color { width: 4px; height: 16px; border-radius: 2px; }
        
        .status-tag { padding: 2px 8px; border-radius: 4px; font-size: 10px; font-weight: 800; }
        .status-tag.GREEN { color: #34d399; background: rgba(52, 211, 153, 0.1); }
        .status-tag.YELLOW { color: #fbbf24; background: rgba(251, 191, 36, 0.1); }
        .status-tag.RED { color: #f87171; background: rgba(248, 113, 113, 0.1); }
        
        .sla-progress { display: flex; align-items: center; gap: 8px; font-size: 11px; font-weight: 700; color: #94a3b8; }
        .sla-bar { height: 4px; border-radius: 2px; flex: 1; max-width: 60px; }
        .font-mono { font-family: monospace; }
        .center { text-align: center; }
        .right { text-align: right; }

        .command-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .cmd-btn {
          height: 100px; background: rgba(15, 23, 42, 0.4); border: 1px solid rgba(255,255,255,0.05);
          border-radius: 16px; color: #cbd5e1; display: flex; flex-direction: column; align-items: center; justify-content: center;
          gap: 10px; cursor: pointer; transition: all 0.2s;
        }
        .cmd-btn:hover { background: #3b82f6; border-color: #3b82f6; color: #fff; transform: translateY(-3px); }
        .cmd-btn .icon { font-size: 24px; }
        .cmd-btn .label { font-size: 11px; font-weight: 800; text-transform: uppercase; }

        .goc-activity-list { display: flex; flex-direction: column; gap: 12px; }
        .goc-act-item { display: flex; gap: 16px; padding: 12px; background: rgba(255,255,255,0.02); border-radius: 12px; }
        .act-t-id { background: #3b82f6; color: #fff; font-size: 9px; font-weight: 900; height: 18px; padding: 0 6px; border-radius: 4px; display: flex; align-items: center; }
        .act-main p { margin: 0; font-size: 12px; color: #cbd5e1; line-height: 1.4; }
        .act-main span { display: block; margin-top: 4px; font-size: 10px; color: #64748b; font-family: monospace; }

        .goc-loading { height: 70vh; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 24px; }
        .radar { width: 60px; height: 60px; border: 2px solid #3b82f6; border-radius: 50%; position: relative; }
        .radar::after { content: ''; position: absolute; width: 30px; height: 30px; border-top: 2px solid #3b82f6; border-right: 2px solid #3b82f6; border-radius: 0 30px 0 0; top: 0; right: 0; animation: radarSpin 2s linear infinite; transform-origin: bottom left; }
        @keyframes radarSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
};

export default AdminDashboard;
