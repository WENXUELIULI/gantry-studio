package com.gantry.export;

import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.time.ZoneOffset;
import java.time.format.DateTimeFormatter;
import java.util.Locale;
import java.util.UUID;

import com.gantry.common.ApiException;
import com.gantry.config.AppLimits;
import com.gantry.project.ProjectService;
import com.gantry.user.User;
import com.gantry.user.UserPlan;
import com.gantry.user.UserRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class ExportService {
    private final ExportArtifactRepository artifacts;
    private final ProjectService projects;
    private final UserRepository users;
    private final AppLimits limits;

    public ExportService(ExportArtifactRepository artifacts, ProjectService projects,
                         UserRepository users, AppLimits limits) {
        this.artifacts = artifacts;
        this.projects = projects;
        this.users = users;
        this.limits = limits;
    }

    @Transactional
    public ExportView create(UUID ownerId, UUID projectId, CreateExportRequest request) {
        projects.requireProject(ownerId, projectId);
        String format = request.format().trim().toUpperCase(Locale.ROOT);
        if (!format.equals("HTML") && !format.equals("JSON")) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "INVALID_FORMAT", "仅支持 HTML 或 JSON 导出");
        }
        if (format.equals("JSON")) {
            User user = users.findById(ownerId)
                    .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "UNAUTHORIZED", "登录已失效"));
            if (user.getPlan() != UserPlan.PRO) {
                throw new ApiException(HttpStatus.PAYMENT_REQUIRED, "PRO_REQUIRED",
                        "项目源文件导出属于 Pro 权益");
            }
        }
        byte[] bytes = request.content().getBytes(StandardCharsets.UTF_8);
        if (bytes.length > limits.maxExportBytes()) {
            throw new ApiException(HttpStatus.PAYLOAD_TOO_LARGE, "EXPORT_TOO_LARGE",
                    "导出文件超过 " + limits.maxExportBytes() + " bytes");
        }
        String fileName = fileName(request.fileName(), format);
        String contentType = format.equals("HTML") ? "text/html; charset=utf-8" : "application/json";
        ExportArtifact artifact = new ExportArtifact(UUID.randomUUID(), projectId, ownerId,
                format, fileName, contentType, request.content());
        artifacts.save(artifact);
        return view(artifact);
    }

    @Transactional(readOnly = true)
    public ExportArtifact download(UUID ownerId, UUID artifactId) {
        return artifacts.findByIdAndOwnerId(artifactId, ownerId)
                .orElseThrow(() -> ApiException.notFound("导出文件不存在"));
    }

    private ExportView view(ExportArtifact artifact) {
        return new ExportView(artifact.getId(), artifact.getFormat(), artifact.getFileName(),
                artifact.getSizeBytes(), artifact.getCreatedAt(),
                "/api/v1/exports/" + artifact.getId());
    }

    private String fileName(String requested, String format) {
        String name = requested == null ? "" : requested.trim();
        if (name.isBlank()) {
            name = "gantry-" + format.toLowerCase(Locale.ROOT) + "-"
                    + DateTimeFormatter.ofPattern("yyyyMMdd-HHmm")
                    .withZone(ZoneOffset.UTC).format(Instant.now());
        }
        name = name.replaceAll("[\\\\/:*?\"<>|\\p{Cntrl}]+", "-");
        return name.length() > 200 ? name.substring(0, 200) : name;
    }
}
