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
class SubdomainMigrationTest {
    @Container static final PostgreSQLContainer POSTGRES=new PostgreSQLContainer(DockerImageName.parse("docker.io/library/postgres:18-alpine").asCompatibleSubstituteFor("postgres"));
    @Test void legacy_subdomains_keep_identity_parent_and_label_and_receive_stable_codes() throws Exception {
        Flyway.configure().dataSource(POSTGRES.getJdbcUrl(),POSTGRES.getUsername(),POSTGRES.getPassword()).locations("classpath:db/migration").target("3").load().migrate();
        String parent="50000000-0000-0000-0000-000000000001";
        try(var connection=DriverManager.getConnection(POSTGRES.getJdbcUrl(),POSTGRES.getUsername(),POSTGRES.getPassword());var sql=connection.createStatement()){
            sql.execute("INSERT INTO domain_reference (id,label) VALUES ('"+parent+"','Parent historique')");
            sql.execute("INSERT INTO subdomain_reference VALUES ('51000000-0000-0000-0000-000000000001','"+parent+"','Premier historique'),('51000000-0000-0000-0000-000000000002','"+parent+"','Second historique')");
        }
        var migration=Flyway.configure().dataSource(POSTGRES.getJdbcUrl(),POSTGRES.getUsername(),POSTGRES.getPassword()).locations("classpath:db/migration").load();migration.migrate();Map<String,String> codes=new HashMap<>();
        try(var connection=DriverManager.getConnection(POSTGRES.getJdbcUrl(),POSTGRES.getUsername(),POSTGRES.getPassword());var sql=connection.createStatement();var rows=sql.executeQuery("SELECT id,domain_id,label,code,active,version FROM subdomain_reference ORDER BY id")){
            assertThat(rows.next()).isTrue();assertThat(rows.getString(1)).isEqualTo("51000000-0000-0000-0000-000000000001");assertThat(rows.getString(2)).isEqualTo(parent);assertThat(rows.getString(3)).isEqualTo("Premier historique");assertThat(rows.getBoolean(5)).isTrue();assertThat(rows.getLong(6)).isZero();codes.put(rows.getString(1),rows.getString(4));
            assertThat(rows.next()).isTrue();assertThat(rows.getString(2)).isEqualTo(parent);assertThat(rows.getString(3)).isEqualTo("Second historique");codes.put(rows.getString(1),rows.getString(4));assertThat(rows.next()).isFalse();
        }
        assertThat(new HashSet<>(codes.values())).hasSize(2);assertThat(codes.values()).allSatisfy(code->assertThat(code).startsWith("MIG-"));migration.migrate();
        try(var connection=DriverManager.getConnection(POSTGRES.getJdbcUrl(),POSTGRES.getUsername(),POSTGRES.getPassword());var sql=connection.createStatement();var rows=sql.executeQuery("SELECT id,code FROM subdomain_reference")){
            while(rows.next())assertThat(rows.getString(2)).isEqualTo(codes.get(rows.getString(1)));
        }
    }
}
