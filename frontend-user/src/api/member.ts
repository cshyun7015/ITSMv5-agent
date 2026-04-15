import apiClient from './client';
import { Approver } from '../types/request';

export const memberApi = {
  getPotentialApprovers: async (): Promise<Approver[]> => {
    const response = await apiClient.get('/members/approvers');
    return response.data;
  }
};
