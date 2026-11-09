package fr.intformation.formations.infrastructure;

import fr.intformation.formations.application.*;
import fr.intformation.formations.domain.Formation;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.net.URI;
import java.security.Principal;
import java.util.*;

@RestController
@RequestMapping("/api/formations")
public class FormationController {
    private final FormationService service;
    public FormationController(FormationService service){this.service=service;}
    public record FormationResponse(UUID id,String code,String title,String objectives,String description,Integer durationMinutes,String state,long version){}
    public record FormationPage(List<FormationResponse> items,long total,int page,int size){}
    private FormationResponse dto(Formation f){return new FormationResponse(f.id(),f.code(),f.title(),f.objectives(),f.description(),f.durationMinutes(),f.state().name(),f.version());}
    public record Change(String code,String title,String objectives,String description,BigDecimal durationMinutes,BigDecimal version){}
    public record Version(BigDecimal version){}
    public record SessionChange(String title){}
    private Integer duration(BigDecimal value){try{return value==null?null:value.intValueExact();}catch(ArithmeticException error){throw new Formation.InvalidField("durationMinutes","Durée entière invalide.");}}
    private Long version(BigDecimal value){try{return value==null?null:value.longValueExact();}catch(ArithmeticException error){throw new Formation.InvalidField("version","Version entière invalide.");}}
    @GetMapping FormationPage list(Principal user,@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="20") int size){var result=service.list(user.getName(),page,size);return new FormationPage(result.items().stream().map(this::dto).toList(),result.total(),page,size);}
    @GetMapping("/{id}") FormationResponse get(Principal user,@PathVariable UUID id){return dto(service.get(user.getName(),id));}
    @PostMapping ResponseEntity<FormationResponse> create(Principal user,@RequestBody Change body){var created=service.create(user.getName(),body.code(),body.title(),body.objectives(),body.description(),duration(body.durationMinutes()));return ResponseEntity.created(URI.create("/api/formations/"+created.id())).body(dto(created));}
    @PutMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    void update(Principal user,@PathVariable UUID id,@RequestBody Change body){service.update(user.getName(),id,body.code(),body.title(),body.objectives(),body.description(),duration(body.durationMinutes()),version(body.version()));}
    @PostMapping("/{id}/{action:activation|archivage|reactivation}") @ResponseStatus(HttpStatus.NO_CONTENT)
    void transition(Principal user,@PathVariable UUID id,@PathVariable String action,@RequestBody Version body){service.transition(user.getName(),id,action,version(body.version()));}
    @GetMapping("/{id}/sessions") List<FormationStore.Session> sessions(Principal user,@PathVariable UUID id){return service.sessions(user.getName(),id);}
    @PostMapping("/{id}/sessions") @ResponseStatus(HttpStatus.CREATED)
    FormationStore.Session createSession(Principal user,@PathVariable UUID id,@RequestBody SessionChange body){return service.createSession(user.getName(),id,body.title());}
}
