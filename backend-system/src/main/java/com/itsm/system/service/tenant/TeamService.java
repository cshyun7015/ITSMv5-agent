package com.itsm.system.service.tenant;

import com.itsm.system.domain.tenant.Organization;
import com.itsm.system.domain.tenant.Team;
import com.itsm.system.domain.tenant.TeamRepository;
import com.itsm.system.dto.tenant.TeamDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeamService {

    private final TeamRepository teamRepository;
    private final OrganizationService organizationService;
    private final com.itsm.system.domain.member.MemberRepository memberRepository;

    @Transactional(readOnly = true)
    public List<TeamDTO> listTeamsByTenant(String tenantId) {
        if ("MSP_CORE".equals(tenantId) || "OPER_MSP".equals(tenantId)) {
            return listAllTeams();
        }
        List<Organization> orgs = organizationService.listOrganizationsByTenant(tenantId);
        return orgs.stream()
                .flatMap(org -> teamRepository.findByOrganization_OrgId(org.getOrgId()).stream())
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TeamDTO> listAllTeams() {
        return teamRepository.findAll().stream()
                .filter(t -> t.getOrganization() != null && t.getOrganization().getTenant() != null 
                          && !"CUSTOMER".equals(t.getOrganization().getTenant().getType()))
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public TeamDTO createTeam(TeamDTO dto, String tenantId) {
        Organization org = organizationService.getOrganization(dto.getOrgId(), tenantId);
        
        Team team = Team.builder()
                .organization(org)
                .name(dto.getName())
                .description(dto.getDescription())
                .build();
        
        return convertToDTO(teamRepository.save(Objects.requireNonNull(team)));
    }

    @Transactional
    public TeamDTO updateTeam(Long teamId, TeamDTO dto, String tenantId) {
        Team team = teamRepository.findById(Objects.requireNonNull(teamId))
                .orElseThrow(() -> new IllegalArgumentException("Team not found"));
        
        if (!"MSP_CORE".equals(tenantId) && !"OPER_MSP".equals(tenantId) && !team.getOrganization().getTenant().getTenantId().equals(tenantId)) {
            throw new SecurityException("Access denied to team in a different tenant");
        }

        if (dto.getOrgId() != null && !dto.getOrgId().equals(team.getOrganization().getOrgId())) {
            Organization newOrg = organizationService.getOrganization(dto.getOrgId(), tenantId);
            team.setOrganization(newOrg);
        }
        
        if (dto.getName() != null) team.setName(dto.getName());
        if (dto.getDescription() != null) team.setDescription(dto.getDescription());
        
        return convertToDTO(teamRepository.save(Objects.requireNonNull(team)));
    }

    @Transactional
    public void deleteTeam(Long teamId, String tenantId) {
        Team team = teamRepository.findById(Objects.requireNonNull(teamId))
                .orElseThrow(() -> new IllegalArgumentException("Team not found"));
        
        if (!"MSP_CORE".equals(tenantId) && !"OPER_MSP".equals(tenantId) && !team.getOrganization().getTenant().getTenantId().equals(tenantId)) {
            throw new SecurityException("Access denied to team in a different tenant");
        }
        
        // Check for members
        long memberCount = memberRepository.countByTeam_TeamId(teamId);
        if (memberCount > 0) {
            throw new IllegalStateException("Cannot delete team with " + memberCount + " members");
        }
        
        teamRepository.delete(Objects.requireNonNull(team));
    }

    private TeamDTO convertToDTO(Team team) {
        return TeamDTO.builder()
                .teamId(team.getTeamId())
                .orgId(team.getOrganization().getOrgId())
                .orgName(team.getOrganization().getName())
                .name(team.getName())
                .description(team.getDescription())
                .build();
    }
}
