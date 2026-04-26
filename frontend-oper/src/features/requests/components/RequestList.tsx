import React, { useState } from 'react';
import RequestDetail from './RequestDetail';
import RequestCreate from './RequestCreate';
import { useRequestList } from '../hooks/useRequestList';

// Sub-components
import RequestBoardSummary from './RequestList/RequestBoardSummary';
import RequestFilterBar from './RequestList/RequestFilterBar';
import RequestTable from './RequestList/RequestTable';
import FieldControlMatrixModal from './RequestList/FieldControlMatrixModal';

import './../requests.css';

const RequestList: React.FC = () => {
  const [viewMode, setViewMode] = useState<'LIST' | 'DETAIL' | 'CREATE'>('LIST');
  const [selectedRequestId, setSelectedRequestId] = useState<number | null>(null);
  const [showMatrixModal, setShowMatrixModal] = useState(false);
  
  const {
    requests,
    tenants,
    statusCodes,
    isLoading,
    summaryCounts,
    filters,
    pagination,
    actions
  } = useRequestList();

  const handleSelectRequest = (id: number) => {
    setSelectedRequestId(id);
    setViewMode('DETAIL');
  };

  if (isLoading && requests.length === 0) {
    return <div className="loading">Initializing Requests Center...</div>;
  }

  return (
    <div className="requests-board">
      {viewMode === 'DETAIL' && selectedRequestId && (
        <RequestDetail 
          requestId={selectedRequestId} 
          onBack={() => setViewMode('LIST')} 
          onSuccess={actions.fetchRequests} 
        />
      )}

      {viewMode === 'CREATE' && (
        <RequestCreate 
          onBack={() => setViewMode('LIST')} 
          onSuccess={actions.fetchRequests} 
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
              <button className="btn-ghost" onClick={actions.fetchRequests}>Refresh</button>
              <button className="btn-primary" onClick={() => setViewMode('CREATE')}>+ Register Request</button>
            </div>
          </div>

          <RequestBoardSummary counts={summaryCounts} />

          <RequestFilterBar 
            filters={filters} 
            tenants={tenants} 
            statusCodes={statusCodes} 
          />

          <RequestTable 
            requests={requests}
            tenants={tenants}
            isLoading={isLoading}
            onSelectRequest={handleSelectRequest}
            onAssign={(e, id) => {
              e.stopPropagation();
              actions.handleQuickAssign(id);
            }}
            pagination={pagination}
          />
        </>
      )}

      {showMatrixModal && (
        <FieldControlMatrixModal onClose={() => setShowMatrixModal(false)} />
      )}
    </div>
  );
};

export default RequestList;
