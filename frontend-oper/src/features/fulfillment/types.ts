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
  attachments?: AttachmentInfo[];
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
