package fr.intformation.formations.domain;

import java.util.UUID;
import fr.intformation.habilitations.domain.AccessPolicy.Conflict;

public record Formation(UUID id,String code,String title,String objectives,String description,Integer durationMinutes,State state,long version) {
    public enum State { BROUILLON, ACTIVE, ARCHIVEE }
    public static final class InvalidField extends IllegalArgumentException {
        private final String field;
        public InvalidField(String field,String message){super(message);this.field=field;}
        public String field(){return field;}
    }
    public static final class DuplicateCode extends RuntimeException {
        public DuplicateCode(){super("Ce code de formation est déjà utilisé, y compris par une formation archivée.");}
    }
    public Formation {
        code=required(code,"code","Code",64);title=required(title,"title","Intitulé",200);
        objectives=optional(objectives,"objectives","Objectifs");description=optional(description,"description","Description");
        if(durationMinutes!=null && durationMinutes<1)throw new InvalidField("durationMinutes","Durée : nombre entier de minutes strictement positif.");
        if(state==null)throw new IllegalArgumentException("État requis.");
    }
    public static String required(String value,String field,String label,int max){
        if(value==null||value.isBlank())throw new InvalidField(field,label+" requis.");
        value=value.strip();if(value.length()>max)throw new InvalidField(field,label+" : "+max+" caractères maximum.");return value;
    }
    private static String optional(String value,String field,String label){
        value=value==null?"":value.strip();if(value.length()>4000)throw new InvalidField(field,label+" : 4000 caractères maximum.");return value;
    }
    public void checkVersion(Long expected){
        if(expected==null||expected<0)throw new InvalidField("version","Version requise.");
        if(expected!=version)throw new Conflict("Cette formation a été modifiée. Rechargez sa fiche avant de recommencer.");
    }
    public Formation change(String code,String title,String objectives,String description,Integer duration,Long expected){
        checkVersion(expected);return new Formation(id,code,title,objectives,description,duration,state,version+1);
    }
    public Formation transition(String action,Long expected){
        checkVersion(expected);
        State target=switch(action){
            case "activation" -> {if(state!=State.BROUILLON)throw new Conflict("Seule une formation brouillon peut être activée.");yield State.ACTIVE;}
            case "archivage" -> {if(state==State.ARCHIVEE)throw new Conflict("Cette formation est déjà archivée.");yield State.ARCHIVEE;}
            case "reactivation" -> {if(state!=State.ARCHIVEE)throw new Conflict("Seule une formation archivée peut être réactivée.");yield State.ACTIVE;}
            default -> throw new IllegalArgumentException("Transition inconnue.");
        };
        return new Formation(id,code,title,objectives,description,durationMinutes,target,version+1);
    }
    public void requireActive(){if(state!=State.ACTIVE)throw new Conflict("Une nouvelle session requiert une formation active.");}
}
