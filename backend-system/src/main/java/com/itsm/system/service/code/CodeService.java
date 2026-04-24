package com.itsm.system.service.code;

import com.itsm.system.dto.code.CodeDTO;
import org.springframework.lang.NonNull;
import java.util.List;

public interface CodeService {
    List<CodeDTO> getAllCodes();
    List<CodeDTO> getCodesByGroup(String groupId);
    CodeDTO createCode(@NonNull CodeDTO codeDTO);
    CodeDTO updateCode(@NonNull Long id, @NonNull CodeDTO codeDTO);
    void deleteCode(@NonNull Long id);
    void deleteCodesByGroup(@NonNull String groupId);
    List<String> getAllGroupIds();
}
