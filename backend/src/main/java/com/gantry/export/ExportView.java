package com.gantry.export;

import java.time.Instant;
import java.util.UUID;

public record ExportView(
        UUID id,
        String format,
        String fileName,
        long sizeBytes,
        Instant createdAt,
        String downloadUrl
) {
}
