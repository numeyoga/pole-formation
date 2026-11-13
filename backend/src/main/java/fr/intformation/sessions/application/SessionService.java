package fr.intformation.sessions.application;

import fr.intformation.sessions.domain.TrainingSession;
import fr.intformation.habilitations.application.AccessStore;
import fr.intformation.habilitations.domain.AccessPolicy;
import java.time.Instant;
import java.util.UUID;

public final class SessionService {
    private final SessionStore store;
    private final AccessStore accounts;
    public SessionService(SessionStore store,AccessStore accounts){this.store=store;this.accounts=accounts;}
    private void authorize(String user){new AccessPolicy().require(accounts.actor(user),AccessPolicy.Permission.MANAGE_SESSION);}
    public TrainingSession get(String user,UUID id){authorize(user);return store.get(id);}
    public TrainingSession create(String user,UUID formation,String title,Integer capacity,String modalities){
        authorize(user);TrainingSession.capacity(capacity);
        return store.create(formation,TrainingSession.title(title),capacity,TrainingSession.modalities(modalities));
    }
    public TrainingSession.Slot addSlot(String user,UUID id,Instant start,Instant end,Long version){authorize(user);return store.addSlot(id,start,end,version);}
    public void plan(String user,UUID id,Long version){authorize(user);store.plan(id,version);}
}
