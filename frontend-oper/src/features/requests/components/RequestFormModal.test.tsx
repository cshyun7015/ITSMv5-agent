import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import RequestFormModal from './RequestFormModal';
import { requestApi } from '../api/requestApi';

vi.mock('../api/requestApi', () => ({
  requestApi: {
    getCodesByGroup: vi.fn(),
    getTenants: vi.fn(),
    getTenantUsers: vi.fn(),
    createRequest: vi.fn(),
    updateRequest: vi.fn(),
  }
}));

describe('RequestFormModal', () => {
  const onClose = vi.fn();
  const onSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (requestApi.getCodesByGroup as any).mockResolvedValue([]);
    (requestApi.getTenants as any).mockResolvedValue([{ tenantId: 'T1', name: 'Tenant 1' }]);
  });

  it('handles manual request creation', async () => {
    render(<RequestFormModal onClose={onClose} onSuccess={onSuccess} />);
    
    await waitFor(() => screen.getByTestId('input-title'));

    fireEvent.change(screen.getByTestId('input-title'), { target: { value: 'New Issue' } });
    fireEvent.change(screen.getByTestId('input-description'), { target: { value: 'Problem details' } });

    fireEvent.click(screen.getByTestId('btn-submit-request'));

    await waitFor(() => {
      expect(requestApi.createRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'New Issue',
          description: 'Problem details',
          targetTenantId: 'T1'
        }),
        expect.any(Array)
      );
      expect(onSuccess).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('handles request update', async () => {
    const existingRequest = {
      requestId: 1,
      title: 'Old Title',
      description: 'Old Desc',
      status: 'OPEN',
      priority: 'NORMAL',
      tenantId: 'T1'
    };
    
    render(<RequestFormModal request={existingRequest as any} onClose={onClose} onSuccess={onSuccess} />);
    
    await waitFor(() => screen.getByTestId('input-title'));
    
    fireEvent.change(screen.getByTestId('input-title'), { target: { value: 'Updated Title' } });
    fireEvent.click(screen.getByTestId('btn-submit-request'));

    await waitFor(() => {
      expect(requestApi.updateRequest).toHaveBeenCalledWith(
        1,
        expect.objectContaining({ title: 'Updated Title' }),
        expect.any(Array)
      );
    });
  });

  it('handles manual requester selection', async () => {
    (requestApi.getTenantUsers as any).mockResolvedValue([{ memberId: 101, username: 'Customer User', email: 'c@example.com' }]);
    
    render(<RequestFormModal onClose={onClose} onSuccess={onSuccess} />);
    await waitFor(() => screen.getByText('Select Customer User'));

    fireEvent.click(screen.getByLabelText('Select Customer User'));
    
    await waitFor(() => screen.getByText('Select Customer User (Requester)'));
    fireEvent.change(screen.getByRole('combobox', { name: /Select Customer User \(Requester\)/i }), { target: { value: '101' } });

    fireEvent.change(screen.getByTestId('input-title'), { target: { value: 'Manual Req' } });
    fireEvent.change(screen.getByTestId('input-description'), { target: { value: 'Manual Desc' } });
    fireEvent.click(screen.getByTestId('btn-submit-request'));

    await waitFor(() => {
      expect(requestApi.createRequest).toHaveBeenCalledWith(
        expect.objectContaining({
          requesterId: 101,
          title: 'Manual Req'
        }),
        expect.any(Array)
      );
    });
  });

  it('handles API error on submit', async () => {
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    (requestApi.createRequest as any).mockRejectedValue(new Error('API Error'));
    
    render(<RequestFormModal onClose={onClose} onSuccess={onSuccess} />);
    await waitFor(() => screen.getByTestId('input-title'));

    fireEvent.change(screen.getByTestId('input-title'), { target: { value: 'Fail Me' } });
    fireEvent.change(screen.getByTestId('input-description'), { target: { value: 'Error trigger' } });
    fireEvent.click(screen.getByTestId('btn-submit-request'));

    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Failed to create request');
    });
  });
});
