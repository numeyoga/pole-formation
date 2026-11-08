package fr.intformation.referentiel.domain;

import java.util.UUID;

public record TrainingDomain(UUID id,String code,String label,boolean active,long version) {
    public static final class InvalidField extends IllegalArgumentException {
        private final String field;
        public InvalidField(String field,String message){super(message);this.field=field;}
        public String field(){return field;}
    }
    public static final class DuplicateCode extends RuntimeException {
        public DuplicateCode(){super("Ce code de domaine est déjà utilisé, y compris par un domaine désactivé.");}
    }
    public static final class StaleVersion extends RuntimeException {
        public StaleVersion(){super("Ce domaine a été modifié. Rechargez sa fiche avant de recommencer.");}
    }
    public TrainingDomain {
        code=required(code,"code","Code",64);
        label=required(label,"label","Libellé",200);
    }
    public static String required(String value,String field,String name,int max){
        if(value==null || value.isBlank())throw new InvalidField(field,name+" requis.");
        value=value.strip();
        if(value.length()>max)throw new InvalidField(field,name+" : "+max+" caractères maximum.");
        return value;
    }
    public TrainingDomain change(String newCode,String newLabel,Long expectedVersion){
        checkVersion(expectedVersion);
        return new TrainingDomain(id,newCode==null?code:newCode,newLabel,active,version);
    }
    public void checkVersion(Long expected){
        if(expected!=null && expected<0)throw new InvalidField("version","Version invalide.");
        if(expected!=null && expected!=version)throw new StaleVersion();
    }
    public void requireActive(){
        if(!active)throw new fr.intformation.habilitations.domain.AccessPolicy.Conflict("Impossible de créer un sous-domaine dans un domaine désactivé.");
    }
}
