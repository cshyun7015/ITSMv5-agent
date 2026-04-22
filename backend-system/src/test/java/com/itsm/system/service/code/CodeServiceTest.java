package com.itsm.system.service.code;

import com.itsm.system.domain.code.Code;
import com.itsm.system.domain.code.CodeRepository;
import com.itsm.system.dto.code.CodeDTO;
import com.itsm.system.exception.CodeNotFoundException;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class CodeServiceTest {

    @Mock
    private CodeRepository codeRepository;

    @InjectMocks
    private CodeServiceImpl codeService;

    private Code sampleCode;
    private CodeDTO sampleCodeDTO;

    @BeforeEach
    void setUp() {
        sampleCode = Code.builder()
                .id(1L)
                .groupId("STATUS")
                .codeId("ACTIVE")
                .codeName("Active Status")
                .sortOrder(1)
                .isActive(true)
                .build();

        sampleCodeDTO = CodeDTO.builder()
                .groupId("STATUS")
                .codeId("ACTIVE")
                .codeName("Active Status")
                .sortOrder(1)
                .isActive(true)
                .build();
    }

    @Test
    @DisplayName("Get all codes should return DTO list")
    void getAllCodes_Success() {
        when(codeRepository.findAll()).thenReturn(Arrays.asList(sampleCode));

        List<CodeDTO> result = codeService.getAllCodes();

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getCodeId()).isEqualTo("ACTIVE");
        verify(codeRepository, times(1)).findAll();
    }

    @Test
    @DisplayName("Get codes by group should return filtered list")
    void getCodesByGroup_Success() {
        when(codeRepository.findByGroupIdOrderBySortOrderAsc("STATUS")).thenReturn(Arrays.asList(sampleCode));

        List<CodeDTO> result = codeService.getCodesByGroup("STATUS");

        assertThat(result).hasSize(1);
        assertThat(result.get(0).getGroupId()).isEqualTo("STATUS");
        verify(codeRepository, times(1)).findByGroupIdOrderBySortOrderAsc("STATUS");
    }

    @Test
    @DisplayName("Create code should save and return DTO")
    void createCode_Success() {
        when(codeRepository.save(Objects.requireNonNull(any(Code.class)))).thenReturn(sampleCode);

        CodeDTO result = codeService.createCode(Objects.requireNonNull(sampleCodeDTO));

        assertThat(result.getCodeName()).isEqualTo("Active Status");
        verify(codeRepository, times(1)).save(Objects.requireNonNull(any(Code.class)));
    }

    @Test
    @DisplayName("Update code should modify and return DTO")
    void updateCode_Success() {
        when(codeRepository.findById(1L)).thenReturn(Optional.of(sampleCode));
        when(codeRepository.save(Objects.requireNonNull(any(Code.class)))).thenReturn(sampleCode);

        CodeDTO updateDTO = CodeDTO.builder()
                .codeName("Updated Name")
                .isActive(false)
                .build();

        CodeDTO result = codeService.updateCode(1L, Objects.requireNonNull(updateDTO));

        assertThat(result.getId()).isEqualTo(1L);
        verify(codeRepository, times(1)).findById(1L);
        verify(codeRepository, times(1)).save(Objects.requireNonNull(any(Code.class)));
    }

    @Test
    @DisplayName("Update code should throw exception when not found")
    void updateCode_NotFound() {
        when(codeRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(CodeNotFoundException.class, () -> codeService.updateCode(99L, Objects.requireNonNull(sampleCodeDTO)));
    }

    @Test
    @DisplayName("Delete code should call repository delete")
    void deleteCode_Success() {
        when(codeRepository.existsById(1L)).thenReturn(true);

        codeService.deleteCode(1L);

        verify(codeRepository, times(1)).existsById(1L);
        verify(codeRepository, times(1)).deleteById(1L);
    }

    @Test
    @DisplayName("Delete code should throw exception when not found")
    void deleteCode_NotFound() {
        when(codeRepository.existsById(99L)).thenReturn(false);

        assertThrows(CodeNotFoundException.class, () -> codeService.deleteCode(99L));
    }

    @Test
    @DisplayName("Get all distinct group IDs")
    void getAllGroupIds_Success() {
        when(codeRepository.findDistinctGroupIds()).thenReturn(Arrays.asList("STATUS", "TYPE"));

        List<String> result = codeService.getAllGroupIds();

        assertThat(result).containsExactly("STATUS", "TYPE");
    }
}
