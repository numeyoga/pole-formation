package fr.intformation.intervenants.domain;

import fr.intformation.habilitations.domain.AccessPolicy.Conflict;
import java.util.UUID;

public record Instructor(UUID id,String label,String firstName,String lastName,String professionalContact,boolean active,long version,boolean hasAccount,long sessionCount) {
    public static final class InvalidField extends IllegalArgumentException {
        private final String field;
        public InvalidField(String field,String message){super(message);this.field=field;}
        public String field(){return field;}
    }
    public record Details(String firstName,String lastName,String professionalContact) {
        public Details {
            firstName=name(firstName,"firstName","Prénom");lastName=name(lastName,"lastName","Nom");
            professionalContact=professionalContact==null?"":professionalContact.strip();
            if(professionalContact.length()>2000)throw new InvalidField("professionalContact","Coordonnées professionnelles : 2000 caractères maximum.");
        }
        public String label(){return firstName+" "+lastName;}
    }
    private static String name(String value,String field,String label){
        if(value==null||value.isBlank()||value.strip().length()>100)throw new InvalidField(field,label+" requis, 100 caractères maximum.");
        return value.strip();
    }
    public void requireVersion(Long expected){
        if(expected==null||expected<0)throw new InvalidField("version","Version requise.");
        if(expected!=version)throw new Conflict("La fiche intervenant a changé. Rechargez-la avant de recommencer.");
    }
}
