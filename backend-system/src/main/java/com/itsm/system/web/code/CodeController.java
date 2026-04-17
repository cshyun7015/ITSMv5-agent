package com.itsm.system.web.code;

import com.itsm.system.dto.code.CodeDTO;
import com.itsm.system.service.code.CodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/codes")
@RequiredArgsConstructor
public class CodeController {

    private final CodeService codeService;

    @GetMapping
    public ResponseEntity<List<CodeDTO>> getAllCodes() {
        return ResponseEntity.ok(codeService.getAllCodes());
    }

    @GetMapping("/group/{groupId}")
    public ResponseEntity<List<CodeDTO>> getCodesByGroup(@PathVariable String groupId) {
        return ResponseEntity.ok(codeService.getCodesByGroup(groupId));
    }

    @GetMapping("/groups")
    public ResponseEntity<List<String>> getAllGroupIds() {
        return ResponseEntity.ok(codeService.getAllGroupIds());
    }

    @PostMapping
    public ResponseEntity<CodeDTO> createCode(@RequestBody CodeDTO codeDTO) {
        return ResponseEntity.ok(codeService.createCode(codeDTO));
    }

    @PutMapping("/{id}")
    public ResponseEntity<CodeDTO> updateCode(@PathVariable Long id, @RequestBody CodeDTO codeDTO) {
        return ResponseEntity.ok(codeService.updateCode(id, codeDTO));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteCode(@PathVariable Long id) {
        codeService.deleteCode(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/groups/{groupId}")
    public ResponseEntity<Void> deleteCodesByGroup(@PathVariable String groupId) {
        codeService.deleteCodesByGroup(groupId);
        return ResponseEntity.noContent().build();
    }
}
