package fr.intformation.profils.application;

import fr.intformation.profils.domain.JobProfile;
import java.util.*;

public interface ProfileStore {
    record Page(List<JobProfile> items,long total,int page,int size) {}
    record Requirement(UUID id,UUID profileId,UUID competencyId,String competencyLabel,UUID classificationId,String classificationLabel) {}
    List<Requirement> requirements(UUID id);
    Requirement addRequirement(UUID id,UUID competencyId,UUID classificationId);
    JobProfile create(JobProfile domain);
    JobProfile get(UUID id);
    Page list(int page,int size);
    void update(UUID id,String code,String label,String description,Long version);
    void deactivate(UUID id,long version);
}
