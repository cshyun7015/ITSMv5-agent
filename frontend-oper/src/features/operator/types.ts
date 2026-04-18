export interface Operator {
  memberId: number;
  username: string;
  email: string;
  roleId: string;
  tenantId: string;
  tenantName: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface OperatorRequest {
  username?: string;
  email: string;
  password?: string;
  roleId?: string;
  isActive: boolean;
}
