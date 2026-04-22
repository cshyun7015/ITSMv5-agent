import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import CodeList from './CodeList';
import { CodeDTO } from '../../../types/code';

describe('CodeList', () => {
  const mockCodes: CodeDTO[] = [
    { id: 1, groupId: 'G1', codeId: 'C1', codeName: 'Name1', sortOrder: 1, isActive: true },
    { id: 2, groupId: 'G1', codeId: 'C2', codeName: 'Name2', sortOrder: 2, isActive: false },
  ];
  const mockOnEdit = vi.fn();
  const mockOnDelete = vi.fn();

  it('should render loading state', () => {
    render(<CodeList codes={[]} onEdit={mockOnEdit} onDelete={mockOnDelete} isLoading={true} />);
    expect(screen.getByText('Loading codes...')).toBeInTheDocument();
  });

  it('should render empty state', () => {
    render(<CodeList codes={[]} onEdit={mockOnEdit} onDelete={mockOnDelete} isLoading={false} />);
    expect(screen.getByText('No codes found. Add your first configuration code above.')).toBeInTheDocument();
  });

  it('should render table with codes', () => {
    render(<CodeList codes={mockCodes} onEdit={mockOnEdit} onDelete={mockOnDelete} isAdmin={true} />);
    
    expect(screen.getByText('C1')).toBeInTheDocument();
    expect(screen.getByText('Name1')).toBeInTheDocument();
    expect(screen.getByText('C2')).toBeInTheDocument();
    expect(screen.getByText('Active')).toBeInTheDocument();
    expect(screen.getByText('Inactive')).toBeInTheDocument();
  });

  it('should call onEdit when edit button is clicked', () => {
    render(<CodeList codes={mockCodes} onEdit={mockOnEdit} onDelete={mockOnDelete} isAdmin={true} />);
    
    const editBtns = screen.getAllByText('Edit');
    fireEvent.click(editBtns[0]);
    
    expect(mockOnEdit).toHaveBeenCalledWith(mockCodes[0]);
  });

  it('should call onDelete when delete button is clicked', () => {
    render(<CodeList codes={mockCodes} onEdit={mockOnEdit} onDelete={mockOnDelete} isAdmin={true} />);
    
    const deleteBtns = screen.getAllByText('Delete');
    fireEvent.click(deleteBtns[0]);
    
    expect(mockOnDelete).toHaveBeenCalledWith(1);
  });
});
