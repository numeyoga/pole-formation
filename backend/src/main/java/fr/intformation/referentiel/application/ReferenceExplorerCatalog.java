package fr.intformation.referentiel.application;

import java.util.List;
import java.util.UUID;

public interface ReferenceExplorerCatalog {
    record Node(UUID id,String code,String label,boolean active) {}
    record Match(Node domain,Node subdomain,Node competency) {}
    record Page(List<Match> items,long total,int page,int size) {}
    Page search(String query,int page,int size);
}
