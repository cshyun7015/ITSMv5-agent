package com.itsm.system.dto.code;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CodeDTO {
    private Long id;

    @NotBlank(message = "Group ID is required")
    @Size(max = 50, message = "Group ID must be at most 50 characters")
    private String groupId;

    @NotBlank(message = "Code ID is required")
    @Size(max = 50, message = "Code ID must be at most 50 characters")
    private String codeId;

    @NotBlank(message = "Code Name is required")
    @Size(max = 100, message = "Code Name must be at most 100 characters")
    private String codeName;

    private String description;

    @NotNull(message = "Sort order is required")
    private Integer sortOrder;

    @NotNull(message = "Active status is required")
    private Boolean isActive;
}
