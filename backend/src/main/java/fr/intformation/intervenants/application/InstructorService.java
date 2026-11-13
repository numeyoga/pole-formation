package fr.intformation.intervenants.application;

import fr.intformation.intervenants.domain.Instructor;
import fr.intformation.habilitations.application.AccessStore;
import fr.intformation.habilitations.domain.AccessPolicy;
import java.util.UUID;

public final class InstructorService {
    private final InstructorStore store;
    private final AccessStore accounts;
    public InstructorService(InstructorStore store,AccessStore accounts){this.store=store;this.accounts=accounts;}
    private void authorize(String user){new AccessPolicy().require(accounts.actor(user),AccessPolicy.Permission.MANAGE_SESSION);}
    private void pagination(int page,int size){if(page<0||size<1||size>100)throw new IllegalArgumentException("Pagination invalide.");}
    public InstructorStore.Page list(String user,String query,boolean activeOnly,int page,int size){
        authorize(user);pagination(page,size);query=query==null?"":query.strip();
        if(query.length()>200)throw new Instructor.InvalidField("q","Recherche : 200 caractères maximum.");
        return store.list(query,activeOnly,page,size);
    }
    public Instructor get(String user,UUID id){authorize(user);return store.get(id);}
    public Instructor create(String user,String firstName,String lastName,String contact){authorize(user);return store.create(new Instructor.Details(firstName,lastName,contact));}
    public void update(String user,UUID id,String firstName,String lastName,String contact,Long version){authorize(user);store.update(id,new Instructor.Details(firstName,lastName,contact),version);}
    public void deactivate(String user,UUID id,Long version){authorize(user);store.deactivate(id,version);}
    public InstructorStore.Sessions sessions(String user,UUID id,int page,int size){authorize(user);pagination(page,size);return store.sessions(id,page,size);}
}
