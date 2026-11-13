package fr.intformation.formations.infrastructure;

import fr.intformation.formations.application.FormationStore;
import fr.intformation.formations.domain.Formation;
import fr.intformation.habilitations.application.AccessService.NotFound;
import fr.intformation.audit.infrastructure.PostgresAuditLog;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.*;

@Repository
public class PostgresFormationStore implements FormationStore {
    private final JdbcClient db;private final PostgresAuditLog audit;
    private static final RowMapper<Formation> ROW=(rs,i)->new Formation(rs.getObject("id",UUID.class),rs.getString("code"),rs.getString("title"),rs.getString("objectives"),rs.getString("description"),rs.getObject("duration_minutes",Integer.class),Formation.State.valueOf(rs.getString("state")),rs.getLong("version"));
    private final fr.intformation.referentiel.application.CompetencyAvailability competencies;
    public PostgresFormationStore(JdbcClient db,PostgresAuditLog audit,fr.intformation.referentiel.application.CompetencyAvailability competencies){this.db=db;this.audit=audit;this.competencies=competencies;}
    public Page list(String query,int page,int size){
        String filter=" FROM formation WHERE position(lower(:query) in lower(code))>0 OR position(lower(:query) in lower(title))>0";
        var items=db.sql("SELECT *"+filter+" ORDER BY lower(code),id LIMIT :size OFFSET :offset")
            .param("query",query).param("size",size).param("offset",(long)page*size).query(ROW).list();
        long total=db.sql("SELECT count(*)"+filter).param("query",query).query(Long.class).single();
        return new Page(items,total,page,size);
    }
    @Transactional(readOnly=true,isolation=org.springframework.transaction.annotation.Isolation.REPEATABLE_READ)
    public Matches forProfile(UUID profileId,int page,int size){
        requireProfile(profileId);
        String filter="""
             FROM formation f WHERE f.state='ACTIVE' AND EXISTS (
                SELECT 1 FROM formation_competency fc
                JOIN profile_requirement r ON r.competency_id=fc.competency_id
                WHERE fc.formation_id=f.id AND r.profile_id=:profile)
            """;
        var items=db.sql("""
            SELECT f.id,f.code,f.title,EXISTS(
                SELECT 1 FROM training_session s WHERE s.formation_id=f.id AND s.state='PLANIFIEE'
            ) AS has_planned_session
            """+filter+" ORDER BY lower(f.code),f.id LIMIT :size OFFSET :offset")
            .param("profile",profileId).param("size",size).param("offset",(long)page*size)
            .query((rs,i)->new Match(rs.getObject("id",UUID.class),rs.getString("code"),rs.getString("title"),rs.getBoolean("has_planned_session"))).list();
        long total=db.sql("SELECT count(*)"+filter).param("profile",profileId).query(Long.class).single();
        return new Matches(items,total,page,size);
    }
    private void requireProfile(UUID id){
        if(!db.sql("SELECT EXISTS(SELECT 1 FROM job_profile WHERE id=:id)").param("id",id).query(Boolean.class).single())throw new NotFound();
    }
    @Transactional(readOnly=true,isolation=org.springframework.transaction.annotation.Isolation.REPEATABLE_READ)
    public ExplanationPage commonRequirements(UUID profileId,UUID formationId,int page,int size){
        requireProfile(profileId);
        return explanation(profileId,formationId,page,size);
    }
    @Transactional(readOnly=true,isolation=org.springframework.transaction.annotation.Isolation.REPEATABLE_READ)
    public ExplanationPage uncoveredRequirements(UUID profileId,int page,int size){
        requireProfile(profileId);
        return explanation(profileId,null,page,size);
    }
    private ExplanationPage explanation(UUID profileId,UUID formationId,int page,int size){
        String coverage="""
            EXISTS (SELECT 1 FROM formation_competency fc JOIN formation f ON f.id=fc.formation_id
                WHERE fc.competency_id=r.competency_id AND f.state='ACTIVE'
            """+(formationId==null?")":" AND f.id=:formation)");
        String filter="""
             FROM profile_requirement r
             JOIN competency_reference c ON c.id=r.competency_id
             JOIN requirement_classification k ON k.id=r.classification_id
             WHERE r.profile_id=:profile AND
            """+(formationId==null?"NOT ":"")+coverage;
        var count=db.sql("SELECT count(*)"+filter).param("profile",profileId);
        if(formationId!=null)count.param("formation",formationId);
        long total=count.query(Long.class).single();
        if(formationId!=null && total==0)throw new NotFound();
        var query=db.sql("""
            SELECT c.id AS competency_id,c.code AS competency_code,c.label AS competency_label,c.active AS competency_active,
                k.id AS classification_id,k.code AS classification_code,k.label AS classification_label,k.active AS classification_active
            """+filter+" ORDER BY lower(c.code),c.id LIMIT :size OFFSET :offset")
            .param("profile",profileId).param("size",size).param("offset",(long)page*size);
        if(formationId!=null)query.param("formation",formationId);
        var items=query.query((rs,i)->new ExplainedRequirement(rs.getObject("competency_id",UUID.class),rs.getString("competency_code"),rs.getString("competency_label"),rs.getBoolean("competency_active"),
            rs.getObject("classification_id",UUID.class),rs.getString("classification_code"),rs.getString("classification_label"),rs.getBoolean("classification_active"))).list();
        return new ExplanationPage(items,total,page,size);
    }
    public Formation get(UUID id){return find(id,false);}
    private Formation find(UUID id,boolean lock){return db.sql("SELECT * FROM formation WHERE id=:id"+(lock?" FOR UPDATE":"")).param("id",id).query(ROW).optional().orElseThrow(NotFound::new);}
    private Map<String,Object> snapshot(Formation f){
        var result=new LinkedHashMap<String,Object>();result.put("code",f.code());result.put("title",f.title());result.put("objectives",f.objectives());result.put("description",f.description());result.put("durationMinutes",f.durationMinutes());result.put("state",f.state().name());result.put("version",f.version());return result;
    }
    private void persist(Formation f,boolean insert){
        String sql=insert?"INSERT INTO formation(id,code,title,objectives,description,duration_minutes,state,version) VALUES (:id,:code,:title,:objectives,:description,:duration,:state,:version)":"UPDATE formation SET code=:code,title=:title,objectives=:objectives,description=:description,duration_minutes=:duration,state=:state,version=:version WHERE id=:id";
        try{db.sql(sql).param("id",f.id()).param("code",f.code()).param("title",f.title()).param("objectives",f.objectives()).param("description",f.description()).param("duration",f.durationMinutes(),java.sql.Types.INTEGER).param("state",f.state().name()).param("version",f.version()).update();}
        catch(DataIntegrityViolationException error){if(error.getMostSpecificCause().getMessage().contains("formation_code_unique"))throw new Formation.DuplicateCode();throw error;}
    }
    @Transactional
    public Formation create(String actor,Formation formation,Instant now){persist(formation,true);audit.record(actor,"CREATION_FORMATION","FORMATION",formation.id().toString(),null,Map.of(),snapshot(formation),now);return formation;}
    @Transactional
    public void update(String actor,UUID id,String code,String title,String objectives,String description,Integer duration,Long version,Instant now){
        var before=find(id,true);var after=before.change(code,title,objectives,description,duration,version);persist(after,false);
        audit.record(actor,"MODIFICATION_FORMATION","FORMATION",id.toString(),null,snapshot(before),snapshot(after),now);
    }
    @Transactional
    public void transition(String actor,UUID id,String action,Long version,Instant now){
        var before=find(id,true);var after=before.transition(action,version);persist(after,false);
        String event=switch(action){case "activation"->"ACTIVATION_FORMATION";case "archivage"->"ARCHIVAGE_FORMATION";case "reactivation"->"REACTIVATION_FORMATION";default->throw new IllegalArgumentException();};
        audit.record(actor,event,"FORMATION",id.toString(),null,snapshot(before),snapshot(after),now);
    }
    private static final String COVERAGE="SELECT fc.id,c.id AS competency_id,c.code,c.label,c.active FROM formation_competency fc JOIN competency_reference c ON c.id=fc.competency_id";
    private static final RowMapper<Coverage> COVERAGE_ROW=(rs,i)->new Coverage(rs.getObject("id",UUID.class),rs.getObject("competency_id",UUID.class),rs.getString("code"),rs.getString("label"),rs.getBoolean("active"));
    public CoveragePage coverage(UUID id,int page,int size){
        get(id);
        var items=db.sql(COVERAGE+" WHERE fc.formation_id=:id ORDER BY lower(c.label),fc.id LIMIT :size OFFSET :offset")
            .param("id",id).param("size",size).param("offset",(long)page*size).query(COVERAGE_ROW).list();
        long total=db.sql("SELECT count(*) FROM formation_competency WHERE formation_id=:id").param("id",id).query(Long.class).single();
        return new CoveragePage(items,total,page,size);
    }
    public Choices competencyChoices(String query,int page,int size){
        String filter=" FROM competency_reference WHERE active=true AND (position(lower(:query) in lower(code))>0 OR position(lower(:query) in lower(label))>0)";
        long total=db.sql("SELECT count(*)"+filter).param("query",query).query(Long.class).single();
        var items=db.sql("SELECT id,code,label"+filter+" ORDER BY lower(label),id LIMIT :size OFFSET :offset")
            .param("query",query).param("size",size).param("offset",(long)page*size)
            .query((rs,i)->new Choice(rs.getObject("id",UUID.class),rs.getString("code"),rs.getString("label"))).list();
        return new Choices(items,total,page,size);
    }
    @Transactional
    public Coverage associate(UUID id,UUID competencyId){
        find(id,true).requireAssociationActive();
        competencies.requireActive(competencyId);
        UUID linkId=UUID.randomUUID();
        try{db.sql("INSERT INTO formation_competency(id,formation_id,competency_id) VALUES (:id,:formation,:competency)")
            .param("id",linkId).param("formation",id).param("competency",competencyId).update();}
        catch(DataIntegrityViolationException error){
            if(error.getMostSpecificCause().getMessage().contains("formation_competency_pair_unique"))throw new fr.intformation.habilitations.domain.AccessPolicy.Conflict("Cette compétence est déjà associée à la formation.");
            throw error;
        }
        return db.sql(COVERAGE+" WHERE fc.id=:id").param("id",linkId).query(COVERAGE_ROW).single();
    }
    public List<Session> sessions(UUID id){get(id);return db.sql("SELECT id,title,state FROM training_session WHERE formation_id=:id ORDER BY lower(title),id").param("id",id).query((rs,i)->new Session(rs.getObject("id",UUID.class),rs.getString("title"),rs.getString("state"))).list();}
}
