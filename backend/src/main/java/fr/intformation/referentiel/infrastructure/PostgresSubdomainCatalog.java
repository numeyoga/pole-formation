package fr.intformation.referentiel.infrastructure;

import fr.intformation.referentiel.application.SubdomainCatalog;
import fr.intformation.referentiel.domain.*;
import fr.intformation.habilitations.application.AccessService.NotFound;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.Sort;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Repository
public class PostgresSubdomainCatalog implements SubdomainCatalog {
    private final JdbcClient db;
    private final SubdomainRepository subdomains;
    private final DomainRepository domains;
    private static final String SELECT="SELECT s.id,s.domain_id,s.code,s.label,s.active,s.version,d.code AS domain_code,d.label AS domain_label,d.active AS domain_active FROM subdomain_reference s JOIN domain_reference d ON d.id=s.domain_id";
    private static final RowMapper<Entry> ROW=(rs,i)->new Entry(rs.getObject("id",UUID.class),rs.getObject("domain_id",UUID.class),rs.getString("code"),rs.getString("label"),rs.getBoolean("active"),rs.getLong("version"),rs.getString("domain_code"),rs.getString("domain_label"),rs.getBoolean("domain_active"));
    public PostgresSubdomainCatalog(JdbcClient db,SubdomainRepository subdomains,DomainRepository domains){this.db=db;this.subdomains=subdomains;this.domains=domains;}
    private TrainingSubdomain value(SubdomainEntity entity){return new TrainingSubdomain(entity.id,entity.domainId,entity.code,entity.label,entity.active,entity.version);}
    private void save(SubdomainEntity entity){
        try{subdomains.saveAndFlush(entity);}catch(DataIntegrityViolationException error){
            if(error.getMostSpecificCause().getMessage().contains("subdomain_reference_code_unique"))throw new TrainingSubdomain.DuplicateCode();
            throw error;
        }
    }
    public Page list(UUID domainId,int page,int size){
        String filter=domainId==null?"":" WHERE s.domain_id=:parent";
        var count=db.sql("SELECT count(*) FROM subdomain_reference s"+filter);
        var query=db.sql(SELECT+filter+" ORDER BY lower(s.label),s.id LIMIT :size OFFSET :offset").param("size",size).param("offset",(long)page*size);
        if(domainId!=null){count=count.param("parent",domainId);query=query.param("parent",domainId);}
        return new Page(query.query(ROW).list(),count.query(Long.class).single(),page,size);
    }
    public Entry get(UUID id){return db.sql(SELECT+" WHERE s.id=:id").param("id",id).query(ROW).optional().orElseThrow(NotFound::new);}
    public List<TrainingDomain> parents(){return domains.findAll(Sort.by(Sort.Order.asc("code").ignoreCase(),Sort.Order.asc("id"))).stream().map(d->new TrainingDomain(d.id,d.code,d.label,d.active,d.version)).toList();}
    @Transactional
    public Entry create(TrainingSubdomain subdomain){
        var parent=domains.findLocked(subdomain.domainId()).orElseThrow(NotFound::new);
        new TrainingDomain(parent.id,parent.code,parent.label,parent.active,parent.version).requireActive();
        var entity=new SubdomainEntity();entity.id=subdomain.id();entity.domainId=subdomain.domainId();entity.code=subdomain.code();entity.label=subdomain.label();entity.active=true;
        save(entity);return get(entity.id);
    }
    @Transactional
    public void update(UUID id,UUID parent,String code,String label,Long version){
        var entity=subdomains.findLocked(id).orElseThrow(NotFound::new);var changed=value(entity).change(parent,code,label,version);
        entity.code=changed.code();entity.label=changed.label();save(entity);
    }
    @Transactional
    public void deactivate(UUID id,Long version){
        var entity=subdomains.findLocked(id).orElseThrow(NotFound::new);value(entity).checkVersion(version);entity.active=false;save(entity);
    }
    public List<Entry> children(UUID domainId){
        if(!domains.existsById(domainId))throw new NotFound();
        return db.sql(SELECT+" WHERE s.domain_id=:parent ORDER BY lower(s.label),s.id").param("parent",domainId).query(ROW).list();
    }
    public List<Competency> competencies(UUID id){
        get(id);return db.sql("SELECT id,subdomain_id,label FROM competency_reference WHERE subdomain_id=:id ORDER BY label,id").param("id",id)
            .query((rs,i)->new Competency(rs.getObject(1,UUID.class),rs.getObject(2,UUID.class),rs.getString(3))).list();
    }
    @Transactional
    public Competency addCompetency(UUID id,String label){
        var parent=subdomains.findLocked(id).orElseThrow(NotFound::new);value(parent).requireActive();
        var child=new Competency(UUID.randomUUID(),id,label);
        db.sql("INSERT INTO competency_reference (id,subdomain_id,label) VALUES (:id,:parent,:label)").param("id",child.id()).param("parent",id).param("label",label).update();return child;
    }
}
