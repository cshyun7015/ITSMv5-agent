export interface ChangeApproval {
  approvalId?: number;
  approverId: number;
  approverName?: string;
  stepOrder: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  comment?: string;
}

export interface ChangeRequest {
  changeId: number;
  tenantId: string;
  title: string;
  reason: string;
  description: string;
  statusCode: string;
  typeCode: string;
  priorityCode: string;
  impactCode: string;
  urgencyCode: string;
  requesterId: number;
  requesterName: string;
  assigneeId?: number;
  assigneeName?: string;
  plannedStartDate?: string;
  plannedEndDate?: string;
  implementationPlan?: string;
  backoutPlan?: string;
  testPlan?: string;
  affectedCis?: string;
  reviewNotes?: string;
  relatedIncidentIds: number[];
  approvals: ChangeApproval[];
  createdAt: string;
}

export interface ChangeReportRequest {
  tenantId: string;
  title: string;
  reason: string;
  description: string;
  typeCode: string;
  impactCode: string;
  urgencyCode: string;
  plannedStartDate?: string;
  plannedEndDate?: string;
  implementationPlan?: string;
  backoutPlan?: string;
  testPlan?: string;
  affectedCis?: string;
  relatedIncidentIds?: number[];
  requesterId: number;
}
