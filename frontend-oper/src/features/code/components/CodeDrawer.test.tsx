import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import CodeDrawer from './CodeDrawer';
import { codeApi } from '../api/codeApi';
import { useToast } from '../../../hooks/useToast';

// Mocking dependencies
vi.mock('../api/codeApi', () => ({
  codeApi: {
    createCode: vi.fn(),
    updateCode: vi.fn(),
  },
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

describe('CodeDrawer', () => {
  const mockOnClose = vi.fn();
  const mockOnSuccess = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render correctly when open', () => {
    render(
      <CodeDrawer 
        isOpen={true} 
        onClose={mockOnClose} 
        onSuccess={mockOnSuccess} 
        initialData={null} 
        title="Create Code" 
      />
    );

    expect(screen.getByText('Create Code')).toBeInTheDocument();
    expect(screen.getByLabelText('Group ID')).toBeInTheDocument();
  });

  it('should convert Group ID and Code ID to uppercase on input', () => {
    render(
      <CodeDrawer 
        isOpen={true} 
        onClose={mockOnClose} 
        onSuccess={mockOnSuccess} 
        initialData={null} 
        title="Create Code" 
      />
    );

    const groupIdInput = screen.getByLabelText('Group ID') as HTMLInputElement;
    fireEvent.change(groupIdInput, { target: { value: 'test_group' } });
    expect(groupIdInput.value).toBe('TEST_GROUP');

    const codeIdInput = screen.getByLabelText('Code ID') as HTMLInputElement;
    fireEvent.change(codeIdInput, { target: { value: 'active_status' } });
    expect(codeIdInput.value).toBe('ACTIVE_STATUS');
  });

  it('should call createCode and onSuccess when form is submitted successfully', async () => {
    vi.mocked(codeApi.createCode).mockResolvedValue({ id: 1 } as any);

    render(
      <CodeDrawer 
        isOpen={true} 
        onClose={mockOnClose} 
        onSuccess={mockOnSuccess} 
        initialData={null} 
        title="Create Code" 
      />
    );

    fireEvent.change(screen.getByLabelText('Group ID'), { target: { value: 'STATUS' } });
    fireEvent.change(screen.getByLabelText('Code ID'), { target: { value: 'OPEN' } });
    fireEvent.change(screen.getByLabelText('Code Name'), { target: { value: 'Open Status' } });

    fireEvent.submit(screen.getByRole('button', { name: /Save Changes/i }));

    await waitFor(() => {
      expect(codeApi.createCode).toHaveBeenCalled();
      expect(mockOnSuccess).toHaveBeenCalled();
      expect(mockToast.success).toHaveBeenCalledWith('Code created successfully');
    });
  });

  it('should display validation errors from backend', async () => {
    const backendError = {
      response: {
        status: 400,
        data: {
          errors: {
            groupId: 'Group ID is required',
            codeId: 'Code ID must be unique'
          }
        }
      }
    };
    vi.mocked(codeApi.createCode).mockRejectedValue(backendError);

    render(
      <CodeDrawer 
        isOpen={true} 
        onClose={mockOnClose} 
        onSuccess={mockOnSuccess} 
        initialData={null} 
        title="Create Code" 
      />
    );

    fireEvent.submit(screen.getByRole('button', { name: /Save Changes/i }));

    await waitFor(() => {
      expect(screen.getByText('Group ID is required')).toBeInTheDocument();
      expect(screen.getByText('Code ID must be unique')).toBeInTheDocument();
      expect(mockToast.error).toHaveBeenCalledWith('Please check the validation errors');
    });
  });
});
