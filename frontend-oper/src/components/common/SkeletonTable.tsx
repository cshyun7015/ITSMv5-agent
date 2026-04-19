import React from 'react';

interface SkeletonTableProps {
  rows?: number;
  cols?: number;
}

const SkeletonTable: React.FC<SkeletonTableProps> = ({ rows = 6, cols = 6 }) => {
  const colWidths = ['40%', '12%', '14%', '16%', '10%', '10%'];

  return (
    <div className="skeleton-wrapper">
      {Array.from({ length: rows }).map((_, ri) => (
        <div key={ri} className="skeleton-row">
          {/* Avatar + text column */}
          <div className="skeleton-cell" style={{ width: colWidths[0] || '20%' }}>
            <div className="skeleton-avatar shimmer" />
            <div className="skeleton-lines">
              <div className="skeleton-bar shimmer" style={{ width: '60%', height: 12 }} />
              <div className="skeleton-bar shimmer" style={{ width: '80%', height: 10, marginTop: 6 }} />
            </div>
          </div>
          {Array.from({ length: cols - 1 }).map((_, ci) => (
            <div key={ci} className="skeleton-cell" style={{ width: colWidths[ci + 1] || '14%' }}>
              <div className="skeleton-bar shimmer" style={{ width: '70%', height: 12 }} />
            </div>
          ))}
        </div>
      ))}

      <style>{`
        .skeleton-wrapper {
          display: flex; flex-direction: column; gap: 8px;
        }
        .skeleton-row {
          display: flex; align-items: center; gap: 0;
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 12px;
          padding: 14px 20px;
        }
        .skeleton-cell {
          display: flex; align-items: center; gap: 12px;
          padding-right: 16px;
        }
        .skeleton-avatar {
          width: 36px; height: 36px; border-radius: 10px;
          flex-shrink: 0;
          background: rgba(255,255,255,0.06);
        }
        .skeleton-lines {
          display: flex; flex-direction: column; flex: 1;
        }
        .skeleton-bar {
          border-radius: 6px;
          background: rgba(255,255,255,0.06);
        }

        @keyframes shimmer {
          0%   { background-position: -600px 0; }
          100% { background-position:  600px 0; }
        }
        .shimmer {
          background: linear-gradient(
            90deg,
            rgba(255,255,255,0.04) 25%,
            rgba(255,255,255,0.10) 50%,
            rgba(255,255,255,0.04) 75%
          );
          background-size: 600px 100%;
          animation: shimmer 1.4s infinite linear;
        }
      `}</style>
    </div>
  );
};

export default SkeletonTable;
