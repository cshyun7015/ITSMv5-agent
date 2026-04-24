package com.itsm.system.dto.operator;

import lombok.*;

import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OperatorDTO {
    private Long memberId;
    private String username;
    private String email;
    private String password; // Only for Create/Update
    private String roleId;   // ROLE_ADMIN or ROLE_OPERATOR
    private String tenantId;
    private String tenantName;
    private Long teamId;
    private String teamName;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
