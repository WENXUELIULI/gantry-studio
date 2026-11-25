package com.gantry.project;

import java.time.Instant;
import java.util.UUID;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

@Entity
@Table(name = "projects")
public class Project {
    @Id
    private UUID id;

    @Column(name = "owner_id", nullable = false)
    private UUID ownerId;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(nullable = false, length = 120)
    private String slug;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private ProjectStatus status;

    @Column(nullable = false)
    private long version;

    @Column(name = "created_at", nullable = false)
    private Instant createdAt;

    @Column(name = "updated_at", nullable = false)
    private Instant updatedAt;

    @Column(name = "last_saved_at")
    private Instant lastSavedAt;

    protected Project() {
    }

    public Project(UUID id, UUID ownerId, String name, String slug) {
        this.id = id;
        this.ownerId = ownerId;
        this.name = name;
        this.slug = slug;
        this.status = ProjectStatus.DRAFT;
        this.version = 0;
        this.createdAt = Instant.now();
        this.updatedAt = this.createdAt;
    }

    public void rename(String name) {
        this.name = name;
        this.updatedAt = Instant.now();
    }

    public void changeStatus(ProjectStatus status) {
        this.status = status;
        this.updatedAt = Instant.now();
    }

    public void markSaved() {
        Instant now = Instant.now();
        this.version += 1;
        this.updatedAt = now;
        this.lastSavedAt = now;
    }

    public UUID getId() {
        return id;
    }

    public UUID getOwnerId() {
        return ownerId;
    }

    public String getName() {
        return name;
    }

    public String getSlug() {
        return slug;
    }

    public ProjectStatus getStatus() {
        return status;
    }

    public long getVersion() {
        return version;
    }

    public Instant getCreatedAt() {
        return createdAt;
    }

    public Instant getUpdatedAt() {
        return updatedAt;
    }

    public Instant getLastSavedAt() {
        return lastSavedAt;
    }
}
