package com.gantry.project;

import java.util.List;
import java.util.UUID;

import com.gantry.security.AuthUser;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/projects")
public class ProjectController {
    private final ProjectService projectService;

    public ProjectController(ProjectService projectService) {
        this.projectService = projectService;
    }

    @GetMapping
    public List<ProjectSummary> list(@AuthenticationPrincipal AuthUser user) {
        return projectService.list(user.id());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ProjectDetail create(@AuthenticationPrincipal AuthUser user,
                                @Valid @RequestBody CreateProjectRequest request) {
        return projectService.create(user.id(), request);
    }

    @GetMapping("/{projectId}")
    public ProjectDetail get(@AuthenticationPrincipal AuthUser user, @PathVariable UUID projectId) {
        return projectService.get(user.id(), projectId);
    }

    @PatchMapping("/{projectId}")
    public ProjectDetail update(@AuthenticationPrincipal AuthUser user, @PathVariable UUID projectId,
                                @Valid @RequestBody UpdateProjectRequest request) {
        return projectService.update(user.id(), projectId, request);
    }

    @DeleteMapping("/{projectId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@AuthenticationPrincipal AuthUser user, @PathVariable UUID projectId) {
        projectService.delete(user.id(), projectId);
    }

    @GetMapping("/{projectId}/pages/{pageId}")
    public PageDetail page(@AuthenticationPrincipal AuthUser user, @PathVariable UUID projectId,
                           @PathVariable UUID pageId) {
        return projectService.page(user.id(), projectId, pageId);
    }

    @PostMapping("/{projectId}/pages")
    @ResponseStatus(HttpStatus.CREATED)
    public PageDetail addPage(@AuthenticationPrincipal AuthUser user, @PathVariable UUID projectId,
                              @Valid @RequestBody CreatePageRequest request) {
        return projectService.addPage(user.id(), projectId, request);
    }

    @PutMapping("/{projectId}/pages/{pageId}")
    public PageDetail updatePage(@AuthenticationPrincipal AuthUser user, @PathVariable UUID projectId,
                                 @PathVariable UUID pageId,
                                 @Valid @RequestBody UpdatePageRequest request) {
        return projectService.updatePage(user.id(), projectId, pageId, request);
    }

    @DeleteMapping("/{projectId}/pages/{pageId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deletePage(@AuthenticationPrincipal AuthUser user, @PathVariable UUID projectId,
                           @PathVariable UUID pageId) {
        projectService.deletePage(user.id(), projectId, pageId);
    }
}
