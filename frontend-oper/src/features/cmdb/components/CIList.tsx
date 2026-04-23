import React, { useEffect, useState } from 'react';
import { ciApi } from '../api/ciApi';
import { requestApi } from '../../requests/api/requestApi';
import { ConfigurationItem } from '../types';
import CIFormModal from './CIFormModal';
import CIQuickStats from './CIQuickStats';
import { useAuth } from '../../auth/context/AuthContext';
import { useToast } from '../../../hooks/useToast';


const CIList: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [cis, setCIs] = useState<ConfigurationItem[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [selectedTenantId, setSelectedTenantId] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isDiscovering, setIsDiscovering] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCI, setSelectedCI] = useState<ConfigurationItem | undefined>();
  
  // Search and Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedIds, setSelectedIds] = useState<number[]>([]);

  useEffect(() => {
    fetchTenants();
  }, [user]);

  useEffect(() => {
    if (selectedTenantId) {
      loadCIs();
    }
  }, [selectedTenantId]);

  const fetchTenants = async () => {
    try {
      const data = await requestApi.getTenants();
      setTenants(data);
      if (data.length > 0 && (!selectedTenantId || data.every(t => t.tenantId !== selectedTenantId))) {
        setSelectedTenantId(data[0].tenantId);
      }
    } catch (error) {
      console.error('Failed to fetch tenants');
    }
  };

  const loadCIs = async () => {
    setIsLoading(true);
    try {
      const data = await ciApi.getCIs(selectedTenantId);
      setCIs(data);
    } catch (error) {
      console.error('Failed to load CIs');
      toast.error('Failed to load assets');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRunDiscovery = async () => {
    if (isDiscovering) return;
    
    setIsDiscovering(true);
    toast.info('Starting Infrastructure Scan via Ansible...');
    
    try {
      await ciApi.runAnsibleDiscovery(selectedTenantId);
      toast.success('Scan completed! Refreshing configuration items...');
      await loadCIs();
    } catch (error) {
      console.error('Discovery failed', error);
      toast.error('Infrastructure scan failed. Check Ansible connectivity.');
    } finally {
      setIsDiscovering(false);
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

  const filteredCIs = cis.filter(ci => {
    const matchesSearch = ci.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          ci.serialNumber?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = typeFilter === 'ALL' || ci.typeCode === typeFilter;
    const matchesStatus = statusFilter === 'ALL' || ci.statusCode === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const toggleSelect = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkDelete = async () => {
    if (!window.confirm(`Delete ${selectedIds.length} assets?`)) return;
    try {
      await Promise.all(selectedIds.map(id => ciApi.deleteCI(id, false)));
      loadCIs();
      setSelectedIds([]);
      toast.success('Assets deleted successfully');
    } catch (error) {
      console.error('Bulk delete failed');
      toast.error('Bulk delete failed');
    }
  };

  const exportToCSV = () => {
    const headers = ['ID', 'Name', 'Type', 'Status', 'S/N', 'Location', 'Owner'];
    const rows = filteredCIs.map(ci => [
      ci.ciId, ci.name, ci.typeCode, ci.statusCode, ci.serialNumber || '', ci.location || '', ci.ownerName || ''
    ]);
    const csvContent = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', 'cmdb_export.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
   



  if (isLoading && tenants.length === 0) return <div className="loading">Initializing CMDB...</div>;

  return (
    <div className="ci-container focus-in">
      <div className="ci-header">
        <div className="header-left">
          <h2>Configuration Items (CIs)</h2>
          <div className="tenant-filter">
            <span className="filter-label">Viewing Tenant:</span>
            <select 
              className="filter-select" 
              value={selectedTenantId} 
              onChange={(e) => setSelectedTenantId(e.target.value)}
            >
              {tenants.map(t => (
                <option key={t.tenantId} value={t.tenantId}>{t.name}</option>
              ))}
            </select>
          </div>
          <span className="ci-count">{filteredCIs.length} of {cis.length} Assets</span>
        </div>
        <div className="board-actions">
          <button 
            className={`btn-scan ${isDiscovering ? 'loading' : ''}`} 
            onClick={handleRunDiscovery}
            disabled={isDiscovering}
          >
            {isDiscovering ? '⚡ Scanning...' : '🔍 Scan Infrastructure'}
          </button>
          <button className="btn-register" onClick={() => handleOpenModal()}>
            + Register CI
          </button>
        </div>
      </div>

      <CIQuickStats cis={cis} />

      {selectedIds.length > 0 && (
        <div className="bulk-action-bar focus-in">
          <span className="selection-count">{selectedIds.length} assets selected</span>
          <div className="bulk-btns">
            <button className="btn-bulk btn-bulk-status">Change Status</button>
            <button className="btn-bulk btn-bulk-delete" onClick={handleBulkDelete}>Delete Selected</button>
            <button className="btn-bulk-close" onClick={() => setSelectedIds([])}>&times;</button>
          </div>
        </div>
      )}



      <div className="ci-filter-bar">
        <div className="ci-search-wrapper">
          <span className="ci-search-icon">🔍</span>
          <input 
            type="text" 
            placeholder="Search by name or serial number..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="ci-search-input"
          />
        </div>
        <div className="ci-quick-filters">
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="q-filter-select">
            <option value="ALL">All Types</option>
            <option value="SERVER">Servers</option>
            <option value="DATABASE">Databases</option>
            <option value="NETWORK">Network</option>
            <option value="APPLICATION">Applications</option>
            <option value="TERMINAL">Terminals</option>
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="q-filter-select">
            <option value="ALL">All Statuses</option>
            <option value="PROVISIONING">Provisioning</option>
            <option value="ACTIVE">Active</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="RETIRED">Retired</option>
          </select>
        </div>
        <button className="btn-export" onClick={exportToCSV}>📥 Export CSV</button>
      </div>



      <div className="standard-list">
        {filteredCIs.map(ci => (
          <div key={ci.ciId} className={`list-item ci-item ${selectedIds.includes(ci.ciId) ? 'selected' : ''}`} onClick={() => handleOpenModal(ci)}>
            <div className="item-selector" onClick={(e) => toggleSelect(ci.ciId, e)}>
              <div className={`checkbox ${selectedIds.includes(ci.ciId) ? 'checked' : ''}`}></div>
            </div>
            <div className="item-icon-side">

              <span className="type-icon">{getTypeIcon(ci.typeCode)}</span>
            </div>
            <div className="item-main">
              <div className="id-tag">CI-{String(ci.ciId).padStart(5, '0')}</div>
              <div className="title-row">
                <div className="title-left">
                  <h3>{ci.name}</h3>
                  <span className="customer-badge">{ci.tenantName}</span>
                </div>
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

        .ci-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
        .header-left { display: flex; align-items: center; gap: 24px; }
        .header-left h2 { margin: 0; font-size: 24px; font-weight: 800; color: #fff; letter-spacing: -0.5px; }

        .ci-filter-bar { display: flex; align-items: center; margin-bottom: 24px; gap: 16px; width: 100%; }
        .ci-search-wrapper { flex: 1; min-width: 0; position: relative; }
        .ci-search-icon { position: absolute; left: 16px; top: 50%; transform: translateY(-50%); color: #64748b; font-size: 14px; pointer-events: none; }
        .ci-search-input { 
          width: 100%; background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.1); 
          border-radius: 12px; padding: 12px 12px 12px 44px; color: #fff; font-size: 14px; outline: none; transition: all 0.2s;
          box-sizing: border-box;
        }
        .ci-search-input:focus { border-color: #3b82f6; background: rgba(15, 23, 42, 0.8); box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.1); }
        
        .ci-quick-filters { display: flex; gap: 12px; flex-shrink: 0; }
        .q-filter-select { 
          background: rgba(15, 23, 42, 0.6); border: 1px solid rgba(255,255,255,0.1); 
          color: #94a3b8; padding: 0 16px; border-radius: 12px; font-size: 13px; font-weight: 600; outline: none; cursor: pointer;
          min-width: 150px; height: 44px; flex-shrink: 0;
        }
        .q-filter-select:hover { border-color: rgba(255,255,255,0.2); color: #fff; }


        .tenant-filter {
          display: flex; align-items: center; gap: 12px;
          background: rgba(255, 255, 255, 0.05); padding: 8px 16px; border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .filter-label { font-size: 13px; color: #94a3b8; font-weight: 600; }
        .filter-select {
          background: transparent; border: none; color: #3b82f6; font-weight: 700;
          font-size: 14px; outline: none; cursor: pointer;
        }
        .filter-select option { background: #1e293b; color: #fff; }

        .ci-count { font-size: 14px; color: #94a3b8; background: rgba(255, 255, 255, 0.05); padding: 4px 12px; border-radius: 20px; }

        .board-actions { display: flex; align-items: center; gap: 24px; }

        .btn-register {
          background: linear-gradient(135deg, #3b82f6, #2563eb); color: #fff; border: none;
          padding: 10px 20px; border-radius: 12px; font-weight: 700; cursor: pointer;
          transition: all 0.2s; box-shadow: 0 4px 15px rgba(37, 99, 235, 0.2);
        }
        .btn-register:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(37, 99, 235, 0.3); }

        .btn-scan {
          background: rgba(255, 255, 255, 0.05); color: #94a3b8; border: 1px solid rgba(255, 255, 255, 0.1);
          padding: 10px 20px; border-radius: 12px; font-weight: 700; cursor: pointer;
          transition: all 0.2s; display: flex; align-items: center; gap: 8px;
        }
        .btn-scan:hover:not(:disabled) { background: rgba(59, 130, 246, 0.1); border-color: #3b82f6; color: #fff; }
        .btn-scan.loading { color: #3b82f6; border-color: #3b82f6; cursor: wait; }
        .btn-scan:disabled { opacity: 0.6; cursor: not-allowed; }

        .bulk-action-bar { 
          background: #3b82f6; border-radius: 12px; padding: 12px 24px; margin-bottom: 24px; 
          display: flex; justify-content: space-between; align-items: center; color: #fff;
          box-shadow: 0 10px 30px rgba(59, 130, 246, 0.4);
        }
        .selection-count { font-weight: 800; font-size: 14px; }
        .bulk-btns { display: flex; align-items: center; gap: 12px; }
        .btn-bulk { background: rgba(255,255,255,0.2); border: none; color: #fff; padding: 6px 14px; border-radius: 8px; font-size: 12px; font-weight: 700; cursor: pointer; }
        .btn-bulk:hover { background: rgba(255,255,255,0.3); }
        .btn-bulk-delete:hover { background: #f43f5e; }
        .btn-bulk-close { background: none; border: none; color: #fff; font-size: 20px; cursor: pointer; margin-left: 8px; }

        .btn-export { background: transparent; border: 1px solid rgba(255,255,255,0.1); color: #94a3b8; padding: 8px 16px; border-radius: 12px; font-size: 13px; font-weight: 700; cursor: pointer; flex-shrink: 0; }
        .btn-export:hover { border-color: #3b82f6; color: #fff; }

        .standard-list { display: flex; flex-direction: column; gap: 12px; }
        .list-item {
          display: flex; align-items: center; background: rgba(255,255,255,0.03);
          border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; transition: all 0.2s; cursor: pointer;
          padding: 16px 24px;
        }
        .list-item.selected { border-color: #3b82f6; background: rgba(59, 130, 246, 0.05); }
        .list-item:hover { background: rgba(255,255,255,0.06); transform: translateX(4px); border-color: rgba(59, 130, 246, 0.3); }

        .item-selector { padding-right: 20px; }
        .checkbox { width: 18px; height: 18px; border: 2px solid rgba(255,255,255,0.1); border-radius: 6px; transition: all 0.2s; }
        .checkbox.checked { background: #3b82f6; border-color: #3b82f6; position: relative; }
        .checkbox.checked::after { content: '✓'; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: #fff; font-size: 12px; font-weight: 900; }

        .item-icon-side { width: 48px; height: 48px; border-radius: 12px; background: rgba(255,255,255,0.05); display: flex; align-items: center; justify-content: center; margin-right: 20px; }
        .type-icon { font-size: 24px; }

        .item-main { flex: 1; }
        .id-tag { font-size: 11px; font-weight: 800; color: #3b82f6; font-family: 'JetBrains Mono', monospace; margin-bottom: 4px; }
        .title-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
        .title-left { display: flex; align-items: center; gap: 12px; }
        .title-row h3 { margin: 0; font-size: 17px; font-weight: 700; color: #f8fafc; }
        
        .customer-badge { background: rgba(59, 130, 246, 0.1); color: #60a5fa; font-size: 10px; font-weight: 800; padding: 2px 8px; border-radius: 4px; border: 1px solid rgba(59, 130, 246, 0.2); }
        
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
