import apiClient from '../../../api/client';

export interface TenantSummary {
  tenantId: String;
  tenantName: String;
  serviceStatus: 'GREEN' | 'YELLOW' | 'RED';
  incidentCount: number;
  brandColor: string;
}

export interface OperatorDashboardSummary {
  totalTenants: number;
  totalCatalogs: number;
  totalActiveIncidents: number;
  totalActiveRequests: number;
  totalActiveChanges: number;
  totalActiveCIs: number;
  tenantSummaries: TenantSummary[];
}

export const dashboardApi = {
  getSummary: async (): Promise<OperatorDashboardSummary> => {
    const response = await apiClient.get<OperatorDashboardSummary>('/operator/dashboard/summary');
    return response.data;
  }
};
