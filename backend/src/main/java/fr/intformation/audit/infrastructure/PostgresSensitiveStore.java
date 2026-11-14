package fr.intformation.audit.infrastructure;

import fr.intformation.audit.application.SensitiveStore;
import fr.intformation.audit.domain.ChangeRules;
import fr.intformation.audit.domain.ChangeRules.Interval;
import fr.intformation.habilitations.application.AccessService.NotFound;
import fr.intformation.habilitations.domain.AccessPolicy.Actor;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.*;

@Repository
public class PostgresSensitiveStore implements SensitiveStore {
    private final JdbcClient db;
    private final PostgresAuditLog audit;
    private final ChangeRules rules=new ChangeRules();
    private final PostgresPlanningConflicts conflicts;
    public PostgresSensitiveStore(JdbcClient db,PostgresAuditLog audit,PostgresPlanningConflicts conflicts) {this.db=db;this.audit=audit;this.conflicts=conflicts;}
    private record SessionState(String state,Integer capacity,long version) {}
    private SessionState lock(UUID session,boolean planningOnly) {
        // Serialise planning mutations before taking the session/capacity lock.
        conflicts.lock();
        var state=db.sql("SELECT state,capacity,version FROM training_session WHERE id=:id FOR UPDATE").param("id",session)
            .query((rs,i)->new SessionState(rs.getString(1),rs.getObject(2,Integer.class),rs.getLong(3))).optional().orElseThrow(NotFound::new);
        if(planningOnly)rules.planned(state.state());return state;
    }
    private Map<String,Object> times(Interval interval) {return Map.of("startsAt",interval.start().toString(),"endsAt",interval.end().toString());}
    @Transactional
    public void changeSlot(Actor actor,UUID session,UUID slot,Instant start,Instant end,boolean confirm,Long version,Instant now) {
        var sessionState=lock(session,false);rules.editable(sessionState.state(),sessionState.version(),version,false);var proposed=new Interval(start,end);
        var before=db.sql("SELECT starts_at,ends_at FROM session_slot WHERE id=:slot AND session_id=:session")
            .param("slot",slot).param("session",session).query((rs,i)->new Interval(rs.getTimestamp(1).toInstant(),rs.getTimestamp(2).toInstant()))
            .optional().orElseThrow(NotFound::new);
        var others=db.sql("SELECT starts_at,ends_at FROM session_slot WHERE id<>:slot AND session_id=:session")
            .param("slot",slot).param("session",session).query((rs,i)->new Interval(rs.getTimestamp(1).toInstant(),rs.getTimestamp(2).toInstant())).list();
        rules.noOverlap(proposed,others);
        if(before.equals(proposed))return;
        db.sql("UPDATE session_slot SET starts_at=:start,ends_at=:end WHERE id=:id")
            .param("start",Timestamp.from(start)).param("end",Timestamp.from(end)).param("id",slot).update();
        rules.confirm(conflicts.forSession(session),confirm);
        db.sql("UPDATE training_session SET version=version+1 WHERE id=:id").param("id",session).update();
        if(sessionState.state().equals("PLANIFIEE"))audit.record(actor.username(),"MODIFICATION_CRENEAU","CRENEAU",slot.toString(),session,times(before),times(proposed),now);
    }
    @Transactional
    public void replaceInstructors(Actor actor,UUID session,List<UUID> instructors,boolean confirm,Long version,Instant now) {
        var current=lock(session,false);
        rules.editable(current.state(),current.version(),version,false);
        var before=db.sql("SELECT instructor_id FROM session_instructor WHERE session_id=:session ORDER BY instructor_id")
            .param("session",session).query(UUID.class).list().stream().sorted().toList();
        var after=instructors.stream().sorted().toList();
        if(!after.isEmpty()) {
            var available=db.sql("SELECT id,active FROM instructor WHERE id IN (:ids) ORDER BY id FOR UPDATE").param("ids",after)
                .query((rs,i)->Map.entry(rs.getObject(1,UUID.class),rs.getBoolean(2))).list();
            if(available.size()!=after.size() || available.stream().anyMatch(i->!i.getValue()&&!before.contains(i.getKey())))
                throw new IllegalArgumentException("Un intervenant est absent ou inactif.");
        }
        if(before.equals(after))return;
        db.sql("DELETE FROM session_instructor WHERE session_id=:session").param("session",session).update();
        for(UUID id:after)db.sql("INSERT INTO session_instructor VALUES (:session,:instructor)").param("session",session).param("instructor",id).update();
        rules.confirm(conflicts.forSession(session),confirm);
        db.sql("UPDATE training_session SET version=version+1 WHERE id=:id").param("id",session).update();
        if(current.state().equals("PLANIFIEE"))audit.record(actor.username(),"REMPLACEMENT_INTERVENANTS","AFFECTATIONS",session.toString(),session,
            Map.of("instructorIds",before.stream().map(UUID::toString).toList()),Map.of("instructorIds",after.stream().map(UUID::toString).toList()),now);
    }
    @Transactional
    public void transition(Actor actor,UUID session,UUID participation,String after,boolean confirm,Instant now) {
        var sessionState=lock(session,true);
        record Current(String state,boolean active) {}
        var before=db.sql("SELECT p.state,c.active FROM participation p JOIN collaborator c ON c.id=p.collaborator_id WHERE p.id=:id AND p.session_id=:session FOR UPDATE OF p,c")
            .param("id",participation).param("session",session).query((rs,i)->new Current(rs.getString(1),rs.getBoolean(2))).optional().orElseThrow(NotFound::new);
        int occupied=db.sql("SELECT count(*) FROM participation WHERE session_id=:session AND state IN ('INSCRITE','PRESENTE','ABSENTE')").param("session",session).query(Integer.class).single();
        rules.transition(before.state(),after,before.active(),sessionState.capacity(),occupied);
        db.sql("UPDATE participation SET state=:state WHERE id=:id").param("state",after).param("id",participation).update();
        if(after.equals("INSCRITE"))rules.confirm(conflicts.forSession(session),confirm);
        audit.record(actor.username(),after.equals("DESISTEE")?"DESISTEMENT":"REACTIVATION_PARTICIPATION","PARTICIPATION",participation.toString(),session,
            Map.of("state",before.state()),Map.of("state",after),now);
    }
}
