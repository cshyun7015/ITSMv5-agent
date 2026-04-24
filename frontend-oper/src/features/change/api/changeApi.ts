import apiClient from '../../../api/client';
import { ChangeRequest, ChangeReportRequest } from '../types';

export const changeApi = {
  // 변경 요청 목록 조회
  getChanges: async (tenantId: string): Promise<ChangeRequest[]> => {
    const response = await apiClient.get<ChangeRequest[]>(`/changes?tenantId=${tenantId}`);
    return response.data;
  },

  // 초안 생성
  createDraft: async (data: ChangeReportRequest): Promise<ChangeRequest> => {
    const response = await apiClient.post<ChangeRequest>('/changes/draft', data);
    return response.data;
  },

  // 변경 요청 수정
  updateChange: async (changeId: number, data: Partial<ChangeReportRequest>): Promise<ChangeRequest> => {
    const response = await apiClient.put<ChangeRequest>(`/changes/${changeId}`, data);
    return response.data;
  },

  // RFC 제출 (결재선 지정 포함)
  submitRFC: async (changeId: number, approverIds: number[]): Promise<ChangeRequest> => {
    const response = await apiClient.post<ChangeRequest>(`/changes/${changeId}/submit`, approverIds);
    return response.data;
  }
};
