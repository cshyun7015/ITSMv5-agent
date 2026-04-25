import React, { useEffect, useState, useMemo } from 'react';
import { requestApi } from '../api/requestApi';
import { ServiceRequest, CodeDTO } from '../types';
import RequestFormModal from './RequestFormModal';
import './../requests.css';

interface RequestListProps {
  onSelectRequest: (id: number) => void;
}

const RequestList: React.FC<RequestListProps> = ({ onSelectRequest }) => {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterTenant, setFilterTenant] = useState<string>('ALL');
  const [keyword, setKeyword] = useState<string>('');
  const [dateRange, setDateRange] = useState<string>('ALL');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statusCodes, setStatusCodes] = useState<CodeDTO[]>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const [tData, cData] = await Promise.all([
        requestApi.getTenants().catch(() => []),
        requestApi.getCodesByGroup('SR_STATUS').catch(() => [])
      ]);
      setTenants(Array.isArray(tData) ? tData : []);
      setStatusCodes(Array.isArray(cData) ? cData : []);
    } catch (error) {
      console.error('Initial metadata loading error', error);
    }
  };

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      let params: any = {
        status: filterStatus === 'ALL' ? undefined : filterStatus,
        tenantId: filterTenant === 'ALL' ? undefined : filterTenant,
        keyword: keyword,
      };

      if (dateRange !== 'ALL') {
        const now = new Date();
        let start: Date | null = null;
        let end: Date = new Date();

        if (dateRange === 'TODAY') {
          start = new Date();
          start.setHours(0, 0, 0, 0);
        } else if (dateRange === '1W') {
          start = new Date();
          start.setDate(now.getDate() - 7);
        } else if (dateRange === '1M') {
          start = new Date();
          start.setMonth(now.getMonth() - 1);
        } else if (dateRange === 'CUSTOM' && startDate && endDate) {
          start = new Date(startDate);
          end = new Date(endDate);
          end.setHours(23, 59, 59, 999);
        }

        if (start) {
          params.startDate = start.toISOString();
          params.endDate = end.toISOString();
        }
      }

      const data = await requestApi.getAllRequests(params);
      // Ensure data is an array before setting
      setRequests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Failed to fetch requests', error);
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchRequests();
    }, 400);
    return () => clearTimeout(handler);
  }, [filterStatus, filterTenant, keyword, dateRange, startDate, endDate]);

  const handleQuickAssign = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    try {
      await requestApi.assignToMe(id);
      fetchRequests();
    } catch (error) {
      alert('Assignment failed');
    }
  };

  const filteredRequests = useMemo(() => {
    return (requests || []).filter(r => r !== null && typeof r === 'object');
  }, [requests]);

  const draftCount = useMemo(() => filteredRequests.filter(r => r?.status === 'DRAFT').length, [filteredRequests]);
  const pendingCount = useMemo(() => filteredRequests.filter(r => r?.status === 'PENDING_APPROVAL').length, [filteredRequests]);
  const openCount = useMemo(() => filteredRequests.filter(r => r?.status === 'OPEN').length, [filteredRequests]);
  const inProgressCount = useMemo(() => filteredRequests.filter(r => r?.status === 'IN_PROGRESS').length, [filteredRequests]);
  const resolvedCount = useMemo(() => filteredRequests.filter(r => r?.status === 'RESOLVED').length, [filteredRequests]);
  const closedCount = useMemo(() => filteredRequests.filter(r => r?.status === 'CLOSED').length, [filteredRequests]);
  const rejectedCount = useMemo(() => filteredRequests.filter(r => r?.status === 'REJECTED').length, [filteredRequests]);

  if (isLoading && filteredRequests.length === 0) return <div className="loading">Initializing Requests Center...</div>;

  return (
    <div className="requests-board">
      <div className="requests-header">
        <div className="title-section">
          <h2>Request Management</h2>
          <div className="subtitle">Track and manage support tickets and service requests across tenants.</div>
        </div>
        <div className="header-actions">
          <button className="btn-ghost" onClick={fetchRequests}>Refresh</button>
          <button className="btn-primary" onClick={() => setShowCreateModal(true)}>+ Register Request</button>
        </div>
      </div>

      <div className="board-summary">
        <div className="summary-item"><span className="dot draft"></span><span className="label">Draft</span><span className="value">{draftCount}</span></div>
        <div className="summary-item"><span className="dot pending"></span><span className="label">Pending</span><span className="value">{pendingCount}</span></div>
        <div className="summary-item"><span className="dot open"></span><span className="label">Open</span><span className="value">{openCount}</span></div>
        <div className="summary-item"><span className="dot progress"></span><span className="label">Progress</span><span className="value">{inProgressCount}</span></div>
        <div className="summary-item"><span className="dot resolved"></span><span className="label">Resolved</span><span className="value">{resolvedCount}</span></div>
        <div className="summary-item"><span className="dot closed"></span><span className="label">Closed</span><span className="value">{closedCount}</span></div>
        <div className="summary-item"><span className="dot rejected"></span><span className="label">Rejected</span><span className="value">{rejectedCount}</span></div>
      </div>

      <div className="filter-bar">
        <div className="search-input-wrapper">
          <input type="text" className="search-input" placeholder="Search by ID, Title..." value={keyword} onChange={e => setKeyword(e.target.value)} />
        </div>
        <div className="filter-group">
          <select className="modern-select" value={dateRange} onChange={e => setDateRange(e.target.value)}>
            <option value="ALL">All Time</option>
            <option value="TODAY">Today</option>
            <option value="1W">1 Week</option>
            <option value="1M">1 Month</option>
            <option value="CUSTOM">Custom Range</option>
          </select>
        </div>
        {dateRange === 'CUSTOM' && (
          <div className="filter-group date-range-group">
            <input type="date" className="modern-input date-input" value={startDate} onChange={e => setStartDate(e.target.value)} />
            <span className="date-separator">~</span>
            <input type="date" className="modern-input date-input" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>
        )}
        <div className="filter-group">
          <select className="modern-select" value={filterTenant} onChange={e => setFilterTenant(e.target.value)}>
            <option value="ALL">All Tenants</option>
            {(tenants || []).filter(t => t !== null).map(t => (
              <option key={t.id || t.tenantId} value={t.id || t.tenantId}>{t.name}</option>
            ))}
          </select>
        </div>
        <div className="filter-group">
          <select className="modern-select" value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
            <option value="ALL">All Status</option>
            {(statusCodes || []).filter(c => c !== null).map(code => (
              <option key={code.codeId} value={code.codeId}>{code.codeName}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="itsm-table-container">
        <table className="itsm-table">
          <thead>
            <tr>
              <th style={{ width: '120px' }}>Created Date</th>
              <th style={{ minWidth: '200px' }}>Request Title</th>
              <th style={{ width: '150px' }}>Tenant</th>
              <th style={{ width: '150px' }}>Requester</th>
              <th style={{ width: '120px' }}>Status</th>
              <th style={{ width: '100px' }}>Priority</th>
              <th style={{ width: '150px' }}>Assignee</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map((req, idx) => {
              try {
                const tenant = (tenants || []).find(t => t && (t.id || t.tenantId) === req.tenantId);
                const priorityMap: any = { 'EMERGENCY': 'P1', 'CRITICAL': 'P1', 'HIGH': 'P2', 'NORMAL': 'P3', 'LOW': 'P4' };
                const pKey = priorityMap[req.priority || 'NORMAL'] || 'P3';
                
                return (
                  <tr key={req.requestId || idx} onClick={() => onSelectRequest(req.requestId)}>
                    <td className="date-cell">{req.createdAt ? new Date(req.createdAt).toLocaleDateString() : '-'}</td>
                    <td className="title-cell" title={req.title}>
                      <span className="req-id">#{req.requestId}</span>
                      <span className="req-title-text">{req.title}</span>
                    </td>
                    <td><div className="tenant-cell">{tenant?.name || req.tenantId || '-'}</div></td>
                    <td>
                      <div className="table-assignee">
                        <div className="avatar-sm">{req.requesterName?.[0] || '?'}</div>
                        <span>{req.requesterName || 'Unknown'}</span>
                      </div>
                    </td>
                    <td><span className={`status-pill ${req.status}`}>{req.status}</span></td>
                    <td><span className={`priority-pill ${pKey}`}>{req.priority || 'NORMAL'}</span></td>
                    <td>
                      {req.assigneeName ? (
                        <div className="table-assignee">
                          <div className="avatar-sm" style={{ background: 'var(--primary)' }}>{req.assigneeName[0]}</div>
                          <span>{req.assigneeName}</span>
                        </div>
                      ) : (
                        <button className="btn-ghost" onClick={e => handleQuickAssign(e, req.requestId)}>Assign</button>
                      )}
                    </td>
                  </tr>
                );
              } catch (e) {
                return <tr key={idx}><td colSpan={7}>Error rendering record</td></tr>;
              }
            })}
          </tbody>
        </table>
        {filteredRequests.length === 0 && !isLoading && <div className="empty-state">No matching requests found.</div>}
      </div>

      {showCreateModal && (
        <RequestFormModal onClose={() => setShowCreateModal(false)} onSuccess={fetchRequests} />
      )}
    </div>
  );
};

export default RequestList;
