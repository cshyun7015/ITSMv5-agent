import apiClient from '../../../api/client';

export interface CatalogItem {
  id: number;
  name: string;
  description: string;
  icon: string;
  categoryName: string;
  jsonSchema: string;
  approvalRequired: boolean;
}

export const catalogApi = {
  getMyCatalog: async (): Promise<CatalogItem[]> => {
    const response = await apiClient.get<CatalogItem[]>('/catalog');
    return response.data;
  }
};
