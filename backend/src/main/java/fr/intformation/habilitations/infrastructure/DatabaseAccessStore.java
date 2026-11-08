package fr.intformation.habilitations.infrastructure;

import fr.intformation.habilitations.application.*;
import fr.intformation.habilitations.domain.AccessPolicy;
import fr.intformation.habilitations.domain.AccessPolicy.*;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.*;

@Repository
public class DatabaseAccessStore implements AccessStore {
    private final JdbcClient db;
    private final AccountRepository accounts;
    private final AccessPolicy policy = new AccessPolicy();
    public DatabaseAccessStore(JdbcClient db, AccountRepository accounts) { this.db = db; this.accounts=accounts; }
    public Actor actor(String username) {
        AccountEntity account=accounts.findById(username).orElseThrow(Forbidden::new);
        return new Actor(account.username,Role.valueOf(account.role),account.instructorId);
    }
    public String password(String username) {
        return accounts.findById(username).orElseThrow(() -> new org.springframework.security.core.userdetails.UsernameNotFoundException("Compte inconnu")).passwordHash;
    }
    private static final String SESSION_SELECT = "SELECT s.id,s.title,s.state,(SELECT max(ends_at) FROM session_slot WHERE session_id=s.id) AS last_end FROM training_session s";
    private static Session mapSession(java.sql.ResultSet rs, int row) throws java.sql.SQLException {
        Timestamp end = rs.getTimestamp("last_end");
        return new Session(rs.getObject("id", UUID.class), rs.getString("title"), rs.getString("state"), end == null ? null : end.toInstant());
    }
    public List<Session> sessions(Actor actor) {
        if (actor.role() != Role.INTERVENANT) return db.sql(SESSION_SELECT + " ORDER BY s.title,s.id").query(DatabaseAccessStore::mapSession).list();
        if (actor.instructorId() == null) return List.of();
        return db.sql(SESSION_SELECT + " WHERE EXISTS (SELECT 1 FROM session_instructor si WHERE si.session_id=s.id AND si.instructor_id=:instructor) ORDER BY s.title,s.id")
            .param("instructor", actor.instructorId()).query(DatabaseAccessStore::mapSession).list();
    }
    public Session session(UUID id) {
        return db.sql(SESSION_SELECT + " WHERE s.id=:id").param("id", id).query(DatabaseAccessStore::mapSession).optional().orElseThrow(AccessService.NotFound::new);
    }
    public boolean assigned(UUID sessionId, UUID instructorId) {
        if (instructorId == null) return false;
        return db.sql("SELECT EXISTS (SELECT 1 FROM session_instructor WHERE session_id=:session AND instructor_id=:instructor)")
            .param("session", sessionId).param("instructor", instructorId).query(Boolean.class).single();
    }
    public List<Participant> participants(UUID sessionId) {
        return db.sql("SELECT p.id,c.first_name,c.last_name,c.professional_id,p.state FROM participation p JOIN collaborator c ON c.id=p.collaborator_id WHERE p.session_id=:session ORDER BY c.last_name,c.first_name,p.id")
            .param("session", sessionId).query((rs,i) -> new Participant(rs.getObject(1, UUID.class),rs.getString(2),rs.getString(3),rs.getString(4),rs.getString(5))).list();
    }
    @Transactional
    public void presence(Actor actor, UUID sessionId, UUID participationId, String state, Instant now) {
        lockSession(sessionId);
        policy.requirePresence(actor, session(sessionId), assigned(sessionId, actor.instructorId()), now);
        String before = db.sql("SELECT state FROM participation WHERE id=:id AND session_id=:session FOR UPDATE")
            .param("id", participationId).param("session", sessionId).query(String.class).optional().orElseThrow(AccessService.NotFound::new);
        if (before.equals("DESISTEE")) throw new Conflict("Une participation désistée doit être réactivée avant la saisie.");
        db.sql("UPDATE participation SET state=:state WHERE id=:id").param("state", state).param("id", participationId).update();
        if (session(sessionId).state().equals("TERMINEE")) audit(actor, "CORRECTION_PRESENCE", participationId.toString(), before, state, now);
    }
    private void lockSession(UUID id) {
        db.sql("SELECT id FROM training_session WHERE id=:id FOR UPDATE").param("id", id).query(UUID.class).optional().orElseThrow(AccessService.NotFound::new);
    }
    public void renameReference(UUID id, String label, boolean classification) {
        String table = classification ? "requirement_classification" : "domain_reference";
        if (db.sql("UPDATE " + table + " SET label=:label WHERE id=:id").param("label", label).param("id", id).update() == 0) throw new AccessService.NotFound();
    }
    public List<Account> accounts() {
        return db.sql("SELECT username,role FROM app_account ORDER BY username").query((rs,i) -> new Account(rs.getString(1), Role.valueOf(rs.getString(2)))).list();
    }
    @Transactional
    public void changeRole(Actor actor, String username, Role role, Instant now) {
        String before = db.sql("SELECT role FROM app_account WHERE username=:username FOR UPDATE").param("username",username).query(String.class).optional().orElseThrow(AccessService.NotFound::new);
        db.sql("UPDATE app_account SET role=:role WHERE username=:username").param("role",role.name()).param("username",username).update();
        audit(actor,"CHANGEMENT_ROLE",username,before,role.name(),now);
    }
    private void audit(Actor actor, String action, String target, String before, String after, Instant now) {
        db.sql("INSERT INTO access_audit VALUES (:id,:at,:actor,:action,:target,:before,:after)")
            .param("id",UUID.randomUUID()).param("at",Timestamp.from(now)).param("actor",actor.username()).param("action",action)
            .param("target",target).param("before",before).param("after",after).update();
    }
}
