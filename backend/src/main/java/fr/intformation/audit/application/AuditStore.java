package fr.intformation.audit.application;

import java.time.Instant;
import java.util.*;

public interface AuditStore {
    record Event(long sequence, UUID id, Instant occurredAt, String actor, String action,
                 String subjectType, String subjectId, UUID sessionId,
                 Map<String,Object> before, Map<String,Object> after) {}
    record Query(String subjectType, String subjectId, UUID sessionId, Long beforeSequence, int limit) {}
    List<Event> read(Query query);
}
