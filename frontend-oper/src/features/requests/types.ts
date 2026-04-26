export type ServiceRequestStatus = 
  | 'DRAFT' 
  | 'PENDING_APPROVAL' 
  | 'OPEN' 
  | 'IN_PROGRESS' 
  | 'RESOLVED' 
  | 'CLOSED' 
  | 'REJECTED';

export type ServiceRequestPriority = 'EMERGENCY' | 'CRITICAL' | 'HIGH' | 'NORMAL' | 'LOW';

export interface ServiceRequest {
  requestId: number;
  requestNo: string;
  tenantId: string;
  tenantName?: string;
  title: string;
  description: string;
  status: ServiceRequestStatus;
  priority: ServiceRequestPriority;
  requesterName: string;
  assigneeName?: string;
  assigneeId?: number;
  resolution?: string;
  slaDeadline?: string;
  createdAt: string;
  submittedAt?: string;
  resolvedAt?: string;
  closedAt?: string;
  attachments?: AttachmentInfo[];
  catalogId?: number;
  catalogName?: string;
  customCatalogName?: string;
  dynamicFields?: string;
}

export interface CreateRequestDTO {
  title: string;
  description: string;
  priority: ServiceRequestPriority;
  targetTenantId: string;
  requesterId?: number;
  catalogId?: number;
  customCatalogName?: string;
  dynamicFields?: string;
}

export interface UpdateRequestDTO {
  title?: string;
  description?: string;
  priority?: ServiceRequestPriority;
  status?: ServiceRequestStatus;
  resolution?: string;
  assigneeId?: number;   // 담당자 재배정 (OPEN, IN_PROGRESS)
  requesterId?: number;  // 대리 요청자 (DRAFT only)
  catalogId?: number;
  customCatalogName?: string;
  deleteAttachmentIds?: number[];
}

export interface AttachmentInfo {
  id: number;
  fileName: string;
  fileSize: number;
}

export interface ApprovalStep {
  id: number;
  stepName: string;
  approverName: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'WAITING';
  stepOrder: number;
  comment?: string;
  processedAt?: string;
  updatedAt?: string;
}

export interface CodeDTO {
  id?: number;
  groupId: string;
  codeId: string;
  codeName: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
}
