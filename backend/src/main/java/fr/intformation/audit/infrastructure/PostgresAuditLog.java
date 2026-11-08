package fr.intformation.audit.infrastructure;

import fr.intformation.audit.application.AuditStore;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;
import tools.jackson.core.type.TypeReference;
import tools.jackson.databind.json.JsonMapper;
import java.sql.Timestamp;
import java.time.Instant;
import java.util.*;

@Repository
public class PostgresAuditLog implements AuditStore {
    private final JdbcClient db;
    private final JsonMapper json=JsonMapper.builder().build();
    public PostgresAuditLog(JdbcClient db) { this.db=db; }
    public void record(String actor,String action,String subjectType,String subjectId,UUID sessionId,
                       Map<String,Object> before,Map<String,Object> after,Instant now) {
        db.sql("INSERT INTO access_audit(id,occurred_at,actor,action,target,subject_type,session_id,before_value,after_value) VALUES (:id,:at,:actor,:action,:target,:type,:session,CAST(:before AS jsonb),CAST(:after AS jsonb))")
            .param("id",UUID.randomUUID()).param("at",Timestamp.from(now)).param("actor",actor).param("action",action)
            .param("target",subjectId).param("type",subjectType).param("session",sessionId)
            .param("before",json.writeValueAsString(before)).param("after",json.writeValueAsString(after)).update();
    }
    public List<Event> read(Query query) {
        String sql="SELECT * FROM access_audit WHERE 1=1";
        var params=new HashMap<String,Object>();
        if(query.subjectType()!=null) {sql+=" AND subject_type=:type";params.put("type",query.subjectType());}
        if(query.subjectId()!=null) {sql+=" AND target=:target";params.put("target",query.subjectId());}
        if(query.sessionId()!=null) {sql+=" AND session_id=:session";params.put("session",query.sessionId());}
        if(query.beforeSequence()!=null) {sql+=" AND sequence<:cursor";params.put("cursor",query.beforeSequence());}
        params.put("limit",query.limit()+1);
        return db.sql(sql+" ORDER BY sequence DESC LIMIT :limit").params(params).query((rs,i)->new Event(
            rs.getLong("sequence"),rs.getObject("id",UUID.class),rs.getTimestamp("occurred_at").toInstant(),rs.getString("actor"),rs.getString("action"),
            rs.getString("subject_type"),rs.getString("target"),rs.getObject("session_id",UUID.class),
            json.readValue(rs.getString("before_value"),new TypeReference<Map<String,Object>>() {}),
            json.readValue(rs.getString("after_value"),new TypeReference<Map<String,Object>>() {}))).list();
    }
}
