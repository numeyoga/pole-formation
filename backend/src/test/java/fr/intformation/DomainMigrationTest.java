package fr.intformation;

import org.flywaydb.core.Flyway;
import org.junit.jupiter.api.Test;
import org.testcontainers.junit.jupiter.*;
import org.testcontainers.postgresql.PostgreSQLContainer;
import org.testcontainers.utility.DockerImageName;
import java.sql.DriverManager;
import java.util.*;
import static org.assertj.core.api.Assertions.*;

@Testcontainers
class DomainMigrationTest {
    @Container static final PostgreSQLContainer POSTGRES=new PostgreSQLContainer(DockerImageName.parse("docker.io/library/postgres:18-alpine").asCompatibleSubstituteFor("postgres"));
    @Test void legacy_domains_keep_identity_and_label_and_receive_stable_unique_migration_codes() throws Exception {
        Flyway.configure().dataSource(POSTGRES.getJdbcUrl(),POSTGRES.getUsername(),POSTGRES.getPassword()).locations("classpath:db/migration").target("2").load().migrate();
        try(var connection=DriverManager.getConnection(POSTGRES.getJdbcUrl(),POSTGRES.getUsername(),POSTGRES.getPassword());var sql=connection.createStatement()){
            sql.execute("INSERT INTO domain_reference VALUES ('50000000-0000-0000-0000-000000000001','Premier historique'),('50000000-0000-0000-0000-000000000002','Second historique')");
        }
        var migration=Flyway.configure().dataSource(POSTGRES.getJdbcUrl(),POSTGRES.getUsername(),POSTGRES.getPassword()).locations("classpath:db/migration").load();migration.migrate();
        Map<String,String> codes=new HashMap<>();
        try(var connection=DriverManager.getConnection(POSTGRES.getJdbcUrl(),POSTGRES.getUsername(),POSTGRES.getPassword());var sql=connection.createStatement();var rows=sql.executeQuery("SELECT id,code,label,active,version FROM domain_reference ORDER BY id")){
            assertThat(rows.next()).isTrue();assertThat(rows.getString(1)).isEqualTo("50000000-0000-0000-0000-000000000001");assertThat(rows.getString(3)).isEqualTo("Premier historique");assertThat(rows.getBoolean(4)).isTrue();assertThat(rows.getLong(5)).isZero();codes.put(rows.getString(1),rows.getString(2));
            assertThat(rows.next()).isTrue();assertThat(rows.getString(3)).isEqualTo("Second historique");codes.put(rows.getString(1),rows.getString(2));assertThat(rows.next()).isFalse();
        }
        assertThat(new HashSet<>(codes.values())).hasSize(2);assertThat(codes.values()).allSatisfy(code->assertThat(code).startsWith("MIG-"));
        migration.migrate();
        try(var connection=DriverManager.getConnection(POSTGRES.getJdbcUrl(),POSTGRES.getUsername(),POSTGRES.getPassword());var sql=connection.createStatement();var rows=sql.executeQuery("SELECT id,code FROM domain_reference")){
            while(rows.next())assertThat(rows.getString(2)).isEqualTo(codes.get(rows.getString(1)));
        }
    }
}
