package com.gantry.project;

import jakarta.validation.constraints.Size;

public record UpdateProjectRequest(
        @Size(min = 1, max = 120) String name,
        ProjectStatus status
) {
}
