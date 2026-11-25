package com.gantry.project;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

import org.springframework.data.jpa.repository.JpaRepository;

public interface ProjectPageRepository extends JpaRepository<ProjectPage, UUID> {
    List<ProjectPage> findByProjectIdOrderByPositionAsc(UUID projectId);

    Optional<ProjectPage> findByIdAndProjectId(UUID id, UUID projectId);

    long countByProjectId(UUID projectId);

    boolean existsByProjectIdAndPath(UUID projectId, String path);
}
