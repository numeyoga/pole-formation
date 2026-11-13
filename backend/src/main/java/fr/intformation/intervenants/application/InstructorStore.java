package fr.intformation.intervenants.application;

import fr.intformation.intervenants.domain.Instructor;
import java.util.*;

public interface InstructorStore {
    record Page(List<Instructor> items,long total,int page,int size) {}
    record Session(UUID id,String title,String state) {}
    record Sessions(List<Session> items,long total,int page,int size) {}
    Page list(String query,boolean activeOnly,int page,int size);
    Instructor get(UUID id);
    Instructor create(Instructor.Details details);
    void update(UUID id,Instructor.Details details,Long version);
    void deactivate(UUID id,Long version);
    Sessions sessions(UUID id,int page,int size);
}
