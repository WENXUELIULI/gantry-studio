package com.gantry.project;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.UUID;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.gantry.common.ApiException;
import com.gantry.config.AppLimits;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ProjectService {
    private final ProjectRepository projects;
    private final ProjectPageRepository pages;
    private final ObjectMapper mapper;
    private final AppLimits limits;

    public ProjectService(ProjectRepository projects, ProjectPageRepository pages,
                          ObjectMapper mapper, AppLimits limits) {
        this.projects = projects;
        this.pages = pages;
        this.mapper = mapper;
        this.limits = limits;
    }

    @Transactional(readOnly = true)
    public List<ProjectSummary> list(UUID ownerId) {
        return projects.findByOwnerIdOrderByUpdatedAtDesc(ownerId).stream()
                .map(project -> ProjectSummary.from(project,
                        Math.toIntExact(pages.countByProjectId(project.getId()))))
                .toList();
    }

    @Transactional(readOnly = true)
    public ProjectDetail get(UUID ownerId, UUID projectId) {
        Project project = requireProject(ownerId, projectId);
        return detail(project);
    }

    @Transactional
    public ProjectDetail create(UUID ownerId, CreateProjectRequest request) {
        String slug = slugify(request.slug() == null || request.slug().isBlank()
                ? request.name() : request.slug());
        if (slug.isBlank()) {
            slug = "site-" + UUID.randomUUID().toString().substring(0, 8);
        }
        if (projects.existsByOwnerIdAndSlug(ownerId, slug)) {
            throw ApiException.conflict("SLUG_TAKEN", "项目地址已被占用，请换一个 slug");
        }
        String document = writeDocument(request.document());
        Project project = new Project(UUID.randomUUID(), ownerId, request.name().trim(), slug);
        projects.save(project);
        ProjectPage home = new ProjectPage(UUID.randomUUID(), project.getId(), "home",
                "首页", "/", 0, document);
        pages.save(home);
        return detail(project);
    }

    @Transactional
    public ProjectDetail update(UUID ownerId, UUID projectId, UpdateProjectRequest request) {
        Project project = requireProject(ownerId, projectId);
        if (request.name() != null && !request.name().isBlank()) {
            project.rename(request.name().trim());
        }
        if (request.status() != null) {
            project.changeStatus(request.status());
        }
        return detail(project);
    }

    @Transactional
    public void delete(UUID ownerId, UUID projectId) {
        Project project = requireProject(ownerId, projectId);
        pages.deleteAll(pages.findByProjectIdOrderByPositionAsc(projectId));
        projects.delete(project);
    }

    @Transactional(readOnly = true)
    public PageDetail page(UUID ownerId, UUID projectId, UUID pageId) {
        requireProject(ownerId, projectId);
        ProjectPage page = requirePage(projectId, pageId);
        return pageDetail(page);
    }

    @Transactional
    public PageDetail addPage(UUID ownerId, UUID projectId, CreatePageRequest request) {
        requireProject(ownerId, projectId);
        long count = pages.countByProjectId(projectId);
        if (count >= limits.maxPages()) {
            throw ApiException.conflict("PAGE_LIMIT_REACHED", "单个项目最多 " + limits.maxPages() + " 个页面");
        }
        String path = normalizePath(request.path());
        if (pages.existsByProjectIdAndPath(projectId, path)) {
            throw ApiException.conflict("PATH_TAKEN", "页面路径已存在");
        }
        String document = writeDocument(request.document());
        String pageKey = uniquePageKey(projectId, path);
        ProjectPage page = new ProjectPage(UUID.randomUUID(), projectId, pageKey,
                request.title().trim(), path, (int) count, document);
        pages.save(page);
        return pageDetail(page);
    }

    @Transactional
    public PageDetail updatePage(UUID ownerId, UUID projectId, UUID pageId, UpdatePageRequest request) {
        Project project = requireProject(ownerId, projectId);
        ProjectPage page = requirePage(projectId, pageId);
        if (page.getVersion() != request.expectedVersion()) {
            throw ApiException.conflict("VERSION_CONFLICT",
                    "页面已在其他设备更新（当前版本 " + page.getVersion() + "），请刷新后重试");
        }
        String path = page.getPath();
        if (request.path() != null && !request.path().isBlank()) {
            String next = normalizePath(request.path());
            if (!next.equals(page.getPath())) {
                if (pages.existsByProjectIdAndPath(projectId, next)) {
                    throw ApiException.conflict("PATH_TAKEN", "页面路径已存在");
                }
                path = next;
            }
        }
        String title = request.title() != null && !request.title().isBlank()
                ? request.title().trim() : page.getTitle();
        page.update(title, path, writeDocument(request.document()));
        project.markSaved();
        return pageDetail(page);
    }

    @Transactional
    public void deletePage(UUID ownerId, UUID projectId, UUID pageId) {
        Project project = requireProject(ownerId, projectId);
        ProjectPage page = requirePage(projectId, pageId);
        if (pages.countByProjectId(projectId) <= 1) {
            throw ApiException.conflict("LAST_PAGE", "项目至少保留一个页面");
        }
        pages.delete(page);
        project.markSaved();
    }

    @Transactional(readOnly = true)
    public Project requireProject(UUID ownerId, UUID projectId) {
        return projects.findByIdAndOwnerId(projectId, ownerId)
                .orElseThrow(() -> ApiException.notFound("项目不存在"));
    }

    private ProjectPage requirePage(UUID projectId, UUID pageId) {
        return pages.findByIdAndProjectId(pageId, projectId)
                .orElseThrow(() -> ApiException.notFound("页面不存在"));
    }

    private ProjectDetail detail(Project project) {
        List<PageSummary> summaries = pages.findByProjectIdOrderByPositionAsc(project.getId())
                .stream().map(PageSummary::from).toList();
        return new ProjectDetail(ProjectSummary.from(project, summaries.size()), summaries);
    }

    private PageDetail pageDetail(ProjectPage page) {
        try {
            JsonNode document = mapper.readTree(page.getDocumentJson());
            return new PageDetail(page.getId(), page.getPageKey(), page.getTitle(), page.getPath(),
                    page.getPosition(), page.getVersion(), page.getUpdatedAt(), document);
        } catch (JsonProcessingException ex) {
            throw new IllegalStateException("Stored document is not valid JSON", ex);
        }
    }

    private String writeDocument(JsonNode document) {
        if (document == null || !document.isObject()) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_DOCUMENT", "页面文档必须是 JSON 对象");
        }
        try {
            byte[] bytes = mapper.writeValueAsBytes(document);
            if (bytes.length > limits.maxDocumentBytes()) {
                throw new ApiException(HttpStatus.PAYLOAD_TOO_LARGE, "DOCUMENT_TOO_LARGE",
                        "页面文档超过 " + limits.maxDocumentBytes() + " bytes");
            }
            return mapper.writeValueAsString(document);
        } catch (JsonProcessingException ex) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_DOCUMENT", "页面文档无法序列化");
        }
    }

    private String uniquePageKey(UUID projectId, String path) {
        String base = Normalizer.normalize(path, Normalizer.Form.NFKD)
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^\\p{L}\\p{N}]+", "-")
                .replaceAll("^-+|-+$", "");
        if (base.isBlank()) {
            base = "page";
        }
        String candidate = base;
        int suffix = 2;
        List<ProjectPage> existing = pages.findByProjectIdOrderByPositionAsc(projectId);
        while (true) {
            String current = candidate;
            boolean taken = existing.stream().anyMatch(page -> page.getPageKey().equals(current));
            if (!taken) {
                return candidate;
            }
            candidate = base + "-" + suffix++;
        }
    }

    private String slugify(String value) {
        String slug = Normalizer.normalize(value, Normalizer.Form.NFKD)
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^\\p{L}\\p{N}]+", "-")
                .replaceAll("^-+|-+$", "");
        return slug.length() > 120 ? slug.substring(0, 120) : slug;
    }

    private String normalizePath(String raw) {
        String path = raw == null ? "" : raw.trim();
        if (path.isEmpty()) {
            path = "/";
        }
        if (!path.startsWith("/")) {
            path = "/" + path;
        }
        path = path.replaceAll("/{2,}", "/");
        if (path.contains("..") || path.length() > 200 || path.contains(" ")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_PATH", "页面路径不合法");
        }
        return path;
    }
}
