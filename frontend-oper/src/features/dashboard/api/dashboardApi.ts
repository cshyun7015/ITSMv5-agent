import apiClient from '../../../api/client';

export interface TenantSummary {
  tenantId: string;
  tenantName: string;
  serviceStatus: 'GREEN' | 'YELLOW' | 'RED';
  incidentCount: number;
  brandColor: string;
  mttr: number;
  slaComplianceRate: number;
}

export interface RecentActivity {
  timestamp: string;
  type: 'INCIDENT_NEW' | 'STATUS_CHANGE' | 'SLA_WARNING' | 'ACTIVITY';
  message: string;
  tenantId: string;
}

export interface OperatorDashboardSummary {
  ciDistribution: Record<string, number>;
  totalTenants: number;
  totalCatalogs: number;
  totalActiveIncidents: number;
  totalActiveRequests: number;
  totalActiveChanges: number;
  totalActiveCIs: number;
  
  // Priority Breakdown
  priorityP1Count: number;
  priorityP2Count: number;
  priorityP3Count: number;
  priorityP4Count: number;
  
  // SLA Risk
  slaRiskCount: number;
  
  tenantSummaries: TenantSummary[];
  recentActivities: RecentActivity[];
}

export const dashboardApi = {
  getSummary: async (startDate?: string, endDate?: string): Promise<OperatorDashboardSummary> => {
    const params = new URLSearchParams();
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);
    
    const response = await apiClient.get<OperatorDashboardSummary>(`/operator/dashboard/summary?${params.toString()}`);
    return response.data;
  },

  async getRecentLogs(): Promise<string[]> {
    const response = await apiClient.get<string[]>('/operator/logs');
    return response.data;
  }
};
