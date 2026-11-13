package fr.intformation.sessions.infrastructure;

import fr.intformation.sessions.application.SessionStore;
import fr.intformation.sessions.domain.TrainingSession;
import fr.intformation.sessions.domain.TrainingSession.Slot;
import fr.intformation.audit.domain.ChangeRules;
import fr.intformation.audit.domain.ChangeRules.Interval;
import fr.intformation.habilitations.application.AccessService.NotFound;
import fr.intformation.habilitations.domain.AccessPolicy.Conflict;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.*;

@Repository
public class PostgresSessionStore implements SessionStore {
    private final JdbcClient db;
    private final fr.intformation.audit.infrastructure.PostgresAuditLog audit;
    private final fr.intformation.audit.infrastructure.PostgresPlanningConflicts conflicts;
    public PostgresSessionStore(JdbcClient db,fr.intformation.audit.infrastructure.PostgresAuditLog audit,fr.intformation.audit.infrastructure.PostgresPlanningConflicts conflicts){this.db=db;this.audit=audit;this.conflicts=conflicts;}
    private List<Slot> slots(UUID id){
        return db.sql("SELECT * FROM session_slot WHERE session_id=:id ORDER BY starts_at,id").param("id",id)
            .query((rs,i)->new Slot(rs.getObject("id",UUID.class),rs.getTimestamp("starts_at").toInstant(),rs.getTimestamp("ends_at").toInstant())).list();
    }
    private TrainingSession find(UUID id,boolean lock){
        var session=db.sql("SELECT * FROM training_session WHERE id=:id"+(lock?" FOR UPDATE":"")).param("id",id)
            .query((rs,i)->new TrainingSession(rs.getObject("id",UUID.class),rs.getObject("formation_id",UUID.class),rs.getString("title"),rs.getString("state"),rs.getObject("capacity",Integer.class),rs.getString("modalities"),rs.getLong("version"),List.of(),List.of()))
            .optional().orElseThrow(NotFound::new);
        return new TrainingSession(session.id(),session.formationId(),session.title(),session.state(),session.capacity(),session.modalities(),session.version(),slots(id),db.sql("SELECT i.id,i.label,i.active FROM instructor i JOIN session_instructor si ON si.instructor_id=i.id WHERE si.session_id=:id ORDER BY lower(i.label),i.id")
            .param("id",id).query((rs,n)->new TrainingSession.AssignedInstructor(rs.getObject(1,UUID.class),rs.getString(2),rs.getBoolean(3))).list());
    }
    @Transactional(readOnly=true,isolation=org.springframework.transaction.annotation.Isolation.REPEATABLE_READ)
    public TrainingSession get(UUID id){return find(id,false);}
    private void activeFormation(UUID id){
        String state=db.sql("SELECT state FROM formation WHERE id=:id FOR UPDATE").param("id",id).query(String.class).optional().orElseThrow(NotFound::new);
        if(!state.equals("ACTIVE"))throw new Conflict("La formation doit être active.");
    }
    @Transactional
    public TrainingSession create(UUID formation,String title,Integer capacity,String modalities){
        activeFormation(formation);UUID id=UUID.randomUUID();
        db.sql("INSERT INTO training_session(id,formation_id,title,state,capacity,modalities) VALUES (:id,:formation,:title,'BROUILLON',:capacity,:modalities)")
            .param("id",id).param("formation",formation).param("title",title).param("capacity",capacity,java.sql.Types.INTEGER).param("modalities",modalities).update();
        return find(id,false);
    }
    @Transactional
    public Slot addSlot(String actor,UUID id,Instant start,Instant end,Long version,boolean confirm,Instant now){
        conflicts.lock();var session=find(id,true);new ChangeRules().editable(session.state(),session.version(),version,true);
        var interval=new Interval(start,end);
        new ChangeRules().noOverlap(interval,session.slots().stream().map(s->new Interval(s.startsAt(),s.endsAt())).toList());
        UUID slot=UUID.randomUUID();
        db.sql("INSERT INTO session_slot(id,session_id,starts_at,ends_at) VALUES (:slot,:session,:start,:end)")
            .param("slot",slot).param("session",id).param("start",Timestamp.from(start)).param("end",Timestamp.from(end)).update();
        db.sql("UPDATE training_session SET version=version+1 WHERE id=:id").param("id",id).update();
        if(session.state().equals("PLANIFIEE")){
            new ChangeRules().confirm(conflicts.forSession(id),confirm);
            audit.record(actor,"AJOUT_CRENEAU","CRENEAU",slot.toString(),id,Map.of(),Map.of("startsAt",start.toString(),"endsAt",end.toString()),now);
        }
        return new Slot(slot,start,end);
    }
    @Transactional
    public void plan(UUID id,Long version){
        conflicts.lock();var session=find(id,true);session.requirePlannable(version);
        db.sql("UPDATE training_session SET state='PLANIFIEE',version=version+1 WHERE id=:id").param("id",id).update();
    }
}
