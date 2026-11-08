package fr.intformation.referentiel.application;

import fr.intformation.habilitations.application.AccessStore;
import fr.intformation.habilitations.domain.AccessPolicy;
import java.util.*;
import fr.intformation.referentiel.domain.*;

public final class SubdomainService {
    private final SubdomainCatalog catalog;
    private final AccessStore accounts;
    private final AccessPolicy policy=new AccessPolicy();
    public SubdomainService(SubdomainCatalog catalog,AccessStore accounts){this.catalog=catalog;this.accounts=accounts;}
    private void authorize(String user){policy.require(accounts.actor(user),AccessPolicy.Permission.WRITE_REFERENTIAL);}
    public SubdomainCatalog.Page list(String user,UUID domainId,int page,int size){
        authorize(user);
        if(page<0 || size<1 || size>100)throw new IllegalArgumentException("Pagination invalide.");
        return catalog.list(domainId,page,size);
    }
    public record ParentChoice(UUID id,String code,String label,boolean active,boolean selectableForCreation){}
    public List<ParentChoice> parents(String user){authorize(user);return catalog.parents().stream().map(d->new ParentChoice(d.id(),d.code(),d.label(),d.active(),d.active())).toList();}
    public SubdomainCatalog.Entry get(String user,UUID id){authorize(user);return catalog.get(id);}
    public SubdomainCatalog.Entry create(String user,UUID parent,String code,String label){authorize(user);return catalog.create(new TrainingSubdomain(UUID.randomUUID(),parent,code,label,true,0));}
    public SubdomainCatalog.Entry legacyCreate(String user,UUID parent,String label){return create(user,parent,"MIG-"+UUID.randomUUID(),label);}
    public List<SubdomainCatalog.Entry> children(String user,UUID parent){authorize(user);return catalog.children(parent);}
    public void update(String user,UUID id,UUID parent,String code,String label,Long version){authorize(user);catalog.update(id,parent,code,label,version);}
    public void deactivate(String user,UUID id,Long version){authorize(user);catalog.deactivate(id,version);}
    public List<SubdomainCatalog.Competency> competencies(String user,UUID id){authorize(user);return catalog.competencies(id);}
    public SubdomainCatalog.Competency addCompetency(String user,UUID id,String label){authorize(user);return catalog.addCompetency(id,TrainingDomain.required(label,"label","Libellé",200));}
}
