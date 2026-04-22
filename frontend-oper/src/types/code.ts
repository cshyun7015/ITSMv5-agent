export interface CodeDTO {
  id?: number;
  groupId: string;
  codeId: string;
  codeName: string;
  description?: string;
  sortOrder?: number;
  isActive?: boolean;
}
