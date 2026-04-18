import React, { useState, useEffect } from 'react';
import { operatorApi } from '../api/operatorApi';
import { Operator } from '../types';
import OperatorFormModal from './OperatorFormModal';

const OperatorList: React.FC = () => {
  const [operators, setOperators] = useState<Operator[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedOperator, setSelectedOperator] = useState<Operator | undefined>();

  const loadOperators = async () => {
    setIsLoading(true);
    try {
      const data = await operatorApi.getOperators();
      setOperators(data);
    } catch (error) {
      console.error('Failed to load operators', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadOperators();
  }, []);

  const handleCreate = () => {
    setSelectedOperator(undefined);
    setIsModalOpen(true);
  };

  const handleEdit = (op: Operator) => {
    setSelectedOperator(op);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this operator?')) {
      try {
        await operatorApi.deleteOperator(id);
        loadOperators();
      } catch (error) {
        console.error('Failed to delete operator', error);
      }
    }
  };

  return (
    <div className="operator-list-container">
      <header className="page-header">
        <div className="header-left">
          <h1>Operator Team Management</h1>
          <p className="subtitle">Manage MSP operation team accounts and roles</p>
        </div>
        <button className="btn-primary" onClick={handleCreate}>
          <span className="icon">+</span> New Operator
        </button>
      </header>

      {isLoading ? (
        <div className="loading-state">Loading operators...</div>
      ) : (
        <div className="operator-grid">
          {operators.map(op => (
            <div key={op.memberId} className="operator-card">
              <div className="card-header">
                <div className="user-avatar">
                  {op.username.substring(0, 2).toUpperCase()}
                </div>
                <div className="status-indicator">
                  <span className={`status-dot ${op.isActive ? 'active' : 'inactive'}`}></span>
                  {op.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
              <div className="card-body">
                <h3>{op.username}</h3>
                <p className="email">{op.email}</p>
                <div className="meta">
                  <span className="tenant-tag">{op.tenantName}</span>
                </div>
              </div>
              <div className="card-footer">
                <button className="btn-text" onClick={() => handleEdit(op)}>Edit</button>
                <button className="btn-text delete" onClick={() => handleDelete(op.memberId)}>Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <OperatorFormModal 
          operator={selectedOperator}
          onClose={() => setIsModalOpen(false)}
          onSuccess={() => {
            setIsModalOpen(false);
            loadOperators();
          }}
        />
      )}

      <style>{`
        .operator-list-container { padding: 40px; }
        .page-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 40px; }
        .page-header h1 { font-size: 32px; font-weight: 800; color: #fff; margin: 0; }
        .subtitle { color: #64748b; margin: 8px 0 0 0; }

        .btn-primary { 
          background: #3b82f6; color: #fff; border: none; padding: 12px 24px; border-radius: 12px; 
          font-weight: 800; cursor: pointer; box-shadow: 0 4px 15px rgba(59, 130, 246, 0.4);
          transition: all 0.2s; display: flex; align-items: center; gap: 8px;
        }
        .btn-primary:hover { transform: translateY(-2px); background: #2563eb; }

        .operator-grid { 
          display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 24px; 
        }

        .operator-card { 
          background: rgba(30, 41, 59, 0.5); border: 1px solid rgba(255,255,255,0.05); 
          border-radius: 20px; padding: 24px; transition: all 0.3s;
          backdrop-filter: blur(10px);
        }
        .operator-card:hover { transform: translateY(-5px); border-color: rgba(59, 130, 246, 0.3); background: rgba(30, 41, 59, 0.8); }

        .card-header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 20px; }
        .user-avatar { 
          width: 50px; height: 50px; background: linear-gradient(135deg, #3b82f6, #8b5cf6); 
          border-radius: 14px; display: flex; align-items: center; justify-content: center;
          font-weight: 800; color: #fff; font-size: 18px;
        }
        
        .status-indicator { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 700; color: #94a3b8; }
        .status-dot { width: 8px; height: 8px; border-radius: 50%; }
        .status-dot.active { background: #10b981; box-shadow: 0 0 8px rgba(16, 185, 129, 0.5); }
        .status-dot.inactive { background: #ef4444; }

        .card-body h3 { margin: 0; font-size: 20px; font-weight: 700; color: #f8fafc; }
        .email { color: #64748b; font-size: 14px; margin: 4px 0 16px 0; }
        
        .tenant-tag { 
          background: rgba(59, 130, 246, 0.1); color: #60a5fa; font-size: 11px; font-weight: 800;
          padding: 4px 10px; border-radius: 6px; border: 1px solid rgba(59, 130, 246, 0.2);
        }

        .card-footer { display: flex; gap: 16px; margin-top: 24px; padding-top: 20px; border-top: 1px solid rgba(255,255,255,0.05); }
        .btn-text { background: none; border: none; color: #94a3b8; font-weight: 700; cursor: pointer; font-size: 14px; }
        .btn-text:hover { color: #3b82f6; }
        .btn-text.delete:hover { color: #ef4444; }

        .loading-state { text-align: center; padding: 100px; color: #64748b; font-size: 18px; }
      `}</style>
    </div>
  );
};

export default OperatorList;
