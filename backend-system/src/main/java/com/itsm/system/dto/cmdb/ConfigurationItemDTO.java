package com.itsm.system.dto.cmdb;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ConfigurationItemDTO {
    private Long ciId;
    private String tenantId;
    private String tenantName;
    private String name;
    private String typeCode;
    private String statusCode;
    private String serialNumber;
    private Long ownerId;
    private String ownerName;
    private String location;
    private String description;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
