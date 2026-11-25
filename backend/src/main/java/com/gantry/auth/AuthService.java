package com.gantry.auth;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Instant;
import java.util.Base64;
import java.util.HexFormat;
import java.util.UUID;

import com.gantry.common.ApiException;
import com.gantry.security.JwtService;
import com.gantry.user.User;
import com.gantry.user.UserPlan;
import com.gantry.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {
    private final UserRepository users;
    private final RefreshTokenRepository refreshTokens;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final SecureRandom random = new SecureRandom();

    public AuthService(UserRepository users, RefreshTokenRepository refreshTokens,
                       PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.users = users;
        this.refreshTokens = refreshTokens;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = normalizeEmail(request.email());
        if (users.existsByEmail(email)) {
            throw ApiException.conflict("EMAIL_TAKEN", "该邮箱已注册");
        }
        User user = new User(UUID.randomUUID(), email, passwordEncoder.encode(request.password()),
                request.displayName().trim(), UserPlan.FREE);
        users.save(user);
        return issue(user);
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        User user = users.findByEmail(normalizeEmail(request.email()))
                .orElseThrow(this::invalidCredentials);
        if (!passwordEncoder.matches(request.password(), user.getPasswordHash())) {
            throw invalidCredentials();
        }
        return issue(user);
    }

    @Transactional
    public AuthResponse refresh(RefreshRequest request) {
        RefreshToken token = refreshTokens.findByTokenHash(hash(request.refreshToken()))
                .orElseThrow(this::invalidRefresh);
        if (token.isRevoked() || token.getExpiresAt().isBefore(Instant.now())) {
            throw invalidRefresh();
        }
        token.revoke();
        return issue(token.getUser());
    }

    @Transactional
    public void logout(String refreshToken) {
        if (refreshToken == null || refreshToken.isBlank()) {
            return;
        }
        refreshTokens.findByTokenHash(hash(refreshToken)).ifPresent(RefreshToken::revoke);
    }

    @Transactional(readOnly = true)
    public UserView me(UUID userId) {
        return UserView.from(users.findById(userId)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "登录已失效")));
    }

    private AuthResponse issue(User user) {
        String accessToken = jwtService.issueAccessToken(user);
        String rawRefresh = randomToken();
        refreshTokens.save(new RefreshToken(UUID.randomUUID(), user, hash(rawRefresh),
                Instant.now().plus(jwtService.properties().refreshTtl())));
        return AuthResponse.of(accessToken, rawRefresh, jwtService.accessTtlSeconds(), UserView.from(user));
    }

    private String randomToken() {
        byte[] bytes = new byte[32];
        random.nextBytes(bytes);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String hash(String token) {
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            return HexFormat.of().formatHex(digest.digest(token.getBytes(StandardCharsets.UTF_8)));
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 not available", ex);
        }
    }

    private String normalizeEmail(String email) {
        return email.trim().toLowerCase();
    }

    private ApiException invalidCredentials() {
        return new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_CREDENTIALS", "邮箱或密码错误");
    }

    private ApiException invalidRefresh() {
        return new ApiException(HttpStatus.UNAUTHORIZED, "INVALID_REFRESH_TOKEN", "登录状态已过期，请重新登录");
    }
}
