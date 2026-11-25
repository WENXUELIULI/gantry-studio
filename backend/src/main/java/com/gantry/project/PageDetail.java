package com.gantry.project;

import java.time.Instant;
import java.util.UUID;

import com.fasterxml.jackson.databind.JsonNode;

public record PageDetail(
        UUID id,
        String key,
        String title,
        String path,
        int position,
        long version,
        Instant updatedAt,
        JsonNode document
) {
}
