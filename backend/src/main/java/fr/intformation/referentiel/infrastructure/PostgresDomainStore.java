package fr.intformation.referentiel.infrastructure;

import fr.intformation.referentiel.application.DomainStore;
import fr.intformation.referentiel.domain.TrainingDomain;
import fr.intformation.habilitations.application.AccessService.NotFound;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Repository
public class PostgresDomainStore implements DomainStore {
    private final DomainRepository domains;
    public PostgresDomainStore(DomainRepository domains){this.domains=domains;}
    private TrainingDomain value(DomainEntity entity){return new TrainingDomain(entity.id,entity.code,entity.label,entity.active,entity.version);}
    private void save(DomainEntity entity){
        try{domains.saveAndFlush(entity);}catch(DataIntegrityViolationException error){
            if(error.getMostSpecificCause().getMessage().contains("domain_reference_code_unique"))throw new TrainingDomain.DuplicateCode();
            throw error;
        }
    }
    @Transactional
    public TrainingDomain create(TrainingDomain domain){
        var entity=new DomainEntity();entity.id=domain.id();entity.code=domain.code();entity.label=domain.label();entity.active=true;
        save(entity);return value(domains.findById(domain.id()).orElseThrow(NotFound::new));
    }
    public TrainingDomain get(UUID id){return value(domains.findById(id).orElseThrow(NotFound::new));}
    public DomainStore.Page list(int page,int size){
        var result=domains.findAll(PageRequest.of(page,size,Sort.by(Sort.Order.asc("code").ignoreCase(),Sort.Order.asc("id"))));
        return new DomainStore.Page(result.getContent().stream().map(this::value).toList(),result.getTotalElements(),page,size);
    }
    @Transactional
    public void update(UUID id,String code,String label,Long version){
        var entity=domains.findLocked(id).orElseThrow(NotFound::new);var changed=value(entity).change(code,label,version);
        entity.code=changed.code();entity.label=changed.label();save(entity);
    }
    @Transactional
    public void deactivate(UUID id,long version){
        var entity=domains.findLocked(id).orElseThrow(NotFound::new);value(entity).checkVersion(version);
        entity.active=false;save(entity);
    }
}
