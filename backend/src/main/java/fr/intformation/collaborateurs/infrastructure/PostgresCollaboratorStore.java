package fr.intformation.collaborateurs.infrastructure;

import fr.intformation.collaborateurs.application.CollaboratorStore;
import fr.intformation.collaborateurs.domain.Collaborator;
import fr.intformation.habilitations.application.AccessService.NotFound;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.*;
import java.util.*;

@Repository
public class PostgresCollaboratorStore implements CollaboratorStore {
    private final JdbcClient db;
    public PostgresCollaboratorStore(JdbcClient db){this.db=db;}
    private static final RowMapper<Collaborator> ROW=(rs,n)->new Collaborator(rs.getObject("id",UUID.class),rs.getString("professional_id"),rs.getString("first_name"),rs.getString("last_name"),rs.getBoolean("active"),rs.getLong("version"));
    private Collaborator find(UUID id,boolean lock){return db.sql("SELECT * FROM collaborator WHERE id=:id"+(lock?" FOR UPDATE":"")).param("id",id).query(ROW).optional().orElseThrow(NotFound::new);}
    public Collaborator get(UUID id){return find(id,false);}
    @Transactional(readOnly=true,isolation=Isolation.REPEATABLE_READ)
    public Page list(String q,boolean activeOnly,int page,int size){
        String filter=" WHERE position(lower(:q) in lower(professional_id||' '||first_name||' '||last_name))>0"+(activeOnly?" AND active":"");
        var items=db.sql("SELECT * FROM collaborator"+filter+" ORDER BY lower(last_name),lower(first_name),id LIMIT :size OFFSET :offset").param("q",q).param("size",size).param("offset",(long)page*size).query(ROW).list();
        long total=db.sql("SELECT count(*) FROM collaborator"+filter).param("q",q).query(Long.class).single();return new Page(items,total,page,size);
    }
    private void unique(String professionalId,UUID id){
        // A transaction advisory lock also serialises creations of the same professional identifier.
        db.sql("SELECT pg_advisory_xact_lock(hashtextextended(:professional,60801))").param("professional",professionalId).query((rs,n)->true).single();
        if(db.sql("SELECT EXISTS(SELECT 1 FROM collaborator WHERE professional_id=:professional AND id<>:id)").param("professional",professionalId).param("id",id).query(Boolean.class).single())throw new Collaborator.DuplicateProfessionalId();
    }
    @Transactional
    public Collaborator create(Collaborator.Details d){UUID id=UUID.randomUUID();unique(d.professionalId(),id);db.sql("INSERT INTO collaborator(id,professional_id,first_name,last_name) VALUES (:id,:professional,:first,:last)").param("id",id).param("professional",d.professionalId()).param("first",d.firstName()).param("last",d.lastName()).update();return find(id,false);}
    @Transactional
    public void update(UUID id,Collaborator.Details d,Long version){unique(d.professionalId(),id);find(id,true).requireVersion(version);db.sql("UPDATE collaborator SET professional_id=:professional,first_name=:first,last_name=:last,version=version+1 WHERE id=:id").param("id",id).param("professional",d.professionalId()).param("first",d.firstName()).param("last",d.lastName()).update();}
    @Transactional
    public void deactivate(UUID id,Long version){var current=find(id,true);current.requireVersion(version);if(current.active())db.sql("UPDATE collaborator SET active=false,version=version+1 WHERE id=:id").param("id",id).update();}
    @Transactional(readOnly=true,isolation=Isolation.REPEATABLE_READ)
    public History history(UUID id,int page,int size){find(id,false);String filter=" FROM participation p JOIN training_session s ON s.id=p.session_id WHERE p.collaborator_id=:id";var items=db.sql("SELECT p.id,s.id,s.title,s.state,p.state"+filter+" ORDER BY lower(s.title),p.id LIMIT :size OFFSET :offset").param("id",id).param("size",size).param("offset",(long)page*size).query((rs,n)->new Participation(rs.getObject(1,UUID.class),rs.getObject(2,UUID.class),rs.getString(3),rs.getString(4),rs.getString(5))).list();return new History(items,db.sql("SELECT count(*)"+filter).param("id",id).query(Long.class).single(),page,size);}
}
