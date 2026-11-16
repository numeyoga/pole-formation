package fr.intformation;

import org.junit.jupiter.api.Test;
import org.springframework.boot.builder.SpringApplicationBuilder;
import org.springframework.boot.web.server.context.WebServerApplicationContext;
import org.testcontainers.junit.jupiter.*;
import org.testcontainers.postgresql.PostgreSQLContainer;
import org.testcontainers.utility.DockerImageName;
import tools.jackson.databind.json.JsonMapper;
import java.net.*;
import java.net.http.*;
import static org.assertj.core.api.Assertions.*;

@Testcontainers
class StandaloneDeliveryTest {
    @Container static final PostgreSQLContainer POSTGRES = new PostgreSQLContainer(
        DockerImageName.parse("docker.io/library/postgres:18-alpine").asCompatibleSubstituteFor("postgres"));

    @Test void administrator_can_login_after_first_boot_and_password_is_preserved_on_restart() throws Exception {
        try (var app = boot("First-install-secret-2026")) {
            assertThat(login(app, "First-install-secret-2026")).isEqualTo(204);
            assertThat(login(app, "Dev-only-2026!")).isEqualTo(401);
            var db = app.getBean(org.springframework.jdbc.core.simple.JdbcClient.class);
            // SQL is only used to inspect absence of development fixtures, without a public listing of every table.
            assertThat(db.sql("SELECT count(*) FROM app_account").query(Integer.class).single()).isEqualTo(1);
            assertThat(db.sql("SELECT count(*) FROM training_session").query(Integer.class).single()).isZero();
        }
        try (var app = boot("Different-bootstrap-2026")) {
            assertThat(login(app, "First-install-secret-2026")).isEqualTo(204);
            assertThat(login(app, "Different-bootstrap-2026")).isEqualTo(401);
        }
    }

    @Test void missing_bootstrap_password_prevents_startup() {
        assertThatThrownBy(() -> { try (var ignored = boot("")) {} })
            .hasStackTraceContaining("deployment.admin.password");
    }

    private org.springframework.context.ConfigurableApplicationContext boot(String password) {
        return new SpringApplicationBuilder(PoleFormationApplication.class)
            .profiles("standalone").run("--server.port=0", "--server.servlet.session.cookie.secure=false",
                "--spring.datasource.url=" + POSTGRES.getJdbcUrl(),
                "--spring.datasource.username=" + POSTGRES.getUsername(),
                "--spring.datasource.password=" + POSTGRES.getPassword(),
                "--deployment.admin.username=install-admin", "--deployment.admin.password=" + password);
    }

    private int login(org.springframework.context.ConfigurableApplicationContext app, String password) throws Exception {
        var http = HttpClient.newBuilder().cookieHandler(new CookieManager(null, CookiePolicy.ACCEPT_ALL)).build();
        String base = "http://localhost:" + ((WebServerApplicationContext) app).getWebServer().getPort();
        var csrf = http.send(HttpRequest.newBuilder(URI.create(base + "/api/auth/csrf")).GET().build(), HttpResponse.BodyHandlers.ofString());
        var token = JsonMapper.builder().build().readTree(csrf.body());
        return http.send(HttpRequest.newBuilder(URI.create(base + "/api/auth/login"))
            .header(token.get("headerName").asString(), token.get("token").asString())
            .header("Content-Type", "application/x-www-form-urlencoded")
            .POST(HttpRequest.BodyPublishers.ofString("username=install-admin&password=" + URLEncoder.encode(password, java.nio.charset.StandardCharsets.UTF_8)))
            .build(), HttpResponse.BodyHandlers.discarding()).statusCode();
    }
}
