package fr.intformation.referentiel.application;

import fr.intformation.habilitations.application.AccessStore;
import fr.intformation.habilitations.domain.AccessPolicy;
import fr.intformation.referentiel.domain.TrainingDomain;

public final class ReferenceExplorerService {
    private final ReferenceExplorerCatalog catalog;
    private final AccessStore accounts;
    private final AccessPolicy policy=new AccessPolicy();
    public ReferenceExplorerService(ReferenceExplorerCatalog catalog,AccessStore accounts){this.catalog=catalog;this.accounts=accounts;}
    public ReferenceExplorerCatalog.Page search(String user,String query,int page,int size){
        policy.require(accounts.actor(user),AccessPolicy.Permission.WRITE_REFERENTIAL);
        if(page<0 || size<1 || size>100)throw new IllegalArgumentException("Pagination invalide.");
        query=query==null?"":query.strip();
        if(query.length()>200)throw new TrainingDomain.InvalidField("q","Recherche : 200 caractères maximum.");
        return catalog.search(query,page,size);
    }
}
