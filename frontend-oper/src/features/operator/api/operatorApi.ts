import apiClient from '../../../api/client';
import { Operator, OperatorRequest } from '../types';

export const operatorApi = {
  // 운영자 목록 조회
  getOperators: async (): Promise<Operator[]> => {
    const response = await apiClient.get<Operator[]>('/operators');
    return response.data;
  },

  // 운영자 상세 조회
  getOperator: async (id: number): Promise<Operator> => {
    const response = await apiClient.get<Operator>(`/operators/${id}`);
    return response.data;
  },

  // 운영자 등록
  createOperator: async (data: OperatorRequest): Promise<Operator> => {
    const response = await apiClient.post<Operator>('/operators', data);
    return response.data;
  },

  // 운영자 수정
  updateOperator: async (id: number, data: Partial<OperatorRequest>): Promise<Operator> => {
    const response = await apiClient.put<Operator>(`/operators/${id}`, data);
    return response.data;
  },

  // 운영자 삭제
  deleteOperator: async (id: number): Promise<void> => {
    await apiClient.delete(`/operators/${id}`);
  }
};
