import apiClient from '../../../api/client';

export interface ServiceCatalog {
  id: number;
  name: string;
  description: string;
  icon: string;
  jsonSchema: string;
  approvalRequired: boolean;
  categoryCode: string;
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

  updateTemplate: async (id: number, data: any): Promise<ServiceCatalog> => {
    const response = await apiClient.put<ServiceCatalog>(`/operator/catalog/templates/${id}`, data);
    return response.data;
  },

  deleteTemplate: async (id: number): Promise<void> => {
    await apiClient.delete(`/operator/catalog/templates/${id}`);
  },

  deployToTenants: async (templateId: number, targetTenantIds: string[]): Promise<void> => {
    await apiClient.post('/operator/catalog/deploy', { templateId, targetTenantIds });
  },

  getCategories: async (): Promise<CatalogCategory[]> => {
    const response = await apiClient.get<CatalogCategory[]>('/operator/catalog/categories');
    return response.data;
  },

  createCategory: async (data: any): Promise<CatalogCategory> => {
    const response = await apiClient.post<CatalogCategory>('/operator/catalog/categories', data);
    return response.data;
  },

  updateCategory: async (id: number, data: any): Promise<CatalogCategory> => {
    const response = await apiClient.put<CatalogCategory>(`/operator/catalog/categories/${id}`, data);
    return response.data;
  },

  deleteCategory: async (id: number): Promise<void> => {
    await apiClient.delete(`/operator/catalog/categories/${id}`);
  }
};
