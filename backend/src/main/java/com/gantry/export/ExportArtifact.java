package com.gantry.export;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "export_artifacts")
public class ExportArtifact {
    @Id
    private UUID id;

    @Column(name = "project_id", nullable = false)
    private UUID projectId;

    @Column(name = "owner_id", nullable = false)
    private UUID ownerId;

    @Column(nullable = false, length = 20)
    private String format;

    @Column(name = "file_name", nullable = false, length = 200)
    private String fileName;

    @Column(name = "content_type", nullable = false, length = 100)
    private String contentType;

    @Column(name = "content_text", nullable = false, columnDefinition = "text")
    private String contentText;

    @Column(name = "size_bytes", nullable = false)
    private long sizeBytes;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    protected ExportArtifact() {
    }

    public ExportArtifact(UUID id, UUID projectId, UUID ownerId, String format, String fileName,
                          String contentType, String contentText) {
        this.id = id;
        this.projectId = projectId;
        this.ownerId = ownerId;
        this.format = format;
        this.fileName = fileName;
        this.contentType = contentType;
        this.contentText = contentText;
        this.sizeBytes = contentText.getBytes(java.nio.charset.StandardCharsets.UTF_8).length;
        this.createdAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getProjectId() {
        return projectId;
    }

    public UUID getOwnerId() {
        return ownerId;
    }

    public String getFormat() {
        return format;
    }

    public String getFileName() {
        return fileName;
    }

    public String getContentType() {
        return contentType;
    }

    public String getContentText() {
        return contentText;
    }

    public long getSizeBytes() {
        return sizeBytes;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }
}
