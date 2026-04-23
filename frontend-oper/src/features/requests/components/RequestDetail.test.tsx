import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import RequestDetail from './RequestDetail';
import { requestApi } from '../api/requestApi';

vi.mock('../api/requestApi', () => ({
  requestApi: {
    getRequest: vi.fn(),
    getApprovals: vi.fn(),
    assignToMe: vi.fn(),
    resolve: vi.fn(),
    close: vi.fn(),
    deleteRequest: vi.fn(),
    downloadAttachment: vi.fn(),
    updateRequest: vi.fn(),
    createRequest: vi.fn(),
    getCodesByGroup: vi.fn(),
    getTenants: vi.fn(),
    getTenantUsers: vi.fn(),
  }
}));

const mockRequest = {
  requestId: 123,
  title: 'Test Request',
  description: 'Detailed description',
  status: 'OPEN',
  priority: 'NORMAL',
  requesterName: 'Requester',
  tenantId: 'T1',
  createdAt: '2026-04-23T10:00:00Z',
  attachments: [{ id: 1, fileName: 'test.pdf', fileSize: 1024 }]
};

describe('RequestDetail', () => {
  const onBack = vi.fn();
  const onUpdated = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (requestApi.getRequest as any).mockResolvedValue(mockRequest);
    (requestApi.getApprovals as any).mockResolvedValue([]);
    (requestApi.getCodesByGroup as any).mockResolvedValue([]);
    (requestApi.getTenants as any).mockResolvedValue([{ tenantId: 'T1', name: 'Tenant 1' }]);
  });

  it('renders request details correctly', async () => {
    render(<RequestDetail requestId={123} onBack={onBack} onUpdated={onUpdated} />);
    
    await waitFor(() => {
      expect(screen.getByText('Test Request')).toBeInTheDocument();
      expect(screen.getByTestId('request-description')).toHaveTextContent('Detailed description');
      expect(screen.getByTestId('status-pill')).toHaveTextContent('OPEN');
    });
  });

  it('handles assignment', async () => {
    render(<RequestDetail requestId={123} onBack={onBack} onUpdated={onUpdated} />);
    await waitFor(() => screen.getByText('Test Request'));

    const assignBtn = screen.getByTestId('btn-take-assignment');
    fireEvent.click(assignBtn);

    expect(requestApi.assignToMe).toHaveBeenCalledWith(123);
  });

  it('shows resolution input when in progress', async () => {
    (requestApi.getRequest as any).mockResolvedValue({ ...mockRequest, status: 'IN_PROGRESS' });
    render(<RequestDetail requestId={123} onBack={onBack} onUpdated={onUpdated} />);
    
    await waitFor(() => {
      expect(screen.getByTestId('resolution-input')).toBeInTheDocument();
    });
  });

  it('handles resolving a request', async () => {
    (requestApi.getRequest as any).mockResolvedValue({ ...mockRequest, status: 'IN_PROGRESS' });
    render(<RequestDetail requestId={123} onBack={onBack} onUpdated={onUpdated} />);
    await waitFor(() => screen.getByTestId('resolution-input'));

    fireEvent.change(screen.getByTestId('resolution-input'), { target: { value: 'Resolved now' } });
    fireEvent.click(screen.getByTestId('btn-commit-resolution'));

    await waitFor(() => {
      expect(requestApi.resolve).toHaveBeenCalledWith(123, 'Resolved now');
    });
  });

  it('handles closing a request', async () => {
    (requestApi.getRequest as any).mockResolvedValue({ ...mockRequest, status: 'RESOLVED' });
    render(<RequestDetail requestId={123} onBack={onBack} onUpdated={onUpdated} />);
    await waitFor(() => screen.getByTestId('btn-close-request'));

    fireEvent.click(screen.getByTestId('btn-close-request'));

    await waitFor(() => {
      expect(requestApi.close).toHaveBeenCalledWith(123);
    });
  });

  it('triggers onSuccess when edit modal completes', async () => {
    (requestApi.updateRequest as any).mockResolvedValue(undefined);
    render(<RequestDetail requestId={123} onBack={onBack} onUpdated={onUpdated} />);
    await waitFor(() => screen.getByText('Test Request'));

    fireEvent.click(screen.getByTestId('btn-edit-request'));
    
    await waitFor(() => screen.getByTestId('input-title'));
    fireEvent.click(screen.getByTestId('btn-submit-request'));

    await waitFor(() => {
      expect(onUpdated).toHaveBeenCalled();
    });
  });

  it('handles deletion with confirmation', async () => {
    vi.spyOn(window, 'confirm').mockReturnValue(true);
    render(<RequestDetail requestId={123} onBack={onBack} onUpdated={onUpdated} />);
    await waitFor(() => screen.getByText('Test Request'));

    const deleteBtn = screen.getByTestId('btn-delete-request');
    fireEvent.click(deleteBtn);

    await waitFor(() => {
      expect(requestApi.deleteRequest).toHaveBeenCalledWith(123);
      expect(onBack).toHaveBeenCalled();
    });
  });
});
