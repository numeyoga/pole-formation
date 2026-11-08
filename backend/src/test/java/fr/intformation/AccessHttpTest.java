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
    @Autowired fr.intformation.referentiel.application.CompetencyAvailability competencyAvailability;
    @Autowired org.springframework.transaction.PlatformTransactionManager transactionManager;
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

    @Test void classifications_are_available_only_to_managers_for_reading_and_administrators_for_writing() throws Exception {
        String path="/api/referentiels/classifications";
        assertThat(as("gestionnaire").get(path).statusCode()).isEqualTo(200);
        assertThat(as("intervenant").get(path).statusCode()).isEqualTo(403);
        assertThat(new Browser().get(path).statusCode()).isEqualTo(401);
        String body="{\"code\":\"C-"+java.util.UUID.randomUUID()+"\",\"label\":\"Classification\",\"sortOrder\":0}";
        assertThat(as("gestionnaire").call("POST",path,body,true).statusCode()).isEqualTo(403);
        var admin=as("admin");
        assertThat(admin.call("POST",path,body,false).statusCode()).isEqualTo(403);
        assertThat(admin.call("POST",path,body,true).statusCode()).isEqualTo(201);
    }

    String classificationBody(String code,String label,int order,boolean active,long version) throws Exception {
        return json.writeValueAsString(java.util.Map.of("code",code,"label",label,"sortOrder",order,"active",active,"version",version));
    }
    @Test void classifications_preserve_historical_requirements_and_exclude_inactive_choices() throws Exception {
        var admin=as("admin");var manager=as("gestionnaire");String root="/api/referentiels/classifications";
        String code="HIST-"+java.util.UUID.randomUUID();
        var created=admin.call("POST",root,classificationBody(code,"Avant",3,true,0),true);
        assertThat(created.statusCode()).isEqualTo(201);var classification=json.readTree(created.body());
        String id=classification.get("id").asString(),path=root+"/"+id;
        var parent=competencyParent(manager);
        var competency=json.readTree(manager.call("POST","/api/referentiels/competences",competencyBody(parent.get("id").asString(),"CL-C-"+java.util.UUID.randomUUID(),"Compétence classification"),true).body());
        var profile=json.readTree(manager.call("POST",PROFILES,"{\"code\":\"CL-P-"+java.util.UUID.randomUUID()+"\",\"label\":\"Profil classification\"}",true).body());
        String requirements=PROFILES+"/"+profile.get("id").asString()+"/exigences";
        String body=json.writeValueAsString(java.util.Map.of("competencyId",competency.get("id").asString(),"classificationId",id));
        var requirement=manager.call("POST",requirements,body,true);assertThat(requirement.statusCode()).isEqualTo(201);
        String requirementId=json.readTree(requirement.body()).get("id").asString();
        assertThat(admin.put(path,classificationBody(code,"Après",1,false,0)).statusCode()).isEqualTo(204);
        var historical=json.readTree(manager.get(requirements).body()).get(0);
        assertThat(historical.get("id").asString()).isEqualTo(requirementId);
        assertThat(historical.get("classificationId").asString()).isEqualTo(id);
        assertThat(historical.get("classificationLabel").asString()).isEqualTo("Après");
        var anotherProfile=json.readTree(manager.call("POST",PROFILES,"{\"code\":\"CL-NEW-"+java.util.UUID.randomUUID()+"\",\"label\":\"Nouveau profil\"}",true).body());
        String newRequirements=PROFILES+"/"+anotherProfile.get("id").asString()+"/exigences";
        var refused=manager.call("POST",newRequirements,body,true);
        assertThat(refused.statusCode()).isEqualTo(409);assertThat(refused.body()).contains("Cette classification est désactivée.");
        assertThat(manager.get(root+"?activeOnly=true&size=100").body()).doesNotContain(id);
        assertThat(json.readTree(admin.get(path).body()).get("active").asBoolean()).isFalse();
        assertThat(admin.put(path,classificationBody(code,"Réactivée",0,true,1)).statusCode()).isEqualTo(204);
        assertThat(manager.get(root+"?activeOnly=true&size=100").body()).contains(id);
    }
    @Test void classifications_validate_fields_uniqueness_versions_and_mutation_permissions() throws Exception {
        var admin=as("admin");String root="/api/referentiels/classifications",code="VALID-"+java.util.UUID.randomUUID();
        var created=admin.call("POST",root,classificationBody(" "+code+" "," Libellé ",0,true,0),true);
        assertThat(created.statusCode()).isEqualTo(201);var item=json.readTree(created.body());String path=root+"/"+item.get("id").asString();
        assertThat(item.get("code").asString()).isEqualTo(code);assertThat(item.get("label").asString()).isEqualTo("Libellé");
        assertThat(admin.call("POST",root,classificationBody(code.toLowerCase(),"Doublon",0,true,0),true).statusCode()).isEqualTo(409);
        for(String invalid:List.of("{\"code\":\"X\",\"label\":\"X\",\"sortOrder\":0.5}","{\"label\":\"X\",\"sortOrder\":0}",classificationBody(" ","X",0,true,0),classificationBody("X".repeat(65),"X",0,true,0),classificationBody("X"," ",0,true,0),classificationBody("X","X".repeat(201),0,true,0),classificationBody("X","X",-1,true,0),"{\"code\":\"X\",\"label\":\"X\"}"))
            assertThat(admin.call("POST",root,invalid,true).statusCode()).isEqualTo(400);
        String update=classificationBody(code,"Modifiée",2,false,0);
        for(String user:List.of("gestionnaire","intervenant")){
            var browser=as(user);assertThat(browser.put(path,update).statusCode()).isEqualTo(403);
            assertThat(browser.call("POST",root,update,true).statusCode()).isEqualTo(403);
        }
        assertThat(admin.call("PUT",path,update,false).statusCode()).isEqualTo(403);
        assertThat(admin.put(path,update.replace(",\"version\":0","").replace("\"version\":0,","")).statusCode()).isEqualTo(400);
        assertThat(admin.put(path,update.replace("\"version\":0","\"version\":0.5")).statusCode()).isEqualTo(400);
        assertThat(admin.put(path,update.replace("\"version\":0","\"version\":9223372036854775808")).statusCode()).isEqualTo(400);
        assertThat(admin.put(path,update).statusCode()).isEqualTo(204);
        assertThat(admin.put(path,update).statusCode()).isEqualTo(409);
        assertThat(admin.call("POST",root,classificationBody(code.toLowerCase(),"Doublon inactif",0,true,0),true).statusCode()).isEqualTo(409);
        assertThat(admin.get(root+"?page=-1").statusCode()).isEqualTo(400);
        assertThat(admin.get(root+"?size=101").statusCode()).isEqualTo(400);
        assertThat(admin.get(root+"/"+java.util.UUID.randomUUID()).statusCode()).isEqualTo(404);
        assertThat(admin.put(path,"{\"label\":\"Renommage compatible\"}").statusCode()).isEqualTo(204);
        assertThat(json.readTree(admin.get(path).body()).get("version").asLong()).isEqualTo(2);
        assertThat(admin.put(path,classificationBody(code,"Édition périmée",2,false,1)).statusCode()).isEqualTo(409);
    }
    @Test void classification_concurrent_creates_have_one_winner_and_list_is_sorted_by_order_then_code() throws Exception {
        var admin=as("admin");String root="/api/referentiels/classifications",code="RACE-"+java.util.UUID.randomUUID();
        String body=classificationBody(code,"Course",0,true,0);
        try(var executor=java.util.concurrent.Executors.newVirtualThreadPerTaskExecutor()){
            var start=new java.util.concurrent.CountDownLatch(1);
            var first=executor.submit(()->{start.await();return admin.call("POST",root,body,true).statusCode();});
            var second=executor.submit(()->{start.await();return admin.call("POST",root,body,true).statusCode();});
            start.countDown();assertThat(List.of(first.get(),second.get())).containsExactlyInAnyOrder(201,409);
        }
        String prefix="ORDER-"+java.util.UUID.randomUUID();
        assertThat(admin.call("POST",root,classificationBody(prefix+"-B","B",2147483647,true,0),true).statusCode()).isEqualTo(201);
        assertThat(admin.call("POST",root,classificationBody(prefix+"-A","A",2147483647,true,0),true).statusCode()).isEqualTo(201);
        String result=admin.get(root+"?size=100").body();assertThat(result.indexOf(prefix+"-A")).isLessThan(result.indexOf(prefix+"-B"));
    }

    static final String PROFILES="/api/referentiels/profils-emploi";
    @Test void profiles_preserve_requirements_and_refuse_new_ones_after_deactivation() throws Exception {
        var manager=as("gestionnaire");var parent=competencyParent(manager);
        var competency=json.readTree(manager.call("POST","/api/referentiels/competences",competencyBody(parent.get("id").asString(),"PROF-C-"+java.util.UUID.randomUUID(),"Compétence profil"),true).body());
        var response=manager.call("POST",PROFILES,"{\"code\":\" P-"+java.util.UUID.randomUUID()+" \",\"label\":\" Profil initial \",\"description\":\" Description \"}",true);
        assertThat(response.statusCode()).isEqualTo(201);var profile=json.readTree(response.body());String path=PROFILES+"/"+profile.get("id").asString();
        assertThat(response.headers().firstValue("Location")).contains(path);
        assertThat(profile.get("label").asString()).isEqualTo("Profil initial");assertThat(profile.get("description").asString()).isEqualTo("Description");
        String requirement="{\"competencyId\":\""+competency.get("id").asString()+"\",\"classificationId\":\"60000000-0000-0000-0000-000000000001\"}";
        assertThat(manager.call("POST",path+"/exigences",requirement,true).statusCode()).isEqualTo(201);
        String history=manager.get(path+"/exigences").body();assertThat(json.readTree(history).size()).isEqualTo(1);
        assertThat(manager.put(path,"{\"code\":\""+profile.get("code").asString()+"\",\"label\":\"Profil renommé\",\"description\":\"Nouvelle description\",\"version\":0}").statusCode()).isEqualTo(204);
        assertThat(manager.get(path+"/exigences").body()).isEqualTo(history);
        assertThat(manager.call("POST",path+"/desactivation","{\"version\":0}",true).statusCode()).isEqualTo(409);
        assertThat(manager.call("POST",path+"/desactivation","{\"version\":1}",true).statusCode()).isEqualTo(204);
        assertThat(json.readTree(manager.get(path).body()).get("active").asBoolean()).isFalse();
        var newCompetency=json.readTree(manager.call("POST","/api/referentiels/competences",competencyBody(parent.get("id").asString(),"NEW-"+java.util.UUID.randomUUID(),"Nouvelle compétence du profil"),true).body());
        var rejected=manager.call("POST",path+"/exigences",requirement.replace(competency.get("id").asString(),newCompetency.get("id").asString()),true);
        assertThat(rejected.statusCode()).isEqualTo(409);assertThat(json.readTree(rejected.body()).get("detail").asString()).contains("profil d’emploi désactivé");
        assertThat(manager.get(path+"/exigences").body()).isEqualTo(history);
        assertThat(manager.put(path,"{\"code\":\""+profile.get("code").asString()+"\",\"label\":\"Historique renommé\",\"description\":\"\",\"version\":2}").statusCode()).isEqualTo(204);
        assertThat(manager.get(path+"/exigences").body()).isEqualTo(history);
    }
    @Test void profiles_enforce_permissions_csrf_versions_and_field_validation() throws Exception {
        var guest=new Browser();assertThat(guest.get(PROFILES).statusCode()).isEqualTo(401);
        var instructor=as("intervenant");var manager=as("gestionnaire");var admin=as("admin");
        String body="{\"code\":\"P-"+java.util.UUID.randomUUID()+"\",\"label\":\"Profil\"}";
        assertThat(instructor.get(PROFILES).statusCode()).isEqualTo(403);
        assertThat(instructor.call("POST",PROFILES,body,true).statusCode()).isEqualTo(403);
        assertThat(manager.call("POST",PROFILES,body,false).statusCode()).isEqualTo(403);
        var created=admin.call("POST",PROFILES,body,true);assertThat(created.statusCode()).isEqualTo(201);
        String path=PROFILES+"/"+json.readTree(created.body()).get("id").asString();
        for(String target:java.util.List.of(path,path+"/exigences"))assertThat(instructor.get(target).statusCode()).isEqualTo(403);
        assertThat(instructor.put(path,body).statusCode()).isEqualTo(403);
        assertThat(instructor.call("POST",path+"/desactivation","{\"version\":0}",true).statusCode()).isEqualTo(403);
        assertThat(instructor.call("POST",path+"/exigences","{}",true).statusCode()).isEqualTo(403);
        assertThat(manager.put(path,body).statusCode()).isEqualTo(400);
        assertThat(manager.call("POST",path+"/desactivation","{}",true).statusCode()).isEqualTo(400);
        var invalid=manager.call("POST",PROFILES,"{\"code\":\" \",\"label\":\"Profil\"}",true);
        assertThat(invalid.statusCode()).isEqualTo(400);assertThat(json.readTree(invalid.body()).get("fieldErrors").has("code")).isTrue();
        assertThat(manager.get(PROFILES+"?page=-1").statusCode()).isEqualTo(400);
        assertThat(manager.get(PROFILES+"?size=101").statusCode()).isEqualTo(400);
        assertThat(manager.get(PROFILES+"/"+java.util.UUID.randomUUID()).statusCode()).isEqualTo(404);
    }

    @Test void profiles_bound_fields_and_reject_competing_edits() throws Exception {
        var manager=as("gestionnaire");String code="BOUND-"+java.util.UUID.randomUUID();
        var created=manager.call("POST",PROFILES,json.writeValueAsString(java.util.Map.of("code",code,"label","L".repeat(200),"description","D".repeat(4000))),true);
        assertThat(created.statusCode()).isEqualTo(201);String path=PROFILES+"/"+json.readTree(created.body()).get("id").asString();
        for(var invalid:java.util.List.of(java.util.Map.of("code","X".repeat(65),"label","Valide"),java.util.Map.of("code",code,"label"," "),java.util.Map.of("code",code,"label","L".repeat(201)),java.util.Map.of("code",code,"label","Valide","description","D".repeat(4001)))){
            assertThat(manager.call("POST",PROFILES,json.writeValueAsString(invalid),true).statusCode()).isEqualTo(400);
        }
        String body=json.writeValueAsString(java.util.Map.of("code",code,"label","Concurrent","version",0));
        var other=as("gestionnaire");
        try(var executor=java.util.concurrent.Executors.newFixedThreadPool(2)){
            var first=executor.submit(()->manager.put(path,body).statusCode());var second=executor.submit(()->other.put(path,body).statusCode());
            assertThat(java.util.List.of(first.get(),second.get())).containsExactlyInAnyOrder(204,409);
        }
        assertThat(manager.put(path,"{\"label\":\"Sans code\",\"version\":1}").statusCode()).isEqualTo(400);
        assertThat(manager.put(path,"{\"code\":\"Valide\",\"label\":\"Valide\",\"version\":-1}").statusCode()).isEqualTo(400);
    }
    @Test void requirements_reject_inactive_references_duplicates_and_unknown_ids() throws Exception {
        var manager=as("gestionnaire");var parent=competencyParent(manager);
        var competency=json.readTree(manager.call("POST","/api/referentiels/competences",competencyBody(parent.get("id").asString(),"REQ-"+java.util.UUID.randomUUID(),"Compétence requise"),true).body());
        var profile=json.readTree(manager.call("POST",PROFILES,"{\"code\":\"REQ-"+java.util.UUID.randomUUID()+"\",\"label\":\"Profil exigence\"}",true).body());
        String path=PROFILES+"/"+profile.get("id").asString()+"/exigences";
        String classificationId=java.util.UUID.randomUUID().toString();
        db.sql("INSERT INTO requirement_classification(id,label,active) VALUES (:id,'Inactive',false)").param("id",java.util.UUID.fromString(classificationId)).update();
        String body=json.writeValueAsString(java.util.Map.of("competencyId",competency.get("id").asString(),"classificationId",classificationId));
        assertThat(manager.call("POST",path,body,true).statusCode()).isEqualTo(409);
        db.sql("UPDATE requirement_classification SET active=true WHERE id=:id").param("id",java.util.UUID.fromString(classificationId)).update();
        assertThat(manager.call("POST",path,body,true).statusCode()).isEqualTo(201);
        assertThat(manager.call("POST",path,body,true).statusCode()).isEqualTo(409);
        assertThat(manager.call("POST",path,"{}",true).statusCode()).isEqualTo(400);
        assertThat(manager.call("POST",path,body.replace(classificationId,java.util.UUID.randomUUID().toString()),true).statusCode()).isEqualTo(404);
        assertThat(manager.call("POST","/api/referentiels/competences/"+competency.get("id").asString()+"/desactivation","{\"version\":0}",true).statusCode()).isEqualTo(204);
        assertThat(manager.call("POST",path,body,true).statusCode()).isEqualTo(409);
        assertThat(json.readTree(manager.get(path).body()).size()).isEqualTo(1);
    }

    @Test void profile_codes_are_unique_without_case_even_after_deactivation_and_concurrent_creation() throws Exception {
        var manager=as("gestionnaire");String code="UNIQUE-"+java.util.UUID.randomUUID();
        String body=json.writeValueAsString(java.util.Map.of("code"," "+code+" ","label","Unique"));
        var profile=json.readTree(manager.call("POST",PROFILES,body,true).body());String path=PROFILES+"/"+profile.get("id").asString();
        assertThat(profile.get("code").asString()).isEqualTo(code);
        String duplicate=json.writeValueAsString(java.util.Map.of("code",code.toLowerCase(java.util.Locale.ROOT),"label","Doublon"));
        var conflict=manager.call("POST",PROFILES,duplicate,true);assertThat(conflict.statusCode()).isEqualTo(409);
        assertThat(json.readTree(conflict.body()).get("fieldErrors").has("code")).isTrue();
        assertThat(manager.call("POST",path+"/desactivation","{\"version\":0}",true).statusCode()).isEqualTo(204);
        assertThat(manager.call("POST",PROFILES,duplicate,true).statusCode()).isEqualTo(409);
        String otherCode="OTHER-"+java.util.UUID.randomUUID();
        var otherProfile=json.readTree(manager.call("POST",PROFILES,json.writeValueAsString(java.util.Map.of("code",otherCode,"label","Autre")),true).body());
        assertThat(manager.put(PROFILES+"/"+otherProfile.get("id").asString(),json.writeValueAsString(java.util.Map.of("code",code,"label","Conflit","version",0))).statusCode()).isEqualTo(409);
        assertThat(json.readTree(manager.get(PROFILES+"/"+otherProfile.get("id").asString()).body()).get("code").asString()).isEqualTo(otherCode);
        String raceBody=json.writeValueAsString(java.util.Map.of("code","RACE-"+java.util.UUID.randomUUID(),"label","Concurrent"));var other=as("gestionnaire");
        try(var executor=java.util.concurrent.Executors.newFixedThreadPool(2)){
            var first=executor.submit(()->manager.call("POST",PROFILES,raceBody,true).statusCode());var second=executor.submit(()->other.call("POST",PROFILES,raceBody,true).statusCode());
            assertThat(java.util.List.of(first.get(),second.get())).containsExactlyInAnyOrder(201,409);
        }
    }

    @Test void explorer_search_exposes_a_competency_path() throws Exception {
        var manager=as("gestionnaire");var parent=competencyParent(manager);String code="EXP-"+java.util.UUID.randomUUID();
        var created=manager.call("POST","/api/referentiels/competences",competencyBody(parent.get("id").asString(),code,"Compétence à retrouver"),true);
        assertThat(created.statusCode()).isEqualTo(201);var competency=json.readTree(created.body());
        var response=manager.get("/api/referentiels/exploration/competences?q="+code.toLowerCase(java.util.Locale.ROOT));
        assertThat(response.statusCode()).isEqualTo(200);var result=json.readTree(response.body());
        assertThat(result.get("total").asLong()).isEqualTo(1);var item=result.get("items").get(0);
        assertThat(item.get("competency").get("id")).isEqualTo(competency.get("id"));
        assertThat(item.get("competency").get("label").asString()).isEqualTo("Compétence à retrouver");
        assertThat(item.get("subdomain").get("id")).isEqualTo(parent.get("id"));
        assertThat(item.get("domain").get("id")).isEqualTo(parent.get("domainId"));
    }

    @Test void explorer_search_matches_literal_code_and_label_and_paginates() throws Exception {
        var manager=as("gestionnaire");var parent=competencyParent(manager);String parentId=parent.get("id").asString();
        String tag="EXP-LITERAL-"+java.util.UUID.randomUUID();String label="Libellé unique "+java.util.UUID.randomUUID();
        var first=manager.call("POST","/api/referentiels/competences",competencyBody(parentId,tag+"%_literal",label+" Alpha"),true);
        assertThat(first.statusCode()).isEqualTo(201);
        assertThat(manager.call("POST","/api/referentiels/competences",competencyBody(parentId,tag+"XYliteral",label+" Zulu"),true).statusCode()).isEqualTo(201);
        String path="/api/referentiels/exploration/competences?q=";
        var literal=json.readTree(manager.get(path+java.net.URLEncoder.encode("  "+tag.toUpperCase(java.util.Locale.ROOT)+"%_literal  ",java.nio.charset.StandardCharsets.UTF_8)).body());
        assertThat(literal.get("total").asLong()).isEqualTo(1);assertThat(literal.get("items").get(0).get("competency").get("id")).isEqualTo(json.readTree(first.body()).get("id"));
        String query=path+java.net.URLEncoder.encode(label,java.nio.charset.StandardCharsets.UTF_8)+"&size=1";
        var pageOne=json.readTree(manager.get(query).body());assertThat(pageOne.get("total").asLong()).isEqualTo(2);assertThat(pageOne.get("items").size()).isEqualTo(1);
        assertThat(pageOne.get("items").get(0).get("competency").get("label").asString()).isEqualTo(label+" Alpha");
        var pageTwo=json.readTree(manager.get(query+"&page=1").body());assertThat(pageTwo.get("items").get(0).get("competency").get("label").asString()).isEqualTo(label+" Zulu");
        assertThat(json.readTree(manager.get(query+"&page=2").body()).get("items").isEmpty()).isTrue();
        assertThat(json.readTree(manager.get(path+"no-such-"+tag).body()).get("total").asLong()).isZero();
        assertThat(json.readTree(manager.get(path+java.net.URLEncoder.encode("' OR 1=1 --",java.nio.charset.StandardCharsets.UTF_8)).body()).get("total").asLong()).isZero();
    }

    @Test void explorer_search_keeps_inactive_competencies_and_the_full_historical_path() throws Exception {
        var manager=as("gestionnaire");String code="HIST-EXP-"+java.util.UUID.randomUUID();
        var domain=json.readTree(manager.call("POST","/api/referentiels/domaines",json.writeValueAsString(java.util.Map.of("code",code,"label","Domaine historique exploration")),true).body());
        var parent=json.readTree(manager.call("POST","/api/referentiels/sous-domaines",json.writeValueAsString(java.util.Map.of("domainId",domain.get("id").asString(),"code",code,"label","Sous-domaine historique exploration")),true).body());
        var child=json.readTree(manager.call("POST","/api/referentiels/competences",competencyBody(parent.get("id").asString(),code,"Compétence historique exploration"),true).body());
        for(String resource:List.of("/api/referentiels/competences/"+child.get("id").asString(),"/api/referentiels/sous-domaines/"+parent.get("id").asString(),"/api/referentiels/domaines/"+domain.get("id").asString()))
            assertThat(manager.call("POST",resource+"/desactivation","{\"version\":0}",true).statusCode()).isEqualTo(204);
        var response=manager.get("/api/referentiels/exploration/competences?q="+code);assertThat(response.statusCode()).isEqualTo(200);
        var result=json.readTree(response.body());assertThat(result.get("total").asLong()).isEqualTo(1);var item=result.get("items").get(0);
        assertThat(item.get("competency").get("id")).isEqualTo(child.get("id"));assertThat(item.get("competency").get("label").asString()).isEqualTo("Compétence historique exploration");
        assertThat(item.get("domain").get("id")).isEqualTo(domain.get("id"));assertThat(item.get("subdomain").get("id")).isEqualTo(parent.get("id"));
        for(String level:List.of("domain","subdomain","competency"))assertThat(item.get(level).get("active").asBoolean()).as(level).isFalse();
    }

    @Test void explorer_search_enforces_permissions_revocation_and_input_limits() throws Exception {
        String path="/api/referentiels/exploration/competences";
        assertThat(new Browser().get(path).statusCode()).isEqualTo(401);assertThat(as("intervenant").get(path).statusCode()).isEqualTo(403);assertThat(as("admin").get(path).statusCode()).isEqualTo(200);
        var manager=as("gestionnaire");
        for(String query:List.of("?page=-1","?size=0","?size=101","?page=invalide","?q="+"x".repeat(201)))assertThat(manager.get(path+query).statusCode()).as(query).isEqualTo(400);
        assertThat(manager.get(path+"?q="+"x".repeat(200)).statusCode()).isEqualTo(200);
        assertThat(manager.get(path+"?page=2147483647&size=100").statusCode()).isEqualTo(200);
        db.sql("UPDATE app_account SET role='INTERVENANT' WHERE username='gestionnaire'").update();assertThat(manager.get(path).statusCode()).isEqualTo(403);
    }

    @Test void manager_can_create_a_competency_under_one_active_subdomain() throws Exception {
        var manager=as("gestionnaire");String code="COMP-"+java.util.UUID.randomUUID();
        var parent=json.readTree(manager.call("POST",DOMAIN+"/sous-domaines",json.writeValueAsString(java.util.Map.of("label","Parent compétence")),true).body());
        String parentId=parent.get("id").asString();
        var created=manager.call("POST","/api/referentiels/competences",json.writeValueAsString(java.util.Map.of("subdomainId",parentId,"code"," "+code+" ","label"," Compétence de test ")),true);
        assertThat(created.statusCode()).isEqualTo(201);
        var competency=json.readTree(created.body());
        assertThat(competency.get("subdomainId").asString()).isEqualTo(parentId);
        assertThat(competency.get("code").asString()).isEqualTo(code);
        assertThat(competency.get("label").asString()).isEqualTo("Compétence de test");
        assertThat(competency.get("active").asBoolean()).isTrue();
        assertThat(manager.get("/api/referentiels/competences/"+competency.get("id").asString()).statusCode()).isEqualTo(200);
    }

    JsonNode competencyParent(Browser manager) throws Exception {
        var response=manager.call("POST",DOMAIN+"/sous-domaines",json.writeValueAsString(java.util.Map.of("label","Parent compétence")),true);
        assertThat(response.statusCode()).isEqualTo(201);return json.readTree(response.body());
    }
    String competencyBody(String parent,String code,String label) throws Exception {return json.writeValueAsString(java.util.Map.of("subdomainId",parent,"code",code,"label",label));}

    @Test void competency_edit_and_deactivation_preserve_identity_parent_and_legacy_history() throws Exception {
        var manager=as("gestionnaire");var parent=competencyParent(manager);String parentId=parent.get("id").asString();
        String path="/api/referentiels/competences",code="EDIT-COMP-"+java.util.UUID.randomUUID();
        var response=manager.call("POST",path,competencyBody(parentId,code,"Avant"),true);assertThat(response.statusCode()).isEqualTo(201);
        var child=json.readTree(response.body());String childPath=path+"/"+child.get("id").asString();assertThat(response.headers().firstValue("Location")).contains(childPath);
        String edit=json.writeValueAsString(java.util.Map.of("code",code+"-B","label","Après","version",0));
        assertThat(manager.put(childPath,edit).statusCode()).isEqualTo(204);
        var changed=json.readTree(manager.get(childPath).body());assertThat(changed.get("version").asLong()).isEqualTo(1);
        assertThat(changed.get("id")).isEqualTo(child.get("id"));assertThat(changed.get("subdomainId").asString()).isEqualTo(parentId);
        assertThat(changed.get("code").asString()).isEqualTo(code+"-B");assertThat(changed.get("label").asString()).isEqualTo("Après");
        assertThat(manager.put(childPath,edit).statusCode()).isEqualTo(409);
        var other=competencyParent(manager);
        assertThat(manager.put(childPath,json.writeValueAsString(java.util.Map.of("subdomainId",other.get("id").asString(),"code",code+"-B","label","Déplacement","version",1))).statusCode()).isEqualTo(409);
        assertThat(manager.call("POST",childPath+"/desactivation","{\"version\":0}",true).statusCode()).isEqualTo(409);
        assertThat(manager.call("POST",childPath+"/desactivation","{\"version\":1}",true).statusCode()).isEqualTo(204);
        var history=json.readTree(manager.get(childPath).body());assertThat(history.get("active").asBoolean()).isFalse();assertThat(history.get("subdomainId").asString()).isEqualTo(parentId);
        var children=json.readTree(manager.get("/api/referentiels/sous-domaines/"+parentId+"/competences").body());
        assertThat(children.size()).isEqualTo(1);assertThat(children.get(0).get("id")).isEqualTo(child.get("id"));assertThat(children.get(0).get("active").asBoolean()).isFalse();
        var duplicate=manager.call("POST",path,competencyBody(other.get("id").asString(),(code+"-B").toLowerCase(java.util.Locale.ROOT),"Doublon"),true);
        assertThat(duplicate.statusCode()).isEqualTo(409);assertThat(duplicate.body()).contains("fieldErrors","code");
        assertThat(manager.get(childPath).body()).contains("Après");
    }

    @Test void competency_fields_versions_and_inactive_parents_are_checked() throws Exception {
        var manager=as("gestionnaire");var parent=competencyParent(manager);String id=parent.get("id").asString(),path="/api/referentiels/competences";
        String code="FIELDS-COMP-"+java.util.UUID.randomUUID();
        for(String body:List.of(competencyBody(id," ","Valide"),competencyBody(id,"X".repeat(65),"Valide"),competencyBody(id,code," "),competencyBody(id,code,"X".repeat(201)),"{}")){
            var invalid=manager.call("POST",path,body,true);assertThat(invalid.statusCode()).isEqualTo(400);assertThat(invalid.body()).contains("fieldErrors");
        }
        var response=manager.call("POST",path,competencyBody(id,"X".repeat(64),"X".repeat(200)),true);assertThat(response.statusCode()).isEqualTo(201);
        String child=path+"/"+json.readTree(response.body()).get("id").asString();
        for(var fields:List.of(java.util.Map.of("code",code,"label","Valide"),java.util.Map.of("code",code,"label","Valide","version",-1)))assertThat(manager.put(child,json.writeValueAsString(fields)).statusCode()).isEqualTo(400);
        assertThat(manager.call("POST",child+"/desactivation","{}",true).statusCode()).isEqualTo(400);
        assertThat(manager.call("POST","/api/referentiels/sous-domaines/"+id+"/desactivation","{\"version\":0}",true).statusCode()).isEqualTo(204);
        assertThat(manager.call("POST",path,competencyBody(id,code,"Interdit"),true).statusCode()).isEqualTo(409);
        assertThat(manager.get(child).statusCode()).isEqualTo(200);
        var choices=json.readTree(manager.get(path+"/parents").body());boolean found=false;
        for(var choice:choices)if(choice.get("id").asString().equals(id)){found=true;assertThat(choice.get("selectableForCreation").asBoolean()).isFalse();}assertThat(found).isTrue();
        assertThat(manager.call("POST",path,competencyBody(java.util.UUID.randomUUID().toString(),code,"Inconnu"),true).statusCode()).isEqualTo(404);
        assertThat(manager.get(path+"/"+java.util.UUID.randomUUID()).statusCode()).isEqualTo(404);
    }

    @Test void competency_catalog_paginates_and_filters_while_retaining_inactive_parents() throws Exception {
        var manager=as("gestionnaire");var parent=competencyParent(manager);String id=parent.get("id").asString(),path="/api/referentiels/competences";
        String code="LIST-COMP-"+java.util.UUID.randomUUID();
        assertThat(manager.call("POST",path,competencyBody(id,code+"-Z","Zulu"),true).statusCode()).isEqualTo(201);
        assertThat(manager.call("POST",path,competencyBody(id,code+"-A","Alpha"),true).statusCode()).isEqualTo(201);
        String query=path+"?subdomainId="+id+"&size=1";var first=json.readTree(manager.get(query).body());
        assertThat(first.get("total").asLong()).isEqualTo(2);assertThat(first.get("items").size()).isEqualTo(1);
        assertThat(first.get("items").get(0).get("label").asString()).isEqualTo("Alpha");
        assertThat(first.get("items").get(0).get("subdomainId").asString()).isEqualTo(id);
        assertThat(first.get("items").get(0).get("subdomainCode")).isEqualTo(parent.get("code"));
        var second=json.readTree(manager.get(query+"&page=1").body());assertThat(second.get("items").get(0).get("label").asString()).isEqualTo("Zulu");
        assertThat(json.readTree(manager.get(query+"&page=2").body()).get("items").isEmpty()).isTrue();
        assertThat(manager.call("POST","/api/referentiels/sous-domaines/"+id+"/desactivation","{\"version\":0}",true).statusCode()).isEqualTo(204);
        var history=json.readTree(manager.get(query).body());assertThat(history.get("items").get(0).get("subdomainActive").asBoolean()).isFalse();
        assertThat(json.readTree(manager.get(path+"?subdomainId="+java.util.UUID.randomUUID()).body()).get("total").asLong()).isZero();
        for(String suffix:List.of("?page=-1","?size=0","?size=101","?subdomainId=invalide"))assertThat(manager.get(path+suffix).statusCode()).as(suffix).isEqualTo(400);
        assertThat(manager.get(path+"?page=2147483647&size=100").statusCode()).isEqualTo(200);
    }

    @Test void competency_api_enforces_permissions_csrf_and_immediate_revocation() throws Exception {
        var manager=as("gestionnaire");var instructor=as("intervenant");var parent=competencyParent(manager);
        String path="/api/referentiels/competences",body=competencyBody(parent.get("id").asString(),"AUTH-COMP-"+java.util.UUID.randomUUID(),"Sécurité");
        var created=manager.call("POST",path,body,true);assertThat(created.statusCode()).isEqualTo(201);String child=path+"/"+json.readTree(created.body()).get("id").asString();
        assertThat(as("admin").get(path).statusCode()).isEqualTo(200);
        for(String resource:List.of(path,path+"/parents",child)){
            assertThat(new Browser().get(resource).statusCode()).isEqualTo(401);assertThat(instructor.get(resource).statusCode()).isEqualTo(403);
        }
        for(String resource:List.of(path,child+"/desactivation")){
            assertThat(instructor.call("POST",resource,body,true).statusCode()).isEqualTo(403);assertThat(manager.call("POST",resource,body,false).statusCode()).isEqualTo(403);
        }
        assertThat(instructor.put(child,body).statusCode()).isEqualTo(403);assertThat(manager.call("PUT",child,body,false).statusCode()).isEqualTo(403);
        db.sql("UPDATE app_account SET role='INTERVENANT' WHERE username='gestionnaire'").update();
        assertThat(manager.get(path).statusCode()).isEqualTo(403);assertThat(manager.call("POST",path,body,true).statusCode()).isEqualTo(403);
        assertThat(manager.put(child,body).statusCode()).isEqualTo(403);assertThat(manager.call("POST",child+"/desactivation","{\"version\":0}",true).statusCode()).isEqualTo(403);
    }

    @Test void association_boundary_rejects_inactive_competencies_without_losing_history() throws Exception {
        var manager=as("gestionnaire");var parent=competencyParent(manager);String path="/api/referentiels/competences";
        var created=manager.call("POST",path,competencyBody(parent.get("id").asString(),"ASSOC-"+java.util.UUID.randomUUID(),"Historique"),true);
        assertThat(created.statusCode()).isEqualTo(201);var child=json.readTree(created.body());var id=java.util.UUID.fromString(child.get("id").asString());
        var transactions=new org.springframework.transaction.support.TransactionTemplate(transactionManager);
        assertThatCode(()->transactions.executeWithoutResult(status->competencyAvailability.requireActive(id))).doesNotThrowAnyException();
        assertThat(manager.call("POST",path+"/"+id+"/desactivation","{\"version\":0}",true).statusCode()).isEqualTo(204);
        assertThatThrownBy(()->transactions.executeWithoutResult(status->competencyAvailability.requireActive(id)))
            .isInstanceOf(fr.intformation.habilitations.domain.AccessPolicy.Conflict.class).hasMessageContaining("désactivée");
        var history=json.readTree(manager.get(path+"/"+id).body());assertThat(history.get("label").asString()).isEqualTo("Historique");assertThat(history.get("subdomainId")).isEqualTo(parent.get("id"));
        assertThatThrownBy(()->transactions.executeWithoutResult(status->competencyAvailability.requireActive(java.util.UUID.randomUUID())))
            .isInstanceOf(fr.intformation.habilitations.application.AccessService.NotFound.class);
    }

    @Test void concurrent_competency_creations_cannot_duplicate_a_code_across_parents() throws Exception {
        var manager=as("gestionnaire");var admin=as("admin");var parent=competencyParent(manager);var other=competencyParent(manager);
        String code="RACE-COMP-"+java.util.UUID.randomUUID();String firstBody=competencyBody(parent.get("id").asString(),code,"Première"),secondBody=competencyBody(other.get("id").asString(),code.toLowerCase(java.util.Locale.ROOT),"Seconde");
        var start=new java.util.concurrent.CountDownLatch(1);
        try(var pool=java.util.concurrent.Executors.newVirtualThreadPerTaskExecutor()){
            var first=pool.submit(()->{start.await();return manager.call("POST","/api/referentiels/competences",firstBody,true).statusCode();});
            var second=pool.submit(()->{start.await();return admin.call("POST","/api/referentiels/competences",secondBody,true).statusCode();});
            start.countDown();assertThat(List.of(first.get(10,java.util.concurrent.TimeUnit.SECONDS),second.get(10,java.util.concurrent.TimeUnit.SECONDS))).containsExactlyInAnyOrder(201,409);
        }
    }

    @Test void manager_can_create_and_read_a_domain() throws Exception {
        var manager=as("gestionnaire");
        String code="DOM-"+java.util.UUID.randomUUID();
        var created=manager.call("POST","/api/referentiels/domaines","{\"code\":\" "+code+" \",\"label\":\" Domaine de test \"}",true);
        assertThat(created.statusCode()).isEqualTo(201);
        var domain=json.readTree(created.body());
        assertThat(domain.get("code").asString()).isEqualTo(code);
        assertThat(domain.get("label").asString()).isEqualTo("Domaine de test");
        assertThat(domain.get("active").asBoolean()).isTrue();
        assertThat(manager.get("/api/referentiels/domaines/"+domain.get("id").asString()).statusCode()).isEqualTo(200);
    }

    @Test void manager_can_list_subdomains_with_their_parent() throws Exception {
        var manager=as("gestionnaire");
        String code="CATALOG-"+java.util.UUID.randomUUID();
        var created=manager.call("POST","/api/referentiels/domaines","{\"code\":\""+code+"\",\"label\":\"Parent du catalogue\"}",true);
        assertThat(created.statusCode()).isEqualTo(201);
        var domain=json.readTree(created.body());String id=domain.get("id").asString();
        String path="/api/referentiels/domaines/"+id;
        for(String label:List.of("Zulu","Alpha"))assertThat(manager.call("POST",path+"/sous-domaines","{\"label\":\""+label+"\"}",true).statusCode()).isEqualTo(201);
        String query="/api/referentiels/sous-domaines?domainId="+id+"&size=1";
        var response=manager.get(query);
        assertThat(response.statusCode()).isEqualTo(200);
        var first=json.readTree(response.body());assertThat(first.get("total").asLong()).isEqualTo(2);
        assertThat(first.get("items").size()).isEqualTo(1);
        var item=first.get("items").get(0);
        assertThat(item.get("label").asString()).isEqualTo("Alpha");
        assertThat(item.get("domainId").asString()).isEqualTo(id);
        assertThat(item.get("domainCode").asString()).isEqualTo(code);
        assertThat(item.get("domainLabel").asString()).isEqualTo("Parent du catalogue");
        assertThat(item.get("domainActive").asBoolean()).isTrue();
        var second=json.readTree(manager.get(query+"&page=1").body());
        assertThat(second.get("items").get(0).get("label").asString()).isEqualTo("Zulu");
        assertThat(second.get("page").asInt()).isEqualTo(1);
        assertThat(json.readTree(manager.get(query+"&page=2").body()).get("items").isEmpty()).isTrue();
        assertThat(manager.call("POST",path+"/desactivation","{\"version\":"+domain.get("version").asLong()+"}",true).statusCode()).isEqualTo(204);
        var history=json.readTree(manager.get(query).body());
        assertThat(history.get("total").asLong()).isEqualTo(2);
        assertThat(history.get("items").get(0).get("id")).isEqualTo(item.get("id"));
        assertThat(history.get("items").get(0).get("domainActive").asBoolean()).isFalse();
        assertThat(json.readTree(manager.get("/api/referentiels/sous-domaines?domainId="+java.util.UUID.randomUUID()).body()).get("total").asLong()).isZero();
    }

    @Test void subdomain_catalog_enforces_permissions_and_query_limits() throws Exception {
        String path="/api/referentiels/sous-domaines";
        assertThat(new Browser().get(path).statusCode()).isEqualTo(401);
        assertThat(as("intervenant").get(path).statusCode()).isEqualTo(403);
        assertThat(as("admin").get(path).statusCode()).isEqualTo(200);
        var manager=as("gestionnaire");
        for(String query:List.of("?page=-1","?size=0","?size=101","?domainId=invalide"))
            assertThat(manager.get(path+query).statusCode()).as(query).isEqualTo(400);
        assertThat(manager.get(path+"?page=2147483647&size=100").statusCode()).isEqualTo(200);
        db.sql("UPDATE app_account SET role='INTERVENANT' WHERE username='gestionnaire'").update();
        assertThat(manager.get(path).statusCode()).isEqualTo(403);
    }

    @Test void manager_can_create_edit_and_deactivate_a_subdomain_without_losing_competencies() throws Exception {
        var manager=as("gestionnaire");String code="SUB-"+java.util.UUID.randomUUID();
        var parentResponse=manager.call("POST","/api/referentiels/domaines","{\"code\":\""+code+"\",\"label\":\"Parent\"}",true);
        assertThat(parentResponse.statusCode()).isEqualTo(201);var parent=json.readTree(parentResponse.body());
        String parentId=parent.get("id").asString();String path="/api/referentiels/sous-domaines";
        var response=manager.call("POST",path,"{\"domainId\":\""+parentId+"\",\"code\":\" "+code+" \",\"label\":\" Prévention \"}",true);
        assertThat(response.statusCode()).isEqualTo(201);var child=json.readTree(response.body());String childPath=path+"/"+child.get("id").asString();
        assertThat(response.headers().firstValue("Location")).contains(childPath);
        assertThat(child.get("code").asString()).isEqualTo(code);assertThat(child.get("label").asString()).isEqualTo("Prévention");assertThat(child.get("domainId").asString()).isEqualTo(parentId);
        var competency=manager.call("POST",childPath+"/competences","{\"label\":\"Compétence historique\"}",true);
        assertThat(competency.statusCode()).isEqualTo(201);String competencyId=json.readTree(competency.body()).get("id").asString();
        assertThat(manager.put(childPath,"{\"code\":\""+code+"-B\",\"label\":\"Prévention modifiée\",\"version\":0}").statusCode()).isEqualTo(204);
        assertThat(manager.put(childPath,"{\"code\":\""+code+"-C\",\"label\":\"Écrasement\",\"version\":0}").statusCode()).isEqualTo(409);
        var edited=json.readTree(manager.get(childPath).body());assertThat(edited.get("id")).isEqualTo(child.get("id"));assertThat(edited.get("domainId").asString()).isEqualTo(parentId);
        assertThat(edited.get("label").asString()).isEqualTo("Prévention modifiée");
        var other=json.readTree(manager.call("POST","/api/referentiels/domaines","{\"code\":\"OTHER-"+code+"\",\"label\":\"Autre parent\"}",true).body());
        String change="{\"domainId\":\""+other.get("id").asString()+"\",\"code\":\""+code+"-B\",\"label\":\"Déplacement\",\"version\":"+edited.get("version").asLong()+"}";
        assertThat(manager.put(childPath,change).statusCode()).isEqualTo(409);
        assertThat(manager.call("POST",childPath+"/desactivation","{\"version\":0}",true).statusCode()).isEqualTo(409);
        assertThat(manager.call("POST",childPath+"/desactivation","{\"version\":"+edited.get("version").asLong()+"}",true).statusCode()).isEqualTo(204);
        assertThat(json.readTree(manager.get(childPath).body()).get("active").asBoolean()).isFalse();
        var history=json.readTree(manager.get(childPath+"/competences").body());assertThat(history.size()).isEqualTo(1);assertThat(history.get(0).get("id").asString()).isEqualTo(competencyId);
        assertThat(manager.call("POST",childPath+"/competences","{\"label\":\"Nouveau\"}",true).statusCode()).isEqualTo(409);
        assertThat(manager.call("POST",path,"{\"domainId\":\""+other.get("id").asString()+"\",\"code\":\""+(code+"-B").toLowerCase(java.util.Locale.ROOT)+"\",\"label\":\"Doublon\"}",true).statusCode()).isEqualTo(409);
    }

    @Test void subdomains_validate_fields_versions_and_active_parents() throws Exception {
        var manager=as("gestionnaire");String code="FIELDS-"+java.util.UUID.randomUUID();String path="/api/referentiels/sous-domaines";
        var parent=json.readTree(manager.call("POST","/api/referentiels/domaines",json.writeValueAsString(java.util.Map.of("code",code,"label","Parent")),true).body());
        String parentId=parent.get("id").asString();
        for(var fields:List.of(java.util.Map.of("domainId",parentId,"code"," ","label","Valide"),java.util.Map.of("domainId",parentId,"code","X".repeat(65),"label","Valide"),java.util.Map.of("domainId",parentId,"code",code,"label"," "),java.util.Map.of("domainId",parentId,"code",code,"label","X".repeat(201)),java.util.Map.of("code",code,"label","Sans parent"))){
            var invalid=manager.call("POST",path,json.writeValueAsString(fields),true);assertThat(invalid.statusCode()).isEqualTo(400);assertThat(invalid.body()).contains("fieldErrors");
        }
        String body=json.writeValueAsString(java.util.Map.of("domainId",parentId,"code",code,"label","Valide"));
        var response=manager.call("POST",path,body,true);assertThat(response.statusCode()).isEqualTo(201);var child=json.readTree(response.body());String childPath=path+"/"+child.get("id").asString();
        for(String version:List.of(""," ,\"version\":-1"))assertThat(manager.put(childPath,"{\"code\":\""+code+"\",\"label\":\"Valide\""+version+"}").statusCode()).isEqualTo(400);
        assertThat(manager.call("POST",childPath+"/desactivation","{}",true).statusCode()).isEqualTo(400);
        assertThat(manager.call("POST",childPath+"/competences","{\"label\":\" \"}",true).statusCode()).isEqualTo(400);
        assertThat(manager.call("POST","/api/referentiels/domaines/"+parentId+"/desactivation","{\"version\":"+parent.get("version").asLong()+"}",true).statusCode()).isEqualTo(204);
        assertThat(manager.call("POST",path,body,true).statusCode()).isEqualTo(409);
        var choices=json.readTree(manager.get(path+"/parents").body());
        boolean found=false;for(var choice:choices)if(choice.get("id").asString().equals(parentId)){found=true;assertThat(choice.get("selectableForCreation").asBoolean()).isFalse();}
        assertThat(found).isTrue();
        assertThat(manager.get(path+"/"+java.util.UUID.randomUUID()).statusCode()).isEqualTo(404);
        assertThat(manager.call("POST",path,body.replace(parentId,java.util.UUID.randomUUID().toString()),true).statusCode()).isEqualTo(404);
    }

    @Test void subdomain_writes_and_history_enforce_permissions_and_csrf() throws Exception {
        var manager=as("gestionnaire");String code="AUTH-SUB-"+java.util.UUID.randomUUID();String path="/api/referentiels/sous-domaines";
        var parent=json.readTree(manager.call("POST","/api/referentiels/domaines",json.writeValueAsString(java.util.Map.of("code",code,"label","Parent")),true).body());String parentId=parent.get("id").asString();
        String body=json.writeValueAsString(java.util.Map.of("domainId",parentId,"code",code,"label","Sous-domaine"));
        var response=manager.call("POST",path,body,true);assertThat(response.statusCode()).isEqualTo(201);String childPath=path+"/"+json.readTree(response.body()).get("id").asString();
        var instructor=as("intervenant");
        for(String resource:List.of(path+"/parents",childPath,childPath+"/competences","/api/referentiels/domaines/"+parentId+"/sous-domaines"))assertThat(instructor.get(resource).statusCode()).isEqualTo(403);
        for(String resource:List.of(path,childPath+"/desactivation",childPath+"/competences","/api/referentiels/domaines/"+parentId+"/sous-domaines")){
            assertThat(instructor.call("POST",resource,body,true).statusCode()).isEqualTo(403);
            assertThat(manager.call("POST",resource,body,false).statusCode()).isEqualTo(403);
        }
        assertThat(instructor.put(childPath,body).statusCode()).isEqualTo(403);
        assertThat(manager.call("PUT",childPath,body,false).statusCode()).isEqualTo(403);
        assertThat(new Browser().get(childPath).statusCode()).isEqualTo(401);
    }

    @Test void concurrent_subdomain_creations_cannot_duplicate_a_code() throws Exception {
        var manager=as("gestionnaire");var admin=as("admin");String code="RACE-SUB-"+java.util.UUID.randomUUID();
        var parent=json.readTree(manager.call("POST","/api/referentiels/domaines",json.writeValueAsString(java.util.Map.of("code",code,"label","Parent")),true).body());
        String body=json.writeValueAsString(java.util.Map.of("domainId",parent.get("id").asString(),"code",code,"label","Sous-domaine"));var start=new java.util.concurrent.CountDownLatch(1);
        try(var pool=java.util.concurrent.Executors.newVirtualThreadPerTaskExecutor()){
            var first=pool.submit(()->{start.await();return manager.call("POST","/api/referentiels/sous-domaines",body,true).statusCode();});
            var second=pool.submit(()->{start.await();return admin.call("POST","/api/referentiels/sous-domaines",body.replace(code,code.toLowerCase(java.util.Locale.ROOT)),true).statusCode();});
            start.countDown();assertThat(List.of(first.get(10,java.util.concurrent.TimeUnit.SECONDS),second.get(10,java.util.concurrent.TimeUnit.SECONDS))).containsExactlyInAnyOrder(201,409);
        }
    }

    @Test void domain_codes_are_unique_ignoring_case_and_remain_reserved_after_deactivation() throws Exception {
        var manager=as("gestionnaire");String code="UNIQUE-"+java.util.UUID.randomUUID();
        var created=manager.call("POST","/api/referentiels/domaines","{\"code\":\""+code+"\",\"label\":\"Premier\"}",true);
        assertThat(created.statusCode()).isEqualTo(201);var domain=json.readTree(created.body());
        var duplicate=manager.call("POST","/api/referentiels/domaines","{\"code\":\" "+code.toLowerCase(java.util.Locale.ROOT)+" \",\"label\":\"Second\"}",true);
        assertThat(duplicate.statusCode()).isEqualTo(409);assertThat(duplicate.body()).contains("fieldErrors","code","déjà utilisé");
        assertThat(manager.call("POST","/api/referentiels/domaines/"+domain.get("id").asString()+"/desactivation","{\"version\":"+domain.get("version").asLong()+"}",true).statusCode()).isEqualTo(204);
        assertThat(manager.call("POST","/api/referentiels/domaines","{\"code\":\""+code+"\",\"label\":\"Réutilisation\"}",true).statusCode()).isEqualTo(409);
        assertThat(json.readTree(manager.get("/api/referentiels/domaines/"+domain.get("id").asString()).body()).get("active").asBoolean()).isFalse();
    }

    @Test void domain_edit_keeps_identity_and_rejects_stale_versions() throws Exception {
        var manager=as("gestionnaire");String code="EDIT-"+java.util.UUID.randomUUID();
        var created=manager.call("POST","/api/referentiels/domaines","{\"code\":\""+code+"\",\"label\":\"Avant\"}",true);
        assertThat(created.statusCode()).isEqualTo(201);var domain=json.readTree(created.body());String path="/api/referentiels/domaines/"+domain.get("id").asString();
        assertThat(manager.put(path,"{\"code\":\""+code+"-B\",\"label\":\"Après\",\"version\":"+domain.get("version").asLong()+"}").statusCode()).isEqualTo(204);
        var changed=json.readTree(manager.get(path).body());assertThat(changed.get("id")).isEqualTo(domain.get("id"));assertThat(changed.get("label").asString()).isEqualTo("Après");
        assertThat(changed.get("version").asLong()).isGreaterThan(domain.get("version").asLong());
        assertThat(manager.put(path,"{\"label\":\"Écrasement\",\"version\":"+domain.get("version").asLong()+"}").statusCode()).isEqualTo(409);
        assertThat(json.readTree(manager.get(path).body()).get("label").asString()).isEqualTo("Après");
    }

    @Test void deactivated_domain_keeps_its_children_and_rejects_new_attachments() throws Exception {
        var manager=as("gestionnaire");String code="PARENT-"+java.util.UUID.randomUUID();
        var domain=json.readTree(manager.call("POST","/api/referentiels/domaines","{\"code\":\""+code+"\",\"label\":\"Parent\"}",true).body());
        String path="/api/referentiels/domaines/"+domain.get("id").asString();
        var child=manager.call("POST",path+"/sous-domaines","{\"label\":\"Sous-domaine historique\"}",true);assertThat(child.statusCode()).isEqualTo(201);
        String childId=json.readTree(child.body()).get("id").asString();
        assertThat(manager.call("POST",path+"/desactivation","{\"version\":"+domain.get("version").asLong()+"}",true).statusCode()).isEqualTo(204);
        assertThat(manager.call("POST",path+"/sous-domaines","{\"label\":\"Nouveau\"}",true).statusCode()).isEqualTo(409);
        var historical=json.readTree(manager.get(path+"/sous-domaines").body());assertThat(historical.size()).isEqualTo(1);assertThat(historical.get(0).get("id").asString()).isEqualTo(childId);
    }

    @Test void domains_validate_fields_and_deny_access_to_instructors() throws Exception {
        var manager=as("gestionnaire");
        assertThat(manager.call("POST","/api/referentiels/domaines","{\"code\":\"   \",\"label\":\"Test\"}",true).statusCode()).isEqualTo(400);
        assertThat(manager.call("POST","/api/referentiels/domaines","{\"code\":\""+"X".repeat(65)+"\",\"label\":\"Test\"}",true).statusCode()).isEqualTo(400);
        assertThat(manager.call("POST","/api/referentiels/domaines","{\"code\":\"VALID\",\"label\":\" \"}",true).statusCode()).isEqualTo(400);
        assertThat(manager.get("/api/referentiels/domaines?size=101").statusCode()).isEqualTo(400);
        var instructor=as("intervenant");
        assertThat(instructor.get("/api/referentiels/domaines").statusCode()).isEqualTo(403);
        assertThat(instructor.call("POST","/api/referentiels/domaines","{\"code\":\"INTERDIT\",\"label\":\"Interdit\"}",true).statusCode()).isEqualTo(403);
        assertThat(new Browser().get("/api/referentiels/domaines").statusCode()).isEqualTo(401);
    }

    @Test void concurrent_domain_creations_cannot_duplicate_a_code() throws Exception {
        var manager=as("gestionnaire");var admin=as("admin");String code="RACE-"+java.util.UUID.randomUUID();
        var start=new java.util.concurrent.CountDownLatch(1);
        try(var pool=java.util.concurrent.Executors.newVirtualThreadPerTaskExecutor()){
            var first=pool.submit(()->{start.await();return manager.call("POST","/api/referentiels/domaines","{\"code\":\""+code+"\",\"label\":\"Premier\"}",true).statusCode();});
            var second=pool.submit(()->{start.await();return admin.call("POST","/api/referentiels/domaines","{\"code\":\""+code.toLowerCase(java.util.Locale.ROOT)+"\",\"label\":\"Second\"}",true).statusCode();});
            start.countDown();assertThat(List.of(first.get(10,java.util.concurrent.TimeUnit.SECONDS),second.get(10,java.util.concurrent.TimeUnit.SECONDS))).containsExactlyInAnyOrder(201,409);
        }
    }

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
