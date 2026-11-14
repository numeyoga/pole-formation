package fr.intformation.audit.application;

import fr.intformation.habilitations.domain.AccessPolicy.Actor;
import java.time.Instant;
import java.util.*;

public interface SensitiveStore {
    void changeSlot(Actor actor,UUID session,UUID slot,Instant start,Instant end,boolean confirmConflicts,Long version,Instant now);
    void replaceInstructors(Actor actor,UUID session,List<UUID> instructors,boolean confirmConflicts,Long version,Instant now);
    void transition(Actor actor,UUID session,UUID participation,String state,boolean confirmConflicts,Instant now);
}
