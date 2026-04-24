package com.itsm.system.domain.request;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

import java.time.Duration;

@Getter
@RequiredArgsConstructor
public enum ServiceRequestPriority {
    EMERGENCY("긴급", Duration.ofHours(4), true),
    NORMAL("보통", Duration.ofHours(24), true),
    LOW("낮음", Duration.ofHours(72), false);

    private final String description;
    private final Duration slaDuration;
    private final boolean approvalRequired;
}
