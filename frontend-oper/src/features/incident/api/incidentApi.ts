import apiClient from '../../../api/client';
import { Incident, IncidentReportRequest } from '../types';

export const incidentApi = {
  // 전체 인시던트 목록 조회
  getAllIncidents: async (): Promise<Incident[]> => {
    const response = await apiClient.get<Incident[]>('/incidents');
    return response.data;
  },

  // 인시던트 상세 조회
  getIncident: async (id: number): Promise<Incident> => {
    const response = await apiClient.get<Incident>(`/incidents/${id}`);
    return response.data;
  },

  // 인시던트 신고 (UI용)
  reportIncident: async (data: IncidentReportRequest): Promise<Incident> => {
    const response = await apiClient.post<Incident>('/incidents', data);
    return response.data;
  },

  // 시스템 알람 시뮬레이션 (Alert용)
  reportAlert: async (data: IncidentReportRequest): Promise<Incident> => {
    const response = await apiClient.post<Incident>('/incidents/alerts', data);
    return response.data;
  },

  // 담당자 배정
  assign: async (id: number): Promise<void> => {
    await apiClient.post(`/incidents/${id}/assign`);
  },

  // 해결 처리
  resolve: async (id: number, resolution: string): Promise<void> => {
    await apiClient.post(`/incidents/${id}/resolve`, { resolution });
  },

  // 인시던트 수정
  updateIncident: async (id: number, data: IncidentReportRequest): Promise<Incident> => {
    const response = await apiClient.put<Incident>(`/incidents/${id}`, data);
    return response.data;
  },

  // 인시던트 삭제
  deleteIncident: async (id: number): Promise<void> => {
    await apiClient.delete(`/incidents/${id}`);
  },
  
  // 운영자 목록 조회 (배정용)
  getOperators: async (): Promise<any[]> => {
    const response = await apiClient.get<any[]>('/members/operators');
    return response.data;
  }
};
