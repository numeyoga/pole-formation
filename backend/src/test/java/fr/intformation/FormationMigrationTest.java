package fr.intformation;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.testcontainers.junit.jupiter.*;
import org.testcontainers.postgresql.PostgreSQLContainer;
import org.testcontainers.utility.DockerImageName;
import java.sql.DriverManager;
import static org.assertj.core.api.Assertions.*;

@Testcontainers
class FormationMigrationTest {
    @Container static final PostgreSQLContainer POSTGRES=new PostgreSQLContainer(DockerImageName.parse("docker.io/library/postgres:18-alpine").asCompatibleSubstituteFor("postgres"));
    @Test void migration_keeps_unmapped_legacy_sessions_slots_and_participations() throws Exception {
        Flyway.configure().dataSource(POSTGRES.getJdbcUrl(),POSTGRES.getUsername(),POSTGRES.getPassword()).locations("classpath:db/migration").target("9").load().migrate();
        try(var connection=DriverManager.getConnection(POSTGRES.getJdbcUrl(),POSTGRES.getUsername(),POSTGRES.getPassword());var sql=connection.createStatement()){
            sql.execute("INSERT INTO training_session(id,title,state) VALUES ('20000000-0000-0000-0000-000000000001','Historique','TERMINEE')");
            sql.execute("INSERT INTO collaborator(id,professional_id,first_name,last_name) VALUES ('30000000-0000-0000-0000-000000000001','TEST','Exemple','Historique')");
            sql.execute("INSERT INTO participation(id,session_id,collaborator_id,state) VALUES ('40000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','30000000-0000-0000-0000-000000000001','PRESENTE')");
            sql.execute("INSERT INTO session_slot(id,session_id,starts_at,ends_at) VALUES ('21000000-0000-0000-0000-000000000001','20000000-0000-0000-0000-000000000001','2020-01-01T09:00:00Z','2020-01-01T10:00:00Z')");
        }
        var migration=Flyway.configure().dataSource(POSTGRES.getJdbcUrl(),POSTGRES.getUsername(),POSTGRES.getPassword()).locations("classpath:db/migration").load();migration.migrate();migration.migrate();
        try(var connection=DriverManager.getConnection(POSTGRES.getJdbcUrl(),POSTGRES.getUsername(),POSTGRES.getPassword());var sql=connection.createStatement();var rows=sql.executeQuery("SELECT s.id,s.title,s.state,s.formation_id,p.id,p.state,c.id FROM training_session s JOIN participation p ON p.session_id=s.id JOIN session_slot c ON c.session_id=s.id")){
            assertThat(rows.next()).isTrue();assertThat(rows.getString(1)).isEqualTo("20000000-0000-0000-0000-000000000001");assertThat(rows.getString(2)).isEqualTo("Historique");
            assertThat(rows.getString(3)).isEqualTo("TERMINEE");assertThat(rows.getObject(4)).isNull();assertThat(rows.getString(5)).isEqualTo("40000000-0000-0000-0000-000000000001");
            assertThat(rows.getString(6)).isEqualTo("PRESENTE");assertThat(rows.getString(7)).isEqualTo("21000000-0000-0000-0000-000000000001");assertThat(rows.next()).isFalse();
        }
    }
}
