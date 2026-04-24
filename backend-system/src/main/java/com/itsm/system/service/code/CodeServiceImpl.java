package com.itsm.system.service.code;

import com.itsm.system.domain.code.Code;
import com.itsm.system.domain.code.CodeRepository;
import com.itsm.system.dto.code.CodeDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.CacheEvict;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.lang.NonNull;
import java.util.List;
import java.util.Objects;
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
    @Cacheable(value = "codes", key = "#groupId")
    public List<CodeDTO> getCodesByGroup(String groupId) {
        return codeRepository.findByGroupIdOrderBySortOrderAsc(groupId).stream()
                .map(this::convertToDTO)
                .collect(Collectors.toList());
    }

    @Override
    @CacheEvict(value = "codes", key = "#codeDTO.groupId")
    public CodeDTO createCode(@NonNull CodeDTO codeDTO) {
        Code code = convertToEntity(codeDTO);
        Code savedCode = codeRepository.save(code);
        return convertToDTO(savedCode);
    }

    @Override
    @CacheEvict(value = "codes", allEntries = true)
    public CodeDTO updateCode(@NonNull Long id, @NonNull CodeDTO codeDTO) {
        Code code = codeRepository.findById(id)
                .orElseThrow(() -> new com.itsm.system.exception.CodeNotFoundException("Code not found with id: " + id));
        
        code.setGroupId(codeDTO.getGroupId());
        code.setCodeId(codeDTO.getCodeId());
        code.setCodeName(codeDTO.getCodeName());
        code.setDescription(codeDTO.getDescription());
        code.setSortOrder(codeDTO.getSortOrder());
        code.setIsActive(codeDTO.getIsActive());
        
        Code savedCode = codeRepository.save(code);
        return convertToDTO(savedCode);
    }

    @Override
    @CacheEvict(value = "codes", allEntries = true)
    public void deleteCode(@NonNull Long id) {
        if (!codeRepository.existsById(id)) {
            throw new com.itsm.system.exception.CodeNotFoundException("Code not found with id: " + id);
        }
        codeRepository.deleteById(id);
    }

    @Override
    @CacheEvict(value = "codes", key = "#groupId")
    public void deleteCodesByGroup(@NonNull String groupId) {
        codeRepository.deleteByGroupId(groupId);
    }

    @Override
    @Transactional(readOnly = true)
    public List<String> getAllGroupIds() {
        return codeRepository.findDistinctGroupIds();
    }

    @NonNull
    private CodeDTO convertToDTO(@NonNull Code code) {
        return Objects.requireNonNull(CodeDTO.builder()
                .id(code.getId())
                .groupId(code.getGroupId())
                .codeId(code.getCodeId())
                .codeName(code.getCodeName())
                .description(code.getDescription())
                .sortOrder(code.getSortOrder())
                .isActive(code.getIsActive())
                .build());
    }

    @NonNull
    private Code convertToEntity(@NonNull CodeDTO dto) {
        return Objects.requireNonNull(Code.builder()
                .groupId(dto.getGroupId())
                .codeId(dto.getCodeId())
                .codeName(dto.getCodeName())
                .description(dto.getDescription())
                .sortOrder(dto.getSortOrder())
                .isActive(dto.getIsActive())
                .build());
    }
}
