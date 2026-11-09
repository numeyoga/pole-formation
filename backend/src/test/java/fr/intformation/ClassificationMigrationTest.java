package fr.intformation;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.testcontainers.junit.jupiter.*;
import org.testcontainers.postgresql.PostgreSQLContainer;
import org.testcontainers.utility.DockerImageName;
import java.sql.DriverManager;
import static org.assertj.core.api.Assertions.*;

@Testcontainers
class ClassificationMigrationTest {
    @Container static final PostgreSQLContainer POSTGRES=new PostgreSQLContainer(DockerImageName.parse("docker.io/library/postgres:18-alpine").asCompatibleSubstituteFor("postgres"));
    @Test void historical_classifications_keep_identity_activation_and_requirements_during_upgrade() throws Exception {
        Flyway.configure().dataSource(POSTGRES.getJdbcUrl(),POSTGRES.getUsername(),POSTGRES.getPassword()).locations("classpath:db/migration").target("7").load().migrate();
        try(var connection=DriverManager.getConnection(POSTGRES.getJdbcUrl(),POSTGRES.getUsername(),POSTGRES.getPassword());var sql=connection.createStatement()){
            sql.execute("INSERT INTO requirement_classification(id,label,active) VALUES ('60000000-0000-0000-0000-000000000001','Historique',false)");
            sql.execute("INSERT INTO domain_reference(id,code,label) VALUES ('50000000-0000-0000-0000-000000000001','D','Domaine')");
            sql.execute("INSERT INTO subdomain_reference(id,domain_id,code,label) VALUES ('51000000-0000-0000-0000-000000000001','50000000-0000-0000-0000-000000000001','S','Sous-domaine')");
            sql.execute("INSERT INTO competency_reference(id,subdomain_id,code,label) VALUES ('52000000-0000-0000-0000-000000000001','51000000-0000-0000-0000-000000000001','C','Compétence')");
            sql.execute("INSERT INTO job_profile(id,code,label) VALUES ('53000000-0000-0000-0000-000000000001','P','Profil')");
            sql.execute("INSERT INTO profile_requirement VALUES ('54000000-0000-0000-0000-000000000001','53000000-0000-0000-0000-000000000001','52000000-0000-0000-0000-000000000001','60000000-0000-0000-0000-000000000001')");
        }
        var migration=Flyway.configure().dataSource(POSTGRES.getJdbcUrl(),POSTGRES.getUsername(),POSTGRES.getPassword()).locations("classpath:db/migration").load();migration.migrate();migration.migrate();
        try(var connection=DriverManager.getConnection(POSTGRES.getJdbcUrl(),POSTGRES.getUsername(),POSTGRES.getPassword());var sql=connection.createStatement();var rows=sql.executeQuery("SELECT r.id,k.id,k.code,k.label,k.active,k.sort_order,k.version,r.version FROM profile_requirement r JOIN requirement_classification k ON k.id=r.classification_id")){
            assertThat(rows.next()).isTrue();assertThat(rows.getString(1)).isEqualTo("54000000-0000-0000-0000-000000000001");
            assertThat(rows.getString(2)).isEqualTo("60000000-0000-0000-0000-000000000001");assertThat(rows.getString(3)).isEqualTo("LEGACY-60000000-0000-0000-0000-000000000001");
            assertThat(rows.getString(4)).isEqualTo("Historique");assertThat(rows.getBoolean(5)).isFalse();assertThat(rows.getInt(6)).isZero();assertThat(rows.getLong(7)).isZero();assertThat(rows.getLong(8)).isZero();assertThat(rows.next()).isFalse();
        }
    }
}
