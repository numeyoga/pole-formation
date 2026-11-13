package fr.intformation.intervenants.infrastructure;

import fr.intformation.intervenants.application.*;
import fr.intformation.intervenants.domain.Instructor;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.net.URI;
import java.security.Principal;
import java.util.*;

@RestController
@RequestMapping("/api/intervenants")
public class InstructorController {
    private final InstructorService service;
    public InstructorController(InstructorService service){this.service=service;}
    public record Response(UUID id,String label,String firstName,String lastName,String professionalContact,boolean active,long version,boolean hasAccount,long sessionCount) {}
    public record Page(List<Response> items,long total,int page,int size) {}
    public record Change(String firstName,String lastName,String professionalContact,BigDecimal version) {}
    public record Version(BigDecimal version) {}
    private Long version(BigDecimal value){try{return value==null?null:value.longValueExact();}catch(ArithmeticException error){throw new Instructor.InvalidField("version","Version entière invalide.");}}
    private Response dto(Instructor i){return new Response(i.id(),i.label(),i.firstName(),i.lastName(),i.professionalContact(),i.active(),i.version(),i.hasAccount(),i.sessionCount());}
    @GetMapping Page list(Principal user,@RequestParam(defaultValue="") String q,@RequestParam(defaultValue="false") boolean activeOnly,@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="20") int size){var result=service.list(user.getName(),q,activeOnly,page,size);return new Page(result.items().stream().map(this::dto).toList(),result.total(),page,size);}
    @GetMapping("/{id}") Response get(Principal user,@PathVariable UUID id){return dto(service.get(user.getName(),id));}
    @PostMapping ResponseEntity<Response> create(Principal user,@RequestBody Change body){var created=service.create(user.getName(),body.firstName(),body.lastName(),body.professionalContact());return ResponseEntity.created(URI.create("/api/intervenants/"+created.id())).body(dto(created));}
    @PutMapping("/{id}") @ResponseStatus(HttpStatus.NO_CONTENT)
    void update(Principal user,@PathVariable UUID id,@RequestBody Change body){service.update(user.getName(),id,body.firstName(),body.lastName(),body.professionalContact(),version(body.version()));}
    @PostMapping("/{id}/desactivation") @ResponseStatus(HttpStatus.NO_CONTENT)
    void deactivate(Principal user,@PathVariable UUID id,@RequestBody Version body){service.deactivate(user.getName(),id,version(body.version()));}
    @GetMapping("/{id}/sessions") InstructorStore.Sessions sessions(Principal user,@PathVariable UUID id,@RequestParam(defaultValue="0") int page,@RequestParam(defaultValue="20") int size){return service.sessions(user.getName(),id,page,size);}
}
