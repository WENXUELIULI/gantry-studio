package com.gantry.project;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "project_pages")
public class ProjectPage {
    @Id
    private UUID id;

    @Column(name = "project_id", nullable = false)
    private UUID projectId;

    @Column(name = "page_key", nullable = false, length = 80)
    private String pageKey;

    @Column(nullable = false, length = 160)
    private String title;

    @Column(nullable = false, length = 200)
    private String path;

    @Column(nullable = false)
    private int position;

    @Column(nullable = false)
    private long version;

    @Column(name = "document_json", nullable = false, columnDefinition = "text")
    private String documentJson;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    protected ProjectPage() {
    }

    public ProjectPage(UUID id, UUID projectId, String pageKey, String title, String path,
                       int position, String documentJson) {
        this.id = id;
        this.projectId = projectId;
        this.pageKey = pageKey;
        this.title = title;
        this.path = path;
        this.position = position;
        this.documentJson = documentJson;
        this.version = 1;
        this.updatedAt = Instant.now();
    }

    public void update(String title, String path, String documentJson) {
        this.title = title;
        this.path = path;
        this.documentJson = documentJson;
        this.version += 1;
        this.updatedAt = Instant.now();
    }

    public UUID getId() {
        return id;
    }

    public UUID getProjectId() {
        return projectId;
    }

    public String getPageKey() {
        return pageKey;
    }

    public String getTitle() {
        return title;
    }

    public String getPath() {
        return path;
    }

    public int getPosition() {
        return position;
    }

    public long getVersion() {
        return version;
    }

    public String getDocumentJson() {
        return documentJson;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }
}
