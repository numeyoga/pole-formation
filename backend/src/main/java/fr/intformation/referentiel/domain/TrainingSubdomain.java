package fr.intformation.referentiel.domain;

import fr.intformation.habilitations.domain.AccessPolicy.Conflict;
import java.util.UUID;

public record TrainingSubdomain(UUID id,UUID domainId,String code,String label,boolean active,long version) {
    public static final class DuplicateCode extends RuntimeException {
        public DuplicateCode(){super("Ce code de sous-domaine est déjà utilisé, y compris par un sous-domaine désactivé.");}
    }
    public static final class StaleVersion extends RuntimeException {
        public StaleVersion(){super("Ce sous-domaine a été modifié. Rechargez sa fiche avant de recommencer.");}
    }
    public TrainingSubdomain {
        if(domainId==null)throw new TrainingDomain.InvalidField("domainId","Domaine parent requis.");
        code=TrainingDomain.required(code,"code","Code",64);
        label=TrainingDomain.required(label,"label","Libellé",200);
    }
    public void checkVersion(Long expected){
        if(expected==null || expected<0)throw new TrainingDomain.InvalidField("version","Version requise.");
        if(expected!=version)throw new StaleVersion();
    }
    public TrainingSubdomain change(UUID parent,String newCode,String newLabel,Long expected){
        checkVersion(expected);
        if(parent!=null && !domainId.equals(parent))throw new Conflict("Le domaine parent est fixé à la création du sous-domaine.");
        return new TrainingSubdomain(id,domainId,newCode,newLabel,active,version);
    }
    public void requireActive(){if(!active)throw new Conflict("Impossible de rattacher une compétence à un sous-domaine désactivé.");}
}
