import apiClient from '../../../api/client';
import { CodeDTO } from '../../fulfillment/types';

export const codeApi = {
  // 모든 코드 목록 조회
  getAllCodes: async (): Promise<CodeDTO[]> => {
    const response = await apiClient.get<CodeDTO[]>('/codes');
    return response.data;
  },

  // 특정 그룹의 코드 목록 조회
  getCodesByGroup: async (groupId: string): Promise<CodeDTO[]> => {
    const response = await apiClient.get<CodeDTO[]>(`/codes/group/${groupId}`);
    return response.data;
  },

  // 코드 생성
  createCode: async (code: CodeDTO): Promise<CodeDTO> => {
    const response = await apiClient.post<CodeDTO>('/codes', code);
    return response.data;
  },

  // 코드 수정
  updateCode: async (id: number, code: CodeDTO): Promise<CodeDTO> => {
    const response = await apiClient.put<CodeDTO>(`/codes/${id}`, code);
    return response.data;
  },

  // 코드 삭제
  deleteCode: async (id: number): Promise<void> => {
    await apiClient.delete(`/codes/${id}`);
  }
};
