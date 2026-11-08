package fr.intformation;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.testcontainers.junit.jupiter.*;
import org.testcontainers.postgresql.PostgreSQLContainer;
import org.testcontainers.utility.DockerImageName;
import java.sql.DriverManager;
import static org.assertj.core.api.Assertions.*;

@Testcontainers
class AuditMigrationTest {
    @Container static final PostgreSQLContainer POSTGRES=new PostgreSQLContainer(DockerImageName.parse("docker.io/library/postgres:18-alpine").asCompatibleSubstituteFor("postgres"));
    @Test void legacy_events_keep_their_author_date_and_before_after_values() throws Exception {
        Flyway.configure().dataSource(POSTGRES.getJdbcUrl(),POSTGRES.getUsername(),POSTGRES.getPassword()).locations("classpath:db/migration").target("1").load().migrate();
        try(var connection=DriverManager.getConnection(POSTGRES.getJdbcUrl(),POSTGRES.getUsername(),POSTGRES.getPassword());var sql=connection.createStatement()) {
            sql.execute("INSERT INTO access_audit VALUES ('90000000-0000-0000-0000-000000000001','2026-11-08T10:00:00Z','admin','CORRECTION_PRESENCE','participation-historique','PRESENTE','ABSENTE')");
            sql.execute("INSERT INTO access_audit VALUES ('90000000-0000-0000-0000-000000000002','2026-11-08T11:00:00Z','admin','CHANGEMENT_ROLE','compte-historique','GESTIONNAIRE','INTERVENANT')");
        }
        Flyway.configure().dataSource(POSTGRES.getJdbcUrl(),POSTGRES.getUsername(),POSTGRES.getPassword()).locations("classpath:db/migration").load().migrate();
        try(var connection=DriverManager.getConnection(POSTGRES.getJdbcUrl(),POSTGRES.getUsername(),POSTGRES.getPassword());var sql=connection.createStatement();var rows=sql.executeQuery("SELECT actor,occurred_at,subject_type,before_value,after_value FROM access_audit ORDER BY occurred_at")) {
            assertThat(rows.next()).isTrue();assertThat(rows.getString(1)).isEqualTo("admin");assertThat(rows.getTimestamp(2).toInstant().toString()).isEqualTo("2026-11-08T10:00:00Z");
            assertThat(rows.getString(3)).isEqualTo("PARTICIPATION");assertThat(rows.getString(4)).contains("PRESENTE");assertThat(rows.getString(5)).contains("ABSENTE");
            assertThat(rows.next()).isTrue();assertThat(rows.getString(3)).isEqualTo("COMPTE");assertThat(rows.getString(4)).contains("GESTIONNAIRE");assertThat(rows.getString(5)).contains("INTERVENANT");
            assertThat(rows.next()).isFalse();
        }
    }
}
