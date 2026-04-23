import { render, screen, fireEvent, act } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import OperatorTable from './OperatorTable';
import { Operator } from '../types';

describe('OperatorTable', () => {
  const mockOperators: Operator[] = [
    {
      memberId: 1,
      username: 'admin_user',
      email: 'admin@test.com',
      roleId: 'ROLE_ADMIN',
      tenantId: 'OPER_MSP',
      tenantName: 'MSP Center',
      teamId: 10,
      teamName: 'Security Team',
      isActive: true,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    },
    {
      memberId: 2,
      username: 'operator_user',
      email: 'op@test.com',
      roleId: 'ROLE_OPERATOR',
      tenantId: 'OPER_MSP',
      tenantName: 'MSP Center',
      teamId: 20,
      teamName: 'Ops Team',
      isActive: false,
      createdAt: '2024-01-01',
      updatedAt: '2024-01-01'
    }
  ];

  const mockProps = {
    operators: mockOperators,
    selectedIds: [],
    onSelectToggle: vi.fn(),
    onSelectAll: vi.fn(),
    onRowClick: vi.fn(),
    onDelete: vi.fn(),
    isLoading: false,
    canManage: true
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render operator list correctly', () => {
    render(<OperatorTable {...mockProps} />);
    
    expect(screen.getByText('admin_user')).toBeInTheDocument();
    expect(screen.getByText('operator_user')).toBeInTheDocument();
    expect(screen.getByText('admin@test.com')).toBeInTheDocument();
    expect(screen.getByText('Security Team')).toBeInTheDocument();
  });

  it('should filter by search text with debounce', async () => {
    vi.useFakeTimers();
    render(<OperatorTable {...mockProps} />);
    
    const searchInput = screen.getByPlaceholderText('Search by name or email…');
    fireEvent.change(searchInput, { target: { value: 'admin' } });
    
    // Before debounce
    expect(screen.getByText('operator_user')).toBeInTheDocument();
    
    // After debounce
    act(() => {
      vi.advanceTimersByTime(300);
    });
    
    expect(screen.getByText('admin_user')).toBeInTheDocument();
    expect(screen.queryByText('operator_user')).not.toBeInTheDocument();
    
    vi.useRealTimers();
  });

  it('should filter by role', () => {
    render(<OperatorTable {...mockProps} />);
    
    const roleSelect = screen.getByDisplayValue('All Roles');
    fireEvent.change(roleSelect, { target: { value: 'ROLE_ADMIN' } });
    
    expect(screen.getByText('admin_user')).toBeInTheDocument();
    expect(screen.queryByText('operator_user')).not.toBeInTheDocument();
  });

  it('should filter by status', () => {
    render(<OperatorTable {...mockProps} />);
    
    const statusSelect = screen.getByDisplayValue('All Status');
    fireEvent.change(statusSelect, { target: { value: 'active' } });
    
    expect(screen.getByText('admin_user')).toBeInTheDocument();
    expect(screen.queryByText('operator_user')).not.toBeInTheDocument();
  });

  it('should call onDelete when delete button is clicked', () => {
    render(<OperatorTable {...mockProps} />);
    
    const deleteBtns = screen.getAllByText('Delete');
    fireEvent.click(deleteBtns[0]);
    
    expect(mockProps.onDelete).toHaveBeenCalledWith(1);
  });

  it('should toggle selection when checkbox is clicked', () => {
    render(<OperatorTable {...mockProps} />);
    
    const checkboxes = screen.getAllByRole('checkbox');
    // Index 0 is "Select All", Index 1 is first row
    fireEvent.click(checkboxes[1]);
    
    expect(mockProps.onSelectToggle).toHaveBeenCalledWith(1);
  });

  it('should call onSelectAll when select all checkbox is clicked', () => {
    render(<OperatorTable {...mockProps} />);
    
    const selectAllCheckbox = screen.getAllByRole('checkbox')[0];
    fireEvent.click(selectAllCheckbox);
    
    expect(mockProps.onSelectAll).toHaveBeenCalledWith([1, 2]);
  });
});
