package com.itsm.system.web.operator;

import com.itsm.system.domain.member.Member;
import com.itsm.system.domain.member.Role;
import com.itsm.system.domain.tenant.Organization;
import com.itsm.system.domain.tenant.Tenant;
import com.itsm.system.dto.operator.OperatorDTO;
import com.itsm.system.dto.tenant.TeamDTO;
import com.itsm.system.service.operator.CustomerManagementService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/customer")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
public class CustomerManagementController {

    private final CustomerManagementService customerManagementService;

    @GetMapping("/tenants")
    public ResponseEntity<List<Map<String, String>>> getManageableCustomers(@AuthenticationPrincipal Member currentMember) {
        String operatorTenantId = currentMember.getTenant().getTenantId();
        List<String> roles = currentMember.getRoles().stream()
                .map(Role::getRoleId)
                .collect(Collectors.toList());
        
        List<Tenant> customers = customerManagementService.listManageableCustomers(operatorTenantId, roles);
        
        List<Map<String, String>> result = customers.stream()
                .map(t -> Map.of("tenantId", t.getTenantId(), "name", t.getName()))
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(result);
    }

    @GetMapping("/tenants/{tenantId}/organizations")
    public ResponseEntity<List<Map<String, Object>>> getCustomerOrganizations(@PathVariable String tenantId) {
        List<Organization> orgs = customerManagementService.listCustomerOrganizations(tenantId);
        List<Map<String, Object>> result = orgs.stream()
                .map(o -> Map.<String, Object>of("orgId", o.getOrgId(), "name", o.getName()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(result);
    }

    @GetMapping("/tenants/{tenantId}/teams")
    public ResponseEntity<List<TeamDTO>> getCustomerTeams(@PathVariable String tenantId) {
        return ResponseEntity.ok(customerManagementService.listCustomerTeams(tenantId));
    }

    @GetMapping("/tenants/{tenantId}/users")
    public ResponseEntity<List<OperatorDTO>> getCustomerUsers(@PathVariable String tenantId) {
        return ResponseEntity.ok(customerManagementService.listCustomerUsers(tenantId));
    }

    @PostMapping("/teams")
    public ResponseEntity<TeamDTO> createTeam(@RequestBody TeamDTO dto) {
        return ResponseEntity.ok(customerManagementService.createCustomerTeam(dto));
    }

    @PostMapping("/users")
    public ResponseEntity<OperatorDTO> createUser(@RequestBody OperatorDTO dto) {
        return ResponseEntity.ok(customerManagementService.createCustomerUser(dto));
    }
}
