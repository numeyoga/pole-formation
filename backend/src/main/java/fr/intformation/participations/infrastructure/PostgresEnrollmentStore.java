package fr.intformation.participations.infrastructure;
import fr.intformation.participations.application.EnrollmentStore;
import fr.intformation.participations.domain.EnrollmentRules;
import fr.intformation.audit.infrastructure.*;
import fr.intformation.audit.domain.ChangeRules;
import fr.intformation.habilitations.application.AccessService.NotFound;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.time.Instant;
import java.util.*;
@Repository
public class PostgresEnrollmentStore implements EnrollmentStore {
    private final JdbcClient db;private final PostgresPlanningConflicts conflicts;private final PostgresAuditLog audit;
    public PostgresEnrollmentStore(JdbcClient db,PostgresPlanningConflicts conflicts,PostgresAuditLog audit){this.db=db;this.conflicts=conflicts;this.audit=audit;}
    @Transactional
    public UUID enroll(String actor,UUID session,UUID collaborator,boolean confirm,Instant now){
        conflicts.lock();
        record Current(String state,Integer capacity) {}
        var current=db.sql("SELECT state,capacity FROM training_session WHERE id=:id FOR UPDATE").param("id",session).query((rs,n)->new Current(rs.getString(1),rs.getObject(2,Integer.class))).optional().orElseThrow(NotFound::new);
        boolean active=db.sql("SELECT active FROM collaborator WHERE id=:id FOR UPDATE").param("id",collaborator).query(Boolean.class).optional().orElseThrow(NotFound::new);
        int occupied=db.sql("SELECT count(*) FROM participation WHERE session_id=:id AND state IN ('INSCRITE','PRESENTE','ABSENTE')").param("id",session).query(Integer.class).single();
        boolean exists=db.sql("SELECT EXISTS(SELECT 1 FROM participation WHERE session_id=:session AND collaborator_id=:collaborator)").param("session",session).param("collaborator",collaborator).query(Boolean.class).single();
        new EnrollmentRules().admit(current.state(),active,current.capacity(),occupied,exists);
        UUID id=UUID.randomUUID();db.sql("INSERT INTO participation(id,session_id,collaborator_id,state) VALUES (:id,:session,:collaborator,'INSCRITE')").param("id",id).param("session",session).param("collaborator",collaborator).update();
        new ChangeRules().confirm(conflicts.forSession(session),confirm);
        audit.record(actor,"INSCRIPTION","PARTICIPATION",id.toString(),session,Map.of(),Map.of("state","INSCRITE","collaboratorId",collaborator.toString()),now);
        return id;
    }
}
