package fr.intformation.habilitations.application;

import fr.intformation.habilitations.domain.AccessPolicy;
import fr.intformation.habilitations.domain.AccessPolicy.*;
import java.time.Clock;
import java.util.*;

public final class AccessService {
    public static final class NotFound extends RuntimeException {}
    private final AccessStore store;
    private final AccessPolicy policy;
    private final Clock clock;
    public AccessService(AccessStore store, AccessPolicy policy, Clock clock) {
        this.store = store; this.policy = policy; this.clock = clock;
    }
    public Actor actor(String username) { return store.actor(username); }
    public List<String> permissions(String username) {
        Actor actor = actor(username);
        return Arrays.stream(Permission.values()).filter(p -> policy.permits(actor, p)).map(Enum::name).toList();
    }
    public List<Session> sessions(String username) {
        Actor actor = actor(username); policy.require(actor, Permission.READ_SESSIONS); return store.sessions(actor);
    }
    public List<AccessStore.Participant> participants(String username, UUID id) {
        Actor actor = actor(username);
        policy.requireSession(actor, Permission.READ_PARTICIPANTS, store.assigned(id, actor.instructorId()));
        store.session(id);
        return store.participants(id);
    }
    public void presence(String username, UUID id, UUID participationId, String state) {
        Actor actor = actor(username);
        policy.requireSession(actor, Permission.WRITE_PRESENCE, store.assigned(id, actor.instructorId()));
        if (state == null || !Set.of("PRESENTE", "ABSENTE").contains(state)) throw new IllegalArgumentException("Présence ou absence attendue.");
        // The store locks the session and rechecks temporal/state conditions in the transaction.
        store.presence(actor, id, participationId, state, clock.instant());
    }
    public List<AccessStore.Account> accounts(String username) {
        policy.require(actor(username), Permission.WRITE_ROLES); return store.accounts();
    }
    public void changeRole(String username, String target, Role role) {
        Actor actor = actor(username); policy.require(actor, Permission.WRITE_ROLES);
        if (role == null) throw new IllegalArgumentException("Rôle requis.");
        store.changeRole(actor, target, role, clock.instant());
    }
}
