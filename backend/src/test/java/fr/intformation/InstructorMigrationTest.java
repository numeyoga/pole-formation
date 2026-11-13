package fr.intformation;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.testcontainers.junit.jupiter.*;
import org.testcontainers.postgresql.PostgreSQLContainer;
import org.testcontainers.utility.DockerImageName;
import java.sql.DriverManager;
import static org.assertj.core.api.Assertions.*;

@Testcontainers
class InstructorMigrationTest {
    @Container static final PostgreSQLContainer POSTGRES=new PostgreSQLContainer(DockerImageName.parse("docker.io/library/postgres:18-alpine").asCompatibleSubstituteFor("postgres"));
    @Test void migration_preserves_legacy_labels_accounts_inactivation_and_assignments_without_invented_names() throws Exception {
        Flyway.configure().dataSource(POSTGRES.getJdbcUrl(),POSTGRES.getUsername(),POSTGRES.getPassword()).locations("classpath:db/migration").target("12").load().migrate();
        try(var connection=DriverManager.getConnection(POSTGRES.getJdbcUrl(),POSTGRES.getUsername(),POSTGRES.getPassword());var sql=connection.createStatement()){
            sql.execute("INSERT INTO instructor(id,label,active) VALUES ('10000000-0000-0000-0000-000000000001','Ancien libellé préservé',false)");
            sql.execute("INSERT INTO app_account(username,password_hash,role,instructor_id) VALUES ('historique','fictif','INTERVENANT','10000000-0000-0000-0000-000000000001')");
            sql.execute("INSERT INTO training_session(id,title,state) VALUES ('20000000-0000-0000-0000-000000000001','Historique','TERMINEE')");
            sql.execute("INSERT INTO session_instructor VALUES ('20000000-0000-0000-0000-000000000001','10000000-0000-0000-0000-000000000001')");
        }
        var migration=Flyway.configure().dataSource(POSTGRES.getJdbcUrl(),POSTGRES.getUsername(),POSTGRES.getPassword()).locations("classpath:db/migration").load();migration.migrate();migration.migrate();
        try(var connection=DriverManager.getConnection(POSTGRES.getJdbcUrl(),POSTGRES.getUsername(),POSTGRES.getPassword());var sql=connection.createStatement();var rows=sql.executeQuery("SELECT i.label,i.first_name,i.last_name,i.professional_contact,i.active,i.version,a.username,s.session_id FROM instructor i JOIN app_account a ON a.instructor_id=i.id JOIN session_instructor s ON s.instructor_id=i.id")){
            assertThat(rows.next()).isTrue();assertThat(rows.getString(1)).isEqualTo("Ancien libellé préservé");assertThat(rows.getString(2)).isNull();assertThat(rows.getString(3)).isNull();assertThat(rows.getString(4)).isEmpty();assertThat(rows.getBoolean(5)).isFalse();assertThat(rows.getLong(6)).isZero();assertThat(rows.getString(7)).isEqualTo("historique");assertThat(rows.getString(8)).isEqualTo("20000000-0000-0000-0000-000000000001");assertThat(rows.next()).isFalse();
        }
    }
}
