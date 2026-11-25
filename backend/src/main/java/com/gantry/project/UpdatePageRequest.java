package com.gantry.project;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record UpdatePageRequest(
        @Size(max = 160) String title,
        @Size(max = 200) String path,
        @NotNull JsonNode document,
        @NotNull Long expectedVersion
) {
}
