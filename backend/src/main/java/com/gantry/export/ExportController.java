package com.gantry.export;

import java.nio.charset.StandardCharsets;
import java.util.UUID;

import com.gantry.security.AuthUser;
import jakarta.validation.Valid;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1")
public class ExportController {
    private final ExportService exportService;

    public ExportController(ExportService exportService) {
        this.exportService = exportService;
    }

    @PostMapping("/projects/{projectId}/exports")
    @ResponseStatus(HttpStatus.CREATED)
    public ExportView create(@AuthenticationPrincipal AuthUser user, @PathVariable UUID projectId,
                             @Valid @RequestBody CreateExportRequest request) {
        return exportService.create(user.id(), projectId, request);
    }

    @GetMapping("/exports/{artifactId}")
    public ResponseEntity<byte[]> download(@AuthenticationPrincipal AuthUser user,
                                           @PathVariable UUID artifactId) {
        ExportArtifact artifact = exportService.download(user.id(), artifactId);
        byte[] body = artifact.getContentText().getBytes(StandardCharsets.UTF_8);
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(artifact.getContentType()))
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(artifact.getFileName()).build().toString())
                .contentLength(body.length)
                .body(body);
    }
}
