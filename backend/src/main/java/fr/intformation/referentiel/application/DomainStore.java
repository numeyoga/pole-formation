package fr.intformation.referentiel.application;

import fr.intformation.referentiel.domain.TrainingDomain;
import java.util.*;

public interface DomainStore {
    record Page(List<TrainingDomain> items,long total,int page,int size) {}
    TrainingDomain create(TrainingDomain domain);
    TrainingDomain get(UUID id);
    Page list(int page,int size);
    void update(UUID id,String code,String label,Long version);
    void deactivate(UUID id,long version);
}
