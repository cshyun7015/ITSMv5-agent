import React from 'react';
import { Info, Calendar, User, Building, List } from 'lucide-react';
import { ServiceRequest, CodeDTO, ServiceRequestPriority, ServiceRequestStatus } from '../../types';

interface RequestSidebarProps {
  request: ServiceRequest;
  isEditing: boolean;
  editStates: {
    editPriority: ServiceRequestPriority;
    setEditPriority: (p: ServiceRequestPriority) => void;
    editStatus: ServiceRequestStatus;
    setEditStatus: (s: ServiceRequestStatus) => void;
    editAssigneeId: number | null;
    setEditAssigneeId: (id: number | null) => void;
    editRequesterId: number | null;
    setEditRequesterId: (id: number | null) => void;
    editCatalogId: number | undefined;
    setEditCatalogId: (id: number | undefined) => void;
    isCustomCatalog: boolean;
    setIsCustomCatalog: (b: boolean) => void;
    editCustomCatalogName: string;
    setEditCustomCatalogName: (s: string) => void;
  };
  options: {
    priorityOptions: CodeDTO[];
    statusOptions: CodeDTO[];
    operators: any[];
    tenantUsers: any[];
    catalogs: any[];
  };
  actions: {
    isFieldEditable: (f: string) => boolean;
    handleAssign: () => void;
  };
  isSubmitting: boolean;
}

const RequestSidebar: React.FC<RequestSidebarProps> = ({
  request, isEditing, editStates, options, actions, isSubmitting
}) => {
  return (
    <aside className="detail-sidebar">
      {/* Basic Attributes Section */}
      <section className="detail-section">
        <div className="section-header">
          <Info size={18} />
          <span className="section-title">Request Context</span>
        </div>
        <div className="meta-grid">
          <div className="meta-row">
            <span className="label"><Calendar size={14} /> Created</span>
            <span className="value">{request.createdAt ? new Date(request.createdAt).toLocaleString() : '-'}</span>
          </div>
          
          <div className="meta-row">
            <span className="label"><Building size={14} /> Tenant</span>
            <span className="value">{request.tenantName || request.tenantId}</span>
          </div>

          <div className="meta-row">
            <span className="label">Priority</span>
            {isEditing && actions.isFieldEditable('priority') ? (
              <select 
                className="attr-select" 
                value={editStates.editPriority} 
                onChange={e => editStates.setEditPriority(e.target.value as ServiceRequestPriority)}
              >
                {options.priorityOptions.map(opt => <option key={opt.codeId} value={opt.codeId}>{opt.codeName}</option>)}
              </select>
            ) : (
              <span className={`value p-${request.priority}`}>{request.priority}</span>
            )}
          </div>

          <div className="meta-row">
            <span className="label">Status</span>
            {isEditing && actions.isFieldEditable('status') ? (
              <select 
                className="attr-select" 
                value={editStates.editStatus} 
                onChange={e => editStates.setEditStatus(e.target.value as ServiceRequestStatus)}
              >
                {options.statusOptions.map(opt => <option key={opt.codeId} value={opt.codeId}>{opt.codeName}</option>)}
              </select>
            ) : (
              <span className="value">{request.status}</span>
            )}
          </div>
        </div>
      </section>

      {/* People Section */}
      <section className="detail-section">
        <div className="section-header">
          <User size={18} />
          <span className="section-title">People & Roles</span>
        </div>
        <div className="meta-grid">
          <div className="meta-row">
            <span className="label">Requester</span>
            {isEditing && actions.isFieldEditable('requester') ? (
              <select 
                className="attr-select" 
                value={editStates.editRequesterId || ''} 
                onChange={e => editStates.setEditRequesterId(Number(e.target.value))}
              >
                <option value="">{request.requesterName} (Current)</option>
                {options.tenantUsers.map(u => <option key={u.id} value={u.id}>{u.username}</option>)}
              </select>
            ) : (
              <span className="value">{request.requesterName}</span>
            )}
          </div>

          <div className="meta-row">
            <span className="label">Assignee</span>
            {isEditing && actions.isFieldEditable('assignee') ? (
              <select 
                className="attr-select" 
                value={editStates.editAssigneeId || ''} 
                onChange={e => editStates.setEditAssigneeId(Number(e.target.value))}
              >
                <option value="">{request.assigneeName || 'Unassigned'}</option>
                {options.operators.map(op => <option key={op.id} value={op.id}>{op.username}</option>)}
              </select>
            ) : (
              <div className="value-group">
                <span className="value">{request.assigneeName || 'Unassigned'}</span>
                {!request.assigneeId && (
                  <button className="btn-link-action" onClick={actions.handleAssign} disabled={isSubmitting}>
                    Assign to Me
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Categorization Section */}
      <section className="detail-section">
        <div className="section-header">
          <List size={18} />
          <span className="section-title">Classification</span>
        </div>
        <div className="meta-grid">
          <div className="meta-row full">
            <span className="label">Catalog</span>
            {isEditing && actions.isFieldEditable('catalog') ? (
              <div className="attr-input-group">
                {editStates.isCustomCatalog ? (
                  <input 
                    type="text" 
                    className="attr-input-text" 
                    value={editStates.editCustomCatalogName}
                    onChange={e => editStates.setEditCustomCatalogName(e.target.value)}
                  />
                ) : (
                  <select 
                    className="attr-select" 
                    value={editStates.editCatalogId} 
                    onChange={e => editStates.setEditCatalogId(Number(e.target.value))}
                  >
                    {options.catalogs.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                )}
                <button 
                  className="btn-toggle-input" 
                  onClick={() => editStates.setIsCustomCatalog(!editStates.isCustomCatalog)}
                >
                  {editStates.isCustomCatalog ? 'List' : 'Edit'}
                </button>
              </div>
            ) : (
              <span className="value">{request.catalogName || 'General Support'}</span>
            )}
          </div>
        </div>
      </section>
    </aside>
  );
};

export default RequestSidebar;
