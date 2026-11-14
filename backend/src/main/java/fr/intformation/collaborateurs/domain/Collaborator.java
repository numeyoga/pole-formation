package fr.intformation.collaborateurs.domain;

import java.util.UUID;
import fr.intformation.habilitations.domain.AccessPolicy.Conflict;

public record Collaborator(UUID id,String professionalId,String firstName,String lastName,boolean active,long version) {
    public static final class DuplicateProfessionalId extends RuntimeException {public DuplicateProfessionalId(){super("Cet identifiant professionnel est déjà utilisé.");}}
    public record Details(String professionalId,String firstName,String lastName) {
        public Details {professionalId=required(professionalId);firstName=required(firstName);lastName=required(lastName);}
        private static String required(String value){if(value==null||value.isBlank()||value.strip().length()>100)throw new IllegalArgumentException("Champ requis, 100 caractères maximum.");return value.strip();}
    }
    public void requireVersion(Long expected){if(expected==null||expected<0)throw new IllegalArgumentException("Version requise.");if(expected!=version)throw new Conflict("La fiche collaborateur a changé. Rechargez-la.");}
}
