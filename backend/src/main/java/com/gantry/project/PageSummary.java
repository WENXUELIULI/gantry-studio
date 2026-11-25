package com.gantry.project;

import java.time.Instant;
import java.util.UUID;

public record PageSummary(
        UUID id,
        String key,
        String title,
        String path,
        int position,
        long version,
        Instant updatedAt
) {
    public static PageSummary from(ProjectPage page) {
        return new PageSummary(page.getId(), page.getPageKey(), page.getTitle(), page.getPath(),
                page.getPosition(), page.getVersion(), page.getUpdatedAt());
    }
}
