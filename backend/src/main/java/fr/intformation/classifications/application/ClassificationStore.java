package fr.intformation.classifications.application;
import fr.intformation.classifications.domain.Classification;
import java.util.*;
public interface ClassificationStore {
    record Page(List<Classification> items,long total,int page,int size) {}
    Page list(int page,int size,boolean activeOnly);
    Classification get(UUID id);
    Classification create(Classification value);
    void update(UUID id,String code,String label,Integer sortOrder,Boolean active,Long version);
    void rename(UUID id,String label);
}
