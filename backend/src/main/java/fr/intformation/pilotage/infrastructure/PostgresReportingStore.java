package fr.intformation.pilotage.infrastructure;
import fr.intformation.pilotage.application.ReportingStore;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.*;
import java.sql.Timestamp;
import java.util.*;
@Repository
public class PostgresReportingStore implements ReportingStore {
    private final JdbcClient db;
    public PostgresReportingStore(JdbcClient db){this.db=db;}
    private static final String SOURCE=" FROM training_session s LEFT JOIN (SELECT session_id,min(starts_at) AS first_start FROM session_slot GROUP BY session_id) t ON t.session_id=s.id";
    private String filter(Query q){return " WHERE true"+(q.from()!=null?" AND t.first_start>=:from":"")+(q.until()!=null?" AND t.first_start<:until":"")+(q.formationId()!=null?" AND s.formation_id=:formation":"")+(q.state()!=null?" AND s.state=:state":"");}
    private JdbcClient.StatementSpec query(String sql,Query q){var statement=db.sql(sql);if(q.from()!=null)statement=statement.param("from",Timestamp.from(q.from()));if(q.until()!=null)statement=statement.param("until",Timestamp.from(q.until()));if(q.formationId()!=null)statement=statement.param("formation",q.formationId());if(q.state()!=null)statement=statement.param("state",q.state());return statement;}
    private Counts counts(Query q,boolean cancelled){return query("SELECT count(*) FILTER(WHERE p.state='INSCRITE'),count(*) FILTER(WHERE p.state='PRESENTE'),count(*) FILTER(WHERE p.state='ABSENTE'),count(*) FILTER(WHERE p.state='DESISTEE')"+SOURCE+" JOIN participation p ON p.session_id=s.id"+filter(q)+(cancelled?" AND s.state='ANNULEE'":" AND s.state<>'ANNULEE'"),q).query((rs,n)->new Counts(rs.getLong(1),rs.getLong(2),rs.getLong(3),rs.getLong(4))).single();}
    @Transactional(readOnly=true,isolation=Isolation.REPEATABLE_READ)
    public Overview overview(Query q){
        Map<String,Long> sessions=new LinkedHashMap<>();for(String state:List.of("BROUILLON","PLANIFIEE","TERMINEE","ANNULEE"))sessions.put(state,0L);
        query("SELECT s.state,count(*)"+SOURCE+filter(q)+" GROUP BY s.state",q).query((rs,n)->Map.entry(rs.getString(1),rs.getLong(2))).list().forEach(entry->sessions.put(entry.getKey(),entry.getValue()));
        return new Overview(db.sql("SELECT count(*) FROM formation WHERE state='ACTIVE'").query(Long.class).single(),sessions,counts(q,false),counts(q,true),sessions.get("TERMINEE"));
    }
    @Transactional(readOnly=true,isolation=Isolation.REPEATABLE_READ)
    public Page sessions(Query q){
        var items=query("SELECT s.id,s.formation_id,s.title,s.state,t.first_start,(SELECT count(*) FROM participation p WHERE p.session_id=s.id AND p.state='INSCRITE'),(SELECT count(*) FROM participation p WHERE p.session_id=s.id AND p.state='PRESENTE'),(SELECT count(*) FROM participation p WHERE p.session_id=s.id AND p.state='ABSENTE'),(SELECT count(*) FROM participation p WHERE p.session_id=s.id AND p.state='DESISTEE')"+SOURCE+filter(q)+" ORDER BY t.first_start DESC NULLS LAST,s.id LIMIT :size OFFSET :offset",q).param("size",q.size()).param("offset",(long)q.page()*q.size()).query((rs,n)->new Session(rs.getObject(1,UUID.class),rs.getObject(2,UUID.class),rs.getString(3),rs.getString(4),rs.getTimestamp(5)==null?null:rs.getTimestamp(5).toInstant(),new Counts(rs.getLong(6),rs.getLong(7),rs.getLong(8),rs.getLong(9)))).list();
        long total=query("SELECT count(*)"+SOURCE+filter(q),q).query(Long.class).single();return new Page(items,total,q.page(),q.size());
    }
}
