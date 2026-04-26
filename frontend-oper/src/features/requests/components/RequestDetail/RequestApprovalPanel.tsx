import React from 'react';
import { ShieldCheck } from 'lucide-react';
import { ApprovalStep } from '../../types';

interface RequestApprovalPanelProps {
  approvals: ApprovalStep[];
}

const RequestApprovalPanel: React.FC<RequestApprovalPanelProps> = ({ approvals }) => {
  if (!approvals || approvals.length === 0) return null;

  return (
    <section className="detail-section full-width">
      <div className="section-header">
        <ShieldCheck size={18} />
        <span className="section-title">Approval Workflow</span>
      </div>
      <div className="approval-flow">
        {approvals.map((step, idx) => (
          <div key={step.id || idx} className={`approval-step ${step.status}`}>
            <div className="step-info">
              <span className="step-num">{idx + 1}</span>
              <span className="step-approver">{step.approverName}</span>
              <span className="step-role">({step.stepName})</span>
            </div>
            <div className="step-status">
              <span className={`status-tag ${step.status}`}>{step.status}</span>
              {step.processedAt && (
                <span className="step-date">{new Date(step.processedAt).toLocaleDateString()}</span>
              )}
            </div>
            {step.comment && <div className="step-comment">"{step.comment}"</div>}
          </div>
        ))}
      </div>
    </section>
  );
};

export default RequestApprovalPanel;
