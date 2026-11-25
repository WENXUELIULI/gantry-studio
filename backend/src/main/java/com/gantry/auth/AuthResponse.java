package com.gantry.auth;

public record AuthResponse(
        String tokenType,
        String accessToken,
        String refreshToken,
        long expiresIn,
        UserView user
) {
    public static AuthResponse of(String accessToken, String refreshToken, long expiresIn, UserView user) {
        return new AuthResponse("Bearer", accessToken, refreshToken, expiresIn, user);
    }
}
