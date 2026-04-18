import React, { useEffect, useState } from 'react';
import { ciApi } from '../api/ciApi';
import { ConfigurationItem } from '../types';
import CIFormModal from './CIFormModal';
import { useAuth } from '../../auth/context/AuthContext';

const CIList: React.FC = () => {
  const { user } = useAuth();
  const [cis, setCis] = useState<ConfigurationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCI, setSelectedCI] = useState<ConfigurationItem | undefined>(undefined);

  useEffect(() => {
    loadCIs();
  }, [user]);

  const loadCIs = async () => {
    if (!user?.tenantId) return;
    try {
      const data = await ciApi.getCIs(user.tenantId);
      setCis(data);
    } catch (error) {
      console.error('Failed to load CIs');
    } finally {
      setIsLoading(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SERVER': return '🖥️';
      case 'DATABASE': return '💾';
      case 'NETWORK': return '🌐';
      case 'APPLICATION': return '🧩';
      case 'TERMINAL': return '💻';
      default: return '📦';
    }
  };

  const handleOpenModal = (ci?: ConfigurationItem) => {
    setSelectedCI(ci);
    setIsModalOpen(true);
  };

  if (isLoading) return <div className="loading">Initializing CMDB...</div>;

  return (
    <div className="ci-container">
      <div className="board-header">
        <div className="title-area">
          <h2>Configuration Items (CIs)</h2>
          <span className="count-badge">{cis.length} Assets</span>
        </div>
        <div className="board-actions">
          <div className="stats-box">
            <div className="stat active">Active: {cis.filter(c => c.statusCode === 'ACTIVE').length}</div>
            <div className="stat maintenance">Alert: {cis.filter(c => c.statusCode === 'MAINTENANCE').length}</div>
          </div>
          <button className="btn-register" onClick={() => handleOpenModal()}>
            + Register CI
          </button>
        </div>
      </div>

      <div className="standard-list">
        {cis.map(ci => (
          <div key={ci.ciId} className="list-item ci-item" onClick={() => handleOpenModal(ci)}>
            <div className="item-icon-side">
              <span className="type-icon">{getTypeIcon(ci.typeCode)}</span>
            </div>
            <div className="item-main">
              <div className="id-tag">CI-{String(ci.ciId).padStart(5, '0')}</div>
              <div className="title-row">
                <h3>{ci.name}</h3>
                <span className={`status-pill ${ci.statusCode}`}>{ci.statusCode}</span>
              </div>
              <div className="meta-row">
                <span className="type">[{ci.typeCode}]</span>
                <span className="serial">S/N: {ci.serialNumber || 'N/A'}</span>
                <span className="location">📍 {ci.location || 'Unknown'}</span>
                <span className="owner">👤 {ci.ownerName || 'Unassigned'}</span>
              </div>
            </div>
            <div className="item-arrow">›</div>
          </div>
        ))}

        {cis.length === 0 && (
          <div className="all-clear">
            <div className="icon">📂</div>
            <h3>No Assets Registered</h3>
            <p>Ready to build your configuration management database.</p>
          </div>
        )}
      </div>

      <style>{`
        .ci-container { width: 100%; animation: fadeIn 0.4s ease-out; }
        @keyframes fadeIn { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }

        .board-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 32px; }
        .title-area h2 { margin: 0; font-size: 24px; font-weight: 800; color: #fff; letter-spacing: -0.5px; }
        .count-badge { background: rgba(255,255,255,0.08); padding: 4px 12px; border-radius: 20px; font-size: 13px; color: #94a3b8; margin-left: 12px; }

        .board-actions { display: flex; align-items: center; gap: 24px; }
        .stats-box { display: flex; gap: 12px; }
        .stat { padding: 4px 14px; border-radius: 8px; font-size: 12px; font-weight: 700; border: 1px solid rgba(255,255,255,0.05); }
        .stat.active { background: rgba(16, 185, 129, 0.1); color: #34d399; }
        .stat.maintenance { background: rgba(245, 158, 11, 0.1); color: #fbbf24; }

        .btn-register {
          background: linear-gradient(135deg, #3b82f6, #2563eb); color: #fff; border: none;
          padding: 10px 20px; border-radius: 12px; font-weight: 700; cursor: pointer;
          transition: all 0.2s; box-shadow: 0 4px 15px rgba(37, 99, 235, 0.2);
        }
        .btn-register:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(37, 99, 235, 0.3); }

        .standard-list { display: flex; flex-direction: column; gap: 12px; }
        .list-item {
          display: flex; align-items: center; background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; transition: all 0.2s; cursor: pointer;
          padding: 16px 24px;
        }
        .list-item:hover { background: rgba(255,255,255,0.06); transform: translateX(4px); border-color: rgba(59, 130, 246, 0.3); }

        .item-icon-side { width: 48px; height: 48px; border-radius: 12px; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; margin-right: 20px; }
        .type-icon { font-size: 24px; }

        .item-main { flex: 1; }
        .id-tag { font-size: 11px; font-weight: 800; color: #3b82f6; font-family: 'JetBrains Mono', monospace; margin-bottom: 4px; }
        .title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .title-row h3 { margin: 0; font-size: 17px; font-weight: 700; color: #f8fafc; }
        
        .status-pill { font-size: 10px; font-weight: 800; padding: 2px 10px; border-radius: 6px; text-transform: uppercase; }
        .status-pill.ACTIVE { background: #059669; color: #fff; }
        .status-pill.PROVISIONING { background: #3b82f6; color: #fff; }
        .status-pill.MAINTENANCE { background: #d97706; color: #fff; }
        .status-pill.RETIRED { background: #4b5563; color: #fff; }

        .meta-row { display: flex; gap: 20px; font-size: 12px; color: #94a3b8; }
        .item-arrow { font-size: 24px; color: #334155; margin-left: 12px; }

        .all-clear { padding: 100px; text-align: center; color: #475569; }
        .all-clear .icon { font-size: 64px; margin-bottom: 24px; opacity: 0.5; }
        .loading { padding: 100px; text-align: center; color: #64748b; font-weight: 700; font-size: 18px; }
      `}</style>

      {isModalOpen && (
        <CIFormModal
          ci={selectedCI}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => { loadCIs(); setIsModalOpen(false); }}
        />
      )}
    </div>
  );
};

export default CIList;
