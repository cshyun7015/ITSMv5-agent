export interface ConfigurationItem {
  ciId: number;
  tenantId: string;
  tenantName: string;
  name: string;
  typeCode: string; // SERVER, DATABASE, NETWORK, APPLICATION, TERMINAL
  statusCode: string; // PROVISIONING, ACTIVE, MAINTENANCE, RETIRED, DECOMMISSIONED
  serialNumber?: string;
  ownerId?: number;
  ownerName?: string;
  location?: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CIRequest {
  tenantId: string;
  name: string;
  typeCode: string;
  statusCode?: string;
  serialNumber?: string;
  ownerId?: number;
  location?: string;
  description?: string;
}
