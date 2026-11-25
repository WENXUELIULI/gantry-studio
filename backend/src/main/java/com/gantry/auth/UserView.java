package com.gantry.auth;

import java.time.Instant;
import java.util.UUID;

import com.gantry.user.User;
import com.gantry.user.UserPlan;

public record UserView(
        UUID id,
        String email,
        String displayName,
        UserPlan plan,
        Instant createdAt
) {
    public static UserView from(User user) {
        return new UserView(user.getId(), user.getEmail(), user.getDisplayName(),
                user.getPlan(), user.getCreatedAt());
    }
}
