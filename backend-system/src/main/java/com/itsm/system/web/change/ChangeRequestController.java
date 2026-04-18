package com.itsm.system.web.change;

import com.itsm.system.dto.change.ChangeRequestDTO;
import com.itsm.system.service.change.ChangeRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/changes")
@RequiredArgsConstructor
public class ChangeRequestController {

    private final ChangeRequestService changeRequestService;

    @GetMapping
    public ResponseEntity<List<ChangeRequestDTO>> listChanges(@RequestParam String tenantId) {
        return ResponseEntity.ok(changeRequestService.listChanges(tenantId));
    }

    @PostMapping("/draft")
    public ResponseEntity<ChangeRequestDTO> createDraft(@RequestBody ChangeRequestDTO dto) {
        return ResponseEntity.ok(changeRequestService.createDraft(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ChangeRequestDTO> updateChange(@PathVariable Long id, @RequestBody ChangeRequestDTO dto) {
        return ResponseEntity.ok(changeRequestService.updateChange(id, dto));
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<ChangeRequestDTO> submitRFC(@PathVariable Long id, @RequestBody List<Long> approverIds) {
        return ResponseEntity.ok(changeRequestService.submitRFC(id, approverIds));
    }
}
