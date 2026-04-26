import React from 'react';

interface SummaryCounts {
  draft: number;
  pending: number;
  open: number;
  inProgress: number;
  resolved: number;
  closed: number;
  rejected: number;
}

interface RequestBoardSummaryProps {
  counts: SummaryCounts;
}

const RequestBoardSummary: React.FC<RequestBoardSummaryProps> = ({ counts }) => {
  return (
    <div className="board-summary">
      <div className="summary-item"><span className="dot draft"></span><span className="label">Draft</span><span className="value">{counts.draft}</span></div>
      <div className="summary-item"><span className="dot pending"></span><span className="label">Pending</span><span className="value">{counts.pending}</span></div>
      <div className="summary-item"><span className="dot open"></span><span className="label">Open</span><span className="value">{counts.open}</span></div>
      <div className="summary-item"><span className="dot progress"></span><span className="label">Progress</span><span className="value">{counts.inProgress}</span></div>
      <div className="summary-item"><span className="dot resolved"></span><span className="label">Resolved</span><span className="value">{counts.resolved}</span></div>
      <div className="summary-item"><span className="dot closed"></span><span className="label">Closed</span><span className="value">{counts.closed}</span></div>
      <div className="summary-item"><span className="dot rejected"></span><span className="label">Rejected</span><span className="value">{counts.rejected}</span></div>
    </div>
  );
};

export default RequestBoardSummary;
