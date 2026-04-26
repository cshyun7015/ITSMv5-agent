import { useState, useEffect, useCallback } from 'react';
import { requestApi } from '../api/requestApi';
import { ServiceRequest, ApprovalStep, ServiceRequestPriority, ServiceRequestStatus, CodeDTO } from '../types';
import { useToast } from '../../../hooks/useToast';

export const useRequestDetail = (requestId: number, onSuccess: () => void) => {
  const { toast } = useToast();
  const [request, setRequest] = useState<ServiceRequest | null>(null);
  const [approvals, setApprovals] = useState<ApprovalStep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Edit Mode States
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editPriority, setEditPriority] = useState<ServiceRequestPriority>('NORMAL');
  const [editStatus, setEditStatus] = useState<ServiceRequestStatus>('DRAFT');
  const [editResolution, setEditResolution] = useState('');
  const [editAssigneeId, setEditAssigneeId] = useState<number | null>(null);
  const [editRequesterId, setEditRequesterId] = useState<number | null>(null);
  const [editCatalogId, setEditCatalogId] = useState<number | undefined>(undefined);
  const [isCustomCatalog, setIsCustomCatalog] = useState(false);
  const [editCustomCatalogName, setEditCustomCatalogName] = useState('');
  const [deletedAttachmentIds, setDeletedAttachmentIds] = useState<number[]>([]);
  const [newFiles, setNewFiles] = useState<File[]>([]);

  // Options
  const [priorityOptions, setPriorityOptions] = useState<CodeDTO[]>([]);
  const [statusOptions, setStatusOptions] = useState<CodeDTO[]>([]);
  const [operators, setOperators] = useState<any[]>([]);
  const [tenantUsers, setTenantUsers] = useState<any[]>([]);
  const [catalogs, setCatalogs] = useState<any[]>([]);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [reqData, approvalData] = await Promise.all([
        requestApi.getRequest(requestId),
        requestApi.getApprovals(requestId)
      ]);
      setRequest(reqData);
      setApprovals(approvalData);
      
      // Initialize Edit States
      setEditTitle(reqData.title);
      setEditDescription(reqData.description);
      setEditPriority(reqData.priority);
      setEditStatus(reqData.status);
      setEditResolution(reqData.resolution || '');
      setEditAssigneeId(null);
      setEditRequesterId(null);
      setEditCatalogId(reqData.catalogId);
      setIsCustomCatalog(!reqData.catalogId && !!reqData.catalogName);
      setEditCustomCatalogName(!reqData.catalogId ? reqData.catalogName || '' : '');
      
      if (reqData.tenantId) {
        requestApi.getTenantUsers(reqData.tenantId).then(setTenantUsers).catch(() => []);
      }
    } catch (error) {
      console.error('Failed to load request details', error);
      toast.error('Failed to load request details');
    } finally {
      setIsLoading(false);
    }
  }, [requestId, toast]);

  const loadOptions = useCallback(async () => {
    try {
      const [pData, sData, opData, cData] = await Promise.all([
        requestApi.getCodesByGroup('SR_PRIORITY').catch(() => []),
        requestApi.getCodesByGroup('SR_STATUS').catch(() => []),
        requestApi.getOperators().catch(() => []),
        requestApi.getCatalogTemplates().catch(() => [])
      ]);
      setPriorityOptions(pData);
      setStatusOptions(sData);
      setOperators(opData);
      setCatalogs(cData);
    } catch (err) {
      console.error('Failed to load options', err);
    }
  }, []);

  useEffect(() => {
    loadData();
    loadOptions();
  }, [loadData, loadOptions]);

  const handleToggleEdit = () => {
    if (isEditing && request) {
      setEditTitle(request.title);
      setEditDescription(request.description);
      setEditPriority(request.priority);
      setEditStatus(request.status);
      setEditResolution(request.resolution || '');
      setEditCatalogId(request.catalogId);
      setIsCustomCatalog(!request.catalogId && !!request.catalogName);
      setEditCustomCatalogName(!request.catalogId ? request.catalogName || '' : '');
      setDeletedAttachmentIds([]);
      setNewFiles([]);
    }
    setIsEditing(!isEditing);
  };

  const handleSaveChanges = async () => {
    if (!editTitle.trim()) {
      toast.warning('Title is required');
      return;
    }
    setIsSubmitting(true);
    try {
      await requestApi.updateRequest(requestId, {
        title: editTitle,
        description: editDescription,
        priority: editPriority,
        status: editStatus,
        resolution: editResolution,
        ...(editAssigneeId !== null && { assigneeId: editAssigneeId }),
        ...(editRequesterId !== null && { requesterId: editRequesterId }),
        catalogId: isCustomCatalog ? undefined : editCatalogId,
        customCatalogName: isCustomCatalog ? editCustomCatalogName : undefined,
        deleteAttachmentIds: deletedAttachmentIds.length > 0 ? deletedAttachmentIds : undefined
      }, newFiles);
      toast.success('Changes saved successfully');
      await loadData();
      setIsEditing(false);
      onSuccess();
    } catch (error) {
      toast.error('Failed to save changes');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAssign = async () => {
    setIsSubmitting(true);
    try {
      await requestApi.assignToMe(requestId);
      toast.success('Request assigned to you');
      await loadData();
      onSuccess();
    } catch (error) {
      toast.error('Assignment failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFieldEditable = (fieldName: string) => {
    if (!request) return false;
    const s = request.status;
    const editableMap: any = {
      'title': ['DRAFT', 'OPEN'],
      'description': ['DRAFT', 'OPEN'],
      'priority': ['DRAFT', 'OPEN', 'IN_PROGRESS'],
      'status': ['DRAFT', 'OPEN', 'IN_PROGRESS', 'RESOLVED'],
      'resolution': ['IN_PROGRESS', 'RESOLVED'],
      'attachments': ['DRAFT', 'OPEN', 'IN_PROGRESS'],
      'assignee': ['OPEN', 'IN_PROGRESS'],
      'requester': ['DRAFT']
    };
    return (editableMap[fieldName] || []).includes(s);
  };

  return {
    request,
    approvals,
    isLoading,
    isSubmitting,
    isEditing,
    editStates: {
      editTitle, setEditTitle,
      editDescription, setEditDescription,
      editPriority, setEditPriority,
      editStatus, setEditStatus,
      editResolution, setEditResolution,
      editAssigneeId, setEditAssigneeId,
      editRequesterId, setEditRequesterId,
      editCatalogId, setEditCatalogId,
      isCustomCatalog, setIsCustomCatalog,
      editCustomCatalogName, setEditCustomCatalogName,
      deletedAttachmentIds, setDeletedAttachmentIds,
      newFiles, setNewFiles,
    },
    options: {
      priorityOptions,
      statusOptions,
      operators,
      tenantUsers,
      catalogs,
    },
    actions: {
      handleToggleEdit,
      handleSaveChanges,
      handleAssign,
      isFieldEditable,
      refresh: loadData,
    }
  };
};
