import React from 'react';
import { X } from 'lucide-react';

interface FieldControlMatrixModalProps {
  onClose: () => void;
}

const FieldControlMatrixModal: React.FC<FieldControlMatrixModalProps> = ({ onClose }) => {
  const matrixData = [
    { f: '📝 Title',          cat: 'Content',  s: ['E','R','E','R','R','R','R'] },
    { f: '📄 Description',    cat: 'Content',  s: ['E','R','E','R','R','R','R'] },
    { f: '🏢 Tenant',         cat: 'Context',  s: ['E','R','R','R','R','R','R'] },
    { f: '📋 Catalog',        cat: 'Context',  s: ['E','R','R','R','R','R','R'] },
    { f: '⚡ Priority',       cat: 'Control',  s: ['E','R','E','E','R','R','R'] },
    { f: '🔄 Status',         cat: 'Control',  s: ['E','R','E','E','E','R','R'] },
    { f: '✅ Resolution',     cat: 'Control',  s: ['R','R','R','E','E','R','R'] },
    { f: '📎 Attachments',   cat: 'Files',    s: ['E','R','E','E','R','R','R'] },
    { f: '👤 Requester',     cat: 'People',   s: ['E','R','R','R','R','R','R'] },
    { f: '👷 Assignee',      cat: 'People',   s: ['R','R','E','E','R','R','R'] },
    { f: '🔖 Request No.',   cat: 'System',   s: ['R','R','R','R','R','R','R'] },
    { f: '⏱️ SLA Deadline',  cat: 'System',   s: ['R','R','R','R','R','R','R'] },
    { f: '🕐 Timestamps',    cat: 'System',   s: ['R','R','R','R','R','R','R'] },
  ];

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="matrix-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Field Control Matrix</h3>
          <button className="btn-close" onClick={onClose}><X size={20} /></button>
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
              {matrixData.map((row, i) => (
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
  );
};

export default FieldControlMatrixModal;
