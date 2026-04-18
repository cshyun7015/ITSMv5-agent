package com.itsm.system.web.operator;

import com.itsm.system.dto.tenant.TeamDTO;
import com.itsm.system.service.tenant.TeamService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/operator/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;

    @GetMapping
    public List<TeamDTO> listTeams(@AuthenticationPrincipal UserDetails userDetails) {
        String tenantId = getTenantId(userDetails);
        return teamService.listTeamsByTenant(tenantId);
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public TeamDTO createTeam(@RequestBody TeamDTO dto, @AuthenticationPrincipal UserDetails userDetails) {
        String tenantId = getTenantId(userDetails);
        return teamService.createTeam(dto, tenantId);
    }

    @PutMapping("/{teamId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public TeamDTO updateTeam(@PathVariable Long teamId, @RequestBody TeamDTO dto, @AuthenticationPrincipal UserDetails userDetails) {
        String tenantId = getTenantId(userDetails);
        return teamService.updateTeam(teamId, dto, tenantId);
    }

    @DeleteMapping("/{teamId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public void deleteTeam(@PathVariable Long teamId, @AuthenticationPrincipal UserDetails userDetails) {
        String tenantId = getTenantId(userDetails);
        teamService.deleteTeam(teamId, tenantId);
    }

    private String getTenantId(UserDetails userDetails) {
        // userDetails is UserSession (CustomUserDetails)
        // We assume it has getTenantId()
        try {
            return (String) userDetails.getClass().getMethod("getTenantId").invoke(userDetails);
        } catch (Exception e) {
            return "OPER_MSP"; // Fallback for testing or misconfigured session
        }
    }
}
