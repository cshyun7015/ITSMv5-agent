import React, { useEffect, useState, useMemo } from 'react';
import { requestApi } from '../api/requestApi';
import { ServiceRequest } from '../types';
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
  const [dateRange, setDateRange] = useState<string>('ALL'); // ALL, TODAY, 1W, 1M, CUSTOM
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [statusCodes, setStatusCodes] = useState<CodeDTO[]>([]);

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      const tenantData = await requestApi.getTenants().catch(err => {
        console.error('Failed to load tenants', err);
        return [];
      });
      setTenants(tenantData);

      const codesData = await requestApi.getCodesByGroup('SR_STATUS').catch(err => {
        console.error('Failed to load status codes', err);
        return [];
      });
      setStatusCodes(codesData);
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
      console.log('Fetched requests with params:', params, 'Result count:', data.length);
      setRequests(data);
    } catch (error) {
      console.error('Failed to fetch requests', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Debounced effect for filtering
  useEffect(() => {
    console.log('Filter changed, scheduling fetch...', { filterStatus, filterTenant, keyword, dateRange });
    const handler = setTimeout(() => {
      fetchRequests();
    }, 400);
    return () => clearTimeout(handler);
  }, [filterStatus, filterTenant, keyword, dateRange, startDate, endDate]);

  const handleQuickAssign = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    try {
      await requestApi.assignToMe(id);
      fetchRequests(); // Refresh list after assignment
    } catch (error) {
      alert('Assignment failed');
    }
  };

  const filteredRequests = useMemo(() => {
    return requests;
  }, [requests]);

  const handleRowClick = (id: number) => {
    onSelectRequest(id);
  };

  const draftCount = useMemo(() => filteredRequests.filter(r => r.status === 'DRAFT').length, [filteredRequests]);
  const pendingCount = useMemo(() => filteredRequests.filter(r => r.status === 'PENDING_APPROVAL').length, [filteredRequests]);
  const openCount = useMemo(() => filteredRequests.filter(r => r.status === 'OPEN' || r.status === 'NEW').length, [filteredRequests]);
  const inProgressCount = useMemo(() => filteredRequests.filter(r => r.status === 'IN_PROGRESS').length, [filteredRequests]);
  const resolvedCount = useMemo(() => filteredRequests.filter(r => r.status === 'RESOLVED').length, [filteredRequests]);
  const closedCount = useMemo(() => filteredRequests.filter(r => r.status === 'CLOSED').length, [filteredRequests]);
  const rejectedCount = useMemo(() => filteredRequests.filter(r => r.status === 'REJECTED').length, [filteredRequests]);

  const getSlaInfo = (deadline: string | null | undefined) => {
    if (!deadline) return { text: 'No SLA', class: '' };
    const diff = new Date(deadline).getTime() - new Date().getTime();
    if (diff < 0) return { text: 'SLA Overdue', class: 'overdue' };
    if (diff < 7200000) return { text: 'Due Soon', class: 'urgent' }; // < 2h
    return { text: new Date(deadline).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), class: '' };
  };

  if (isLoading) return <div className="loading">Initializing Requests Center...</div>;

  return (
    <div className="requests-board" data-testid="requests-board">
      <div className="requests-header">
        <div className="title-section">
          <h2>Request Management</h2>
          <div className="subtitle">Track and manage support tickets and service requests across tenants.</div>
        </div>
        
        <div className="header-actions">
          <button className="btn-ghost" onClick={loadInitialData}>Refresh</button>
          <button className="btn-secondary">Export CSV</button>
          <button className="btn-primary" onClick={() => setShowCreateModal(true)} data-testid="btn-create-request">
            + Register Request
          </button>
        </div>
      </div>

      <div className="board-summary">
        <div className="summary-item">
          <div className="label-row">
            <span className="dot draft"></span>
            <span className="label">Draft</span>
          </div>
          <span className="value">{draftCount}</span>
        </div>
        <div className="summary-item">
          <div className="label-row">
            <span className="dot pending"></span>
            <span className="label">Pending</span>
          </div>
          <span className="value">{pendingCount}</span>
        </div>
        <div className="summary-item">
          <div className="label-row">
            <span className="dot open"></span>
            <span className="label">Open</span>
          </div>
          <span className="value">{openCount}</span>
        </div>
        <div className="summary-item">
          <div className="label-row">
            <span className="dot progress"></span>
            <span className="label">In Progress</span>
          </div>
          <span className="value">{inProgressCount}</span>
        </div>
        <div className="summary-item">
          <div className="label-row">
            <span className="dot resolved"></span>
            <span className="label">Resolved</span>
          </div>
          <span className="value">{resolvedCount}</span>
        </div>
        <div className="summary-item">
          <div className="label-row">
            <span className="dot closed"></span>
            <span className="label">Closed</span>
          </div>
          <span className="value">{closedCount}</span>
        </div>
        <div className="summary-item">
          <div className="label-row">
            <span className="dot rejected"></span>
            <span className="label">Rejected</span>
          </div>
          <span className="value">{rejectedCount}</span>
        </div>
      </div>

      <div className="filter-bar">
        <div className="search-input-wrapper">
          <span className="search-icon">🔍</span>
          <input 
            id="search-keyword"
            type="text" 
            className="search-input" 
            placeholder="Search by ID, Title, or Requester..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <span className="group-label">Created</span>
          <select 
            id="date-filter"
            className="modern-select"
            value={dateRange}
            onChange={(e) => setDateRange(e.target.value)}
          >
            <option value="ALL">All Time</option>
            <option value="TODAY">Today</option>
            <option value="1W">1 Week</option>
            <option value="1M">1 Month</option>
            <option value="CUSTOM">Custom Range</option>
          </select>
        </div>

        {dateRange === 'CUSTOM' && (
          <div className="filter-group date-range-group">
            <input 
              type="date" 
              className="modern-input date-input"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />
            <span className="date-separator">~</span>
            <input 
              type="date" 
              className="modern-input date-input"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
            />
          </div>
        )}

        <div className="filter-group">
          <span className="group-label">Tenant</span>
          <select 
            id="tenant-filter"
            className="modern-select"
            value={filterTenant}
            onChange={(e) => {
              console.log('Tenant filter changed:', e.target.value);
              setFilterTenant(e.target.value);
            }}
          >
            <option value="ALL">All Tenants</option>
            {tenants.map(t => (
              <option key={`tenant-${t.id || t.tenantId}`} value={t.id || t.tenantId}>{t.name}</option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <span className="group-label">Status</span>
          <select 
            id="status-filter"
            className="modern-select"
            value={filterStatus}
            onChange={(e) => {
              console.log('Status filter changed:', e.target.value);
              setFilterStatus(e.target.value);
            }}
          >
            <option value="ALL">All Status</option>
            {statusCodes.length > 0 ? (
              statusCodes.map(code => (
                <option key={`status-${code.codeId}`} value={code.codeId}>{code.codeName}</option>
              ))
            ) : (
              <>
                <option value="DRAFT">Draft</option>
                <option value="PENDING_APPROVAL">Pending Approval</option>
                <option value="OPEN">Open</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="RESOLVED">Resolved</option>
                <option value="CLOSED">Closed</option>
                <option value="REJECTED">Rejected</option>
              </>
            )}
          </select>
        </div>
      </div>

      <div className="itsm-table-container">
        <table className="itsm-table" data-testid="request-list">
          <thead>
            <tr>
              <th style={{ width: '100px' }}>ID</th>
              <th>Request Title</th>
              <th style={{ width: '140px' }}>Status</th>
              <th style={{ width: '120px' }}>Priority</th>
              <th style={{ width: '180px' }}>Requester</th>
              <th style={{ width: '180px' }}>Assignee</th>
              <th style={{ width: '150px' }}>SLA Deadline</th>
            </tr>
          </thead>
          <tbody>
            {filteredRequests.map(req => {
              const sla = getSlaInfo(req.slaDeadline);
              const tenant = tenants.find(t => (t.id || t.tenantId) === req.tenantId);
              
              // Map priority to standardized P1-P4 keys
              const priorityMap: Record<string, string> = {
                'EMERGENCY': 'P1',
                'CRITICAL': 'P1',
                'HIGH': 'P2',
                'NORMAL': 'P3',
                'MEDIUM': 'P3',
                'LOW': 'P4'
              };
              const pKey = priorityMap[req.priority || 'NORMAL'] || 'P3';

              return (
                <tr key={`req-${req.requestId}`} onClick={() => handleRowClick(req.requestId)}>
                  <td>
                    <span className="table-link">#{req.requestId}</span>
                  </td>
                  <td>
                    <div style={{ fontWeight: 600 }}>{req.title}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>{tenant?.name || req.tenantId}</div>
                  </td>
                  <td>
                    <span className={`status-pill ${req.status}`}>{req.status}</span>
                  </td>
                  <td>
                    <span className={`priority-pill ${pKey}`}>{req.priority || 'NORMAL'}</span>
                  </td>
                  <td>
                    <div className="table-assignee">
                      <div className="avatar-sm">{req.requesterName?.[0]}</div>
                      <span>{req.requesterName}</span>
                    </div>
                  </td>
                  <td>
                    {req.assigneeName ? (
                      <div className="table-assignee">
                        <div className="avatar-sm" style={{ background: 'var(--primary)' }}>{req.assigneeName[0]}</div>
                        <span>{req.assigneeName}</span>
                      </div>
                    ) : (
                      <button 
                        className="btn-ghost" 
                        style={{ fontSize: '11px', padding: '4px 8px' }}
                        onClick={(e) => handleQuickAssign(e, req.requestId)}
                      >
                        Assign to Me
                      </button>
                    )}
                  </td>
                  <td>
                    <span className={sla.class === 'overdue' ? 'sla-warning' : ''}>
                      {sla.text}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        
        {filteredRequests.length === 0 && (
          <div className="empty-state">No matching requests found in the current scope.</div>
        )}
      </div>

      {showCreateModal && (
        <RequestFormModal 
          onClose={() => setShowCreateModal(false)}
          onSuccess={loadInitialData}
        />
      )}

    </div>
  );
};

export default RequestList;
