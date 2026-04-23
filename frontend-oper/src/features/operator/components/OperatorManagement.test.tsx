import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import OperatorManagement from './OperatorManagement';
import { operatorApi } from '../api/operatorApi';
import { AuthProvider } from '../../auth/context/AuthContext';
import { ToastProvider } from '../../../context/ToastContext';

// Mock APIs
vi.mock('../api/operatorApi', () => ({
  operatorApi: {
    getOperators: vi.fn(),
    getTeams: vi.fn(),
    getTenants: vi.fn(),
    deleteOperator: vi.fn(),
    updateOperator: vi.fn()
  }
}));

// Mock Auth Context
vi.mock('../../auth/context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      username: 'admin',
      roles: ['ROLE_ADMIN']
    }
  }),
  AuthProvider: ({ children }: any) => <div>{children}</div>
}));

describe('OperatorManagement', () => {
  const mockOperators = [
    { memberId: 1, username: 'user1', email: 'u1@t.com', tenantId: 'T1', roleId: 'ROLE_OPERATOR', isActive: true }
  ];
  const mockTeams = [
    { teamId: 10, name: 'Team A', orgId: 100, tenantId: 'T1', orgName: 'Org A' }
  ];
  const mockTenants = [
    { tenantId: 'T1', name: 'Org A', brandColor: '#ff0000' }
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(operatorApi.getOperators).mockResolvedValue(mockOperators);
    vi.mocked(operatorApi.getTeams).mockResolvedValue(mockTeams);
    vi.mocked(operatorApi.getTenants).mockResolvedValue(mockTenants);
  });

  const renderComponent = () => {
    return render(
      <ToastProvider>
        <AuthProvider>
          <OperatorManagement />
        </AuthProvider>
      </ToastProvider>
    );
  };

  it('should load and render data correctly', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(operatorApi.getOperators).toHaveBeenCalled();
      expect(operatorApi.getTeams).toHaveBeenCalled();
      expect(operatorApi.getTenants).toHaveBeenCalled();
    });

    // Use getAllByText or specific role since it appears in sidebar and card
    expect(screen.getAllByText('Org A').length).toBeGreaterThan(0);
  });

  it('should switch view modes', async () => {
    renderComponent();
    
    await waitFor(() => screen.getByTestId('view-mode-tenants'));
    
    const operatorsTab = screen.getByTestId('view-mode-operators');
    fireEvent.click(operatorsTab);
    
    await waitFor(() => {
      // Check title heading specifically
      expect(screen.getByRole('heading', { name: /All Operators/i })).toBeInTheDocument();
    });
  });

  it('should open operator drawer on add button click', async () => {
    renderComponent();
    
    await waitFor(() => screen.getByTestId('view-mode-operators'));
    fireEvent.click(screen.getByTestId('view-mode-operators'));
    
    const addBtn = await screen.findByTestId('add-operator-btn');
    fireEvent.click(addBtn);
    
    expect(screen.getByText('Register New Member')).toBeInTheDocument();
  });
});
