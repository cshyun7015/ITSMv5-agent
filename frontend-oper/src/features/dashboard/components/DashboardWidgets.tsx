import React, { useState } from 'react';

interface WidgetProps {
  title: string;
  icon?: string;
  children: React.ReactNode;
  description?: string;
  className?: string;
  onExpand?: () => void;
}

export const Widget: React.FC<WidgetProps> = ({ title, icon, children, description, className = '', onExpand }) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleExpand = () => {
    setIsExpanded(!isExpanded);
    if (onExpand) onExpand();
  };

  return (
    <div className={`goc-widget ${isExpanded ? 'expanded' : ''} ${className}`}>
      <div className="widget-header">
        <div className="header-left">
          <span className="widget-icon">{icon}</span>
          <div className="widget-titles">
            <h4>{title}</h4>
            {description && <p>{description}</p>}
          </div>
        </div>
        <div className="widget-actions">
          <button className="btn-icon" onClick={toggleExpand}>
            {isExpanded ? '↙️' : '↗️'}
          </button>
        </div>
      </div>
      <div className="widget-content">
        {children}
      </div>
      
      <style>{`
        .goc-widget {
          background: rgba(30, 41, 59, 0.4);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 24px;
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
        }
        .goc-widget:hover {
          background: rgba(30, 41, 59, 0.6);
          border-color: rgba(255, 255, 255, 0.1);
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.4);
        }
        .goc-widget.expanded {
          position: fixed;
          top: 20px;
          left: 20px;
          right: 20px;
          bottom: 20px;
          z-index: 1000;
          background: rgba(15, 23, 42, 0.95);
          backdrop-filter: blur(40px);
        }

        .widget-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .header-left {
          display: flex;
          gap: 16px;
        }
        .widget-icon {
          width: 44px;
          height: 44px;
          background: rgba(59, 130, 246, 0.1);
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 20px;
        }
        .widget-titles h4 {
          margin: 0;
          font-size: 16px;
          font-weight: 800;
          color: #fff;
          letter-spacing: -0.3px;
        }
        .widget-titles p {
          margin: 4px 0 0;
          font-size: 12px;
          color: #64748b;
        }
        .btn-icon {
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          color: #94a3b8;
          width: 32px;
          height: 32px;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
        }
        .btn-icon:hover {
          background: #3b82f6;
          color: #fff;
        }

        .widget-content {
          flex: 1;
          min-height: 0;
        }
      `}</style>
    </div>
  );
};

export const AssetDonut: React.FC<{ data: Record<string, number> }> = ({ data }) => {
  const total = Object.values(data).reduce((a, b) => a + b, 0);
  let currentOffset = 0;
  
  const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

  return (
    <div className="donut-container">
      <svg viewBox="0 0 100 100" className="donut-svg">
        <circle cx="50" cy="50" r="40" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
        {Object.entries(data).map(([key, value]: [string, number], i: number) => {
          const percentage = (value / total) * 100;
          const strokeDasharray = `${percentage} ${100 - percentage}`;
          const rotation = (currentOffset / total) * 360 - 90;
          currentOffset += value;
          
          return (
            <circle
              key={key}
              cx="50" cy="50" r="40"
              fill="transparent"
              stroke={colors[i % colors.length]}
              strokeWidth="12"
              strokeDasharray={`${percentage * 2.51} 251`} // 2*PI*R = 251.3
              transform={`rotate(${rotation} 50 50)`}
              className="donut-segment"
              style={{ transition: 'stroke-dasharray 1s ease-out' }}
            >
              <title>{key}: {value}</title>
            </circle>
          );
        })}
        <circle cx="50" cy="50" r="28" fill="#1e293b" />
        <text x="50" y="48" className="donut-total" textAnchor="middle">{total}</text>
        <text x="50" y="58" className="donut-label" textAnchor="middle">Total Assets</text>
      </svg>
      <div className="donut-legend">
        {Object.entries(data).map(([key, value]: [string, number], i: number) => (
          <div key={key} className="legend-item">
            <span className="dot" style={{ background: colors[i % colors.length] }}></span>
            <span className="label">{key}</span>
            <span className="val">{value}</span>
          </div>
        ))}
      </div>
      
      <style>{`
        .donut-container { display: flex; align-items: center; gap: 32px; height: 100%; }
        .donut-svg { width: 180px; height: 180px; filter: drop-shadow(0 0 20px rgba(0,0,0,0.4)); }
        .donut-total { font-size: 14px; font-weight: 900; fill: #fff; }
        .donut-label { font-size: 6px; font-weight: 700; fill: #64748b; text-transform: uppercase; letter-spacing: 0.5px; }
        .donut-legend { display: flex; flex-direction: column; gap: 12px; flex: 1; }
        .legend-item { display: flex; align-items: center; gap: 10px; font-size: 13px; }
        .dot { width: 8px; height: 8px; border-radius: 50%; }
        .label { color: #94a3b8; flex: 1; }
        .val { color: #fff; font-weight: 800; font-family: monospace; }
        .donut-segment { transition: all 0.3s; cursor: pointer; }
        .donut-segment:hover { stroke-width: 15px; }
      `}</style>
    </div>
  );
};
