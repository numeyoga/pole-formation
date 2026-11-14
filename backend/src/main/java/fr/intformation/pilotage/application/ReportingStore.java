package fr.intformation.pilotage.application;
import java.time.Instant;
import java.util.*;
public interface ReportingStore {
    record Query(Instant from,Instant until,UUID formationId,String state,int page,int size) {
        public Query {if(from!=null&&until!=null&&!from.isBefore(until))throw new IllegalArgumentException("Période invalide.");if(page<0||size<1||size>100)throw new IllegalArgumentException("Pagination invalide.");if(state!=null&&!Set.of("BROUILLON","PLANIFIEE","TERMINEE","ANNULEE").contains(state))throw new IllegalArgumentException("État invalide.");}
    }
    record Counts(long registered,long present,long absent,long withdrawn) {}
    record Overview(long activeFormations,Map<String,Long> sessions,Counts participations,Counts cancelledParticipations,long realizedSessions) {}
    record Session(UUID id,UUID formationId,String title,String state,Instant firstSlotStart,Counts participations) {}
    record Page(List<Session> items,long total,int page,int size) {}
    Overview overview(Query query);
    Page sessions(Query query);
}
