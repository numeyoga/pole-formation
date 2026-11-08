package fr.intformation.referentiel.domain;

import fr.intformation.habilitations.domain.AccessPolicy.Conflict;
import java.util.UUID;

public record TrainingCompetency(UUID id,UUID subdomainId,String code,String label,boolean active,long version) {
    public static final class DuplicateCode extends RuntimeException {
        public DuplicateCode(){super("Ce code de compétence est déjà utilisé, y compris par une compétence désactivée.");}
    }
    public static final class StaleVersion extends RuntimeException {
        public StaleVersion(){super("Cette compétence a été modifiée. Rechargez sa fiche avant de recommencer.");}
    }
    public TrainingCompetency {
        if(subdomainId==null)throw new TrainingDomain.InvalidField("subdomainId","Sous-domaine parent requis.");
        code=TrainingDomain.required(code,"code","Code",64);
        label=TrainingDomain.required(label,"label","Libellé",200);
    }
    public void checkVersion(Long expected){
        if(expected==null || expected<0)throw new TrainingDomain.InvalidField("version","Version requise.");
        if(expected!=version)throw new StaleVersion();
    }
    public TrainingCompetency change(UUID parent,String newCode,String newLabel,Long expected){
        checkVersion(expected);
        if(parent!=null && !subdomainId.equals(parent))throw new Conflict("Le sous-domaine parent est fixé à la création de la compétence.");
        return new TrainingCompetency(id,subdomainId,newCode,newLabel,active,version);
    }
    public void requireActive(){if(!active)throw new Conflict("Impossible de créer une association avec une compétence désactivée.");}
}
