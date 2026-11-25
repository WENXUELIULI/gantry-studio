package com.gantry.security;

import java.security.Principal;
import java.util.UUID;

public record AuthUser(UUID id, String email, String name, String plan) implements Principal {
    @Override
    public String getName() {
        return id.toString();
    }
}
