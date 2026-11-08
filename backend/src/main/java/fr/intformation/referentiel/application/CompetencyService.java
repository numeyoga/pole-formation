package fr.intformation.referentiel.application;

import fr.intformation.habilitations.application.AccessStore;
import fr.intformation.habilitations.domain.AccessPolicy;
import fr.intformation.referentiel.domain.TrainingCompetency;
import java.util.*;

public final class CompetencyService {
    private final CompetencyCatalog catalog;
    private final AccessStore accounts;
    private final AccessPolicy policy=new AccessPolicy();
    public CompetencyService(CompetencyCatalog catalog,AccessStore accounts){this.catalog=catalog;this.accounts=accounts;}
    private void authorize(String user){policy.require(accounts.actor(user),AccessPolicy.Permission.WRITE_REFERENTIAL);}
    public CompetencyCatalog.Page list(String user,UUID subdomainId,int page,int size){
        authorize(user);
        if(page<0 || size<1 || size>100)throw new IllegalArgumentException("Pagination invalide.");
        return catalog.list(subdomainId,page,size);
    }
    public record ParentChoice(UUID id,String code,String label,boolean active,boolean selectableForCreation){}
    public List<ParentChoice> parents(String user){authorize(user);return catalog.parents().stream().map(p->new ParentChoice(p.id(),p.code(),p.label(),p.active(),p.active())).toList();}
    public CompetencyCatalog.Entry get(String user,UUID id){authorize(user);return catalog.get(id);}
    public CompetencyCatalog.Entry create(String user,UUID parent,String code,String label){authorize(user);return catalog.create(new TrainingCompetency(UUID.randomUUID(),parent,code,label,true,0));}
    public void update(String user,UUID id,UUID parent,String code,String label,Long version){authorize(user);catalog.update(id,parent,code,label,version);}
    public void deactivate(String user,UUID id,Long version){authorize(user);catalog.deactivate(id,version);}
}
