package fr.intformation.collaborateurs.infrastructure;
import fr.intformation.collaborateurs.application.*;
import fr.intformation.collaborateurs.domain.Collaborator;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.net.URI;
import java.security.Principal;
import java.util.UUID;
@RestController
@RequestMapping("/api/collaborateurs")
public class CollaboratorController {
    private final CollaboratorService service;
    public CollaboratorController(CollaboratorService service){this.service=service;}
    public record Response(UUID id,String professionalId,String firstName,String lastName,boolean active,long version) {}
    public record Page(java.util.List<Response> items,long total,int page,int size) {}
    private Response dto(Collaborator c){return new Response(c.id(),c.professionalId(),c.firstName(),c.lastName(),c.active(),c.version());}
    public record Change(String professionalId,String firstName,String lastName,BigDecimal version) {}
    public record Version(BigDecimal version) {}
    private Long version(BigDecimal v){try{return v==null?null:v.longValueExact();}catch(ArithmeticException e){throw new IllegalArgumentException("Version entière requise.");}}
    @GetMapping Page list(Principal user,@RequestParam(defaultValue="") String q,@RequestParam(defaultValue="false") boolean activeOnly,@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="20") int size){var result=service.list(user.getName(),q,activeOnly,page,size);return new Page(result.items().stream().map(this::dto).toList(),result.total(),page,size);}
    @GetMapping("/{id}") Response get(Principal user,@PathVariable UUID id){return dto(service.get(user.getName(),id));}
    @PostMapping ResponseEntity<Response> create(Principal user,@RequestBody Change body){var created=service.create(user.getName(),body.professionalId(),body.firstName(),body.lastName());return ResponseEntity.created(URI.create("/api/collaborateurs/"+created.id())).body(dto(created));}
    @PutMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT) void update(Principal user,@PathVariable UUID id,@RequestBody Change body){service.update(user.getName(),id,body.professionalId(),body.firstName(),body.lastName(),version(body.version()));}
    @PostMapping("/{id}/desactivation") @ResponseStatus(HttpStatus.NO_CONTENT) void deactivate(Principal user,@PathVariable UUID id,@RequestBody Version body){service.deactivate(user.getName(),id,version(body.version()));}
    @GetMapping("/{id}/participations") CollaboratorStore.History history(Principal user,@PathVariable UUID id,@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="20") int size){return service.history(user.getName(),id,page,size);}
}
