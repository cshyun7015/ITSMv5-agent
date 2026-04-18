package com.itsm.system.dto.tenant;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TeamDTO {
    private Long teamId;
    private Long orgId;
    private String orgName;
    private String name;
    private String description;
}
