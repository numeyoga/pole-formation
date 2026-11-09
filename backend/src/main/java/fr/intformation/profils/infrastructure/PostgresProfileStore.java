package fr.intformation.profils.infrastructure;

import fr.intformation.profils.application.ProfileStore;
import fr.intformation.profils.domain.JobProfile;
import fr.intformation.habilitations.application.AccessService.NotFound;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.data.domain.*;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;
import java.util.*;

@Repository
public class PostgresProfileStore implements ProfileStore {
    private final ProfileRepository profiles;
    private final org.springframework.jdbc.core.simple.JdbcClient db;
    private final fr.intformation.referentiel.application.CompetencyAvailability competencies;
    public PostgresProfileStore(ProfileRepository profiles,org.springframework.jdbc.core.simple.JdbcClient db,fr.intformation.referentiel.application.CompetencyAvailability competencies){this.profiles=profiles;this.db=db;this.competencies=competencies;}
    private JobProfile value(ProfileEntity entity){return new JobProfile(entity.id,entity.code,entity.label,entity.description,entity.active,entity.version);}
    private void save(ProfileEntity entity){
        try{profiles.saveAndFlush(entity);}catch(DataIntegrityViolationException error){
            if(error.getMostSpecificCause().getMessage().contains("job_profile_code_unique"))throw new JobProfile.DuplicateCode();
            throw error;
        }
    }
    @Transactional
    public JobProfile create(JobProfile domain){
        var entity=new ProfileEntity();entity.id=domain.id();entity.code=domain.code();entity.label=domain.label();entity.description=domain.description();entity.active=true;
        save(entity);return value(profiles.findById(domain.id()).orElseThrow(NotFound::new));
    }
    public JobProfile get(UUID id){return value(profiles.findById(id).orElseThrow(NotFound::new));}
    public ProfileStore.Page list(int page,int size){
        var result=profiles.findAll(PageRequest.of(page,size,Sort.by(Sort.Order.asc("code").ignoreCase(),Sort.Order.asc("id"))));
        return new ProfileStore.Page(result.getContent().stream().map(this::value).toList(),result.getTotalElements(),page,size);
    }
    public List<Requirement> requirements(UUID id){
        get(id);
        return db.sql("SELECT r.id,r.profile_id,r.competency_id,c.label AS competency_label,r.classification_id,r.version,k.label AS classification_label FROM profile_requirement r JOIN competency_reference c ON c.id=r.competency_id JOIN requirement_classification k ON k.id=r.classification_id WHERE r.profile_id=:id ORDER BY lower(c.label),r.id")
            .param("id",id).query((rs,i)->new Requirement(rs.getObject("id",UUID.class),rs.getObject("profile_id",UUID.class),rs.getObject("competency_id",UUID.class),rs.getString("competency_label"),rs.getObject("classification_id",UUID.class),rs.getString("classification_label"),rs.getLong("version"))).list();
    }
    public Choices competencyChoices(String query,int page,int size){
        String filter=" FROM competency_reference WHERE active=true AND (position(lower(:query) in lower(code))>0 OR position(lower(:query) in lower(label))>0)";
        long total=db.sql("SELECT count(*)"+filter).param("query",query).query(Long.class).single();
        var items=db.sql("SELECT id,code,label"+filter+" ORDER BY lower(label),id LIMIT :size OFFSET :offset")
            .param("query",query).param("size",size).param("offset",(long)page*size)
            .query((rs,i)->new CompetencyChoice(rs.getObject("id",UUID.class),rs.getString("code"),rs.getString("label"))).list();
        return new Choices(items,total,page,size);
    }
    @Transactional
    public void reclassify(UUID profileId,UUID requirementId,UUID classificationId,long expectedVersion){
        profiles.findLocked(profileId).orElseThrow(NotFound::new);
        long current=db.sql("SELECT version FROM profile_requirement WHERE id=:id AND profile_id=:profile FOR UPDATE")
            .param("id",requirementId).param("profile",profileId).query(Long.class).optional().orElseThrow(NotFound::new);
        if(current!=expectedVersion)throw new fr.intformation.habilitations.domain.AccessPolicy.Conflict("Cette exigence a été modifiée. Rechargez les exigences avant de recommencer.");
        requireClassificationActive(classificationId);
        db.sql("UPDATE profile_requirement SET classification_id=:classification,version=version+1 WHERE id=:id")
            .param("classification",classificationId).param("id",requirementId).update();
    }
    private void requireClassificationActive(UUID classificationId){
        boolean active=db.sql("SELECT active FROM requirement_classification WHERE id=:id FOR UPDATE").param("id",classificationId).query(Boolean.class).optional().orElseThrow(NotFound::new);
        if(!active)throw new fr.intformation.habilitations.domain.AccessPolicy.Conflict("Cette classification est désactivée.");
    }
    @Transactional
    public Requirement addRequirement(UUID id,UUID competencyId,UUID classificationId){
        value(profiles.findLocked(id).orElseThrow(NotFound::new)).requireActive();
        competencies.requireActive(competencyId);
        requireClassificationActive(classificationId);
        UUID requirementId=UUID.randomUUID();
        try{db.sql("INSERT INTO profile_requirement(id,profile_id,competency_id,classification_id) VALUES (:id,:profile,:competency,:classification)").param("id",requirementId).param("profile",id).param("competency",competencyId).param("classification",classificationId).update();}
        catch(DataIntegrityViolationException error){
            if(error.getMostSpecificCause().getMessage().contains("profile_requirement_pair_unique"))throw new fr.intformation.habilitations.domain.AccessPolicy.Conflict("Cette compétence est déjà associée au profil.");
            throw error;
        }
        return requirements(id).stream().filter(r->r.id().equals(requirementId)).findFirst().orElseThrow();
    }
    @Transactional
    public void update(UUID id,String code,String label,String description,Long version){
        var entity=profiles.findLocked(id).orElseThrow(NotFound::new);var changed=value(entity).change(code,label,description,version);
        entity.code=changed.code();entity.label=changed.label();entity.description=changed.description();save(entity);
    }
    @Transactional
    public void deactivate(UUID id,long version){
        var entity=profiles.findLocked(id).orElseThrow(NotFound::new);value(entity).checkVersion(version);
        entity.active=false;save(entity);
    }
}
