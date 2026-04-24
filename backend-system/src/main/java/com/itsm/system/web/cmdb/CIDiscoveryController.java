package com.itsm.system.web.cmdb;

import com.itsm.system.service.cmdb.CIDiscoveryService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/cis/discovery")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('OPERATOR', 'ADMIN')")
public class CIDiscoveryController {

    private final CIDiscoveryService ciDiscoveryService;

    @GetMapping("/live")
    public ResponseEntity<List<Map<String, Object>>> discoverLiveDependencies(@RequestParam String tenantId) {
        // Fetches real-time traffic dependencies from Prometheus
        return ResponseEntity.ok(ciDiscoveryService.discoverLive(tenantId));
    }

    @PostMapping("/ansible")
    public ResponseEntity<Void> runAnsibleDiscovery(@RequestParam String tenantId) {
        ciDiscoveryService.runAnsibleDiscovery(tenantId);
        return ResponseEntity.ok().build();
    }
}
