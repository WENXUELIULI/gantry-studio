package com.gantry;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.header;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ProjectFlowTest {
    private static final String PAGE_DOCUMENT = """
            {"id":"page-1","name":"Test","sections":[{"id":"hero","type":"hero","visible":true,"title":"Hello"}]}
            """;

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper mapper;

    @Autowired
    private JdbcTemplate jdbc;

    @Test
    void createsProjectAddsPagesAndRejectsStaleWrites() throws Exception {
        String email = "project-" + System.nanoTime() + "@gantry.test";
        String token = register(email);
        String auth = "Bearer " + token;

        MvcResult created = mockMvc.perform(post("/api/v1/projects")
                        .header("Authorization", auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Demo Site","slug":"demo-site","document":%s}
                                """.formatted(PAGE_DOCUMENT)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.project.pageCount").value(1))
                .andExpect(jsonPath("$.pages[0].path").value("/"))
                .andReturn();
        String projectId = mapper.readTree(created.getResponse().getContentAsString())
                .path("project").path("id").asText();

        MvcResult pageCreated = mockMvc.perform(post("/api/v1/projects/" + projectId + "/pages")
                        .header("Authorization", auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"title":"Products","path":"/products","document":%s}
                                """.formatted(PAGE_DOCUMENT)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.key").value("products"))
                .andReturn();
        JsonNode page = mapper.readTree(pageCreated.getResponse().getContentAsString());
        String pageId = page.path("id").asText();
        long version = page.path("version").asLong();

        mockMvc.perform(get("/api/v1/projects/" + projectId)
                        .header("Authorization", auth))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.pages.length()").value(2));

        mockMvc.perform(put("/api/v1/projects/" + projectId + "/pages/" + pageId)
                        .header("Authorization", auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"title":"Products 2","path":"/products","expectedVersion":%d,"document":%s}
                                """.formatted(version, PAGE_DOCUMENT)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.title").value("Products 2"))
                .andExpect(jsonPath("$.version").value(version + 1));

        mockMvc.perform(put("/api/v1/projects/" + projectId + "/pages/" + pageId)
                        .header("Authorization", auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"title":"Stale","path":"/products","expectedVersion":%d,"document":%s}
                                """.formatted(version, PAGE_DOCUMENT)))
                .andExpect(status().isConflict())
                .andExpect(jsonPath("$.code").value("VERSION_CONFLICT"));
    }

    @Test
    void gatesProjectSourceJsonBehindProEntitlement() throws Exception {
        String email = "export-" + System.nanoTime() + "@gantry.test";
        String token = register(email);
        String auth = "Bearer " + token;

        MvcResult created = mockMvc.perform(post("/api/v1/projects")
                        .header("Authorization", auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"name":"Export Site","document":%s}
                                """.formatted(PAGE_DOCUMENT)))
                .andExpect(status().isCreated())
                .andReturn();
        String projectId = mapper.readTree(created.getResponse().getContentAsString())
                .path("project").path("id").asText();

        mockMvc.perform(post("/api/v1/projects/" + projectId + "/exports")
                        .header("Authorization", auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"format":"json","content":"{}","fileName":"source.json"}
                                """))
                .andExpect(status().isPaymentRequired())
                .andExpect(jsonPath("$.code").value("PRO_REQUIRED"));

        jdbc.update("update users set plan = 'PRO' where email = ?", email);

        MvcResult exported = mockMvc.perform(post("/api/v1/projects/" + projectId + "/exports")
                        .header("Authorization", auth)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"format":"json","content":"{\\"pages\\":2}","fileName":"source.json"}
                                """))
                .andExpect(status().isCreated())
                .andReturn();
        String artifactId = mapper.readTree(exported.getResponse().getContentAsString())
                .path("id").asText();

        MvcResult download = mockMvc.perform(get("/api/v1/exports/" + artifactId)
                        .header("Authorization", auth))
                .andExpect(status().isOk())
                .andExpect(header().string("Content-Disposition",
                        org.hamcrest.Matchers.containsString("source.json")))
                .andReturn();
        assertThat(download.getResponse().getContentAsString()).contains("\"pages\":2");
    }

    private String register(String email) throws Exception {
        MvcResult result = mockMvc.perform(post("/api/v1/auth/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("""
                                {"email":"%s","password":"GantryDemo123!","displayName":"Project Tester"}
                                """.formatted(email)))
                .andExpect(status().isCreated())
                .andReturn();
        return mapper.readTree(result.getResponse().getContentAsString())
                .path("accessToken").asText();
    }
}
