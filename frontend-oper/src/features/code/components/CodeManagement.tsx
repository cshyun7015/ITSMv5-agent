import React, { useState, useEffect } from 'react';
import GroupSidebar from './GroupSidebar';
import CodeList from './CodeList';
import CodeDrawer from './CodeDrawer';
import ConfirmDialog from '../../../components/common/ConfirmDialog';
import { codeApi } from '../api/codeApi';
import { CodeDTO } from '../../../types/code';
import { useAuth } from '../../auth/context/AuthContext';
import { useToast } from '../../../hooks/useToast';

const CodeManagement: React.FC = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const isAdmin = user?.roles?.includes('ROLE_ADMIN') ?? false;

  const [groupIds, setGroupIds] = useState<string[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [codes, setCodes] = useState<CodeDTO[]>([]);
  const [isLoadingGroups, setIsLoadingGroups] = useState(false);
  const [isLoadingCodes, setIsLoadingCodes] = useState(false);
  
  const [isDrawerOpen, setDrawerOpen] = useState(false);
  const [selectedCode, setSelectedCode] = useState<CodeDTO | null>(null);

  // ConfirmDialog state
  const [confirmConfig, setConfirmConfig] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: '',
    message: '',
    onConfirm: () => {}
  });

  const fetchGroups = async (refreshSelection: boolean = false) => {
    setIsLoadingGroups(true);
    try {
      const data = await codeApi.getAllGroupIds();
      setGroupIds(data);
      if (data.length > 0 && (!selectedGroupId || refreshSelection)) {
        if (!data.includes(selectedGroupId || '')) {
          setSelectedGroupId(data[0]);
        }
      } else if (data.length === 0) {
        setSelectedGroupId(null);
        setCodes([]);
      }
    } catch (error) {
      console.error('Failed to fetch group IDs', error);
    } finally {
      setIsLoadingGroups(false);
    }
  };

  const fetchCodesByGroup = async (groupId: string) => {
    setIsLoadingCodes(true);
    try {
      const data = await codeApi.getCodesByGroup(groupId);
      setCodes(data);
    } catch (error) {
      console.error(`Failed to fetch codes for group ${groupId}`, error);
    } finally {
      setIsLoadingCodes(false);
    }
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  useEffect(() => {
    if (selectedGroupId) {
      fetchCodesByGroup(selectedGroupId);
    }
  }, [selectedGroupId]);

  const handleEdit = (code: CodeDTO) => {
    setSelectedCode(code);
    setDrawerOpen(true);
  };

  const handleDeleteCode = (id: number) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Code',
      message: 'Are you sure you want to delete this code? This action cannot be undone.',
      onConfirm: async () => {
        try {
          await codeApi.deleteCode(id);
          setConfirmConfig((prev: any) => ({ ...prev, isOpen: false }));
          handleRefresh();
          toast.success('Code deleted successfully');
        } catch (error) {
          toast.error('Failed to delete code');
        }
      }
    });
  };

  const handleDeleteGroup = (groupId: string) => {
    setConfirmConfig({
      isOpen: true,
      title: 'Delete Entire Group',
      message: `Are you sure you want to delete the "${groupId}" group and ALL its codes? This is a destructive action.`,
      onConfirm: async () => {
        try {
          await codeApi.deleteCodesByGroup(groupId);
          setConfirmConfig((prev: any) => ({ ...prev, isOpen: false }));
          if (selectedGroupId === groupId) {
            setSelectedGroupId(null);
          }
          fetchGroups(true);
          toast.success(`Group "${groupId}" and its codes deleted`);
        } catch (error) {
          toast.error('Failed to delete group');
        }
      }
    });
  };

  const handleAdd = () => {
    setSelectedCode(selectedGroupId ? { groupId: selectedGroupId } as any : null);
    setDrawerOpen(true);
  };

  const handleCreateGroup = () => {
    setSelectedCode({ groupId: '', isNewGroup: true } as any);
    setDrawerOpen(true);
  };

  const handleRefresh = () => {
    fetchGroups();
    if (selectedGroupId) {
      fetchCodesByGroup(selectedGroupId);
    }
  };

  return (
    <div className="code-management">
      <div className="code-management__container">
        <GroupSidebar 
          groups={groupIds} 
          selectedGroupId={selectedGroupId} 
          onSelectGroup={setSelectedGroupId}
          onDeleteGroup={handleDeleteGroup}
          onAddGroup={handleCreateGroup}
          isLoading={isLoadingGroups}
          isAdmin={isAdmin}
        />
        
        <div className="code-management__main">
          <div className="code-management__header">
            <div className="header-info">
              <h2 className="header-title">
                {selectedGroupId ? `Group: ${selectedGroupId}` : 'Select a Group'}
              </h2>
              <p className="header-subtitle">Manage system configuration codes and their metadata.</p>
            </div>
            <div className="header-actions">
              <button className="btn-secondary" onClick={handleRefresh}>🔄 Refresh</button>
              {isAdmin && (
                <button className="btn-primary" onClick={handleAdd}>+ Add New Code</button>
              )}
            </div>
          </div>

          <div className="code-management__content">
            <CodeList 
              codes={codes} 
              onEdit={handleEdit} 
              onDelete={handleDeleteCode}
              isLoading={isLoadingCodes} 
              isAdmin={isAdmin}
            />
          </div>
        </div>
      </div>

      <CodeDrawer 
        isOpen={isDrawerOpen} 
        onClose={() => setDrawerOpen(false)} 
        onSuccess={() => {
          setDrawerOpen(false);
          handleRefresh();
        }}
        initialData={selectedCode}
        title={(selectedCode as any)?.isNewGroup ? 'Create New Group' : (selectedCode?.id ? 'Edit Code' : 'Create New Code')} 
      />

      <ConfirmDialog 
        isOpen={confirmConfig.isOpen}
        title={confirmConfig.title}
        message={confirmConfig.message}
        onConfirm={confirmConfig.onConfirm}
        onCancel={() => setConfirmConfig((prev: any) => ({ ...prev, isOpen: false }))}
      />

      <style>{`
        .code-management {
          height: calc(100vh - 120px);
          display: flex;
          flex-direction: column;
        }

        .code-management__container {
          display: flex;
          flex: 1;
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(20px);
          border: 1px solid var(--glass-border);
          border-radius: 20px;
          overflow: hidden;
        }

        .code-management__main {
          flex: 1;
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .code-management__header {
          padding: 24px 30px;
          border-bottom: 1px solid var(--glass-border);
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: rgba(255, 255, 255, 0.01);
        }

        .header-title {
          font-size: 1.25rem;
          font-weight: 700;
          color: white;
          margin: 0 0 4px 0;
        }

        .header-subtitle {
          font-size: 0.85rem;
          color: var(--text-muted);
          margin: 0;
        }

        .header-actions {
          display: flex;
          gap: 12px;
        }

        .code-management__content {
          flex: 1;
          overflow-y: auto;
          padding: 30px;
        }

        .btn-primary {
          background: var(--primary-gradient);
          color: white;
          border: none;
          padding: 10px 20px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-smooth);
          box-shadow: 0 4px 15px rgba(59, 130, 246, 0.2);
        }

        .btn-primary:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(59, 130, 246, 0.3);
        }

        .btn-secondary {
          background: rgba(255, 255, 255, 0.05);
          color: white;
          border: 1px solid var(--glass-border);
          padding: 10px 20px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: var(--transition-smooth);
        }

        .btn-secondary:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
};

export default CodeManagement;
