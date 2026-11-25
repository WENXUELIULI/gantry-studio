package com.gantry.export;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateExportRequest(
        @NotBlank @Size(max = 20) String format,
        @NotBlank String content,
        @Size(max = 200) String fileName
) {
}
