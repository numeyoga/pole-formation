package fr.intformation.referentiel.infrastructure;

import fr.intformation.referentiel.application.ReferenceExplorerCatalog;
import org.springframework.jdbc.core.simple.JdbcClient;
import org.springframework.stereotype.Repository;
import java.util.UUID;

@Repository
public class PostgresReferenceExplorerCatalog implements ReferenceExplorerCatalog {
    private final JdbcClient db;
    private static final String FROM=" FROM competency_reference c JOIN subdomain_reference s ON s.id=c.subdomain_id JOIN domain_reference d ON d.id=s.domain_id";
    private static final String FILTER=" WHERE position(lower(:query) in lower(c.code))>0 OR position(lower(:query) in lower(c.label))>0";
    public PostgresReferenceExplorerCatalog(JdbcClient db){this.db=db;}
    public Page search(String query,int page,int size){
        long total=db.sql("SELECT count(*)"+FROM+FILTER).param("query",query).query(Long.class).single();
        var items=db.sql("SELECT d.id,d.code,d.label,d.active,s.id,s.code,s.label,s.active,c.id,c.code,c.label,c.active"+FROM+FILTER+" ORDER BY lower(c.label),c.id LIMIT :size OFFSET :offset")
            .param("query",query).param("size",size).param("offset",(long)page*size)
            .query((rs,i)->new Match(
                new Node(rs.getObject(1,UUID.class),rs.getString(2),rs.getString(3),rs.getBoolean(4)),
                new Node(rs.getObject(5,UUID.class),rs.getString(6),rs.getString(7),rs.getBoolean(8)),
                new Node(rs.getObject(9,UUID.class),rs.getString(10),rs.getString(11),rs.getBoolean(12)))).list();
        return new Page(items,total,page,size);
    }
}
