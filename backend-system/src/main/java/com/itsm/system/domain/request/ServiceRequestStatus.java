package com.itsm.system.domain.request;

import lombok.Getter;
import lombok.RequiredArgsConstructor;

@Getter
@RequiredArgsConstructor
public enum ServiceRequestStatus {
    DRAFT("작성 중"),
    PENDING_APPROVAL("결재 대기"),
    OPEN("접수 완료"),
    IN_PROGRESS("처리 중"),
    RESOLVED("해결 완료"),
    CLOSED("종료"),
    REJECTED("반려");

    private final String description;
}
