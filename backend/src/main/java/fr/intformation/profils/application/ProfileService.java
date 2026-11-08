package fr.intformation.profils.application;

import fr.intformation.habilitations.application.AccessStore;
import fr.intformation.habilitations.domain.AccessPolicy;
import fr.intformation.profils.domain.JobProfile;
import java.util.*;

public final class ProfileService {
    private final ProfileStore store;
    private final AccessStore accounts;
    private final AccessPolicy policy=new AccessPolicy();
    public ProfileService(ProfileStore store,AccessStore accounts){this.store=store;this.accounts=accounts;}
    private void authorize(String user){policy.require(accounts.actor(user),AccessPolicy.Permission.WRITE_REFERENTIAL);}
    public JobProfile create(String user,String code,String label,String description){
        authorize(user);return store.create(new JobProfile(UUID.randomUUID(),code,label,description,true,0));
    }
    public JobProfile get(String user,UUID id){authorize(user);return store.get(id);}
    public ProfileStore.Page list(String user,int page,int size){
        authorize(user);if(page<0 || size<1 || size>100)throw new IllegalArgumentException("Pagination invalide.");
        return store.list(page,size);
    }
    public List<ProfileStore.Requirement> requirements(String user,UUID id){authorize(user);return store.requirements(id);}
    public ProfileStore.Requirement addRequirement(String user,UUID id,UUID competencyId,UUID classificationId){
        authorize(user);
        if(competencyId==null)throw new JobProfile.InvalidField("competencyId","Compétence requise.");
        if(classificationId==null)throw new JobProfile.InvalidField("classificationId","Classification requise.");
        return store.addRequirement(id,competencyId,classificationId);
    }
    public void update(String user,UUID id,String code,String label,String description,Long version){authorize(user);store.update(id,code,label,description,version);}
    public void deactivate(String user,UUID id,Long version){
        authorize(user);if(version==null || version<0)throw new JobProfile.InvalidField("version","Version requise.");store.deactivate(id,version);
    }
}
