package com.itsm.system.dto.code;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CodeDTO {
    private Long id;
    private String groupId;
    private String codeId;
    private String codeName;
    private String description;
    private Integer sortOrder;
    private Boolean isActive;
}
