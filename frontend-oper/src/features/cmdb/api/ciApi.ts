import apiClient from '../../../api/client';
import { ConfigurationItem, CIRequest } from '../types';

export const ciApi = {
  // CI 목록 조회
  getCIs: async (tenantId: string): Promise<ConfigurationItem[]> => {
    const response = await apiClient.get<ConfigurationItem[]>(`/cis?tenantId=${tenantId}`);
    return response.data;
  },

  // CI 상세 조회
  getCI: async (id: number): Promise<ConfigurationItem> => {
    const response = await apiClient.get<ConfigurationItem>(`/cis/${id}`);
    return response.data;
  },

  // CI 등록
  createCI: async (data: CIRequest): Promise<ConfigurationItem> => {
    const response = await apiClient.post<ConfigurationItem>('/cis', data);
    return response.data;
  },

  // CI 수정 (상태 전이 포함)
  updateCI: async (id: number, data: Partial<CIRequest>): Promise<ConfigurationItem> => {
    const response = await apiClient.put<ConfigurationItem>(`/cis/${id}`, data);
    return response.data;
  },

  // CI 삭제
  deleteCI: async (id: number): Promise<void> => {
    await apiClient.delete(`/cis/${id}`);
  }
};
