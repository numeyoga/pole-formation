package fr.intformation.participations.application;
import java.util.UUID;
import java.time.Instant;
public interface EnrollmentStore {
    UUID enroll(String actor,UUID session,UUID collaborator,boolean confirm,Instant now);
}
