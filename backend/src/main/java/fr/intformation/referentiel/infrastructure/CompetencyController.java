package fr.intformation.referentiel.infrastructure;

import fr.intformation.referentiel.application.*;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.net.URI;
import java.security.Principal;
import java.util.*;

@RestController
public class CompetencyController {
    private final CompetencyService service;
    public CompetencyController(CompetencyService service){this.service=service;}
    public record CompetencyResponse(UUID id,UUID subdomainId,String code,String label,boolean active,long version,String subdomainCode,String subdomainLabel,boolean subdomainActive){}
    public record CompetencyPage(List<CompetencyResponse> items,long total,int page,int size){}
    public record Change(UUID subdomainId,String code,String label,Long version){}
    public record Version(Long version){}
    private CompetencyResponse dto(CompetencyCatalog.Entry s){return new CompetencyResponse(s.id(),s.subdomainId(),s.code(),s.label(),s.active(),s.version(),s.subdomainCode(),s.subdomainLabel(),s.subdomainActive());}
    @GetMapping("/api/referentiels/competences") CompetencyPage list(Principal user,@RequestParam(required=false) UUID subdomainId,
                                  @RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="20") int size){
        var result=service.list(user.getName(),subdomainId,page,size);
        return new CompetencyPage(result.items().stream().map(this::dto).toList(),result.total(),page,size);
    }
    @GetMapping("/api/referentiels/competences/parents") List<CompetencyService.ParentChoice> parents(Principal user){return service.parents(user.getName());}
    @GetMapping("/api/referentiels/competences/{id}") CompetencyResponse get(Principal user,@PathVariable UUID id){return dto(service.get(user.getName(),id));}
    @PostMapping("/api/referentiels/competences") ResponseEntity<CompetencyResponse> create(Principal user,@RequestBody Change body){return created(service.create(user.getName(),body.subdomainId(),body.code(),body.label()));}
    private ResponseEntity<CompetencyResponse> created(CompetencyCatalog.Entry result){return ResponseEntity.created(URI.create("/api/referentiels/competences/"+result.id())).body(dto(result));}
    @PutMapping("/api/referentiels/competences/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    void update(Principal user,@PathVariable UUID id,@RequestBody Change body){service.update(user.getName(),id,body.subdomainId(),body.code(),body.label(),body.version());}
    @PostMapping("/api/referentiels/competences/{id}/desactivation") @ResponseStatus(HttpStatus.NO_CONTENT)
    void deactivate(Principal user,@PathVariable UUID id,@RequestBody Version body){service.deactivate(user.getName(),id,body.version());}
}
