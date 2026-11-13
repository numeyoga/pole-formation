package fr.intformation.audit.domain;

import fr.intformation.habilitations.domain.AccessPolicy.Conflict;
import java.time.Instant;
import java.util.*;

public final class ChangeRules {
    public record Interval(Instant start,Instant end) {
        public Interval {
            if(start==null || end==null || !start.isBefore(end)) throw new IllegalArgumentException("Créneau invalide.");
        }
        public boolean overlaps(Interval other) { return start.isBefore(other.end) && other.start.isBefore(end); }
    }
    public static final class PlanningConflict extends RuntimeException {
        private final List<UUID> sessions;
        public PlanningConflict(List<UUID> sessions) { super("Des conflits de planning nécessitent une confirmation.");this.sessions=List.copyOf(sessions); }
        public List<UUID> sessions() { return sessions; }
    }
    public void planned(String state) {
        if(!state.equals("PLANIFIEE")) throw new Conflict("Cette opération nécessite une session planifiée.");
    }
    public void editable(String state,long currentVersion,Long expectedVersion,boolean versionRequired) {
        if(!state.equals("BROUILLON")&&!state.equals("PLANIFIEE"))throw new Conflict("Les créneaux d’une session terminée ou annulée ne sont pas modifiables.");
        if(expectedVersion==null){
            if(versionRequired||state.equals("BROUILLON"))throw new IllegalArgumentException("Version de session requise.");
        }else{
            if(expectedVersion<0)throw new IllegalArgumentException("Version invalide.");
            if(expectedVersion!=currentVersion)throw new Conflict("La session a changé. Rechargez sa fiche.");
        }
    }
    public void noOverlap(Interval proposed,List<Interval> others) {
        if(others.stream().anyMatch(proposed::overlaps)) throw new Conflict("Deux créneaux d’une même session ne peuvent pas se chevaucher.");
    }
    public void transition(String before,String after,boolean active,Integer capacity,int occupied) {
        if(before.equals("INSCRITE") && after.equals("DESISTEE")) return;
        if(!before.equals("DESISTEE") || !after.equals("INSCRITE")) throw new Conflict("Transition de participation refusée.");
        if(!active) throw new Conflict("Le collaborateur est inactif.");
        if(capacity!=null && occupied>=capacity) throw new Conflict("La capacité de la session est atteinte.");
    }
    public void confirm(List<UUID> conflicts,boolean confirmed) {
        if(!conflicts.isEmpty() && !confirmed) throw new PlanningConflict(conflicts);
    }
}
