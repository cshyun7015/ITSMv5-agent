import apiClient from '../../../api/client';
import { ServiceRequest, ApprovalStep, CodeDTO, CreateRequestDTO, UpdateRequestDTO } from '../types';

const createFormData = (dto: any, files?: File[]) => {
  const formData = new FormData();
  formData.append('request', new Blob([JSON.stringify(dto)], { type: 'application/json' }));
  if (files) {
    files.forEach(file => formData.append('files', file));
  }
  return formData;
};

export const requestApi = {
  // 공통 코드 조회
  getCodesByGroup: async (groupId: string): Promise<CodeDTO[]> => {
    const response = await apiClient.get<CodeDTO[]>(`/codes/group/${groupId}`);
    return response.data;
  },
  
  // 운영자용 전체 요청 목록 조회
  getAllRequests: async (params?: {
    status?: string;
    tenantId?: string;
    keyword?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    size?: number;
  }): Promise<import('../types').PaginatedResponse<ServiceRequest>> => {
    const cleanParams = params ? Object.fromEntries(
      Object.entries(params).filter(([_, v]) => v !== undefined && v !== 'all' && v !== 'ALL' && v !== '')
    ) : undefined;
    
    const response = await apiClient.get<import('../types').PaginatedResponse<ServiceRequest>>('/requests/all', { params: cleanParams });
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

  // 테넌트 목록 조회
  getTenants: async (): Promise<any[]> => {
    const response = await apiClient.get('/operator/tenants');
    return response.data;
  },

  // 특정 테넌트의 사용자 목록 조회
  getTenantUsers: async (tenantId: string): Promise<any[]> => {
    const response = await apiClient.get(`/operator/tenants/${tenantId}/users`);
    return response.data;
  },

  // 요청 생성
  createRequest: async (dto: CreateRequestDTO, files?: File[]): Promise<ServiceRequest> => {
    const formData = createFormData(dto, files);
    const response = await apiClient.post<ServiceRequest>('/requests', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return response.data;
  },

  // 요청 수정
  updateRequest: async (id: number, dto: UpdateRequestDTO, files?: File[]): Promise<void> => {
    const formData = createFormData(dto, files);
    await apiClient.put(`/requests/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
  },

  // 요청 삭제
  deleteRequest: async (id: number): Promise<void> => {
    await apiClient.delete(`/requests/${id}`);
  },

  // 첨부 파일 다운로드 (window.open + 토큰 쿼리 파라미터 방식 - 팝업 차단 우회)
  downloadAttachment: (id: number, _fileName: string): void => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }
    // 절대 URL(localhost:8080) 대신 상대 경로 사용 → Chrome 크로스 오리진 팝업 차단 우회
    const url = `/api/v1/requests/attachments/${id}/download?token=${encodeURIComponent(token)}`;
    window.open(url, '_blank');
  },
  
  // 서비스 카탈로그 템플릿 조회 (운영자용)
  getCatalogTemplates: async (): Promise<any[]> => {
    const response = await apiClient.get('/operator/catalog/templates');
    return response.data;
  },

  // 운영자 목록 조회 (담당자 배정용)
  getOperators: async (): Promise<any[]> => {
    const response = await apiClient.get('/operator/operators');
    return response.data;
  }
};
