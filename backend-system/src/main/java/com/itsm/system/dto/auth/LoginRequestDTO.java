package com.itsm.system.dto.auth;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class LoginRequestDTO {
    private String tenantId;
    private String username;
    private String password;
}
