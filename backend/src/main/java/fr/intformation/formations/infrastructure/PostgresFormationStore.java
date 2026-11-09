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
    public PostgresFormationStore(JdbcClient db,PostgresAuditLog audit){this.db=db;this.audit=audit;}
    public Page list(int page,int size){return new Page(db.sql("SELECT * FROM formation ORDER BY lower(code),id LIMIT :size OFFSET :offset").param("size",size).param("offset",(long)page*size).query(ROW).list(),db.sql("SELECT count(*) FROM formation").query(Long.class).single(),page,size);}
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
    public List<Session> sessions(UUID id){get(id);return db.sql("SELECT id,title,state FROM training_session WHERE formation_id=:id ORDER BY lower(title),id").param("id",id).query((rs,i)->new Session(rs.getObject("id",UUID.class),rs.getString("title"),rs.getString("state"))).list();}
    @Transactional
    public Session createSession(UUID id,String title){
        find(id,true).requireActive();var session=new Session(UUID.randomUUID(),title,"BROUILLON");
        db.sql("INSERT INTO training_session(id,title,state,formation_id) VALUES (:id,:title,'BROUILLON',:formation)").param("id",session.id()).param("title",title).param("formation",id).update();return session;
    }
}
