package fr.intformation.sessions.application;

import fr.intformation.sessions.domain.TrainingSession;
import java.time.Instant;
import java.util.UUID;

public interface SessionStore {
    TrainingSession get(UUID id);
    TrainingSession create(UUID formation,String title,Integer capacity,String modalities);
    TrainingSession.Slot addSlot(UUID id,Instant start,Instant end,Long version);
    void plan(UUID id,Long version);
}
