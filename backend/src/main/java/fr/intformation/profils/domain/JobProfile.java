package fr.intformation.profils.domain;

import java.util.UUID;

public record JobProfile(UUID id,String code,String label,String description,boolean active,long version) {
    public static final class InvalidField extends IllegalArgumentException {
        private final String field;
        public InvalidField(String field,String message){super(message);this.field=field;}
        public String field(){return field;}
    }
    public static final class DuplicateCode extends RuntimeException {
        public DuplicateCode(){super("Ce code de profil d’emploi est déjà utilisé, y compris par un profil d’emploi désactivé.");}
    }
    public static final class StaleVersion extends RuntimeException {
        public StaleVersion(){super("Ce profil d’emploi a été modifié. Rechargez sa fiche avant de recommencer.");}
    }
    public JobProfile {
        code=required(code,"code","Code",64);
        label=required(label,"label","Libellé",200);
        description=description==null?"":description.strip();
        if(description.length()>4000)throw new InvalidField("description","Description : 4000 caractères maximum.");
    }
    public static String required(String value,String field,String name,int max){
        if(value==null || value.isBlank())throw new InvalidField(field,name+" requis.");
        value=value.strip();
        if(value.length()>max)throw new InvalidField(field,name+" : "+max+" caractères maximum.");
        return value;
    }
    public JobProfile change(String newCode,String newLabel,String newDescription,Long expectedVersion){
        checkVersion(expectedVersion);
        return new JobProfile(id,newCode,newLabel,newDescription,active,version);
    }
    public void checkVersion(Long expected){
        if(expected==null || expected<0)throw new InvalidField("version","Version invalide.");
        if(expected!=null && expected!=version)throw new StaleVersion();
    }
    public void requireActive(){
        if(!active)throw new fr.intformation.habilitations.domain.AccessPolicy.Conflict("Impossible de créer une exigence pour un profil d’emploi désactivé.");
    }
}
