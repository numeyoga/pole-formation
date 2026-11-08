package fr.intformation.referentiel.infrastructure;

import fr.intformation.referentiel.application.CompetencyCatalog;
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
public class PostgresCompetencyCatalog implements CompetencyCatalog, fr.intformation.referentiel.application.CompetencyAvailability {
    private final JdbcClient db;
    private final CompetencyRepository competencies;
    private final SubdomainRepository subdomains;
    private static final String SELECT="SELECT c.id,c.subdomain_id,c.code,c.label,c.active,c.version,s.code AS subdomain_code,s.label AS subdomain_label,s.active AS subdomain_active FROM competency_reference c JOIN subdomain_reference s ON s.id=c.subdomain_id";
    private static final RowMapper<Entry> ROW=(rs,i)->new Entry(rs.getObject("id",UUID.class),rs.getObject("subdomain_id",UUID.class),rs.getString("code"),rs.getString("label"),rs.getBoolean("active"),rs.getLong("version"),rs.getString("subdomain_code"),rs.getString("subdomain_label"),rs.getBoolean("subdomain_active"));
    public PostgresCompetencyCatalog(JdbcClient db,CompetencyRepository competencies,SubdomainRepository subdomains){this.db=db;this.competencies=competencies;this.subdomains=subdomains;}
    private TrainingCompetency value(CompetencyEntity entity){return new TrainingCompetency(entity.id,entity.subdomainId,entity.code,entity.label,entity.active,entity.version);}
    private void save(CompetencyEntity entity){
        try{competencies.saveAndFlush(entity);}catch(DataIntegrityViolationException error){
            if(error.getMostSpecificCause().getMessage().contains("competency_reference_code_unique"))throw new TrainingCompetency.DuplicateCode();
            throw error;
        }
    }
    public Page list(UUID subdomainId,int page,int size){
        String filter=subdomainId==null?"":" WHERE c.subdomain_id=:parent";
        var count=db.sql("SELECT count(*) FROM competency_reference c"+filter);
        var query=db.sql(SELECT+filter+" ORDER BY lower(c.label),c.id LIMIT :size OFFSET :offset").param("size",size).param("offset",(long)page*size);
        if(subdomainId!=null){count=count.param("parent",subdomainId);query=query.param("parent",subdomainId);}
        return new Page(query.query(ROW).list(),count.query(Long.class).single(),page,size);
    }
    public Entry get(UUID id){return db.sql(SELECT+" WHERE c.id=:id").param("id",id).query(ROW).optional().orElseThrow(NotFound::new);}
    public List<TrainingSubdomain> parents(){return subdomains.findAll(Sort.by(Sort.Order.asc("code").ignoreCase(),Sort.Order.asc("id"))).stream().map(s->new TrainingSubdomain(s.id,s.domainId,s.code,s.label,s.active,s.version)).toList();}
    @Transactional(propagation=org.springframework.transaction.annotation.Propagation.MANDATORY)
    public void requireActive(UUID id){value(competencies.findLocked(id).orElseThrow(NotFound::new)).requireActive();}
    @Transactional
    public Entry create(TrainingCompetency competency){
        var parent=subdomains.findLocked(competency.subdomainId()).orElseThrow(NotFound::new);
        new TrainingSubdomain(parent.id,parent.domainId,parent.code,parent.label,parent.active,parent.version).requireActive();
        var entity=new CompetencyEntity();entity.id=competency.id();entity.subdomainId=competency.subdomainId();entity.code=competency.code();entity.label=competency.label();entity.active=true;
        save(entity);return get(entity.id);
    }
    @Transactional
    public void update(UUID id,UUID parent,String code,String label,Long version){
        var entity=competencies.findLocked(id).orElseThrow(NotFound::new);var changed=value(entity).change(parent,code,label,version);
        entity.code=changed.code();entity.label=changed.label();save(entity);
    }
    @Transactional
    public void deactivate(UUID id,Long version){
        var entity=competencies.findLocked(id).orElseThrow(NotFound::new);value(entity).checkVersion(version);entity.active=false;save(entity);
    }
}
