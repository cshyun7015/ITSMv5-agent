export type IncidentStatus = 'NEW' | 'ASSIGNED' | 'IN_PROGRESS' | 'RESOLVED' | 'CLOSED';
export type IncidentPriority = 'P1' | 'P2' | 'P3' | 'P4';
export type IncidentImpact = 'HIGH' | 'MEDIUM' | 'LOW';
export type IncidentUrgency = 'HIGH' | 'MEDIUM' | 'LOW';

export interface Incident {
  incidentId: number;
  tenantId: string;
  title: string;
  description: string;
  status: IncidentStatus;
  priority: IncidentPriority;
  impact: IncidentImpact;
  urgency: IncidentUrgency;
  category: string;
  source: 'USER' | 'SYSTEM';
  reporterName: string;
  assigneeName?: string;
  assigneeId?: number;
  resolution?: string;
  isMajor: boolean;
  affectedService?: string;
  slaDeadline: string;
  createdAt: string;
}

export interface IncidentReportRequest {
  tenantId: string;
  title: string;
  description: string;
  impact: IncidentImpact;
  urgency: IncidentUrgency;
  category: string;
  source?: string;
  isMajor: boolean;
  affectedService?: string;
  status?: IncidentStatus;
  assigneeId?: number;
  resolution?: string;
}
