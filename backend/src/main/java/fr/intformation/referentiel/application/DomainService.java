package fr.intformation.referentiel.application;

import fr.intformation.habilitations.application.AccessStore;
import fr.intformation.habilitations.domain.AccessPolicy;
import fr.intformation.referentiel.domain.TrainingDomain;
import java.util.*;

public final class DomainService {
    private final DomainStore store;
    private final AccessStore accounts;
    private final AccessPolicy policy=new AccessPolicy();
    public DomainService(DomainStore store,AccessStore accounts){this.store=store;this.accounts=accounts;}
    private void authorize(String user){policy.require(accounts.actor(user),AccessPolicy.Permission.WRITE_REFERENTIAL);}
    public TrainingDomain create(String user,String code,String label){
        authorize(user);return store.create(new TrainingDomain(UUID.randomUUID(),code,label,true,0));
    }
    public TrainingDomain get(String user,UUID id){authorize(user);return store.get(id);}
    public DomainStore.Page list(String user,int page,int size){
        authorize(user);if(page<0 || size<1 || size>100)throw new IllegalArgumentException("Pagination invalide.");
        return store.list(page,size);
    }
    public void update(String user,UUID id,String code,String label,Long version){authorize(user);store.update(id,code,label,version);}
    public void deactivate(String user,UUID id,Long version){
        authorize(user);if(version==null || version<0)throw new TrainingDomain.InvalidField("version","Version requise.");store.deactivate(id,version);
    }
}
