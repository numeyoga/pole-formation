package fr.intformation.classifications.application;
import fr.intformation.classifications.domain.Classification;
import fr.intformation.habilitations.application.AccessStore;
import fr.intformation.habilitations.domain.AccessPolicy;
import java.util.UUID;
public final class ClassificationService {
    private final ClassificationStore store;
    private final AccessStore accounts;
    private final AccessPolicy policy=new AccessPolicy();
    public ClassificationService(ClassificationStore store,AccessStore accounts){this.store=store;this.accounts=accounts;}
    private void read(String user){policy.require(accounts.actor(user),AccessPolicy.Permission.WRITE_REFERENTIAL);}
    private void write(String user){policy.require(accounts.actor(user),AccessPolicy.Permission.WRITE_CLASSIFICATION);}
    public ClassificationStore.Page list(String user,int page,int size,boolean activeOnly){read(user);if(page<0||size<1||size>100)throw new IllegalArgumentException();return store.list(page,size,activeOnly);}
    public Classification get(String user,UUID id){read(user);return store.get(id);}
    public Classification create(String user,String code,String label,Integer order){write(user);return store.create(new Classification(UUID.randomUUID(),code,label,Classification.order(order),true,0));}
    public void update(String user,UUID id,String code,String label,Integer order,Boolean active,Long version){write(user);store.update(id,code,label,order,active,version);}
    public void rename(String user,UUID id,String label){write(user);store.rename(id,label);}
}
