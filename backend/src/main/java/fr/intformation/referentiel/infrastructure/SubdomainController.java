package fr.intformation.referentiel.infrastructure;

import fr.intformation.referentiel.application.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.net.URI;
import java.security.Principal;
import java.util.*;

@RestController
public class SubdomainController {
    private final SubdomainService service;
    public SubdomainController(SubdomainService service){this.service=service;}
    public record SubdomainResponse(UUID id,UUID domainId,String code,String label,boolean active,long version,String domainCode,String domainLabel,boolean domainActive){}
    public record SubdomainPage(List<SubdomainResponse> items,long total,int page,int size){}
    public record Change(UUID domainId,String code,String label,Long version){}
    public record Version(Long version){}
    public record Label(String label){}
    private SubdomainResponse dto(SubdomainCatalog.Entry s){return new SubdomainResponse(s.id(),s.domainId(),s.code(),s.label(),s.active(),s.version(),s.domainCode(),s.domainLabel(),s.domainActive());}
    @GetMapping("/api/referentiels/sous-domaines") SubdomainPage list(Principal user,@RequestParam(required=false) UUID domainId,
                                  @RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="20") int size){
        var result=service.list(user.getName(),domainId,page,size);
        return new SubdomainPage(result.items().stream().map(this::dto).toList(),result.total(),page,size);
    }
    @GetMapping("/api/referentiels/sous-domaines/parents") List<SubdomainService.ParentChoice> parents(Principal user){return service.parents(user.getName());}
    @GetMapping("/api/referentiels/sous-domaines/{id}") SubdomainResponse get(Principal user,@PathVariable UUID id){return dto(service.get(user.getName(),id));}
    @PostMapping("/api/referentiels/sous-domaines") ResponseEntity<SubdomainResponse> create(Principal user,@RequestBody Change body){return created(service.create(user.getName(),body.domainId(),body.code(),body.label()));}
    private ResponseEntity<SubdomainResponse> created(SubdomainCatalog.Entry result){return ResponseEntity.created(URI.create("/api/referentiels/sous-domaines/"+result.id())).body(dto(result));}
    @PutMapping("/api/referentiels/sous-domaines/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    void update(Principal user,@PathVariable UUID id,@RequestBody Change body){service.update(user.getName(),id,body.domainId(),body.code(),body.label(),body.version());}
    @PostMapping("/api/referentiels/sous-domaines/{id}/desactivation") @ResponseStatus(HttpStatus.NO_CONTENT)
    void deactivate(Principal user,@PathVariable UUID id,@RequestBody Version body){service.deactivate(user.getName(),id,body.version());}
    @GetMapping("/api/referentiels/domaines/{id}/sous-domaines") List<SubdomainResponse> children(Principal user,@PathVariable UUID id){return service.children(user.getName(),id).stream().map(this::dto).toList();}
    @PostMapping("/api/referentiels/domaines/{id}/sous-domaines") ResponseEntity<SubdomainResponse> legacyCreate(Principal user,@PathVariable UUID id,@RequestBody Label body){return created(service.legacyCreate(user.getName(),id,body.label()));}
    @GetMapping("/api/referentiels/sous-domaines/{id}/competences") List<SubdomainCatalog.Competency> competencies(Principal user,@PathVariable UUID id){return service.competencies(user.getName(),id);}
    @PostMapping("/api/referentiels/sous-domaines/{id}/competences") ResponseEntity<SubdomainCatalog.Competency> competency(Principal user,@PathVariable UUID id,@RequestBody Label body){return ResponseEntity.status(HttpStatus.CREATED).body(service.addCompetency(user.getName(),id,body.label()));}
}
