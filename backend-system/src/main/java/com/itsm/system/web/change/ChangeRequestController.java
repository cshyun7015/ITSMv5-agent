package com.itsm.system.web.change;

import com.itsm.system.dto.change.ChangeRequestDTO;
import com.itsm.system.service.change.ChangeRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;

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
        return ResponseEntity.ok(changeRequestService.createDraft(Objects.requireNonNull(dto)));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ChangeRequestDTO> updateChange(@PathVariable Long id, @RequestBody ChangeRequestDTO dto) {
        return ResponseEntity.ok(changeRequestService.updateChange(Objects.requireNonNull(id), Objects.requireNonNull(dto)));
    }

    @PostMapping("/{id}/submit")
    public ResponseEntity<ChangeRequestDTO> submitRFC(@PathVariable Long id, @RequestBody List<Long> approverIds) {
        return ResponseEntity.ok(changeRequestService.submitRFC(Objects.requireNonNull(id), approverIds));
    }
}
