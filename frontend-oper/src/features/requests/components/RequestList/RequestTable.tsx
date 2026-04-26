import React from 'react';
import { ServiceRequest } from '../../types';

interface RequestTableProps {
  requests: ServiceRequest[];
  tenants: any[];
  isLoading: boolean;
  onSelectRequest: (id: number) => void;
  onAssign: (e: React.MouseEvent, id: number) => void;
  pagination: {
    currentPage: number;
    setCurrentPage: (p: number | ((prev: number) => number)) => void;
    pageSize: number;
    setPageSize: (s: number) => void;
    totalElements: number;
    totalPages: number;
  };
}

const RequestTable: React.FC<RequestTableProps> = ({ 
  requests, tenants, isLoading, onSelectRequest, onAssign, pagination 
}) => {
  return (
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
          {requests.map((req, idx) => {
            try {
              const tenant = (tenants || []).find(t => t && (t.id || t.tenantId) === req.tenantId);
              const priorityMap: any = { 'EMERGENCY': 'P1', 'CRITICAL': 'P1', 'HIGH': 'P2', 'NORMAL': 'P3', 'LOW': 'P4' };
              const pKey = priorityMap[req.priority || 'NORMAL'] || 'P3';
              
              return (
                <tr key={req.requestId || idx} onClick={() => onSelectRequest(req.requestId)}>
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
                      <button className="btn-ghost" onClick={e => onAssign(e, req.requestId)}>Assign</button>
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
      {requests.length === 0 && !isLoading && <div className="empty-state">No matching requests found.</div>}

      <div className="pagination-footer">
        <div className="pagination-info">
          Total <strong>{pagination.totalElements}</strong> requests found
        </div>
        <div className="pagination-controls">
          <button 
            className="btn-page" 
            disabled={pagination.currentPage === 0 || isLoading}
            onClick={() => pagination.setCurrentPage(prev => prev - 1)}
          >
            &lt; Prev
          </button>
          
          <div className="page-numbers">
            {Array.from({ length: pagination.totalPages }, (_, i) => (
              <button 
                key={i} 
                className={`btn-page-num ${pagination.currentPage === i ? 'active' : ''}`}
                onClick={() => pagination.setCurrentPage(i)}
                disabled={isLoading}
              >
                {i + 1}
              </button>
            )).slice(Math.max(0, pagination.currentPage - 2), Math.min(pagination.totalPages, pagination.currentPage + 3))}
          </div>

          <button 
            className="btn-page" 
            disabled={pagination.currentPage >= pagination.totalPages - 1 || isLoading}
            onClick={() => pagination.setCurrentPage(prev => prev + 1)}
          >
            Next &gt;
          </button>
          
          <select 
            className="page-size-select"
            value={pagination.pageSize}
            onChange={e => pagination.setPageSize(Number(e.target.value))}
            disabled={isLoading}
          >
            <option value={10}>10 per page</option>
            <option value={20}>20 per page</option>
            <option value={50}>50 per page</option>
          </select>
        </div>
      </div>
    </div>
  );
};

export default RequestTable;
