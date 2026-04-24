import { describe, it, expect, vi, beforeEach } from 'vitest';
import apiClient from '../../../api/client';
import { codeApi } from './codeApi';
import { CodeDTO } from '../../../types/code';

vi.mock('../../../api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

describe('codeApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockCode: CodeDTO = {
    id: 1,
    groupId: 'STATUS',
    codeId: 'ACTIVE',
    codeName: 'Active',
    isActive: true,
  };

  it('getAllCodes should fetch all codes', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: [mockCode] });
    
    const result = await codeApi.getAllCodes();
    
    expect(apiClient.get).toHaveBeenCalledWith('/codes');
    expect(result).toEqual([mockCode]);
  });

  it('getCodesByGroup should fetch codes for a specific group', async () => {
    vi.mocked(apiClient.get).mockResolvedValue({ data: [mockCode] });
    
    const result = await codeApi.getCodesByGroup('STATUS');
    
    expect(apiClient.get).toHaveBeenCalledWith('/codes/group/STATUS');
    expect(result).toEqual([mockCode]);
  });

  it('createCode should send POST request', async () => {
    vi.mocked(apiClient.post).mockResolvedValue({ data: mockCode });
    
    const result = await codeApi.createCode(mockCode);
    
    expect(apiClient.post).toHaveBeenCalledWith('/codes', mockCode);
    expect(result).toEqual(mockCode);
  });

  it('updateCode should send PUT request', async () => {
    vi.mocked(apiClient.put).mockResolvedValue({ data: mockCode });
    
    const result = await codeApi.updateCode(1, mockCode);
    
    expect(apiClient.put).toHaveBeenCalledWith('/codes/1', mockCode);
    expect(result).toEqual(mockCode);
  });

  it('deleteCode should send DELETE request', async () => {
    vi.mocked(apiClient.delete).mockResolvedValue({});
    
    await codeApi.deleteCode(1);
    
    expect(apiClient.delete).toHaveBeenCalledWith('/codes/1');
  });
});
