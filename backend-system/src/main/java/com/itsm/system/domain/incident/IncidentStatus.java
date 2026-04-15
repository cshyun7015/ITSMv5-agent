package com.itsm.system.domain.incident;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum IncidentStatus {
    NEW("신규"),
    ASSIGNED("배정됨"),
    IN_PROGRESS("처리 중"),
    RESOLVED("해결됨"),
    CLOSED("종료됨");

    private final String description;
}
