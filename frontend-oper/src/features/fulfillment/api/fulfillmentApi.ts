import apiClient from '../../../api/client';
import { ServiceRequest, ApprovalStep } from '../types';

export const fulfillmentApi = {
  // 운영자용 전체 요청 목록 조회
  getAllRequests: async (): Promise<ServiceRequest[]> => {
    const response = await apiClient.get<ServiceRequest[]>('/requests/all');
    return response.data;
  },

  // 특정 요청 상세 조회
  getRequest: async (id: number): Promise<ServiceRequest> => {
    const response = await apiClient.get<ServiceRequest>(`/requests/${id}`);
    return response.data;
  },

  // 특정 요청의 결재 히스토리 조회
  getApprovals: async (id: number): Promise<ApprovalStep[]> => {
    const response = await apiClient.get<ApprovalStep[]>(`/requests/${id}/approvals`);
    return response.data;
  },

  // 자신에게 배정
  assignToMe: async (id: number): Promise<void> => {
    await apiClient.post(`/requests/${id}/assign`);
  },

  // 해결 처리
  resolve: async (id: number, resolution: string): Promise<void> => {
    await apiClient.post(`/requests/${id}/resolve`, { resolution });
  },

  // 최종 종료
  close: async (id: number): Promise<void> => {
    await apiClient.post(`/requests/${id}/close`);
  }
};
