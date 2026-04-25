package com.itsm.system.exception;

import lombok.Builder;
import lombok.Getter;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.LocalDateTime;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponse> handleIllegalState(IllegalStateException e) {
        return ResponseEntity.status(400).body(ErrorResponse.builder()
                .message(e.getMessage())
                .code("INVALID_STATE")
                .timestamp(LocalDateTime.now())
                .build());
    }

    @ExceptionHandler(SecurityException.class)
    public ResponseEntity<ErrorResponse> handleSecurity(SecurityException e) {
        return ResponseEntity.status(403).body(ErrorResponse.builder()
                .message(e.getMessage())
                .code("ACCESS_DENIED")
                .timestamp(LocalDateTime.now())
                .build());
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgument(IllegalArgumentException e) {
        return ResponseEntity.status(400).body(ErrorResponse.builder()
                .message(e.getMessage())
                .code("BAD_REQUEST")
                .timestamp(LocalDateTime.now())
                .build());
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGeneral(Exception e) {
        e.printStackTrace(); // 서버 로그에는 기록
        return ResponseEntity.status(500).body(ErrorResponse.builder()
                .message("An unexpected system error occurred. Please contact the administrator.")
                .code("INTERNAL_ERROR")
                .timestamp(LocalDateTime.now())
                .build());
    }

    @Getter
    @Builder
    public static class ErrorResponse {
        private String message;
        private String code;
        private LocalDateTime timestamp;
    }
}
