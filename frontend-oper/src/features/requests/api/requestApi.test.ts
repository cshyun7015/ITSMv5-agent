import { vi, describe, it, expect, beforeEach } from 'vitest';
import { requestApi } from './requestApi';
vi.mock('../../../api/client', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  }
}));

import apiClient from '../../../api/client';
const mockedApiClient = apiClient as any;

describe('requestApi', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches all requests', async () => {
    const mockData = [{ requestId: 1, title: 'Test' }];
    mockedApiClient.get.mockResolvedValue({ data: mockData });

    const result = await requestApi.getAllRequests();
    expect(result).toEqual(mockData);
    expect(mockedApiClient.get).toHaveBeenCalledWith('/requests/all');
  });

  it('creates a request with files', async () => {
    const dto = { title: 'New', description: 'Desc', priority: 'NORMAL', targetTenantId: 'T1' };
    const file = new File([''], 'test.txt', { type: 'text/plain' });
    mockedApiClient.post.mockResolvedValue({ data: { id: 1 } });

    await requestApi.createRequest(dto as any, [file]);

    expect(mockedApiClient.post).toHaveBeenCalledWith(
      '/requests',
      expect.any(FormData),
      expect.objectContaining({ headers: { 'Content-Type': 'multipart/form-data' } })
    );
  });

  it('handles assignment', async () => {
    mockedApiClient.post.mockResolvedValue({ data: {} });
    await requestApi.assignToMe(123);
    expect(mockedApiClient.post).toHaveBeenCalledWith('/requests/123/assign');
  });

  it('handles resolution', async () => {
    mockedApiClient.post.mockResolvedValue({ data: {} });
    await requestApi.resolve(123, 'Fixed it');
    expect(mockedApiClient.post).toHaveBeenCalledWith('/requests/123/resolve', { resolution: 'Fixed it' });
  });

  it('handles deletion', async () => {
    mockedApiClient.delete.mockResolvedValue({ data: {} });
    await requestApi.deleteRequest(123);
    expect(mockedApiClient.delete).toHaveBeenCalledWith('/requests/123');
  });
});
