import React from 'react';
import { useRequestDetail } from '../hooks/useRequestDetail';

// Sub-components
import RequestHeader from './RequestDetail/RequestHeader';
import RequestSidebar from './RequestDetail/RequestSidebar';
import RequestApprovalPanel from './RequestDetail/RequestApprovalPanel';
import AttachmentPanel from './AttachmentPanel';

// Icons
import { FileText, Paperclip } from 'lucide-react';

import './../requests.css';

interface RequestDetailProps {
  requestId: number;
  onBack: () => void;
  onSuccess: () => void;
}

const RequestDetail: React.FC<RequestDetailProps> = ({ requestId, onBack, onSuccess }) => {
  const {
    request,
    approvals,
    isLoading,
    isSubmitting,
    isEditing,
    editStates,
    options,
    actions
  } = useRequestDetail(requestId, onSuccess);

  if (isLoading || !request) {
    return <div className="loading">Loading request details...</div>;
  }

  return (
    <div className="request-detail-view" data-testid="request-detail-view">
      <RequestHeader 
        request={request}
        isEditing={isEditing}
        isSubmitting={isSubmitting}
        editTitle={editStates.editTitle}
        setEditTitle={editStates.setEditTitle}
        onBack={onBack}
        onToggleEdit={actions.handleToggleEdit}
        onSave={actions.handleSaveChanges}
        canEditTitle={actions.isFieldEditable('title')}
      />

      <div className="detail-layout-optimized">
        <div className="detail-main-content">
          {/* Description Section */}
          <section className="detail-section">
            <div className="section-header">
              <FileText size={18} />
              <span className="section-title">Request Description</span>
            </div>
            {isEditing && actions.isFieldEditable('description') ? (
              <textarea 
                className="description-edit-area" 
                value={editStates.editDescription} 
                onChange={e => editStates.setEditDescription(e.target.value)}
                rows={8}
              />
            ) : (
              <div className="description-text">{request.description}</div>
            )}
          </section>

          {/* Resolution Section (Only if applicable) */}
          {(request.resolution || (isEditing && actions.isFieldEditable('resolution'))) && (
            <section className="detail-section resolution-section">
              <div className="section-header">
                <FileText size={18} />
                <span className="section-title">Resolution / Close Note</span>
              </div>
              {isEditing && actions.isFieldEditable('resolution') ? (
                <textarea 
                  className="description-edit-area" 
                  value={editStates.editResolution} 
                  onChange={e => editStates.setEditResolution(e.target.value)}
                  placeholder="Enter resolution details..."
                  rows={4}
                />
              ) : (
                <div className="description-text">{request.resolution || 'No resolution provided yet.'}</div>
              )}
            </section>
          )}

          {/* Attachments Section */}
          <section className="detail-section">
            <div className="section-header">
              <Paperclip size={18} />
              <span className="section-title">Attachments</span>
            </div>
            <AttachmentPanel
              existingFiles={request.attachments}
              deletedIds={editStates.deletedAttachmentIds}
              newFiles={editStates.newFiles}
              mode={isEditing && actions.isFieldEditable('attachments') ? 'edit' : 'view'}
              onDeleteExisting={(id) => editStates.setDeletedAttachmentIds(prev => [...prev, id])}
              onAddFiles={(files) => editStates.setNewFiles(prev => [...prev, ...files])}
              onRemoveNew={(idx) => editStates.setNewFiles(prev => prev.filter((_, i) => i !== idx))}
              inputId="detail-attachment-upload"
            />
          </section>

          <RequestApprovalPanel approvals={approvals} />
        </div>

        <RequestSidebar 
          request={request}
          isEditing={isEditing}
          editStates={editStates}
          options={options}
          actions={actions}
          isSubmitting={isSubmitting}
        />
      </div>
    </div>
  );
};

export default RequestDetail;
