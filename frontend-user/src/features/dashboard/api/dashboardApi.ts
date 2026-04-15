import apiClient from '../../../api/client';

export interface DashboardSummary {
  serviceStatus: 'GREEN' | 'YELLOW' | 'RED';
  availability: number;
  activeIncidents: number;
  highPriorityIncidents: number;
  pendingApprovals: number;
  inProgressRequests: number;
  logoUrl?: string;
  brandColor: string;
}

export const dashboardApi = {
  getSummary: async (): Promise<DashboardSummary> => {
    const response = await apiClient.get<DashboardSummary>('/api/v1/dashboard/summary');
    return response.data;
  }
};
