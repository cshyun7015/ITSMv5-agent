package com.itsm.system.service.code;

import com.itsm.system.domain.code.Code;
import com.itsm.system.domain.code.CodeRepository;
import com.itsm.system.dto.code.CodeDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class CodeServiceImpl implements CodeService {

    private final CodeRepository codeRepository;

    @Override
    @Transactional(readOnly = true)
    public List<CodeDTO> getAllCodes() {
        return codeRepository.findAll().stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<CodeDTO> getCodesByGroup(String groupId) {
        return codeRepository.findByGroupIdOrderBySortOrderAsc(groupId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    public CodeDTO createCode(CodeDTO codeDTO) {
        Code code = convertToEntity(codeDTO);
        return convertToDTO(codeRepository.save(code));
    }

    @Override
    public CodeDTO updateCode(Long id, CodeDTO codeDTO) {
        Code code = codeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Code not found"));
        
        code.setGroupId(codeDTO.getGroupId());
        code.setCodeId(codeDTO.getCodeId());
        code.setCodeName(codeDTO.getCodeName());
        code.setDescription(codeDTO.getDescription());
        code.setSortOrder(codeDTO.getSortOrder());
        code.setIsActive(codeDTO.getIsActive());
        
        return convertToDTO(codeRepository.save(code));
    }

    @Override
    public void deleteCode(Long id) {
        codeRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getAllGroupIds() {
        return codeRepository.findDistinctGroupIds();
    }

    private CodeDTO convertToDTO(Code code) {
        return CodeDTO.builder()
                .id(code.getId())
                .groupId(code.getGroupId())
                .codeId(code.getCodeId())
                .codeName(code.getCodeName())
                .description(code.getDescription())
                .sortOrder(code.getSortOrder())
                .isActive(code.getIsActive())
                .build();
    }

    private Code convertToEntity(CodeDTO dto) {
        return Code.builder()
                .groupId(dto.getGroupId())
                .codeId(dto.getCodeId())
                .codeName(dto.getCodeName())
                .description(dto.getDescription())
                .sortOrder(dto.getSortOrder())
                .isActive(dto.getIsActive())
                .build();
    }
}
