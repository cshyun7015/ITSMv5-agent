package com.itsm.system.dto.member;

import com.itsm.system.domain.member.Member;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;

public class MemberDTO {

    @Getter
    @NoArgsConstructor(access = AccessLevel.PROTECTED)
    @AllArgsConstructor
    @Builder
    public static class Response {
        private Long memberId;
        private String username;
        private String email;

        public static Response from(Member member) {
            return Response.builder()
                    .memberId(member.getMemberId())
                    .username(member.getUsername())
                    .email(member.getEmail())
                    .build();
        }
    }
}
