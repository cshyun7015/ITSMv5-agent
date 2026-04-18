package com.itsm.system.web.operator;

import com.itsm.system.dto.operator.OperatorDTO;
import com.itsm.system.service.operator.OperatorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/operator/operators")
@RequiredArgsConstructor
public class OperatorController {

    private final OperatorService operatorService;

    @GetMapping
    public ResponseEntity<List<OperatorDTO>> listOperators(@AuthenticationPrincipal UserDetails userDetails) {
        String tenantId = getTenantId(userDetails);
        return ResponseEntity.ok(operatorService.listOperatorsByTenant(tenantId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<OperatorDTO> getOperator(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        String tenantId = getTenantId(userDetails);
        return ResponseEntity.ok(operatorService.getOperator(id, tenantId));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<OperatorDTO> createOperator(@RequestBody OperatorDTO dto, @AuthenticationPrincipal UserDetails userDetails) {
        String tenantId = getTenantId(userDetails);
        return ResponseEntity.ok(operatorService.createOperator(dto, tenantId));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<OperatorDTO> updateOperator(@PathVariable Long id, @RequestBody OperatorDTO dto, @AuthenticationPrincipal UserDetails userDetails) {
        String tenantId = getTenantId(userDetails);
        return ResponseEntity.ok(operatorService.updateOperator(id, dto, tenantId));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'OPERATOR')")
    public ResponseEntity<Void> deleteOperator(@PathVariable Long id, @AuthenticationPrincipal UserDetails userDetails) {
        String tenantId = getTenantId(userDetails);
        operatorService.deleteOperator(id, tenantId);
        return ResponseEntity.ok().build();
    }

    private String getTenantId(UserDetails userDetails) {
        try {
            return (String) userDetails.getClass().getMethod("getTenantId").invoke(userDetails);
        } catch (Exception e) {
            return "OPER_MSP";
        }
    }
}
