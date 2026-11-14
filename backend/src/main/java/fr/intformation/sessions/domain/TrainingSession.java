package fr.intformation.sessions.domain;

import fr.intformation.habilitations.domain.AccessPolicy.Conflict;
import java.time.Instant;
import java.util.*;

public record TrainingSession(UUID id,UUID formationId,String title,String state,Integer capacity,String modalities,long version,List<Slot> slots,List<AssignedInstructor> instructors) {
    public record AssignedInstructor(UUID id,String label,boolean active) {}
    public record Slot(UUID id,Instant startsAt,Instant endsAt) {}
    public static final class InvalidField extends IllegalArgumentException {
        private final String field;
        public InvalidField(String field,String message){super(message);this.field=field;}
        public String field(){return field;}
    }
    public static String title(String value){
        if(value==null||value.isBlank()||value.strip().length()>200)throw new InvalidField("title","Intitulé requis, 200 caractères maximum.");
        return value.strip();
    }
    public static String modalities(String value){
        value=value==null?"":value.strip();
        if(value.length()>4000)throw new InvalidField("modalities","Modalités : 4000 caractères maximum.");
        return value;
    }
    public static void capacity(Integer value){if(value!=null&&value<1)throw new InvalidField("capacity","La capacité doit être un entier strictement positif.");}
    public void requireTransition(Long expected,String target,Instant now,boolean pendingAttendance){
        if(expected==null||expected<0)throw new InvalidField("version","Version requise.");
        if(expected!=version)throw new Conflict("La session a changé. Rechargez sa fiche.");
        if(target.equals("ANNULEE")){
            if(!state.equals("BROUILLON")&&!state.equals("PLANIFIEE"))throw new Conflict("Seule une session Brouillon ou Planifiée peut être annulée.");
        }else if(target.equals("TERMINEE")){
            if(!state.equals("PLANIFIEE"))throw new Conflict("La clôture nécessite une session planifiée.");
            if(slots.isEmpty()||slots.stream().anyMatch(slot->now.isBefore(slot.endsAt())))throw new Conflict("La clôture est possible après le dernier créneau.");
            if(pendingAttendance)throw new Conflict("Les participations Inscrites doivent être renseignées avant la clôture.");
        }else throw new IllegalArgumentException("Transition inconnue.");
    }
    public void requireDraft(Long expected){
        if(expected==null||expected<0)throw new InvalidField("version","Version requise.");
        if(expected!=version)throw new Conflict("La session a changé. Rechargez sa fiche.");
        if(!state.equals("BROUILLON"))throw new Conflict("Cette opération nécessite une session Brouillon.");
    }
    public void requirePlannable(Long expected){
        requireDraft(expected);
        if(formationId==null)throw new Conflict("La session doit être rattachée à une formation.");
        if(slots.isEmpty())throw new Conflict("Un créneau est requis avant de planifier la session.");
    }
}
