package com.itsm.system.dto.tenant;

import lombok.Builder;
import lombok.Getter;

@Getter
@Builder
public class TenantDTO {
    private String tenantId;
    private String name;
    private String brandColor;
}
