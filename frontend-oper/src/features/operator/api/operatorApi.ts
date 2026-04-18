import apiClient from '../../../api/client';
import { Operator, OperatorRequest, Team, TeamRequest } from '../types';

export const operatorApi = {
  // 운영자 목록 조회
  getOperators: async (): Promise<Operator[]> => {
    const response = await apiClient.get<Operator[]>('/operator/operators');
    return response.data;
  },

  // 팀 목록 조회
  getTeams: async (): Promise<Team[]> => {
    const response = await apiClient.get<Team[]>('/operator/teams');
    return response.data;
  },

  // 팀 등록
  createTeam: async (data: TeamRequest): Promise<Team> => {
    const response = await apiClient.post<Team>('/operator/teams', data);
    return response.data;
  },

  // 팀 수정
  updateTeam: async (id: number, data: TeamRequest): Promise<Team> => {
    const response = await apiClient.put<Team>(`/operator/teams/${id}`, data);
    return response.data;
  },

  // 팀 삭제
  deleteTeam: async (id: number): Promise<void> => {
    await apiClient.delete(`/operator/teams/${id}`);
  },

  // 운영자 상세 조회
  getOperator: async (id: number): Promise<Operator> => {
    const response = await apiClient.get<Operator>(`/operator/operators/${id}`);
    return response.data;
  },

  // 운영자 등록
  createOperator: async (data: OperatorRequest): Promise<Operator> => {
    const response = await apiClient.post<Operator>('/operator/operators', data);
    return response.data;
  },

  // 운영자 수정
  updateOperator: async (id: number, data: Partial<OperatorRequest>): Promise<Operator> => {
    const response = await apiClient.put<Operator>(`/operator/operators/${id}`, data);
    return response.data;
  },

  // 운영자 삭제
  deleteOperator: async (id: number): Promise<void> => {
    await apiClient.delete(`/operator/operators/${id}`);
  }
};
