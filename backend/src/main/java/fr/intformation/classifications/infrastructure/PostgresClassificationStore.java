package fr.intformation.classifications.infrastructure;
import fr.intformation.classifications.application.ClassificationStore;
import fr.intformation.classifications.domain.Classification;
import fr.intformation.habilitations.application.AccessService.NotFound;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;
@Repository
public class PostgresClassificationStore implements ClassificationStore {
    private final ClassificationRepository repository;
    public PostgresClassificationStore(ClassificationRepository repository){this.repository=repository;}
    private Classification value(ClassificationEntity e){return new Classification(e.id,e.code,e.label,e.sortOrder,e.active,e.version);}
    private void save(ClassificationEntity e){try{repository.saveAndFlush(e);}catch(DataIntegrityViolationException error){if(error.getMostSpecificCause().getMessage().contains("classification_code_unique"))throw new Classification.DuplicateCode();throw error;}}
    public Classification get(UUID id){return value(repository.findById(id).orElseThrow(NotFound::new));}
    public Page list(int page,int size,boolean activeOnly){
        var pageable=PageRequest.of(page,size,Sort.by("sortOrder").ascending().and(Sort.by(Sort.Order.asc("code").ignoreCase(),Sort.Order.asc("id"))));
        var result=activeOnly?repository.findByActiveTrue(pageable):repository.findAll(pageable);
        return new Page(result.getContent().stream().map(this::value).toList(),result.getTotalElements(),page,size);
    }
    @Transactional public Classification create(Classification v){var e=new ClassificationEntity();e.id=v.id();e.code=v.code();e.label=v.label();e.sortOrder=v.sortOrder();e.active=v.active();save(e);return get(e.id);}
    @Transactional public void update(UUID id,String code,String label,Integer order,Boolean active,Long version){
        var e=repository.findLocked(id).orElseThrow(NotFound::new);var changed=value(e).change(code,label,order,active,version);
        e.code=changed.code();e.label=changed.label();e.sortOrder=changed.sortOrder();e.active=changed.active();save(e);
    }
    @Transactional public void rename(UUID id,String label){
        var e=repository.findLocked(id).orElseThrow(NotFound::new);var changed=new Classification(e.id,e.code,label,e.sortOrder,e.active,e.version);e.label=changed.label();save(e);
    }
}
