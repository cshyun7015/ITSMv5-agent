import React from 'react';
import { ConfigurationItem } from '../types';

interface CIQuickStatsProps {
  cis: ConfigurationItem[];
}

const CIQuickStats: React.FC<CIQuickStatsProps> = ({ cis }) => {
  const types = ['SERVER', 'DATABASE', 'NETWORK', 'APPLICATION', 'TERMINAL'];
  
  const getTypeCount = (type: string) => cis.filter(ci => ci.typeCode === type).length;
  const getStatusCount = (status: string) => cis.filter(ci => ci.statusCode === status).length;

  return (
    <div className="ci-quick-stats">
      <div className="stats-grid">
        <div className="stat-card total">
          <div className="stat-label">Total Assets</div>
          <div className="stat-value">{cis.length}</div>
          <div className="stat-trend">Inventory Size</div>
        </div>
        
        <div className="stat-card lifecycle">
          <div className="lifecycle-bars">
            <div className="l-bar provisioning" style={{ flex: getStatusCount('PROVISIONING') || 0, display: getStatusCount('PROVISIONING') > 0 ? 'flex' : 'none' }}>
              <span>Prov ({getStatusCount('PROVISIONING')})</span>
            </div>
            <div className="l-bar active" style={{ flex: getStatusCount('ACTIVE') || 0, display: getStatusCount('ACTIVE') > 0 ? 'flex' : 'none' }}>
              <span>Active ({getStatusCount('ACTIVE')})</span>
            </div>
            <div className="l-bar maintenance" style={{ flex: getStatusCount('MAINTENANCE') || 0, display: getStatusCount('MAINTENANCE') > 0 ? 'flex' : 'none' }}>
              <span>Maint ({getStatusCount('MAINTENANCE')})</span>
            </div>
            <div className="l-bar retired" style={{ flex: getStatusCount('RETIRED') || 0, display: getStatusCount('RETIRED') > 0 ? 'flex' : 'none' }}>
              <span>Ret ({getStatusCount('RETIRED')})</span>
            </div>
            {cis.length === 0 && <div className="l-bar empty" style={{ flex: 1 }}>No data</div>}
          </div>
          <div className="stat-label">Lifecycle Distribution</div>
        </div>

        <div className="stat-card types-breakdown">
          <div className="type-pills">
            {types.map(t => (
              <div key={t} className="type-pill">
                <span className="t-name">{t.charAt(0)}{t.slice(1).toLowerCase()}</span>
                <span className="t-count">{getTypeCount(t)}</span>
              </div>
            ))}
          </div>
          <div className="stat-label">Asset Classification</div>
        </div>
      </div>

      <style>{`
        .ci-quick-stats { margin-bottom: 32px; animation: slideDown 0.4s ease-out; }
        @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

        .stats-grid { display: grid; grid-template-columns: 200px 1fr 1.5fr; gap: 20px; }
        
        .stat-card { 
          background: rgba(30, 41, 59, 0.4); border: 1px solid rgba(255,255,255,0.05); 
          border-radius: 16px; padding: 20px; display: flex; flex-direction: column; justify-content: space-between;
        }

        .stat-label { font-size: 11px; font-weight: 800; color: #64748b; text-transform: uppercase; letter-spacing: 0.5px; margin-top: 12px; }
        .stat-value { font-size: 32px; font-weight: 900; color: #fff; line-height: 1; }
        .stat-trend { font-size: 11px; color: #3b82f6; font-weight: 700; }

        .lifecycle-bars { display: flex; height: 32px; border-radius: 8px; overflow: hidden; gap: 2px; }
        .l-bar { display: flex; align-items: center; justify-content: center; font-size: 10px; font-weight: 800; color: #fff; transition: all 0.5s ease; }
        .l-bar.provisioning { background: #3b82f6; }
        .l-bar.active { background: #10b981; }
        .l-bar.maintenance { background: #f59e0b; }
        .l-bar.retired { background: #64748b; }
        .l-bar.empty { background: rgba(255,255,255,0.05); color: #475569; }

        .type-pills { display: flex; flex-wrap: wrap; gap: 8px; }
        .type-pill { 
          display: flex; align-items: center; gap: 8px; padding: 6px 12px; 
          background: rgba(255,255,255,0.03); border-radius: 8px; border: 1px solid rgba(255,255,255,0.05);
        }
        .t-name { font-size: 11px; font-weight: 700; color: #94a3b8; }
        .t-count { font-size: 12px; font-weight: 800; color: #fff; }
      `}</style>
    </div>
  );
};

export default CIQuickStats;
