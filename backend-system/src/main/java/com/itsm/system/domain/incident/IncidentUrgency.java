package com.itsm.system.domain.incident;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum IncidentUrgency {
    HIGH("높음"),
    MEDIUM("중간"),
    LOW("낮음");

    private final String description;
}
