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
    private String tenantId;
    private String tenantName;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
