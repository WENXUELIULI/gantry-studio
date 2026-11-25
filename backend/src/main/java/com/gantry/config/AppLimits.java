package com.gantry.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

@ConfigurationProperties(prefix = "app.limits")
public record AppLimits(int maxPages, long maxDocumentBytes, long maxExportBytes) {
}
