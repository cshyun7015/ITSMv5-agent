import apiClient from '../../../api/client';
import { Operator, Team } from '../../operator/types';

export interface CustomerTenant {
    tenantId: string;
    name: string;
}

export interface CustomerOrg {
    orgId: number;
    name: string;
}

export const customerApi = {
    getTenants: async (): Promise<CustomerTenant[]> => {
        const response = await apiClient.get<CustomerTenant[]>('/customer/tenants');
        return response.data;
    },

    getOrganizations: async (tenantId: string): Promise<CustomerOrg[]> => {
        const response = await apiClient.get<CustomerOrg[]>(`/customer/tenants/${tenantId}/organizations`);
        return response.data;
    },

    getTeams: async (tenantId: string): Promise<Team[]> => {
        const response = await apiClient.get<Team[]>(`/customer/tenants/${tenantId}/teams`);
        return response.data;
    },

    getUsers: async (tenantId: string): Promise<Operator[]> => {
        const response = await apiClient.get<Operator[]>(`/customer/tenants/${tenantId}/users`);
        return response.data;
    },

    createTeam: async (data: any): Promise<Team> => {
        const response = await apiClient.post<Team>('/customer/teams', data);
        return response.data;
    },

    createUser: async (data: any): Promise<Operator> => {
        const response = await apiClient.post<Operator>('/customer/users', data);
        return response.data;
    }
};
