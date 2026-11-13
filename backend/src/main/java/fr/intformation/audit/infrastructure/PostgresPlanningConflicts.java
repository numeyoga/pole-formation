package fr.intformation.audit.infrastructure;

import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Component;
import java.util.*;

@Component
public class PostgresPlanningConflicts {
    private final JdbcClient db;
    public PostgresPlanningConflicts(JdbcClient db){this.db=db;}
    public void lock(){db.sql("SELECT pg_advisory_xact_lock(80602)").query((rs,i)->true).single();}
    public List<UUID> forSession(UUID session) {
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
}
