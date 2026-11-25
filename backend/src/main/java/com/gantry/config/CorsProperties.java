package com.gantry.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.cors")
public record CorsProperties(String allowedOrigins) {
    public String[] origins() {
        return allowedOrigins.split(",");
    }
}
