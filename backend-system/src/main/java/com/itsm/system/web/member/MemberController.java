package com.itsm.system.web.member;

import com.itsm.system.domain.member.Member;
import com.itsm.system.domain.member.MemberRepository;
import com.itsm.system.dto.member.MemberDTO;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/members")
@RequiredArgsConstructor
public class MemberController {

    private final MemberRepository memberRepository;

    @GetMapping("/approvers")
    public List<MemberDTO.Response> getApprovers(@AuthenticationPrincipal Member currentMember) {
        // 동일 테넌트 내의 ROLE_MANAGER 권한을 가진 사용자 목록 조회
        List<Member> managers = memberRepository.findByTenant_TenantIdAndRoles_RoleId(
                currentMember.getTenant().getTenantId(), 
                "ROLE_MANAGER"
        );

        return managers.stream()
                .map(MemberDTO.Response::from)
                .collect(Collectors.toList());
    }
}
