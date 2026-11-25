package com.gantry.project;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

public record CreatePageRequest(
        @NotBlank @Size(max = 160) String title,
        @NotBlank @Size(max = 200) String path,
        @NotNull JsonNode document
) {
}
