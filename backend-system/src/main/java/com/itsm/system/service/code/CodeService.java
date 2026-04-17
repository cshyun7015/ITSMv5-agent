package com.itsm.system.service.code;

import com.itsm.system.dto.code.CodeDTO;
import java.util.List;

public interface CodeService {
    List<CodeDTO> getAllCodes();
    List<CodeDTO> getCodesByGroup(String groupId);
    CodeDTO createCode(CodeDTO codeDTO);
    CodeDTO updateCode(Long id, CodeDTO codeDTO);
    void deleteCode(Long id);
    void deleteCodesByGroup(String groupId);
    List<String> getAllGroupIds();
}
