package fr.intformation.participations.application;
import fr.intformation.habilitations.application.AccessStore;
import fr.intformation.habilitations.domain.AccessPolicy;
import java.time.Clock;
import java.util.UUID;
public final class EnrollmentService {
    private final AccessStore accounts;private final EnrollmentStore store;private final Clock clock;
    public EnrollmentService(AccessStore accounts,EnrollmentStore store,Clock clock){this.accounts=accounts;this.store=store;this.clock=clock;}
    public UUID enroll(String user,UUID session,UUID collaborator,boolean confirm){new AccessPolicy().require(accounts.actor(user),AccessPolicy.Permission.MANAGE_PARTICIPATION);if(collaborator==null)throw new IllegalArgumentException("Collaborateur requis.");return store.enroll(user,session,collaborator,confirm,clock.instant());}
}
