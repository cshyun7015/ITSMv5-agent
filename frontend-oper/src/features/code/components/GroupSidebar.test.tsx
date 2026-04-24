import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import GroupSidebar from './GroupSidebar';

describe('GroupSidebar', () => {
  const mockGroups = ['GROUP1', 'GROUP2', 'SYSTEM_ADMIN'];
  const mockOnSelectGroup = vi.fn();
  const mockOnDeleteGroup = vi.fn();
  const mockOnAddGroup = vi.fn();

  it('should render group list', () => {
    render(
      <GroupSidebar 
        groups={mockGroups} 
        selectedGroupId="GROUP1" 
        onSelectGroup={mockOnSelectGroup}
        onDeleteGroup={mockOnDeleteGroup}
        onAddGroup={mockOnAddGroup}
      />
    );

    expect(screen.getByText('GROUP1')).toBeInTheDocument();
    expect(screen.getByText('GROUP2')).toBeInTheDocument();
  });

  it('should filter groups based on search term', () => {
    render(
      <GroupSidebar 
        groups={mockGroups} 
        selectedGroupId={null} 
        onSelectGroup={mockOnSelectGroup}
        onDeleteGroup={mockOnDeleteGroup}
        onAddGroup={mockOnAddGroup}
      />
    );

    const searchInput = screen.getByPlaceholderText('Search groups...');
    fireEvent.change(searchInput, { target: { value: 'SYSTEM' } });

    expect(screen.getByText('SYSTEM_ADMIN')).toBeInTheDocument();
    expect(screen.queryByText('GROUP1')).not.toBeInTheDocument();
  });

  it('should call onSelectGroup when a group is clicked', () => {
    render(
      <GroupSidebar 
        groups={mockGroups} 
        selectedGroupId={null} 
        onSelectGroup={mockOnSelectGroup}
        onDeleteGroup={mockOnDeleteGroup}
        onAddGroup={mockOnAddGroup}
      />
    );

    fireEvent.click(screen.getByText('GROUP2'));
    expect(mockOnSelectGroup).toHaveBeenCalledWith('GROUP2');
  });

  it('should call onAddGroup when add button is clicked', () => {
    render(
      <GroupSidebar 
        groups={mockGroups} 
        selectedGroupId={null} 
        onSelectGroup={mockOnSelectGroup}
        onDeleteGroup={mockOnDeleteGroup}
        onAddGroup={mockOnAddGroup}
        isAdmin={true}
      />
    );

    fireEvent.click(screen.getByTitle('Add New Group'));
    expect(mockOnAddGroup).toHaveBeenCalled();
  });

  it('should call onDeleteGroup when delete button is clicked', () => {
    render(
      <GroupSidebar 
        groups={mockGroups} 
        selectedGroupId={null} 
        onSelectGroup={mockOnSelectGroup}
        onDeleteGroup={mockOnDeleteGroup}
        onAddGroup={mockOnAddGroup}
        isAdmin={true}
      />
    );

    const deleteBtns = screen.getAllByTitle('Delete Group');
    fireEvent.click(deleteBtns[0]);
    expect(mockOnDeleteGroup).toHaveBeenCalledWith('GROUP1');
  });
});
