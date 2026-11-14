package fr.intformation.collaborateurs.application;

import fr.intformation.collaborateurs.domain.Collaborator;
import fr.intformation.habilitations.application.AccessStore;
import fr.intformation.habilitations.domain.AccessPolicy;
import java.util.UUID;

public final class CollaboratorService {
    private final CollaboratorStore store;private final AccessStore accounts;
    public CollaboratorService(CollaboratorStore store,AccessStore accounts){this.store=store;this.accounts=accounts;}
    private void authorize(String user){new AccessPolicy().require(accounts.actor(user),AccessPolicy.Permission.MANAGE_PARTICIPATION);}
    private void pagination(int page,int size){if(page<0||size<1||size>100)throw new IllegalArgumentException("Pagination invalide.");}
    public CollaboratorStore.Page list(String user,String query,boolean activeOnly,int page,int size){authorize(user);pagination(page,size);query=query.strip();if(query.length()>200)throw new IllegalArgumentException("Recherche trop longue.");return store.list(query,activeOnly,page,size);}
    public Collaborator get(String user,UUID id){authorize(user);return store.get(id);}
    public Collaborator create(String user,String professionalId,String firstName,String lastName){authorize(user);return store.create(new Collaborator.Details(professionalId,firstName,lastName));}
    public void update(String user,UUID id,String professionalId,String firstName,String lastName,Long version){authorize(user);store.update(id,new Collaborator.Details(professionalId,firstName,lastName),version);}
    public void deactivate(String user,UUID id,Long version){authorize(user);store.deactivate(id,version);}
    public CollaboratorStore.History history(String user,UUID id,int page,int size){authorize(user);pagination(page,size);return store.history(id,page,size);}
}
