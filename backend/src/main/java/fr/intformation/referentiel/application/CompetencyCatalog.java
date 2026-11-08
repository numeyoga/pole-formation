package fr.intformation.referentiel.application;

import java.util.*;
import fr.intformation.referentiel.domain.*;

public interface CompetencyCatalog {
    record Entry(UUID id,UUID subdomainId,String code,String label,boolean active,long version,String subdomainCode,String subdomainLabel,boolean subdomainActive) {}
    record Page(List<Entry> items,long total,int page,int size) {}
    Page list(UUID subdomainId,int page,int size);
    Entry get(UUID id);
    List<TrainingSubdomain> parents();
    Entry create(TrainingCompetency competency);
    void update(UUID id,UUID parent,String code,String label,Long version);
    void deactivate(UUID id,Long version);
}
