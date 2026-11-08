package fr.intformation.habilitations.application;

import fr.intformation.habilitations.domain.AccessPolicy.*;
import java.time.Instant;
import java.util.*;

public interface AccessStore {
    record Participant(UUID id, String firstName, String lastName, String professionalId, String state) {}
    record Account(String username, Role role) {}
    Actor actor(String username);
    List<Session> sessions(Actor actor);
    Session session(UUID id);
    boolean assigned(UUID sessionId, UUID instructorId);
    List<Participant> participants(UUID sessionId);
    void presence(Actor actor, UUID sessionId, UUID participationId, String state, Instant now);
    void renameClassification(UUID id, String label);
    List<Account> accounts();
    void changeRole(Actor actor, String username, Role role, Instant now);
}
