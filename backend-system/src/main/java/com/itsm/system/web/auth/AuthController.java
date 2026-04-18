package com.itsm.system.web.auth;


import com.itsm.system.domain.member.MemberRepository;
import com.itsm.system.domain.member.Role;
import com.itsm.system.dto.auth.AuthResponseDTO;
import com.itsm.system.dto.auth.LoginRequestDTO;
import com.itsm.system.security.jwt.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.lang.NonNull;

import org.springframework.transaction.annotation.Transactional;
import com.itsm.system.domain.auth.TokenBlacklist;
import com.itsm.system.domain.auth.TokenBlacklistRepository;
import jakarta.servlet.http.HttpServletRequest;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.util.Date;
import java.util.Objects;
import java.util.stream.Collectors;

@Slf4j
@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
public class AuthController {

    private final MemberRepository memberRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider jwtTokenProvider;
    private final TokenBlacklistRepository tokenBlacklistRepository;

    @Transactional(readOnly = true)
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequestDTO loginRequest) {
        log.info("Login attempt for user: {} in tenant: {}", loginRequest.getUsername(), loginRequest.getTenantId());
        
        try {
            return memberRepository.findByTenant_TenantIdAndUsername(
                    loginRequest.getTenantId(), loginRequest.getUsername()
            ).map(member -> {
                if (passwordEncoder.matches(loginRequest.getPassword(), member.getPassword())) {
                    String token = jwtTokenProvider.createToken(
                            member.getUsername(),
                            member.getTenant().getTenantId(),
                            member.getRoles().stream().map(Role::getRoleId).collect(Collectors.toList())
                    );

                    log.info("Login successful for user: {}", member.getUsername());
                    return ResponseEntity.ok(AuthResponseDTO.builder()
                            .accessToken(token)
                            .username(member.getUsername())
                            .tenantId(member.getTenant().getTenantId())
                            .roles(member.getRoles().stream().map(Role::getRoleId).collect(Collectors.toList()))
                            .build());
                } else {
                    log.warn("Password mismatch for user: {}", loginRequest.getUsername());
                    return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
                }
            }).orElseGet(() -> {
                log.warn("User not found: {} for tenant: {}", loginRequest.getUsername(), loginRequest.getTenantId());
                return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid credentials");
            });
        } catch (Exception e) {
            log.error("Error during login process", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Internal server error");
        }
    }
    
    @Transactional
    @PostMapping("/logout")
    public ResponseEntity<Void> logout(@NonNull HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
            String token = bearerToken.substring(7);
            
            try {
                Date expiration = jwtTokenProvider.getExpirationDate(token);
                LocalDateTime expiresAt = expiration.toInstant()
                        .atZone(ZoneId.systemDefault())
                        .toLocalDateTime();
                
                tokenBlacklistRepository.save(Objects.requireNonNull(TokenBlacklist.builder()
                        .token(token)
                        .expiresAt(expiresAt)
                        .build()));
                
                log.info("Token successfully blacklisted");
            } catch (Exception e) {
                log.warn("Failed to blacklist token or token already expired", e);
            }
        }
        
        return ResponseEntity.ok().build();
    }
}
