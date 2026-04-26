import React, { useEffect, useState, useMemo } from 'react';
import { requestApi } from '../api/requestApi';
import { ServiceRequest, CodeDTO } from '../types';
import RequestDetail from './RequestDetail';
import RequestCreate from './RequestCreate';
import { useToast } from '../../../hooks/useToast';
import { X } from 'lucide-react';
import './../requests.css';

interface RequestListProps {
  onSelectRequest: (id: number) => void;
}

const RequestList: React.FC = () => {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<'LIST' | 'DETAIL' | 'CREATE'>('LIST');
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [showMatrixModal, setShowMatrixModal] = useState(false);
  
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [tenants, setTenants] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterTenant, setFilterTenant] = useState<string>('ALL');
  const [keyword, setKeyword] = useState<string>('');
  const [dateRange, setDateRange] = useState<string>('TODAY');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [statusCodes, setStatusCodes] = useState<CodeDTO[]>([]);

  const [totalElements, setTotalElements] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [pageSize, setPageSize] = useState(20);

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
      toast.error('Failed to load metadata');
    }
  };

  useEffect(() => {
    updateDateInputs();
  }, [dateRange]);

  const updateDateInputs = () => {
    const now = new Date();
    const pad = (num: number) => String(num).padStart(2, '0');
    const formatDate = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

    let start: Date | null = null;
    let end: Date = new Date();

    if (dateRange === 'TODAY') {
      start = new Date();
    } else if (dateRange === '1W') {
      start = new Date();
      start.setDate(now.getDate() - 7);
    } else if (dateRange === '1M') {
      start = new Date();
      start.setMonth(now.getMonth() - 1);
    } else if (dateRange === 'ALL') {
      setStartDate('');
      setEndDate('');
      return;
    }

    if (start) {
      setStartDate(formatDate(start));
      setEndDate(formatDate(end));
    }
  };

  const fetchRequests = async () => {
    setIsLoading(true);
    try {
      let params: any = {
        status: filterStatus === 'ALL' ? undefined : filterStatus,
        tenantId: filterTenant === 'ALL' ? undefined : filterTenant,
        keyword: keyword,
        page: currentPage,
        size: pageSize
      };

      if (dateRange !== 'ALL') {
        const toLocalISO = (date: Date) => {
          const pad = (num: number) => String(num).padStart(2, '0');
          return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
        };

        let start: Date | null = null;
        let end: Date = new Date();

        if (dateRange === 'TODAY') {
          start = new Date();
          start.setHours(0, 0, 0, 0);
        } else if (dateRange === '1W') {
          start = new Date();
          start.setDate(start.getDate() - 7);
        } else if (dateRange === '1M') {
          start = new Date();
          start.setMonth(start.getMonth() - 1);
        } else if (dateRange === 'CUSTOM' && startDate && endDate) {
          const [sY, sM, sD] = startDate.split('-').map(Number);
          const [eY, eM, eD] = endDate.split('-').map(Number);
          start = new Date(sY, sM - 1, sD, 0, 0, 0, 0);
          end = new Date(eY, eM - 1, eD, 23, 59, 59, 999);
        }

        if (start) {
          params.startDate = toLocalISO(start);
          params.endDate = toLocalISO(end);
        }
      }

      const response = await requestApi.getAllRequests(params);
      setRequests(response.content || []);
      setTotalElements(response.totalElements || 0);
      setTotalPages(response.totalPages || 0);
    } catch (error) {
      console.error('Failed to fetch requests', error);
      toast.error('Failed to load requests');
      setRequests([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setCurrentPage(0); // Reset to first page when filters change
  }, [filterStatus, filterTenant, keyword, dateRange, startDate, endDate, pageSize]);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchRequests();
    }, 400);
    return () => clearTimeout(handler);
  }, [filterStatus, filterTenant, keyword, dateRange, startDate, endDate, currentPage, pageSize]);

  const handleQuickAssign = async (e: React.MouseEvent, id: number) => {
    e.stopPropagation();
    try {
      await requestApi.assignToMe(id);
      toast.success('Assigned to you');
      fetchRequests();
    } catch (error) {
      toast.error('Assignment failed');
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
      {viewMode === 'DETAIL' && selectedRequestId && (
        <RequestDetail 
          requestId={selectedRequestId} 
          onBack={() => setViewMode('LIST')} 
          onSuccess={fetchRequests} 
        />
      )}

      {viewMode === 'CREATE' && (
        <RequestCreate 
          onBack={() => setViewMode('LIST')} 
          onSuccess={fetchRequests} 
        />
      )}

      {viewMode === 'LIST' && (
        <>
          <div className="requests-header">
            <div className="title-section">
              <h2>Request Management</h2>
              <div className="subtitle">Track and manage support tickets and service requests across tenants.</div>
            </div>
            <div className="header-actions">
              <button className="btn-ghost" onClick={() => setShowMatrixModal(true)}>Field Control Guide</button>
              <button className="btn-ghost" onClick={fetchRequests}>Refresh</button>
              <button className="btn-primary" onClick={() => setViewMode('CREATE')}>+ Register Request</button>
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
        <div className="filter-group date-range-group">
          <input 
            type="date" 
            className="modern-input date-input" 
            value={startDate} 
            onChange={e => {
              setStartDate(e.target.value);
              setDateRange('CUSTOM');
            }} 
          />
          <span className="date-separator">~</span>
          <input 
            type="date" 
            className="modern-input date-input" 
            value={endDate} 
            onChange={e => {
              setEndDate(e.target.value);
              setDateRange('CUSTOM');
            }} 
          />
        </div>
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
                  <tr key={req.requestId || idx} onClick={() => {
                    setSelectedRequestId(req.requestId);
                    setViewMode('DETAIL');
                  }}>
                    <td className="date-cell">{req.createdAt ? new Date(req.createdAt).toLocaleDateString() : '-'}</td>
                    <td className="title-cell" title={req.title}>
                      <span className="req-id">{req.requestNo}</span>
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
                      ) : req.status === 'OPEN' ? (
                        <button className="btn-ghost" onClick={e => handleQuickAssign(e, req.requestId)}>Assign</button>
                      ) : (
                        <span className="text-muted" style={{ fontSize: '11px' }}>Unassigned</span>
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

      <div className="pagination-footer">
        <div className="pagination-info">
          Total <strong>{totalElements}</strong> requests found
        </div>
        <div className="pagination-controls">
          <button 
            className="btn-page" 
            disabled={currentPage === 0 || isLoading}
            onClick={() => setCurrentPage(prev => prev - 1)}
          >
            &lt; Prev
          </button>
          
          <div className="page-numbers">
            {Array.from({ length: totalPages }, (_, i) => (
              <button 
                key={i} 
                className={`btn-page-num ${currentPage === i ? 'active' : ''}`}
                onClick={() => setCurrentPage(i)}
                disabled={isLoading}
              >
                {i + 1}
              </button>
            )).slice(Math.max(0, currentPage - 2), Math.min(totalPages, currentPage + 3))}
          </div>

          <button 
            className="btn-page" 
            disabled={currentPage >= totalPages - 1 || isLoading}
            onClick={() => setCurrentPage(prev => prev + 1)}
          >
            Next &gt;
          </button>
          
          <select 
            className="page-size-select"
            value={pageSize}
            onChange={e => setPageSize(Number(e.target.value))}
            disabled={isLoading}
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
      </div>
      {showMatrixModal && (
        <div className="modal-overlay" onClick={() => setShowMatrixModal(false)}>
          <div className="matrix-modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Field Control Matrix</h3>
              <button className="btn-close" onClick={() => setShowMatrixModal(false)}><X size={20} /></button>
            </div>
            <div className="modal-body">
              <table className="matrix-table">
                <thead>
                  <tr>
                    <th>Field / Category</th>
                    <th>DRAFT</th>
                    <th>PEND</th>
                    <th>OPEN</th>
                    <th>PROG</th>
                    <th>RESL</th>
                    <th>CLSD</th>
                    <th>RJCT</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    // E = Editable, R = Read-Only
                    // Columns: DRAFT, PENDING_APPROVAL, OPEN, IN_PROGRESS, RESOLVED, CLOSED, REJECTED
                    { f: '📝 Title',          cat: 'Content',  s: ['E','R','E','R','R','R','R'] },
                    { f: '📄 Description',    cat: 'Content',  s: ['E','R','E','R','R','R','R'] },
                    { f: '🏢 Tenant',         cat: 'Context',  s: ['E','R','R','R','R','R','R'] },
                    { f: '📋 Catalog',        cat: 'Context',  s: ['E','R','R','R','R','R','R'] },
                    { f: '⚡ Priority',       cat: 'Control',  s: ['E','R','E','E','R','R','R'] },
                    { f: '🔄 Status',         cat: 'Control',  s: ['E','R','E','E','E','R','R'] }, // Updated: DRAFT can change status
                    { f: '✅ Resolution',     cat: 'Control',  s: ['R','R','R','E','E','R','R'] },
                    { f: '📎 Attachments',   cat: 'Files',    s: ['E','R','E','E','R','R','R'] },
                    { f: '👤 Requester',     cat: 'People',   s: ['E','R','R','R','R','R','R'] },
                    { f: '👷 Assignee',      cat: 'People',   s: ['R','R','E','E','R','R','R'] },
                    { f: '🔖 Request No.',   cat: 'System',   s: ['R','R','R','R','R','R','R'] },
                    { f: '⏱️ SLA Deadline',  cat: 'System',   s: ['R','R','R','R','R','R','R'] },
                    { f: '🕐 Timestamps',    cat: 'System',   s: ['R','R','R','R','R','R','R'] },
                  ].map((row, i) => (
                    <tr key={i}>
                      <td className="field-name">{row.f}</td>
                      {row.s.map((cell, j) => (
                        <td key={j} className={cell === 'E' ? 'editable-cell' : 'readonly-cell'}>
                          {cell === 'E' ? '✏️' : '🔒'}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
              <div className="matrix-legend">
                <span className="legend-item"><span className="dot editable"></span> ✏️ Editable</span>
                <span className="legend-item"><span className="dot readonly"></span> 🔒 Read-Only</span>
                <span className="legend-item" style={{marginLeft: 'auto', fontSize: '11px', color: '#64748b'}}>
                  PEND = PENDING_APPROVAL · PROG = IN_PROGRESS · RESL = RESOLVED · CLSD = CLOSED · RJCT = REJECTED
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
      </>
    )}
  </div>
  );
};

export default RequestList;
