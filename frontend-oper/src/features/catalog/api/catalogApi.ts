import apiClient from '../../../api/client';

export interface ServiceCatalog {
  id: number;
  name: string;
  description: string;
  icon: string;
  jsonSchema: string;
  approvalRequired: boolean;
  category: {
    id: number;
    name: string;
  };
}

export interface CatalogCategory {
  id: number;
  name: string;
  description?: string;
  icon?: string;
}

export const catalogApi = {
  getTemplates: async (): Promise<ServiceCatalog[]> => {
    const response = await apiClient.get<ServiceCatalog[]>('/operator/catalog/templates');
    return response.data;
  },

  createTemplate: async (data: any): Promise<ServiceCatalog> => {
    const response = await apiClient.post<ServiceCatalog>('/operator/catalog/templates', data);
    return response.data;
  },

  deployToTenant: async (templateId: number, targetTenantId: string): Promise<void> => {
    await apiClient.post('/operator/catalog/deploy', { templateId, targetTenantId });
  },

  getCategories: async (): Promise<CatalogCategory[]> => {
    const response = await apiClient.get<CatalogCategory[]>('/operator/catalog/categories');
    return response.data;
  },

  createCategory: async (data: any): Promise<CatalogCategory> => {
    const response = await apiClient.post<CatalogCategory>('/operator/catalog/categories', data);
    return response.data;
  }
};
