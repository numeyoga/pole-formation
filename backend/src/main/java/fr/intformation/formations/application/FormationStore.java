package fr.intformation.formations.application;

import fr.intformation.formations.domain.Formation;
import java.time.Instant;
import java.util.*;

public interface FormationStore {
    record Page(List<Formation> items,long total,int page,int size) {}
    record Session(UUID id,String title,String state) {}
    record Coverage(UUID id,UUID competencyId,String competencyCode,String competencyLabel,boolean active) {}
    record CoveragePage(List<Coverage> items,long total,int page,int size) {}
    record Choice(UUID id,String code,String label) {}
    record Choices(List<Choice> items,long total,int page,int size) {}
    CoveragePage coverage(UUID id,int page,int size);
    Coverage associate(UUID id,UUID competencyId);
    Choices competencyChoices(String query,int page,int size);
    Page list(int page,int size);
    Formation get(UUID id);
    Formation create(String actor,Formation formation,Instant now);
    void update(String actor,UUID id,String code,String title,String objectives,String description,Integer duration,Long version,Instant now);
    void transition(String actor,UUID id,String action,Long version,Instant now);
    List<Session> sessions(UUID id);
    Session createSession(UUID id,String title);
}
