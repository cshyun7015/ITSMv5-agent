import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import OperatorDrawer from './OperatorDrawer';
import { operatorApi } from '../api/operatorApi';
import { Operator, Team } from '../types';

// Mock operatorApi
vi.mock('../api/operatorApi', () => ({
  operatorApi: {
    createOperator: vi.fn(),
    updateOperator: vi.fn()
  }
}));

describe('OperatorDrawer', () => {
  const mockTeams: Team[] = [
    { teamId: 10, name: 'Team A', orgId: 100, tenantId: 'T1' },
    { teamId: 20, name: 'Team B', orgId: 200, tenantId: 'T2' }
  ];

  const mockOrgs = [
    { orgId: 100, name: 'Org A' },
    { orgId: 200, name: 'Org B' }
  ];

  const mockProps = {
    isOpen: true,
    onClose: vi.fn(),
    onSuccess: vi.fn(),
    allTeams: mockTeams,
    organizations: mockOrgs
  };

  const mockOperator: Operator = {
    memberId: 1,
    username: 'existing_user',
    email: 'test@test.com',
    roleId: 'ROLE_OPERATOR',
    tenantId: 'T1',
    tenantName: 'Org A',
    teamId: 10,
    teamName: 'Team A',
    isActive: true,
    createdAt: '2024-01-01',
    updatedAt: '2024-01-01'
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render create mode correctly', () => {
    render(<OperatorDrawer {...mockProps} />);
    
    expect(screen.getByText('Register New Member')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('e.g. operator_dev')).not.toBeDisabled();
    expect(screen.getByLabelText('Initial Password')).toBeInTheDocument();
  });

  it('should render edit mode correctly', () => {
    render(<OperatorDrawer {...mockProps} operator={mockOperator} />);
    
    expect(screen.getByText('Edit Operator Profile')).toBeInTheDocument();
    expect(screen.getByDisplayValue('existing_user')).toBeDisabled();
    expect(screen.getByLabelText('Update Password')).toBeInTheDocument();
  });

  it('should handle form input changes', () => {
    render(<OperatorDrawer {...mockProps} />);
    
    const emailInput = screen.getByPlaceholderText('operator@company.com');
    fireEvent.change(emailInput, { target: { name: 'email', value: 'new@test.com' } });
    
    expect(emailInput).toHaveValue('new@test.com');
  });

  it('should call createOperator API on submit in create mode', async () => {
    vi.mocked(operatorApi.createOperator).mockResolvedValue({} as any);
    render(<OperatorDrawer {...mockProps} />);
    
    fireEvent.change(screen.getByPlaceholderText('e.g. operator_dev'), { target: { name: 'username', value: 'new_user' } });
    fireEvent.change(screen.getByPlaceholderText('operator@company.com'), { target: { name: 'email', value: 'new@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('Enter login password'), { target: { name: 'password', value: 'password123' } });
    
    fireEvent.click(screen.getByText('Create Account'));
    
    await waitFor(() => {
      expect(operatorApi.createOperator).toHaveBeenCalledWith(expect.objectContaining({
        username: 'new_user',
        email: 'new@test.com'
      }));
      expect(mockProps.onSuccess).toHaveBeenCalled();
    });
  });

  it('should call updateOperator API on submit in edit mode', async () => {
    vi.mocked(operatorApi.updateOperator).mockResolvedValue({} as any);
    render(<OperatorDrawer {...mockProps} operator={mockOperator} />);
    
    fireEvent.change(screen.getByPlaceholderText('operator@company.com'), { target: { name: 'email', value: 'updated@test.com' } });
    
    fireEvent.click(screen.getByText('Save Changes'));
    
    await waitFor(() => {
      expect(operatorApi.updateOperator).toHaveBeenCalledWith(1, expect.objectContaining({
        email: 'updated@test.com'
      }));
      expect(mockProps.onSuccess).toHaveBeenCalled();
    });
  });

  it('should filter teams based on organization selection', () => {
    render(<OperatorDrawer {...mockProps} />);
    
    const orgSelect = screen.getByDisplayValue('Select Organization');
    fireEvent.change(orgSelect, { target: { value: '100' } });
    
    const teamSelect = screen.getByRole('combobox', { name: /Assigned Team/i });
    expect(screen.getByText('Team A')).toBeInTheDocument();
    expect(screen.queryByText('Team B')).not.toBeInTheDocument();
  });
});
