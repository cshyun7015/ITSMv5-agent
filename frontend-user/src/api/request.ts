import apiClient from './client';
import { ServiceRequest, ServiceRequestDTO, ServiceRequestStatus } from '../types/request';

export const requestApi = {
  // 전체 목록 조회 (권한에 따라 다르게 보임)
  getRequests: async (): Promise<ServiceRequest[]> => {
    const response = await apiClient.get('/requests');
    return response.data;
  },

  // 상세 조회
  getRequest: async (id: number): Promise<ServiceRequest> => {
    const response = await apiClient.get(`/requests/${id}`);
    return response.data;
  },

  // 결재 정보 조회
  getApprovals: async (requestId: number) => {
    const response = await apiClient.get(`/requests/${requestId}/approvals`);
    return response.data;
  },

  // 임시 저장 (Draft)
  createDraft: async (data: ServiceRequestDTO | FormData): Promise<ServiceRequest> => {
    const headers = data instanceof FormData ? { 'Content-Type': 'multipart/form-data' } : {};
    const response = await apiClient.post('/requests', data, { headers });
    return response.data;
  },

  // 상신 (Submit)
  submitRequest: async (requestId: number, approverIds: number[]) => {
    await apiClient.post(`/requests/${requestId}/submit`, { approverIds });
  },

  // 결재 처리 (승인/반려)
  processApproval: async (approvalId: number, approved: boolean, comment: string) => {
    await apiClient.post(`/requests/approvals/${approvalId}`, { approved, comment });
  },

  // 요청 수정
  updateRequest: async (requestId: number, data: FormData): Promise<void> => {
    await apiClient.put(`/requests/${requestId}`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // 요청 삭제
  deleteRequest: async (requestId: number): Promise<void> => {
    await apiClient.delete(`/requests/${requestId}`);
  }
};
