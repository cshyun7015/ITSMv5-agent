import React from 'react';
import { ArrowLeft, Edit2, Save, X, Type } from 'lucide-react';
import { ServiceRequest } from '../../types';

interface RequestHeaderProps {
  request: ServiceRequest;
  isEditing: boolean;
  isSubmitting: boolean;
  editTitle: string;
  setEditTitle: (t: string) => void;
  onBack: () => void;
  onToggleEdit: () => void;
  onSave: () => void;
  canEditTitle: boolean;
}

const RequestHeader: React.FC<RequestHeaderProps> = ({
  request, isEditing, isSubmitting, editTitle, setEditTitle, onBack, onToggleEdit, onSave, canEditTitle
}) => {
  return (
    <header className="detail-header">
      <div className="header-top">
        <button className="btn-back" onClick={onBack}>
          <ArrowLeft size={18} /> Back to List
        </button>
        
        <div className="header-actions">
          {isEditing ? (
            <>
              <button className="btn-ghost" onClick={onToggleEdit} disabled={isSubmitting}>
                <X size={16} /> Cancel
              </button>
              <button className="btn-primary" onClick={onSave} disabled={isSubmitting}>
                <Save size={16} /> Save Changes
              </button>
            </>
          ) : (
            <button className="btn-secondary" onClick={onToggleEdit}>
              <Edit2 size={16} /> Edit Request
            </button>
          )}
        </div>
      </div>

      <div className="header-main">
        <div className="id-tag"><Hash size={14} /> {request.requestNo}</div>
        {isEditing && canEditTitle ? (
          <input 
            type="text" 
            className="title-edit-input" 
            value={editTitle} 
            onChange={e => setEditTitle(e.target.value)}
          />
        ) : (
          <h1 className="detail-title">{request.title}</h1>
        )}
        <span className={`status-badge ${request.status}`}>{request.status}</span>
      </div>
    </header>
  );
};

// Internal icon import fix for the Hash icon used in the JSX above
import { Hash } from 'lucide-react';

export default RequestHeader;
