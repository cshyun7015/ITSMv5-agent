package com.itsm.system.web.auth;

import com.itsm.system.domain.member.Member;
import com.itsm.system.domain.member.MemberRepository;
import com.itsm.system.domain.member.Role;
import com.itsm.system.dto.auth.AuthResponseDTO;
import com.itsm.system.dto.auth.LoginRequestDTO;
import com.itsm.system.security.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;

    @PostMapping("/login")
    public ResponseEntity<AuthResponseDTO> login(@RequestBody LoginRequestDTO loginRequest) {
        Member member = memberRepository.findByTenant_TenantIdAndUsername(
                loginRequest.getTenantId(), loginRequest.getUsername()
        ).orElseThrow(() -> new RuntimeException("Invalid credentials"));

        if (!passwordEncoder.matches(loginRequest.getPassword(), member.getPassword())) {
            throw new RuntimeException("Invalid credentials");
        }

        String token = jwtTokenProvider.createToken(
                member.getUsername(),
                member.getTenant().getTenantId(),
                member.getRoles().stream().map(Role::getRoleId).collect(Collectors.toList())
        );

        return ResponseEntity.ok(AuthResponseDTO.builder()
                .accessToken(token)
                .username(member.getUsername())
                .tenantId(member.getTenant().getTenantId())
                .roles(member.getRoles().stream().map(Role::getRoleId).collect(Collectors.toList()))
                .build());
    }
}
