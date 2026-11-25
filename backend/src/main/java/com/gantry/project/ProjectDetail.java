package com.gantry.project;

import java.util.List;

public record ProjectDetail(ProjectSummary project, List<PageSummary> pages) {
}
