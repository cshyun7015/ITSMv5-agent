package com.itsm.system.dto.auth;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class AuthResponseDTO {
    private String accessToken;
    private String username;
    private String tenantId;
    private List<String> roles;
}
