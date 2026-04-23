import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import RequestList from './RequestList';
import { requestApi } from '../api/requestApi';

vi.mock('../api/requestApi', () => ({
  requestApi: {
    getAllRequests: vi.fn(),
    getTenants: vi.fn(),
    assignToMe: vi.fn(),
  }
}));

const mockRequests = [
  { requestId: 1, title: 'Req 1', status: 'OPEN', tenantId: 'T1', requesterName: 'User 1', createdAt: '2026-04-23T10:00:00Z' },
  { requestId: 2, title: 'Req 2', status: 'IN_PROGRESS', tenantId: 'T2', requesterName: 'User 2', createdAt: '2026-04-23T11:00:00Z' }
];

const mockTenants = [
  { tenantId: 'T1', name: 'Tenant 1', brandColor: '#ff0000' },
  { tenantId: 'T2', name: 'Tenant 2', brandColor: '#00ff00' }
];

describe('RequestList', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (requestApi.getAllRequests as any).mockResolvedValue(mockRequests);
    (requestApi.getTenants as any).mockResolvedValue(mockTenants);
  });

  it('renders request list correctly', async () => {
    render(<RequestList onSelectRequest={() => {}} />);
    
    expect(screen.getByText('Initializing Requests Center...')).toBeInTheDocument();
    
    await waitFor(() => {
      expect(screen.getByText('Req 1')).toBeInTheDocument();
      expect(screen.getByText('Req 2')).toBeInTheDocument();
    });

    expect(screen.getByTestId('open-count')).toHaveTextContent('1');
    expect(screen.getByTestId('progress-count')).toHaveTextContent('1');
  });

  it('filters requests by status', async () => {
    render(<RequestList onSelectRequest={() => {}} />);
    await waitFor(() => screen.getByText('Req 1'));

    const openFilter = screen.getByTestId('filter-status-OPEN');
    fireEvent.click(openFilter);

    expect(screen.getByText('Req 1')).toBeInTheDocument();
    expect(screen.queryByText('Req 2')).not.toBeInTheDocument();
  });

  it('filters requests by tenant', async () => {
    render(<RequestList onSelectRequest={() => {}} />);
    await waitFor(() => screen.getByText('Req 1'));

    const tenantFilter = screen.getByTestId('filter-tenant');
    fireEvent.change(tenantFilter, { target: { value: 'T2' } });

    expect(screen.getByText('Req 2')).toBeInTheDocument();
    expect(screen.queryByText('Req 1')).not.toBeInTheDocument();
  });

  it('calls assignToMe when Assign button is clicked', async () => {
    const onSelectRequest = vi.fn();
    render(<RequestList onSelectRequest={onSelectRequest} />);
    await waitFor(() => screen.getByText('Req 1'));

    const assignBtn = screen.getByTestId('btn-assign-1');
    fireEvent.click(assignBtn);

    expect(requestApi.assignToMe).toHaveBeenCalledWith(1);
  });
});
