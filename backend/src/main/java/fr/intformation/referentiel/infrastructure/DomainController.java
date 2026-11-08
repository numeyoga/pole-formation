package fr.intformation.referentiel.infrastructure;

import fr.intformation.referentiel.application.*;
import fr.intformation.referentiel.domain.TrainingDomain;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.net.URI;
import java.security.Principal;
import java.util.*;

@RestController
@RequestMapping("/api/referentiels/domaines")
public class DomainController {
    private final DomainService service;
    public DomainController(DomainService service){this.service=service;}
    public record DomainResponse(UUID id,String code,String label,boolean active,long version){}
    public record DomainPage(List<DomainResponse> items,long total,int page,int size){}
    public record Change(String code,String label,Long version){}
    public record Version(Long version){}
    public record ChildRequest(String label){}
    public record ChildResponse(UUID id,UUID domainId,String label){}
    private DomainResponse dto(TrainingDomain domain){return new DomainResponse(domain.id(),domain.code(),domain.label(),domain.active(),domain.version());}
    @GetMapping DomainPage list(Principal user,@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="20") int size){
        var result=service.list(user.getName(),page,size);return new DomainPage(result.items().stream().map(this::dto).toList(),result.total(),page,size);
    }
    @GetMapping("/{id}") DomainResponse get(Principal user,@PathVariable UUID id){return dto(service.get(user.getName(),id));}
    @PostMapping ResponseEntity<DomainResponse> create(Principal user,@RequestBody Change body){
        var result=service.create(user.getName(),body.code(),body.label());return ResponseEntity.created(URI.create("/api/referentiels/domaines/"+result.id())).body(dto(result));
    }
    @PutMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    void update(Principal user,@PathVariable UUID id,@RequestBody Change body){service.update(user.getName(),id,body.code(),body.label(),body.version());}
    @PostMapping("/{id}/desactivation") @ResponseStatus(HttpStatus.NO_CONTENT)
    void deactivate(Principal user,@PathVariable UUID id,@RequestBody Version body){service.deactivate(user.getName(),id,body.version());}
    @GetMapping("/{id}/sous-domaines") List<ChildResponse> children(Principal user,@PathVariable UUID id){
        return service.children(user.getName(),id).stream().map(c->new ChildResponse(c.id(),c.domainId(),c.label())).toList();
    }
    @PostMapping("/{id}/sous-domaines") ResponseEntity<ChildResponse> child(Principal user,@PathVariable UUID id,@RequestBody ChildRequest body){
        var result=service.addChild(user.getName(),id,body.label());return ResponseEntity.status(HttpStatus.CREATED).body(new ChildResponse(result.id(),result.domainId(),result.label()));
    }
}
