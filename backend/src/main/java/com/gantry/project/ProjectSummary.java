package com.gantry.project;

import java.time.Instant;
import java.util.UUID;

public record ProjectSummary(
        UUID id,
        String name,
        String slug,
        ProjectStatus status,
        long version,
        int pageCount,
        Instant createdAt,
        Instant updatedAt,
        Instant lastSavedAt
) {
    public static ProjectSummary from(Project project, int pageCount) {
        return new ProjectSummary(project.getId(), project.getName(), project.getSlug(),
                project.getStatus(), project.getVersion(), pageCount,
                project.getCreatedAt(), project.getUpdatedAt(), project.getLastSavedAt());
    }
}
