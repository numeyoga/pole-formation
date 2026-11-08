package fr.intformation.habilitations.domain;

import java.time.Instant;
import java.util.UUID;

public final class AccessPolicy {
    public enum Role { INTERVENANT, GESTIONNAIRE, ADMINISTRATEUR_FONCTIONNEL }
    public enum Permission { READ_SESSIONS, READ_PARTICIPANTS, WRITE_PRESENCE, WRITE_REFERENTIAL, WRITE_CLASSIFICATION, WRITE_ROLES, CORRECT_PRESENCE, READ_REPORTING, READ_AUDIT, MANAGE_SESSION, MANAGE_PARTICIPATION }
    public record Actor(String username, Role role, UUID instructorId) {}
    public record Session(UUID id, String title, String state, Instant lastSlotEnd) {}
    public static final class Forbidden extends RuntimeException {}
    public static final class Conflict extends RuntimeException {
        public Conflict(String message) { super(message); }
    }

    public boolean permits(Actor actor, Permission permission) {
        return switch (actor.role()) {
            case ADMINISTRATEUR_FONCTIONNEL -> true;
            case GESTIONNAIRE -> permission != Permission.WRITE_CLASSIFICATION
                && permission != Permission.WRITE_ROLES && permission != Permission.CORRECT_PRESENCE;
            case INTERVENANT -> permission == Permission.READ_SESSIONS
                || permission == Permission.READ_PARTICIPANTS || permission == Permission.WRITE_PRESENCE;
        };
    }
    public void require(Actor actor, Permission permission) {
        if (!permits(actor, permission)) throw new Forbidden();
    }
    public void requireSession(Actor actor, Permission permission, boolean assigned) {
        require(actor, permission);
        if (actor.role() == Role.INTERVENANT && (actor.instructorId() == null || !assigned)) throw new Forbidden();
    }
    public void requirePresence(Actor actor, Session session, boolean assigned, Instant now) {
        requireSession(actor, Permission.WRITE_PRESENCE, assigned);
        if (session.lastSlotEnd() == null || now.isBefore(session.lastSlotEnd()))
            throw new Conflict("La saisie est possible après le dernier créneau.");
        if (session.state().equals("ANNULEE")) throw new Conflict("La session est annulée.");
        if (session.state().equals("TERMINEE")) require(actor, Permission.CORRECT_PRESENCE);
    }
}
