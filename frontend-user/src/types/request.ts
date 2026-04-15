export type ServiceRequestStatus = 'DRAFT' | 'PENDING_APPROVAL' | 'APPROVED' | 'REJECTED';
export type ServiceRequestPriority = 'EMERGENCY' | 'NORMAL' | 'LOW';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ServiceRequest {
  requestId: number;
  title: String;
  description: String;
  status: ServiceRequestStatus;
  priority: ServiceRequestPriority;
  requesterName: string;
  deadline?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceRequestDTO {
  title: string;
  description: string;
  priority: ServiceRequestPriority;
  catalogId?: number;
  dynamicFields?: string; // JSON string of dynamic values
}

export interface Approver {
  memberId: number;
  username: string;
  email: string;
}

export interface ApprovalProgress {
  approvalId: number;
  approverName: string;
  status: ApprovalStatus;
  stepOrder: number;
  comment?: string;
  updatedAt?: string;
}
