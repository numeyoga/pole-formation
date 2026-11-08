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
    public PostgresSensitiveStore(JdbcClient db,PostgresAuditLog audit) {this.db=db;this.audit=audit;}
    private record SessionState(String state,Integer capacity) {}
    private SessionState lock(UUID session) {
        // Serialise planning mutations before taking the session/capacity lock.
        db.sql("SELECT pg_advisory_xact_lock(80602)").query((rs,i)->true).single();
        var state=db.sql("SELECT state,capacity FROM training_session WHERE id=:id FOR UPDATE").param("id",session)
            .query((rs,i)->new SessionState(rs.getString(1),rs.getObject(2,Integer.class))).optional().orElseThrow(NotFound::new);
        rules.planned(state.state());return state;
    }
    private List<UUID> conflicts(UUID session) {
        return db.sql("""
            SELECT DISTINCT other.id FROM training_session other
            WHERE other.id<>:session AND other.state='PLANIFIEE'
            AND EXISTS (SELECT 1 FROM session_slot a JOIN session_slot b ON a.starts_at<b.ends_at AND b.starts_at<a.ends_at
                        WHERE a.session_id=:session AND b.session_id=other.id)
            AND (EXISTS (SELECT 1 FROM session_instructor a JOIN session_instructor b ON a.instructor_id=b.instructor_id
                         WHERE a.session_id=:session AND b.session_id=other.id)
                 OR EXISTS (SELECT 1 FROM participation a JOIN participation b ON a.collaborator_id=b.collaborator_id
                            WHERE a.session_id=:session AND b.session_id=other.id
                            AND a.state IN ('INSCRITE','PRESENTE','ABSENTE') AND b.state IN ('INSCRITE','PRESENTE','ABSENTE')))
            ORDER BY other.id
            """).param("session",session).query(UUID.class).list();
    }
    private Map<String,Object> times(Interval interval) {return Map.of("startsAt",interval.start().toString(),"endsAt",interval.end().toString());}
    @Transactional
    public void changeSlot(Actor actor,UUID session,UUID slot,Instant start,Instant end,boolean confirm,Instant now) {
        lock(session);var proposed=new Interval(start,end);
        var before=db.sql("SELECT starts_at,ends_at FROM session_slot WHERE id=:slot AND session_id=:session")
            .param("slot",slot).param("session",session).query((rs,i)->new Interval(rs.getTimestamp(1).toInstant(),rs.getTimestamp(2).toInstant()))
            .optional().orElseThrow(NotFound::new);
        var others=db.sql("SELECT starts_at,ends_at FROM session_slot WHERE id<>:slot AND session_id=:session")
            .param("slot",slot).param("session",session).query((rs,i)->new Interval(rs.getTimestamp(1).toInstant(),rs.getTimestamp(2).toInstant())).list();
        rules.noOverlap(proposed,others);
        if(before.equals(proposed))return;
        db.sql("UPDATE session_slot SET starts_at=:start,ends_at=:end WHERE id=:id")
            .param("start",Timestamp.from(start)).param("end",Timestamp.from(end)).param("id",slot).update();
        rules.confirm(conflicts(session),confirm);
        audit.record(actor.username(),"MODIFICATION_CRENEAU","CRENEAU",slot.toString(),session,times(before),times(proposed),now);
    }
    @Transactional
    public void replaceInstructors(Actor actor,UUID session,List<UUID> instructors,boolean confirm,Instant now) {
        lock(session);
        var before=db.sql("SELECT instructor_id FROM session_instructor WHERE session_id=:session ORDER BY instructor_id")
            .param("session",session).query(UUID.class).list();
        var after=instructors.stream().sorted().toList();
        if(!after.isEmpty()) {
            int active=db.sql("SELECT count(*) FROM instructor WHERE id IN (:ids) AND active=true").param("ids",after).query(Integer.class).single();
            if(active!=after.size())throw new IllegalArgumentException("Un intervenant est absent ou inactif.");
        }
        if(before.equals(after))return;
        db.sql("DELETE FROM session_instructor WHERE session_id=:session").param("session",session).update();
        for(UUID id:after)db.sql("INSERT INTO session_instructor VALUES (:session,:instructor)").param("session",session).param("instructor",id).update();
        rules.confirm(conflicts(session),confirm);
        audit.record(actor.username(),"REMPLACEMENT_INTERVENANTS","AFFECTATIONS",session.toString(),session,
            Map.of("instructorIds",before.stream().map(UUID::toString).toList()),Map.of("instructorIds",after.stream().map(UUID::toString).toList()),now);
    }
    @Transactional
    public void transition(Actor actor,UUID session,UUID participation,String after,boolean confirm,Instant now) {
        var sessionState=lock(session);
        record Current(String state,boolean active) {}
        var before=db.sql("SELECT p.state,c.active FROM participation p JOIN collaborator c ON c.id=p.collaborator_id WHERE p.id=:id AND p.session_id=:session FOR UPDATE OF p")
            .param("id",participation).param("session",session).query((rs,i)->new Current(rs.getString(1),rs.getBoolean(2))).optional().orElseThrow(NotFound::new);
        int occupied=db.sql("SELECT count(*) FROM participation WHERE session_id=:session AND state IN ('INSCRITE','PRESENTE','ABSENTE')").param("session",session).query(Integer.class).single();
        rules.transition(before.state(),after,before.active(),sessionState.capacity(),occupied);
        db.sql("UPDATE participation SET state=:state WHERE id=:id").param("state",after).param("id",participation).update();
        if(after.equals("INSCRITE"))rules.confirm(conflicts(session),confirm);
        audit.record(actor.username(),after.equals("DESISTEE")?"DESISTEMENT":"REACTIVATION_PARTICIPATION","PARTICIPATION",participation.toString(),session,
            Map.of("state",before.state()),Map.of("state",after),now);
    }
}
