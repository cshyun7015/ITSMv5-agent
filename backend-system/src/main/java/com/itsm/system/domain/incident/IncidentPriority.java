package com.itsm.system.domain.incident;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum IncidentPriority {
    P1("P1 - Critical", 2),
    P2("P2 - High", 4),
    P3("P3 - Normal", 8),
    P4("P4 - Low", 24);

    private final String description;
    private final int targetHours;
}
