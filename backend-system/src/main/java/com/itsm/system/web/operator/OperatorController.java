package com.itsm.system.web.operator;

import com.itsm.system.dto.operator.OperatorDTO;
import com.itsm.system.service.operator.OperatorService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/operators")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class OperatorController {

    private final OperatorService operatorService;

    @GetMapping
    public ResponseEntity<List<OperatorDTO>> listOperators() {
        return ResponseEntity.ok(operatorService.listOperators());
    }

    @GetMapping("/{id}")
    public ResponseEntity<OperatorDTO> getOperator(@PathVariable Long id) {
        return ResponseEntity.ok(operatorService.getOperator(id));
    }

    @PostMapping
    public ResponseEntity<OperatorDTO> createOperator(@RequestBody OperatorDTO dto) {
        return ResponseEntity.ok(operatorService.createOperator(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<OperatorDTO> updateOperator(@PathVariable Long id, @RequestBody OperatorDTO dto) {
        return ResponseEntity.ok(operatorService.updateOperator(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteOperator(@PathVariable Long id) {
        operatorService.deleteOperator(id);
        return ResponseEntity.ok().build();
    }
}
