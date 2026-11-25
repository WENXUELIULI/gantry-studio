package com.gantry.export;

import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ExportArtifactRepository extends JpaRepository<ExportArtifact, UUID> {
    Optional<ExportArtifact> findByIdAndOwnerId(UUID id, UUID ownerId);
}
