package fr.intformation.referentiel.application;

import java.util.*;
import fr.intformation.referentiel.domain.*;

public interface SubdomainCatalog {
    record Entry(UUID id,UUID domainId,String code,String label,boolean active,long version,String domainCode,String domainLabel,boolean domainActive) {}
    record Page(List<Entry> items,long total,int page,int size) {}
    record Competency(UUID id,UUID subdomainId,String label) {}
    Page list(UUID domainId,int page,int size);
    Entry get(UUID id);
    List<TrainingDomain> parents();
    Entry create(TrainingSubdomain subdomain);
    void update(UUID id,UUID parent,String code,String label,Long version);
    void deactivate(UUID id,Long version);
    List<Entry> children(UUID domainId);
    List<Competency> competencies(UUID id);
    Competency addCompetency(UUID id,String label);
}
