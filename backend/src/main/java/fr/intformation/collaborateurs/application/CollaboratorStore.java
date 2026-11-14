package fr.intformation.collaborateurs.application;

import fr.intformation.collaborateurs.domain.Collaborator;
import java.util.*;

public interface CollaboratorStore {
    record Page(List<Collaborator> items,long total,int page,int size) {}
    record Participation(UUID id,UUID sessionId,String title,String sessionState,String state) {}
    record History(List<Participation> items,long total,int page,int size) {}
    Page list(String q,boolean activeOnly,int page,int size);
    Collaborator get(UUID id);
    Collaborator create(Collaborator.Details details);
    void update(UUID id,Collaborator.Details details,Long version);
    void deactivate(UUID id,Long version);
    History history(UUID id,int page,int size);
}
