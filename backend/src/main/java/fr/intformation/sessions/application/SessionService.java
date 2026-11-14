package fr.intformation.sessions.application;

import fr.intformation.sessions.domain.TrainingSession;
import fr.intformation.habilitations.application.AccessStore;
import fr.intformation.habilitations.domain.AccessPolicy;
import java.time.Instant;
import java.util.UUID;

public final class SessionService {
    private final SessionStore store;
    private final AccessStore accounts;
    private final java.time.Clock clock;
    public SessionService(SessionStore store,AccessStore accounts,java.time.Clock clock){this.store=store;this.accounts=accounts;this.clock=clock;}
    private void authorize(String user){new AccessPolicy().require(accounts.actor(user),AccessPolicy.Permission.MANAGE_SESSION);}
    public TrainingSession get(String user,UUID id){authorize(user);return store.get(id);}
    public TrainingSession create(String user,UUID formation,String title,Integer capacity,String modalities){
        authorize(user);TrainingSession.capacity(capacity);
        return store.create(formation,TrainingSession.title(title),capacity,TrainingSession.modalities(modalities));
    }
    public TrainingSession.Slot addSlot(String user,UUID id,Instant start,Instant end,Long version,boolean confirm){authorize(user);return store.addSlot(user,id,start,end,version,confirm,clock.instant());}
    public void transition(String user,UUID id,Long version,String target){authorize(user);store.transition(user,id,version,target,clock.instant());}
    public void plan(String user,UUID id,Long version){authorize(user);store.plan(id,version);}
}
