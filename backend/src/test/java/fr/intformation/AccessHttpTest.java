package fr.intformation;

import org.junit.jupiter.api.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.server.LocalServerPort;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.test.context.*;
import org.testcontainers.junit.jupiter.*;
import org.testcontainers.postgresql.PostgreSQLContainer;
import tools.jackson.databind.*;
import tools.jackson.databind.json.JsonMapper;
import java.net.*;
import java.net.http.*;
import static org.assertj.core.api.Assertions.*;

@SpringBootTest(webEnvironment=SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("dev")
@Testcontainers
class AccessHttpTest {
    @Container static final PostgreSQLContainer POSTGRES = new PostgreSQLContainer(org.testcontainers.utility.DockerImageName.parse("docker.io/library/postgres:18-alpine").asCompatibleSubstituteFor("postgres"));
    @DynamicPropertySource static void database(DynamicPropertyRegistry registry) {
        registry.add("spring.datasource.url",POSTGRES::getJdbcUrl);
        registry.add("spring.datasource.username",POSTGRES::getUsername);
        registry.add("spring.datasource.password",POSTGRES::getPassword);
    }
    @LocalServerPort int port;
    @Autowired JdbcClient db;
    final JsonMapper json=JsonMapper.builder().build();
    static final String S1="20000000-0000-0000-0000-000000000001", S2="20000000-0000-0000-0000-000000000002", S3="20000000-0000-0000-0000-000000000003", S4="20000000-0000-0000-0000-000000000004";
    static final String P1="40000000-0000-0000-0000-000000000001", P2="40000000-0000-0000-0000-000000000002", P3="40000000-0000-0000-0000-000000000003", P4="40000000-0000-0000-0000-000000000004";
    static final String DOMAIN="/api/referentiels/domaines/50000000-0000-0000-0000-000000000001";
    static final String CLASSIFICATION="/api/referentiels/classifications/60000000-0000-0000-0000-000000000001";
    @BeforeEach void restoreFixtures() {
        db.sql("UPDATE app_account SET role='GESTIONNAIRE' WHERE username='gestionnaire'").update();
        db.sql("UPDATE participation SET state=CASE WHEN session_id='"+S3+"' THEN 'PRESENTE' ELSE 'INSCRITE' END").update();
        db.sql("DELETE FROM access_audit").update();
    }
    class Browser {
        final HttpClient http=HttpClient.newBuilder().cookieHandler(new CookieManager(null,CookiePolicy.ACCEPT_ALL)).build();
        String csrf,header;
        HttpResponse<String> call(String method,String path,String body,boolean token) throws Exception {
            var request=HttpRequest.newBuilder(URI.create("http://localhost:"+port+path));
            if(token) request.header(header,csrf);
            if(body!=null) request.header("Content-Type","application/json");
            return http.send(request.method(method,body==null?HttpRequest.BodyPublishers.noBody():HttpRequest.BodyPublishers.ofString(body)).build(),HttpResponse.BodyHandlers.ofString());
        }
        void refreshCsrf() throws Exception {
            var response=call("GET","/api/auth/csrf",null,false);
            assertThat(response.statusCode()).isEqualTo(200);
            JsonNode node=json.readTree(response.body()); csrf=node.get("token").asString(); header=node.get("headerName").asString();
        }
        void login(String username) throws Exception {
            refreshCsrf();
            var response=http.send(HttpRequest.newBuilder(URI.create("http://localhost:"+port+"/api/auth/login"))
                .header(header,csrf).header("Content-Type","application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString("username="+username+"&password=Dev-only-2026%21")).build(),HttpResponse.BodyHandlers.ofString());
            assertThat(response.statusCode()).isEqualTo(204);
            refreshCsrf();
        }
        HttpResponse<String> get(String path) throws Exception { return call("GET",path,null,false); }
        HttpResponse<String> put(String path,String body) throws Exception { return call("PUT",path,body,true); }
    }
    Browser as(String username) throws Exception { var browser=new Browser();browser.login(username);return browser; }
    String people(String session) { return "/api/sessions/"+session+"/participants"; }
    String presence(String session,String participation) { return people(session)+"/"+participation+"/presence"; }

    @Test void anonymous_access_and_missing_csrf_are_rejected() throws Exception {
        var anonymous=new Browser();
        assertThat(anonymous.get("/api/sessions").statusCode()).isEqualTo(401);
        var manager=as("gestionnaire");
        assertThat(manager.call("PUT",DOMAIN,"{\"label\":\"Test\"}",false).statusCode()).isEqualTo(403);
        assertThat(manager.get("/api/auth/me").headers().firstValue("Content-Type")).hasValueSatisfying(v->assertThat(v).contains("application/json"));
    }
    @Test void manager_can_modify_referential_but_not_admin_permissions() throws Exception {
        var manager=as("gestionnaire");
        assertThat(manager.put(DOMAIN,"{\"label\":\"Domaine modifié\"}").statusCode()).isEqualTo(204);
        assertThat(manager.put(CLASSIFICATION,"{\"label\":\"Restreint\"}").statusCode()).isEqualTo(403);
        assertThat(manager.get("/api/habilitations/comptes").statusCode()).isEqualTo(403);
        assertThat(manager.put("/api/habilitations/comptes/intervenant/role","{\"role\":\"GESTIONNAIRE\"}").statusCode()).isEqualTo(403);
        assertThat(json.readTree(manager.get("/api/sessions").body()).size()).isEqualTo(4);
    }
    @Test void instructor_only_sees_assigned_sessions_and_safe_participant_fields() throws Exception {
        var instructor=as("intervenant");
        var sessions=instructor.get("/api/sessions");
        assertThat(sessions.statusCode()).isEqualTo(200);
        assertThat(sessions.body()).contains(S1,S3,S4).doesNotContain(S2);
        JsonNode participant=json.readTree(instructor.get(people(S1)).body()).get(0);
        assertThat(participant.propertyNames()).containsExactlyInAnyOrder("id","firstName","lastName","professionalId","state");
        assertThat(instructor.put(DOMAIN,"{\"label\":\"Interdit\"}").statusCode()).isEqualTo(403);
        assertThat(as("sans-affectation").get("/api/sessions").body()).isEqualTo("[]");
    }
    @Test void guessing_another_session_or_participation_cannot_bypass_assignment() throws Exception {
        var instructor=as("intervenant");
        assertThat(instructor.get(people(S2)).statusCode()).isEqualTo(403);
        assertThat(instructor.put(presence(S2,P2),"{\"state\":\"PRESENTE\"}").statusCode()).isEqualTo(403);
        assertThat(instructor.put(presence(S1,P2),"{\"state\":\"PRESENTE\"}").statusCode()).isEqualTo(404);
        assertThat(as("intervenant-b").get(people(S2)).body()).contains("INSCRITE");
    }
    @Test void presence_requires_last_slot_and_closed_correction_requires_admin_and_audit() throws Exception {
        var instructor=as("intervenant");
        assertThat(instructor.put(presence(S1,P1),"{\"state\":\"PRESENTE\"}").statusCode()).isEqualTo(204);
        assertThat(instructor.get(people(S1)).body()).contains("PRESENTE");
        assertThat(instructor.put(presence(S4,P4),"{\"state\":\"PRESENTE\"}").statusCode()).isEqualTo(409);
        assertThat(instructor.put(presence(S3,P3),"{\"state\":\"ABSENTE\"}").statusCode()).isEqualTo(403);
        assertThat(as("gestionnaire").put(presence(S3,P3),"{\"state\":\"ABSENTE\"}").statusCode()).isEqualTo(403);
        var admin=as("admin");
        assertThat(admin.put(presence(S3,P3),"{\"state\":\"ABSENTE\"}").statusCode()).isEqualTo(204);
        assertThat(admin.get(people(S3)).body()).contains("ABSENTE");
        assertThat(db.sql("SELECT count(*) FROM access_audit WHERE actor='admin' AND action='CORRECTION_PRESENCE' AND before_value='PRESENTE' AND after_value='ABSENTE'").query(Integer.class).single()).isEqualTo(1);
    }
    @Test void role_changes_take_effect_for_an_existing_session_and_are_audited() throws Exception {
        var manager=as("gestionnaire"); var admin=as("admin");
        assertThat(admin.put(CLASSIFICATION,"{\"label\":\"Classification modifiée\"}").statusCode()).isEqualTo(204);
        assertThat(admin.put("/api/habilitations/comptes/gestionnaire/role","{\"role\":\"INTERVENANT\"}").statusCode()).isEqualTo(204);
        assertThat(manager.put(DOMAIN,"{\"label\":\"Interdit\"}").statusCode()).isEqualTo(403);
        assertThat(manager.get("/api/auth/me").body()).contains("INTERVENANT");
        assertThat(db.sql("SELECT count(*) FROM access_audit WHERE action='CHANGEMENT_ROLE'").query(Integer.class).single()).isEqualTo(1);
    }
    @Test void malformed_requests_are_rejected_and_failed_audit_rolls_back_role_change() throws Exception {
        var admin=as("admin");
        assertThat(admin.put(presence(S1,P1),"{}").statusCode()).isEqualTo(400);
        assertThat(admin.put("/api/habilitations/comptes/gestionnaire/role","{\"role\":\"UNKNOWN\"}").statusCode()).isEqualTo(400);
        db.sql("CREATE FUNCTION fail_audit_test() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'audit unavailable'; END $$").update();
        db.sql("CREATE TRIGGER fail_audit_test BEFORE INSERT ON access_audit FOR EACH ROW EXECUTE FUNCTION fail_audit_test()").update();
        try {
            var response=admin.put("/api/habilitations/comptes/gestionnaire/role","{\"role\":\"INTERVENANT\"}");
            assertThat(response.statusCode()).isEqualTo(500);
            assertThat(response.body()).doesNotContain("audit unavailable","Exception","password_hash");
            assertThat(as("gestionnaire").get("/api/auth/me").body()).contains("GESTIONNAIRE");
            assertThat(db.sql("SELECT count(*) FROM access_audit").query(Integer.class).single()).isZero();
        } finally {
            db.sql("DROP TRIGGER fail_audit_test ON access_audit").update();
            db.sql("DROP FUNCTION fail_audit_test()").update();
        }
    }
    @Test void logout_invalidates_the_session() throws Exception {
        var browser=as("intervenant");
        assertThat(browser.call("POST","/api/auth/logout",null,true).statusCode()).isEqualTo(204);
        assertThat(browser.get("/api/auth/me").statusCode()).isEqualTo(401);
    }
}
