import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import TeamSidebar from './TeamSidebar';
import { Team } from '../types';

describe('TeamSidebar', () => {
  const mockTeams: Team[] = [
    { teamId: 10, name: 'Cloud Team', orgId: 100, tenantId: 'T1' },
    { teamId: 20, name: 'Security Team', orgId: 100, tenantId: 'T1' },
    { teamId: 30, name: 'Network Team', orgId: 200, tenantId: 'T2' }
  ];

  const mockOrgs = [
    { orgId: 100, name: 'Org Alpha' },
    { orgId: 200, name: 'Org Beta' }
  ];

  const mockProps = {
    teams: mockTeams,
    organizations: mockOrgs,
    selectedTeamId: null,
    onSelectTeam: vi.fn(),
    onAddTeam: vi.fn(),
    onEditTeam: vi.fn(),
    onDeleteTeam: vi.fn(),
    isLoading: false,
    canManage: true,
    totalCount: 50
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render organizations and teams correctly', () => {
    render(<TeamSidebar {...mockProps} />);
    
    expect(screen.getByText('Org Alpha')).toBeInTheDocument();
    expect(screen.getByText('Org Beta')).toBeInTheDocument();
    expect(screen.getByText('Cloud Team')).toBeInTheDocument();
    expect(screen.getByText('Security Team')).toBeInTheDocument();
  });

  it('should toggle organization expansion', () => {
    render(<TeamSidebar {...mockProps} />);
    
    // Beta is expanded by default if total orgs <= 3 (as per initial state logic)
    expect(screen.getByText('Network Team')).toBeInTheDocument();
    
    // Collapse Beta
    fireEvent.click(screen.getByText('Org Beta'));
    expect(screen.queryByText('Network Team')).not.toBeInTheDocument();
  });

  it('should call onSelectTeam when a team is clicked', () => {
    render(<TeamSidebar {...mockProps} />);
    
    fireEvent.click(screen.getByText('Cloud Team'));
    expect(mockProps.onSelectTeam).toHaveBeenCalledWith(10);
  });

  it('should call onAddTeam when plus button is clicked', () => {
    render(<TeamSidebar {...mockProps} />);
    
    fireEvent.click(screen.getByTitle('Create New Team'));
    expect(mockProps.onAddTeam).toHaveBeenCalled();
  });

  it('should call onEditTeam when edit button is clicked', () => {
    render(<TeamSidebar {...mockProps} />);
    
    // Find edit button (✎) for Cloud Team
    const editBtns = screen.getAllByText('✎');
    fireEvent.click(editBtns[0]);
    
    expect(mockProps.onEditTeam).toHaveBeenCalledWith(mockTeams[0]);
  });

  it('should call onDeleteTeam when delete button is clicked', () => {
    render(<TeamSidebar {...mockProps} />);
    
    // Find delete button (×) for Cloud Team
    const deleteBtns = screen.getAllByText('×');
    fireEvent.click(deleteBtns[0]);
    
    expect(mockProps.onDeleteTeam).toHaveBeenCalledWith(10);
  });

  it('should show loading skeleton when isLoading is true', () => {
    render(<TeamSidebar {...mockProps} isLoading={true} />);
    
    // Find elements with skeleton-item class (mocking DOM check)
    const wrapper = screen.getByRole('complementary');
    expect(wrapper.querySelector('.sidebar-skeleton')).toBeInTheDocument();
  });
});
