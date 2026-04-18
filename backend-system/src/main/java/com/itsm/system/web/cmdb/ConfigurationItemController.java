package com.itsm.system.web.cmdb;

import com.itsm.system.dto.cmdb.ConfigurationItemDTO;
import com.itsm.system.service.cmdb.ConfigurationItemService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/cis")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('OPERATOR', 'ADMIN')")
public class ConfigurationItemController {

    private final ConfigurationItemService configurationItemService;

    @GetMapping
    public ResponseEntity<List<ConfigurationItemDTO>> listCIs(@RequestParam String tenantId) {
        return ResponseEntity.ok(configurationItemService.listCIs(tenantId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ConfigurationItemDTO> getCI(@PathVariable Long id) {
        return ResponseEntity.ok(configurationItemService.getCI(id));
    }

    @PostMapping
    public ResponseEntity<ConfigurationItemDTO> createCI(@RequestBody ConfigurationItemDTO dto) {
        return ResponseEntity.ok(configurationItemService.createCI(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ConfigurationItemDTO> updateCI(@PathVariable Long id, @RequestBody ConfigurationItemDTO dto) {
        return ResponseEntity.ok(configurationItemService.updateCI(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCI(@PathVariable Long id) {
        configurationItemService.deleteCI(id);
        return ResponseEntity.ok().build();
    }
}
