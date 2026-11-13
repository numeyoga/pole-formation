package fr.intformation.intervenants.infrastructure;

import fr.intformation.intervenants.application.InstructorStore;
import fr.intformation.intervenants.domain.Instructor;
import fr.intformation.audit.infrastructure.PostgresPlanningConflicts;
import fr.intformation.habilitations.application.AccessService.NotFound;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.*;
import java.util.*;

@Repository
public class PostgresInstructorStore implements InstructorStore {
    private final JdbcClient db;
    private final PostgresPlanningConflicts planning;
    public PostgresInstructorStore(JdbcClient db,PostgresPlanningConflicts planning){this.db=db;this.planning=planning;}
    private static final String SELECT="""
        SELECT i.*,EXISTS(SELECT 1 FROM app_account a WHERE a.instructor_id=i.id) AS has_account,
        (SELECT count(*) FROM session_instructor si WHERE si.instructor_id=i.id) AS session_count FROM instructor i
        """;
    private static final RowMapper<Instructor> ROW=(rs,n)->new Instructor(rs.getObject("id",UUID.class),rs.getString("label"),rs.getString("first_name"),rs.getString("last_name"),rs.getString("professional_contact"),rs.getBoolean("active"),rs.getLong("version"),rs.getBoolean("has_account"),rs.getLong("session_count"));
    @Transactional(readOnly=true,isolation=Isolation.REPEATABLE_READ)
    public Page list(String query,boolean activeOnly,int page,int size){
        String filter=" WHERE position(lower(:q) in lower(i.label))>0"+(activeOnly?" AND i.active=true":"");
        var items=db.sql(SELECT+filter+" ORDER BY lower(i.label),i.id LIMIT :size OFFSET :offset").param("q",query).param("size",size).param("offset",(long)page*size).query(ROW).list();
        long total=db.sql("SELECT count(*) FROM instructor i"+filter).param("q",query).query(Long.class).single();
        return new Page(items,total,page,size);
    }
    private Instructor find(UUID id,boolean lock){return db.sql(SELECT+" WHERE i.id=:id"+(lock?" FOR UPDATE OF i":"")).param("id",id).query(ROW).optional().orElseThrow(NotFound::new);}
    public Instructor get(UUID id){return find(id,false);}
    @Transactional
    public Instructor create(Instructor.Details details){
        UUID id=UUID.randomUUID();
        db.sql("INSERT INTO instructor(id,label,first_name,last_name,professional_contact) VALUES (:id,:label,:first,:last,:contact)")
            .param("id",id).param("label",details.label()).param("first",details.firstName()).param("last",details.lastName()).param("contact",details.professionalContact()).update();
        return find(id,false);
    }
    @Transactional
    public void update(UUID id,Instructor.Details details,Long version){
        find(id,true).requireVersion(version);
        db.sql("UPDATE instructor SET label=:label,first_name=:first,last_name=:last,professional_contact=:contact,version=version+1 WHERE id=:id")
            .param("id",id).param("label",details.label()).param("first",details.firstName()).param("last",details.lastName()).param("contact",details.professionalContact()).update();
    }
    @Transactional
    public void deactivate(UUID id,Long version){
        // Serialise with assignment checks: no new assignment can pass an obsolete active check.
        planning.lock();var before=find(id,true);before.requireVersion(version);
        if(!before.active())return;
        db.sql("UPDATE instructor SET active=false,version=version+1 WHERE id=:id").param("id",id).update();
    }
    @Transactional(readOnly=true,isolation=Isolation.REPEATABLE_READ)
    public Sessions sessions(UUID id,int page,int size){
        find(id,false);
        String filter=" FROM training_session s JOIN session_instructor si ON si.session_id=s.id WHERE si.instructor_id=:id";
        var items=db.sql("SELECT s.id,s.title,s.state"+filter+" ORDER BY lower(s.title),s.id LIMIT :size OFFSET :offset")
            .param("id",id).param("size",size).param("offset",(long)page*size).query((rs,n)->new Session(rs.getObject(1,UUID.class),rs.getString(2),rs.getString(3))).list();
        long total=db.sql("SELECT count(*)"+filter).param("id",id).query(Long.class).single();
        return new Sessions(items,total,page,size);
    }
}
