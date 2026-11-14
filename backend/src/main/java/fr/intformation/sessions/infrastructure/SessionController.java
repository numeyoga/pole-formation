package fr.intformation.sessions.infrastructure;

import fr.intformation.sessions.application.SessionService;
import fr.intformation.sessions.domain.TrainingSession;
import org.springframework.http.*;
import org.springframework.web.bind.annotation.*;
import java.math.BigDecimal;
import java.net.URI;
import java.security.Principal;
import java.time.OffsetDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/sessions")
public class SessionController {
    private final SessionService service;
    public SessionController(SessionService service){this.service=service;}
    public record AssignedInstructorResponse(UUID id,String label,boolean active) {}
    public record SlotResponse(UUID id,java.time.Instant startsAt,java.time.Instant endsAt) {}
    public record SessionResponse(UUID id,UUID formationId,String title,String state,Integer capacity,String modalities,long version,java.util.List<SlotResponse> slots,java.util.List<AssignedInstructorResponse> instructors) {}
    private SlotResponse dto(TrainingSession.Slot slot){return new SlotResponse(slot.id(),slot.startsAt(),slot.endsAt());}
    private SessionResponse dto(TrainingSession session){return new SessionResponse(session.id(),session.formationId(),session.title(),session.state(),session.capacity(),session.modalities(),session.version(),session.slots().stream().map(this::dto).toList(),session.instructors().stream().map(i->new AssignedInstructorResponse(i.id(),i.label(),i.active())).toList());}
    public record Version(BigDecimal version) {}
    public record SlotChange(OffsetDateTime startsAt,OffsetDateTime endsAt,BigDecimal version,Boolean confirmConflicts) {}
    static Long version(BigDecimal value){try{return value==null?null:value.longValueExact();}catch(ArithmeticException error){throw new TrainingSession.InvalidField("version","Version entière invalide.");}}
    @GetMapping("/{id}") SessionResponse get(Principal user,@PathVariable UUID id){return dto(service.get(user.getName(),id));}
    @PostMapping("/{id}/creneaux")
    ResponseEntity<SlotResponse> addSlot(Principal user,@PathVariable UUID id,@RequestBody SlotChange body){
        var slot=service.addSlot(user.getName(),id,body.startsAt()==null?null:body.startsAt().toInstant(),body.endsAt()==null?null:body.endsAt().toInstant(),version(body.version()),Boolean.TRUE.equals(body.confirmConflicts()));
        return ResponseEntity.created(URI.create("/api/sessions/"+id+"/creneaux/"+slot.id())).body(dto(slot));
    }
    @PostMapping("/{id}/planification") @ResponseStatus(HttpStatus.NO_CONTENT)
    void plan(Principal user,@PathVariable UUID id,@RequestBody Version body){service.plan(user.getName(),id,version(body.version()));}
    @PostMapping("/{id}/cloture") @ResponseStatus(HttpStatus.NO_CONTENT)
    void complete(Principal user,@PathVariable UUID id,@RequestBody Version body){service.transition(user.getName(),id,version(body.version()),"TERMINEE");}
    @PostMapping("/{id}/annulation") @ResponseStatus(HttpStatus.NO_CONTENT)
    void cancel(Principal user,@PathVariable UUID id,@RequestBody Version body){service.transition(user.getName(),id,version(body.version()),"ANNULEE");}

}
