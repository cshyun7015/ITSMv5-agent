export type ServiceRequestStatus = 
  | 'DRAFT' 
  | 'PENDING_APPROVAL' 
  | 'OPEN' 
  | 'IN_PROGRESS' 
  | 'RESOLVED' 
  | 'CLOSED' 
  | 'REJECTED';

export type ServiceRequestPriority = 'EMERGENCY' | 'NORMAL' | 'LOW';

export interface ServiceRequest {
  requestId: number;
  requestNo: string;
  tenantId: string;
  title: string;
  description: string;
  status: ServiceRequestStatus;
  priority: ServiceRequestPriority;
  requesterName: string;
  assigneeName?: string;
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
}

export interface AttachmentInfo {
  id: number;
  fileName: string;
  fileSize: number;
}

export interface ApprovalStep {
  approvalId: number;
  approverName: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  stepOrder: number;
  comment?: string;
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
