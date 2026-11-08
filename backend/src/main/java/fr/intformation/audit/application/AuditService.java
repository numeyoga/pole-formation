package fr.intformation.audit.application;

import fr.intformation.habilitations.application.AccessStore;
import fr.intformation.habilitations.domain.AccessPolicy;
import static fr.intformation.habilitations.domain.AccessPolicy.Permission.*;
import java.time.*;
import java.util.*;

public final class AuditService {
    private final AccessStore accounts;
    private final AuditStore audit;
    private final SensitiveStore changes;
    private final AccessPolicy policy=new AccessPolicy();
    private final Clock clock;
    public AuditService(AccessStore accounts,AuditStore audit,SensitiveStore changes,Clock clock) {
        this.accounts=accounts;this.audit=audit;this.changes=changes;this.clock=clock;
    }
    public List<AuditStore.Event> read(String user,AuditStore.Query query) {
        policy.require(accounts.actor(user),READ_AUDIT);
        if(query.limit()<1 || query.limit()>100 || (query.beforeSequence()!=null && query.beforeSequence()<1)) throw new IllegalArgumentException("Pagination invalide.");
        if(query.subjectType()!=null && !Set.of("COMPTE","PARTICIPATION","CRENEAU","AFFECTATIONS").contains(query.subjectType())) throw new IllegalArgumentException("Type d’objet invalide.");
        if(query.subjectId()!=null && (query.subjectId().isBlank() || query.subjectId().length()>100)) throw new IllegalArgumentException("Identifiant invalide.");
        return audit.read(query);
    }
    public void slot(String user,UUID session,UUID slot,Instant start,Instant end,boolean confirm) {
        var actor=accounts.actor(user);policy.require(actor,MANAGE_SESSION);
        changes.changeSlot(actor,session,slot,start,end,confirm,clock.instant());
    }
    public void instructors(String user,UUID session,List<UUID> instructors,boolean confirm) {
        var actor=accounts.actor(user);policy.require(actor,MANAGE_SESSION);
        if(instructors==null || instructors.stream().anyMatch(Objects::isNull) || new HashSet<>(instructors).size()!=instructors.size()) throw new IllegalArgumentException("Affectations invalides.");
        changes.replaceInstructors(actor,session,instructors,confirm,clock.instant());
    }
    public void transition(String user,UUID session,UUID participation,String state,boolean confirm) {
        var actor=accounts.actor(user);policy.require(actor,MANAGE_PARTICIPATION);
        if(state==null || !Set.of("INSCRITE","DESISTEE").contains(state)) throw new IllegalArgumentException("État invalide.");
        changes.transition(actor,session,participation,state,confirm,clock.instant());
    }
}
