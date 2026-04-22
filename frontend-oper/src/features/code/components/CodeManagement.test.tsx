import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CodeManagement from './CodeManagement';
import { codeApi } from '../api/codeApi';
import { useAuth } from '../../auth/context/AuthContext';
import { useToast } from '../../../hooks/useToast';

// Mock dependencies
vi.mock('../api/codeApi', () => ({
  codeApi: {
    getAllGroupIds: vi.fn(),
    getCodesByGroup: vi.fn(),
    deleteCode: vi.fn(),
    deleteCodesByGroup: vi.fn(),
  },
}));

vi.mock('../../auth/context/AuthContext', () => ({
  useAuth: vi.fn(() => ({
    user: { roles: ['ROLE_ADMIN'] }
  })),
}));

const mockToast = {
  success: vi.fn(),
  error: vi.fn(),
};

vi.mock('../../../hooks/useToast', () => ({
  useToast: vi.fn(() => ({
    toast: mockToast,
  })),
}));

// Mock child components to simplify testing
vi.mock('./GroupSidebar', () => ({
  default: ({ onSelectGroup, onAddGroup }: any) => (
    <div data-testid="group-sidebar">
      <button onClick={() => onSelectGroup('TEST_GROUP')}>Select Group</button>
      <button onClick={onAddGroup}>Add Group</button>
    </div>
  )
}));

vi.mock('./CodeList', () => ({
  default: ({ onEdit, onDelete }: any) => (
    <div data-testid="code-list">
      <button onClick={() => onEdit({ id: 1, codeId: 'C1' })}>Edit</button>
      <button onClick={() => onDelete(1)}>Delete</button>
    </div>
  )
}));

describe('CodeManagement', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(codeApi.getAllGroupIds).mockResolvedValue(['GROUP1', 'GROUP2']);
    vi.mocked(codeApi.getCodesByGroup).mockResolvedValue([]);
  });

  it('should fetch group IDs on mount', async () => {
    render(<CodeManagement />);
    
    await waitFor(() => {
      expect(codeApi.getAllGroupIds).toHaveBeenCalled();
    });
  });

  it('should fetch codes when a group is selected', async () => {
    render(<CodeManagement />);
    
    const selectBtn = await screen.findByText('Select Group');
    fireEvent.click(selectBtn);

    await waitFor(() => {
      expect(codeApi.getCodesByGroup).toHaveBeenCalledWith('TEST_GROUP');
    });
  });

  it('should open drawer when Add Code is clicked', async () => {
    render(<CodeManagement />);
    
    const addBtn = screen.getByText('+ Add New Code');
    fireEvent.click(addBtn);

    // CodeDrawer is mocked internally by Vitest if not explicitly mocked, 
    // but here we can check if state changes or if the drawer title appears
    expect(screen.getByText('Create New Code')).toBeInTheDocument();
  });

  it('should show confirm dialog when delete is clicked', async () => {
    render(<CodeManagement />);
    
    const deleteBtn = await screen.findByText('Delete');
    fireEvent.click(deleteBtn);

    expect(screen.getByText('Are you sure you want to delete this code? This action cannot be undone.')).toBeInTheDocument();
  });
});
