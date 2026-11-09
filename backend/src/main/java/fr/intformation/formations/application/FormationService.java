package fr.intformation.formations.application;

import fr.intformation.formations.domain.Formation;
import fr.intformation.habilitations.application.AccessStore;
import fr.intformation.habilitations.domain.AccessPolicy;
import java.time.Clock;
import java.util.*;

public final class FormationService {
    private final FormationStore store;private final AccessStore accounts;private final Clock clock;
    private final AccessPolicy policy=new AccessPolicy();
    public FormationService(FormationStore store,AccessStore accounts,Clock clock){this.store=store;this.accounts=accounts;this.clock=clock;}
    private void authorize(String user){policy.require(accounts.actor(user),AccessPolicy.Permission.WRITE_REFERENTIAL);}
    public FormationStore.Page list(String user,int page,int size){authorize(user);if(page<0||size<1||size>100)throw new IllegalArgumentException("Pagination invalide.");return store.list(page,size);}
    public Formation get(String user,UUID id){authorize(user);return store.get(id);}
    public Formation create(String user,String code,String title,String objectives,String description,Integer duration){
        authorize(user);return store.create(user,new Formation(UUID.randomUUID(),code,title,objectives,description,duration,Formation.State.BROUILLON,0),clock.instant());
    }
    public void update(String user,UUID id,String code,String title,String objectives,String description,Integer duration,Long version){authorize(user);store.update(user,id,code,title,objectives,description,duration,version,clock.instant());}
    public void transition(String user,UUID id,String action,Long version){authorize(user);store.transition(user,id,action,version,clock.instant());}
    public List<FormationStore.Session> sessions(String user,UUID id){authorize(user);return store.sessions(id);}
    public FormationStore.Session createSession(String user,UUID id,String title){authorize(user);return store.createSession(id,Formation.required(title,"title","Intitulé de session",200));}
}
