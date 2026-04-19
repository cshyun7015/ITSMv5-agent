export interface Team {
  teamId: number;
  name: string;
  description?: string;
  orgId: number;
  orgName?: string;
  tenantId: string;
}

export interface TeamRequest {
  name: string;
  description?: string;
  orgId: number;
}

export interface Operator {
  memberId: number;
  username: string;
  email: string;
  roleId: string;
  tenantId: string;
  tenantName: string;
  teamId: number | null;
  teamName: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OperatorRequest {
  username?: string;
  password?: string;
  email: string;
  roleId?: string;
  teamId: number | null;
  isActive: boolean;
}

export interface Tenant {
  tenantId: string;
  name: string;
  brandColor: string;
}
