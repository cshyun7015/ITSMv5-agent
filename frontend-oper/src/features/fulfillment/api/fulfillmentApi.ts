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
  },

  // 테넌트 목록 조회 (필터 및 등록용)
  getTenants: async (): Promise<any[]> => {
    const response = await apiClient.get('/operator/tenants');
    return response.data;
  },

  // 특정 테넌트의 사용자 목록 조회 (신청자 대행 선택용)
  getTenantUsers: async (tenantId: string): Promise<any[]> => {
    const response = await apiClient.get(`/operator/tenants/${tenantId}/users`);
    return response.data;
  },

  // 요청 생성 (수동 등록)
  createRequest: async (dto: any, files?: File[]): Promise<ServiceRequest> => {
    const formData = new FormData();
    formData.append('request', new Blob([JSON.stringify(dto)], { type: 'application/json' }));
    if (files) {
      files.forEach(file => formData.append('files', file));
    }
    const response = await apiClient.post<ServiceRequest>('/requests', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // 요청 수정
  updateRequest: async (id: number, dto: any, files?: File[]): Promise<void> => {
    const formData = new FormData();
    formData.append('request', new Blob([JSON.stringify(dto)], { type: 'application/json' }));
    if (files) {
      files.forEach(file => formData.append('files', file));
    }
    await apiClient.put(`/requests/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // 요청 삭제
  deleteRequest: async (id: number): Promise<void> => {
    await apiClient.delete(`/requests/${id}`);
  },

  // 첨부 파일 다운로드
  downloadAttachment: async (id: number, fileName: string): Promise<void> => {
    const response = await apiClient.get(`/requests/attachments/${id}`, {
      responseType: 'blob'
    });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    link.remove();
  }
};
