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
import java.util.List;
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
        db.sql("UPDATE training_session SET capacity=NULL").update();
        db.sql("UPDATE collaborator SET active=true").update();
        db.sql("DELETE FROM participation WHERE id NOT IN ('"+P1+"','"+P2+"','"+P3+"','"+P4+"')").update();
        db.sql("DELETE FROM collaborator WHERE id<>'30000000-0000-0000-0000-000000000001'").update();
        db.sql("DELETE FROM session_slot WHERE id NOT IN ('21000000-0000-0000-0000-000000000001','21000000-0000-0000-0000-000000000002','21000000-0000-0000-0000-000000000003','21000000-0000-0000-0000-000000000004')").update();
        db.sql("UPDATE session_slot SET starts_at='2020-01-01T09:00:00Z',ends_at='2020-01-01T10:00:00Z' WHERE session_id<>'"+S4+"'").update();
        db.sql("DELETE FROM session_instructor WHERE session_id='"+S1+"'").update();
        db.sql("INSERT INTO session_instructor VALUES ('"+S1+"','10000000-0000-0000-0000-000000000001')").update();
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

    @Test void audit_is_readable_by_management_and_denied_to_instructors() throws Exception {
        var admin=as("admin");
        assertThat(admin.put("/api/habilitations/comptes/gestionnaire/role","{\"role\":\"INTERVENANT\"}").statusCode()).isEqualTo(204);
        var response=admin.get("/api/audit?subjectType=COMPTE&subjectId=gestionnaire");
        assertThat(response.statusCode()).isEqualTo(200);
        assertThat(response.body()).contains("CHANGEMENT_ROLE","GESTIONNAIRE","INTERVENANT","admin","occurredAt");
        assertThat(as("intervenant").get("/api/audit").statusCode()).isEqualTo(403);
        assertThat(new Browser().get("/api/audit").statusCode()).isEqualTo(401);
    }

    @Test void planned_slot_changes_are_audited_and_rejected_changes_leave_no_success_event() throws Exception {
        var manager=as("gestionnaire");
        String path="/api/sessions/"+S1+"/creneaux/21000000-0000-0000-0000-000000000001";
        assertThat(manager.put(path,"{\"startsAt\":\"2020-01-01T10:00:00Z\",\"endsAt\":\"2020-01-01T11:00:00Z\"}").statusCode()).isEqualTo(204);
        var events=json.readTree(manager.get("/api/audit?sessionId="+S1).body()).get("items");
        assertThat(events.size()).isEqualTo(1);
        assertThat(events.get(0).get("before").get("startsAt").asString()).isEqualTo("2020-01-01T09:00:00Z");
        assertThat(events.get(0).get("after").get("endsAt").asString()).isEqualTo("2020-01-01T11:00:00Z");
        var conflict=manager.put(path,"{\"startsAt\":\"2020-01-01T09:30:00Z\",\"endsAt\":\"2020-01-01T10:30:00Z\"}");
        assertThat(conflict.statusCode()).isEqualTo(409);
        assertThat(conflict.body()).contains("confirmationRequired",S2);
        assertThat(json.readTree(manager.get("/api/audit?sessionId="+S1).body()).get("items").size()).isEqualTo(1);
        assertThat(manager.put(path,"{\"startsAt\":\"2020-01-01T09:30:00Z\",\"endsAt\":\"2020-01-01T10:30:00Z\",\"confirmConflicts\":true}").statusCode()).isEqualTo(204);
        assertThat(manager.put(path,"{\"startsAt\":\"2020-01-01T12:00:00Z\",\"endsAt\":\"2020-01-01T11:00:00Z\"}").statusCode()).isEqualTo(400);
        assertThat(manager.put("/api/sessions/"+S3+"/creneaux/21000000-0000-0000-0000-000000000003","{\"startsAt\":\"2020-01-01T12:00:00Z\",\"endsAt\":\"2020-01-01T13:00:00Z\"}").statusCode()).isEqualTo(409);
        assertThat(as("intervenant").put(path,"{\"startsAt\":\"2020-01-01T12:00:00Z\",\"endsAt\":\"2020-01-01T13:00:00Z\"}").statusCode()).isEqualTo(403);
        assertThat(json.readTree(manager.get("/api/audit?sessionId="+S1).body()).get("items").size()).isEqualTo(2);
    }

    @Test void replacement_preserves_old_and_new_assignments_and_changes_actual_scope() throws Exception {
        var manager=as("gestionnaire");
        var response=manager.put("/api/sessions/"+S1+"/intervenants","{\"instructorIds\":[\"10000000-0000-0000-0000-000000000002\"],\"confirmConflicts\":true}");
        assertThat(response.statusCode()).isEqualTo(204);
        var event=json.readTree(manager.get("/api/audit?subjectType=AFFECTATIONS&sessionId="+S1).body()).get("items").get(0);
        assertThat(event.get("before").toString()).contains("10000000-0000-0000-0000-000000000001");
        assertThat(event.get("after").toString()).contains("10000000-0000-0000-0000-000000000002");
        assertThat(as("intervenant").get(people(S1)).statusCode()).isEqualTo(403);
        assertThat(as("intervenant-b").get(people(S1)).statusCode()).isEqualTo(200);
    }

    @Test void withdrawal_and_reactivation_share_the_same_participation_and_can_be_paginated() throws Exception {
        var manager=as("gestionnaire");String path=people(S1)+"/"+P1+"/etat";
        assertThat(manager.put(path,"{\"state\":\"DESISTEE\"}").statusCode()).isEqualTo(204);
        assertThat(manager.put(path,"{\"state\":\"INSCRITE\",\"confirmConflicts\":true}").statusCode()).isEqualTo(204);
        var first=json.readTree(manager.get("/api/audit?subjectType=PARTICIPATION&subjectId="+P1+"&limit=1").body());
        assertThat(first.get("items").size()).isEqualTo(1);
        assertThat(first.get("items").get(0).get("action").asString()).isEqualTo("REACTIVATION_PARTICIPATION");
        assertThat(first.get("items").get(0).get("subjectId").asString()).isEqualTo(P1);
        var next=json.readTree(manager.get("/api/audit?subjectId="+P1+"&limit=1&beforeSequence="+first.get("nextCursor").asString()).body());
        assertThat(next.get("items").get(0).get("action").asString()).isEqualTo("DESISTEMENT");
        assertThat(next.get("items").get(0).get("subjectId").asString()).isEqualTo(P1);
        assertThat(next.get("nextCursor").isNull()).isTrue();
        assertThat(manager.get(people(S1)).body()).contains(P1,"INSCRITE");
        assertThat(manager.get("/api/audit?limit=101").statusCode()).isEqualTo(400);
        assertThat(manager.get("/api/audit?subjectType=SECRET").statusCode()).isEqualTo(400);
        assertThat(manager.get("/api/audit?beforeSequence=0").statusCode()).isEqualTo(400);
    }

    @Test void failed_audit_rolls_back_a_slot_change_and_leaves_no_event() throws Exception {
        var manager=as("gestionnaire");
        db.sql("CREATE FUNCTION fail_slot_audit_test() RETURNS trigger LANGUAGE plpgsql AS $$ BEGIN RAISE EXCEPTION 'audit unavailable'; END $$").update();
        db.sql("CREATE TRIGGER fail_slot_audit_test BEFORE INSERT ON access_audit FOR EACH ROW EXECUTE FUNCTION fail_slot_audit_test()").update();
        try {
            assertThat(manager.put("/api/sessions/"+S1+"/creneaux/21000000-0000-0000-0000-000000000001","{\"startsAt\":\"2020-01-01T10:00:00Z\",\"endsAt\":\"2020-01-01T11:00:00Z\"}").statusCode()).isEqualTo(500);
            var sessions=json.readTree(manager.get("/api/sessions").body());
            for(var session:sessions)if(session.get("id").asString().equals(S1)) assertThat(session.get("lastSlotEnd").asString()).isEqualTo("2020-01-01T10:00:00Z");
            assertThat(json.readTree(manager.get("/api/audit?sessionId="+S1).body()).get("items").size()).isZero();
        } finally {
            db.sql("DROP TRIGGER fail_slot_audit_test ON access_audit").update();db.sql("DROP FUNCTION fail_slot_audit_test()").update();
        }
    }

    @Test void concurrent_reactivations_cannot_take_the_same_last_place() throws Exception {
        var manager=as("gestionnaire");var other=as("admin");
        db.sql("UPDATE training_session SET capacity=1 WHERE id='"+S4+"'").update();
        db.sql("UPDATE participation SET state='DESISTEE' WHERE id='"+P4+"'").update();
        String extra="80000000-0000-0000-0000-000000000001";
        db.sql("INSERT INTO collaborator VALUES ('70000000-0000-0000-0000-000000000001','EXTRA-1','Second','Exemple',true)").update();
        db.sql("INSERT INTO participation VALUES ('"+extra+"','"+S4+"','70000000-0000-0000-0000-000000000001','DESISTEE')").update();
        var start=new java.util.concurrent.CountDownLatch(1);
        try(var pool=java.util.concurrent.Executors.newVirtualThreadPerTaskExecutor()) {
            var first=pool.submit(()->{start.await();return manager.put(people(S4)+"/"+P4+"/etat","{\"state\":\"INSCRITE\"}").statusCode();});
            var second=pool.submit(()->{start.await();return other.put(people(S4)+"/"+extra+"/etat","{\"state\":\"INSCRITE\"}").statusCode();});
            start.countDown();assertThat(List.of(first.get(10,java.util.concurrent.TimeUnit.SECONDS),second.get(10,java.util.concurrent.TimeUnit.SECONDS))).containsExactlyInAnyOrder(204,409);
        }
        assertThat(json.readTree(manager.get("/api/audit?sessionId="+S4).body()).get("items").size()).isEqualTo(1);
        assertThat(manager.get(people(S4)).body()).contains("INSCRITE","DESISTEE");
    }

    @Test void present_and_absent_participants_still_consume_capacity_on_reactivation() throws Exception {
        var manager=as("gestionnaire");
        db.sql("UPDATE training_session SET capacity=1 WHERE id='"+S4+"'").update();
        db.sql("INSERT INTO collaborator VALUES ('70000000-0000-0000-0000-000000000001','EXTRA-1','Second','Exemple',true)").update();
        String extra="80000000-0000-0000-0000-000000000001";
        db.sql("INSERT INTO participation VALUES ('"+extra+"','"+S4+"','70000000-0000-0000-0000-000000000001','DESISTEE')").update();
        for(String state:List.of("PRESENTE","ABSENTE")) {
            db.sql("UPDATE participation SET state=:state WHERE id='"+P4+"'").param("state",state).update();
            assertThat(manager.put(people(S4)+"/"+extra+"/etat","{\"state\":\"INSCRITE\"}").statusCode()).isEqualTo(409);
        }
        assertThat(json.readTree(manager.get("/api/audit?sessionId="+S4).body()).get("items").size()).isZero();
    }

    @Test void concurrent_slot_changes_revalidate_overlap_after_the_first_commit() throws Exception {
        var manager=as("gestionnaire");var admin=as("admin");
        String extra="22000000-0000-0000-0000-000000000001";
        db.sql("INSERT INTO session_slot VALUES ('"+extra+"','"+S1+"','2020-01-01T11:00:00Z','2020-01-01T12:00:00Z')").update();
        String body="{\"startsAt\":\"2020-01-01T10:00:00Z\",\"endsAt\":\"2020-01-01T11:00:00Z\"}";
        var start=new java.util.concurrent.CountDownLatch(1);
        try(var pool=java.util.concurrent.Executors.newVirtualThreadPerTaskExecutor()) {
            var first=pool.submit(()->{start.await();return manager.put("/api/sessions/"+S1+"/creneaux/21000000-0000-0000-0000-000000000001",body).statusCode();});
            var second=pool.submit(()->{start.await();return admin.put("/api/sessions/"+S1+"/creneaux/"+extra,body).statusCode();});
            start.countDown();assertThat(List.of(first.get(10,java.util.concurrent.TimeUnit.SECONDS),second.get(10,java.util.concurrent.TimeUnit.SECONDS))).containsExactlyInAnyOrder(204,409);
        }
        assertThat(json.readTree(manager.get("/api/audit?sessionId="+S1).body()).get("items").size()).isEqualTo(1);
    }

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
        assertThat(db.sql("SELECT count(*) FROM access_audit WHERE actor='admin' AND action='CORRECTION_PRESENCE' AND before_value->>'state'='PRESENTE' AND after_value->>'state'='ABSENTE'").query(Integer.class).single()).isEqualTo(1);
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
